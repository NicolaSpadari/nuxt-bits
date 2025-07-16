<template>
	<div
		ref="containerRef"
		class="top-0 left-0 relative w-full h-full"
		:style="{ zIndex: props.zIndex }"
		@mousemove="handleMove"
		@touchmove="handleMove"
	>
		<svg v-if="props.useFilter" class="absolute w-0 h-0">
			<filter :id="props.filterId">
				<feGaussianBlur in="SourceGraphic" result="blur" :stdDeviation="props.filterStdDeviation" />
				<feColorMatrix in="blur" :values="props.filterColorMatrixValues" />
			</filter>
		</svg>

		<div
			class="absolute inset-0 overflow-hidden cursor-default pointer-events-none select-none"
			:style="{
				filter: props.useFilter ? `url(#${props.filterId})` : undefined,
			}"
		>
			<div
				v-for="(_, i) in props.trailCount"
				:key="i"
				:ref="
					(el: HTMLElement | null) => {
						blobsRef[i] = el;
					}
				"
				class="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform transform"
				:style="{
					width: `${props.sizes[i]}px`,
					height: `${props.sizes[i]}px`,
					borderRadius: props.blobType === 'circle' ? '50%' : '0',
					backgroundColor: props.fillColor,
					opacity: props.opacities[i],
					boxShadow: `${props.shadowOffsetX}px ${props.shadowOffsetY}px ${props.shadowBlur}px 0 ${props.shadowColor}`,
				}"
			>
				<div
					class="absolute"
					:style="{
						width: `${props.innerSizes[i]}px`,
						height: `${props.innerSizes[i]}px`,
						top: `${(props.sizes[i] - props.innerSizes[i]) / 2}px`,
						left: `${(props.sizes[i] - props.innerSizes[i]) / 2}px`,
						backgroundColor: props.innerColor,
						borderRadius: props.blobType === 'circle' ? '50%' : '0',
					}"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import gsap from "gsap";
	import { onMounted, onUnmounted, ref } from "vue";

	interface BlobCursorProps {
		blobType?: "circle" | "square"
		fillColor?: string
		trailCount?: number
		sizes?: number[]
		innerSizes?: number[]
		innerColor?: string
		opacities?: number[]
		shadowColor?: string
		shadowBlur?: number
		shadowOffsetX?: number
		shadowOffsetY?: number
		filterId?: string
		filterStdDeviation?: number
		filterColorMatrixValues?: string
		useFilter?: boolean
		fastDuration?: number
		slowDuration?: number
		fastEase?: string
		slowEase?: string
		zIndex?: number
	}

	const props = withDefaults(defineProps<BlobCursorProps>(), {
		blobType: "circle",
		fillColor: "#27FF64",
		trailCount: 3,
		sizes: () => [60, 125, 75],
		innerSizes: () => [20, 35, 25],
		innerColor: "rgba(255,255,255,0.8)",
		opacities: () => [0.6, 0.6, 0.6],
		shadowColor: "rgba(0,0,0,0.75)",
		shadowBlur: 5,
		shadowOffsetX: 10,
		shadowOffsetY: 10,
		filterId: "blob",
		filterStdDeviation: 30,
		filterColorMatrixValues: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10",
		useFilter: true,
		fastDuration: 0.1,
		slowDuration: 0.5,
		fastEase: "power3.out",
		slowEase: "power1.out",
		zIndex: 100
	});

	const containerRef = ref<HTMLDivElement | null>(null);
	const blobsRef = ref<(HTMLElement | null)[]>([]);

	const updateOffset = () => {
		if (!containerRef.value) return { left: 0, top: 0 };
		const rect = containerRef.value.getBoundingClientRect();
		return { left: rect.left, top: rect.top };
	};

	const handleMove = (e: MouseEvent | TouchEvent) => {
		const { left, top } = updateOffset();
		const x = "clientX" in e ? e.clientX : e.touches[0].clientX;
		const y = "clientY" in e ? e.clientY : e.touches[0].clientY;

		blobsRef.value.forEach((el, i) => {
			if (!el) return;

			const isLead = i === 0;
			gsap.to(el, {
				x: x - left,
				y: y - top,
				duration: isLead ? props.fastDuration : props.slowDuration,
				ease: isLead ? props.fastEase : props.slowEase
			});
		});
	};

	onMounted(() => {
		if (!updateOffset) return;
		window.addEventListener("resize", updateOffset);
	});

	onUnmounted(() => {
		window.removeEventListener("resize", updateOffset);
	});
</script>
