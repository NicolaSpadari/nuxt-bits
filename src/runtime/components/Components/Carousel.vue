<template>
	<div
		ref="containerRef"
		class="relative overflow-hidden p-4" :class="[
			round ? 'rounded-full border border-[#333]' : 'rounded-[24px] border border-[#333]',
		]"
		:style="{
			width: `${baseWidth}px`,
			...(round && { height: `${baseWidth}px` }),
		}"
	>
		<Motion
			tag="div"
			class="flex"
			drag="x"
			:drag-constraints="dragConstraints"
			:style="{
				width: `${itemWidth}px`,
				gap: `${GAP}px`,
				perspective: 1000,
				perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
				x: motionX,
			}"
			:animate="{ x: -(currentIndex * trackItemOffset) }"
			:transition="effectiveTransition"
			@drag-end="handleDragEnd"
			@animation-complete="handleAnimationComplete"
		>
			<Motion
				v-for="(item, index) in carouselItems"
				:key="index"
				tag="div"
				class="relative shrink-0 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing" :class="[
					round
						? 'items-center justify-center text-center bg-[#111] border border-[#333] rounded-full'
						: 'items-start justify-between bg-[#111] border border-[#333] rounded-[12px]',
				]"
				:style="{
					width: `${itemWidth}px`,
					height: round ? `${itemWidth}px` : '100%',
					rotateY: getRotateY(index),
					...(round && { borderRadius: '50%' }),
				}"
				:transition="effectiveTransition"
			>
				<div :class="round ? 'p-0 m-0' : 'mb-4 p-5'">
					<span class="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060010]">
						<i :class="item.icon" class="text-white text-base" />
					</span>
				</div>

				<div class="p-5">
					<div class="mb-1 font-black text-lg text-white">
						{{ item.title }}
					</div>

					<p class="text-sm text-white">
						{{ item.description }}
					</p>
				</div>
			</Motion>
		</Motion>

		<div class="flex w-full justify-center" :class="[round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : '']">
			<div class="mt-4 flex w-[150px] justify-between px-8">
				<Motion
					v-for="(_, index) in items"
					:key="index"
					tag="div"
					class="h-2 w-2 rounded-full cursor-pointer transition-colors duration-150" :class="[
						currentIndex % items.length === index
							? round
								? 'bg-white'
								: 'bg-[#333333]'
							: round
								? 'bg-[#555]'
								: 'bg-[rgba(51,51,51,0.4)]',
					]"
					:animate="{
						scale: currentIndex % items.length === index ? 1.2 : 1,
					}"
					:transition="{ duration: 0.15 }"
					@click="() => setCurrentIndex(index)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Motion, useMotionValue, useTransform } from "motion-v";
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";

	export interface CarouselItem {
		title: string
		description: string
		id: number
		icon: string
	}

	export interface CarouselProps {
		items?: CarouselItem[]
		baseWidth?: number
		autoplay?: boolean
		autoplayDelay?: number
		pauseOnHover?: boolean
		loop?: boolean
		round?: boolean
	}

	const props = withDefaults(defineProps<CarouselProps>(), {
		items: () => [
			{
				title: "Text Animations",
				description: "Cool text animations for your projects.",
				id: 1,
				icon: "pi pi-file"
			},
			{
				title: "Animations",
				description: "Smooth animations for your projects.",
				id: 2,
				icon: "pi pi-circle"
			},
			{
				title: "Components",
				description: "Reusable components for your projects.",
				id: 3,
				icon: "pi pi-objects-column"
			},
			{
				title: "Backgrounds",
				description: "Beautiful backgrounds and patterns for your projects.",
				id: 4,
				icon: "pi pi-table"
			},
			{
				title: "Common UI",
				description: "Common UI components are coming soon!",
				id: 5,
				icon: "pi pi-code"
			}
		],
		baseWidth: 300,
		autoplay: false,
		autoplayDelay: 3000,
		pauseOnHover: false,
		loop: false,
		round: false
	});

	const DRAG_BUFFER = 0;
	const VELOCITY_THRESHOLD = 500;
	const GAP = 16;
	const SPRING_OPTIONS = { type: "spring" as const, stiffness: 300, damping: 30 };

	const containerPadding = 16;
	const itemWidth = computed(() => props.baseWidth - containerPadding * 2);
	const trackItemOffset = computed(() => itemWidth.value + GAP);

	const carouselItems = computed(() => (props.loop ? [...props.items, props.items[0]] : props.items));
	const currentIndex = ref<number>(0);
	const motionX = useMotionValue(0);
	const isHovered = ref<boolean>(false);
	const isResetting = ref<boolean>(false);

	const containerRef = ref<HTMLDivElement>();
	let autoplayTimer: number | null = null;

	const dragConstraints = computed(() => {
		return props.loop
			? {}
			: {
				left: -trackItemOffset.value * (carouselItems.value.length - 1),
				right: 0
			};
	});

	const effectiveTransition = computed(() => (isResetting.value ? { duration: 0 } : SPRING_OPTIONS));

	const maxItems = Math.max(props.items.length + 1, 10);
	const rotateYTransforms = Array.from({ length: maxItems }, (_, index) => {
		const range = computed(() => [
			-(index + 1) * trackItemOffset.value,
			-index * trackItemOffset.value,
			-(index - 1) * trackItemOffset.value
		]);
		const outputRange = [90, 0, -90];
		return useTransform(motionX, range, outputRange, { clamp: false });
	});

	const getRotateY = (index: number) => {
		return rotateYTransforms[index] || rotateYTransforms[0];
	};

	const setCurrentIndex = (index: number) => {
		currentIndex.value = index;
	};

	const handleAnimationComplete = () => {
		if (props.loop && currentIndex.value === carouselItems.value.length - 1) {
			isResetting.value = true;
			motionX.set(0);
			currentIndex.value = 0;
			setTimeout(() => {
				isResetting.value = false;
			}, 50);
		}
	};

	interface DragInfo {
		offset: { x: number, y: number }
		velocity: { x: number, y: number }
	}

	const handleDragEnd = (event: Event, info: DragInfo) => {
		const offset = info.offset.x;
		const velocity = info.velocity.x;

		if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
			if (props.loop && currentIndex.value === props.items.length - 1) {
				currentIndex.value = currentIndex.value + 1;
			} else {
				currentIndex.value = Math.min(currentIndex.value + 1, carouselItems.value.length - 1);
			}
		} else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
			if (props.loop && currentIndex.value === 0) {
				currentIndex.value = props.items.length - 1;
			} else {
				currentIndex.value = Math.max(currentIndex.value - 1, 0);
			}
		}
	};

	const startAutoplay = () => {
		if (props.autoplay && (!props.pauseOnHover || !isHovered.value)) {
			autoplayTimer = window.setInterval(() => {
				currentIndex.value = (() => {
					const prev = currentIndex.value;
					if (prev === props.items.length - 1 && props.loop) {
						return prev + 1;
					}
					if (prev === carouselItems.value.length - 1) {
						return props.loop ? 0 : prev;
					}
					return prev + 1;
				})();
			}, props.autoplayDelay);
		}
	};

	const stopAutoplay = () => {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	};

	const handleMouseEnter = () => {
		isHovered.value = true;
		if (props.pauseOnHover) {
			stopAutoplay();
		}
	};

	const handleMouseLeave = () => {
		isHovered.value = false;
		if (props.pauseOnHover) {
			startAutoplay();
		}
	};

	watch(
		[
			() => props.autoplay,
			() => props.autoplayDelay,
			isHovered,
			() => props.loop,
			() => props.items.length,
			() => carouselItems.value.length,
			() => props.pauseOnHover
		],
		() => {
			stopAutoplay();
			startAutoplay();
		}
	);

	onMounted(() => {
		if (props.pauseOnHover && containerRef.value) {
			containerRef.value.addEventListener("mouseenter", handleMouseEnter);
			containerRef.value.addEventListener("mouseleave", handleMouseLeave);
		}
		startAutoplay();
	});

	onUnmounted(() => {
		if (containerRef.value) {
			containerRef.value.removeEventListener("mouseenter", handleMouseEnter);
			containerRef.value.removeEventListener("mouseleave", handleMouseLeave);
		}
		stopAutoplay();
	});
</script>
