<template>
	<div :class="`flex flex-col items-center justify-center gap-4 w-48 ${className}`">
		<div
			class="flex w-full touch-none select-none items-center justify-center gap-4"
			:style="{
				scale,
				opacity: sliderOpacity,
			}"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
			@touchstart="handleTouchStart"
			@touchend="handleTouchEnd"
		>
			<div
				ref="leftIconRef"
				:style="{
					transform: `translateX(${leftIconTranslateX}px) scale(${leftIconScale})`,
				}"
				class="transition-transform duration-200 ease-out"
			>
				<slot name="left-icon">
					<component :is="leftIcon" v-if="leftIcon && typeof leftIcon === 'object'" />

					<span v-else-if="leftIcon">{{ leftIcon }}</span>

					<span v-else>-</span>
				</slot>
			</div>

			<div
				ref="sliderRef"
				class="relative flex w-full max-w-xs flex-grow cursor-grab touch-none select-none items-center py-4"
				@pointermove="handlePointerMove"
				@pointerdown="handlePointerDown"
				@pointerup="handlePointerUp"
			>
				<div
					:style="{
						transform: `scaleX(${sliderScaleX}) scaleY(${sliderScaleY})`,
						transformOrigin,
						height: `${sliderHeight}px`,
						marginTop: `${sliderMarginTop}px`,
						marginBottom: `${sliderMarginBottom}px`,
					}"
					class="flex flex-grow"
				>
					<div class="relative h-full flex-grow overflow-hidden rounded-full bg-gray-400">
						<div class="absolute h-full bg-[#27FF64] rounded-full" :style="{ width: `${rangePercentage}%` }" />
					</div>
				</div>
			</div>

			<div
				ref="rightIconRef"
				:style="{
					transform: `translateX(${rightIconTranslateX}px) scale(${rightIconScale})`,
				}"
				class="transition-transform duration-200 ease-out"
			>
				<slot name="right-icon">
					<component :is="rightIcon" v-if="rightIcon && typeof rightIcon === 'object'" />

					<span v-else-if="rightIcon">{{ rightIcon }}</span>

					<span v-else>+</span>
				</slot>
			</div>
		</div>

		<p class="absolute text-gray-400 transform -translate-y-6 font-medium tracking-wide">
			{{ Math.round(value) }}
		</p>
	</div>
</template>

<script setup lang="ts">
	import type { Component } from "vue";
	import { computed, onMounted, ref, watch } from "vue";

	const props = withDefaults(defineProps<Props>(), {
		defaultValue: 50,
		startingValue: 0,
		maxValue: 100,
		className: "",
		isStepped: false,
		stepSize: 1,
		leftIcon: "-",
		rightIcon: "+"
	});

	const MAX_OVERFLOW = 50;

	interface Props {
		defaultValue?: number
		startingValue?: number
		maxValue?: number
		className?: string
		isStepped?: boolean
		stepSize?: number
		leftIcon?: Component | string
		rightIcon?: Component | string
	}

	const sliderRef = ref<HTMLDivElement>();
	const leftIconRef = ref<HTMLDivElement>();
	const rightIconRef = ref<HTMLDivElement>();

	const value = ref(props.defaultValue);
	const region = ref<"left" | "middle" | "right">("middle");
	const clientX = ref(0);
	const overflow = ref(0);
	const scale = ref(1);
	const leftIconScale = ref(1);
	const rightIconScale = ref(1);

	let scaleAnimation: number | null = null;
	let overflowAnimation: number | null = null;

	const decay = (inputValue: number, max: number): number => {
		if (max === 0) return 0;
		const entry = inputValue / max;
		const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
		return sigmoid * max;
	};

	watch(
		() => props.defaultValue,
		(newValue) => {
			value.value = newValue;
		}
	);

	watch(clientX, (latest) => {
		if (sliderRef.value) {
			const { left, right } = sliderRef.value.getBoundingClientRect();
			let newValue: number;
			if (latest < left) {
				region.value = "left";
				newValue = left - latest;
			} else if (latest > right) {
				region.value = "right";
				newValue = latest - right;
			} else {
				region.value = "middle";
				newValue = 0;
			}
			overflow.value = decay(newValue, MAX_OVERFLOW);
		}
	});

	const rangePercentage = computed(() => {
		const totalRange = props.maxValue - props.startingValue;
		if (totalRange === 0) return 0;
		return ((value.value - props.startingValue) / totalRange) * 100;
	});

	const sliderScaleX = computed(() => {
		if (!sliderRef.value) return 1;
		const { width } = sliderRef.value.getBoundingClientRect();
		return 1 + overflow.value / width;
	});

	const sliderScaleY = computed(() => {
		const t = overflow.value / MAX_OVERFLOW;
		return 1 + t * (0.8 - 1);
	});

	const transformOrigin = computed(() => {
		if (!sliderRef.value) return "center";
		const { left, width } = sliderRef.value.getBoundingClientRect();
		return clientX.value < left + width / 2 ? "right" : "left";
	});

	const sliderHeight = computed(() => {
		const t = (scale.value - 1) / (1.2 - 1);
		return 6 + t * (12 - 6);
	});

	const sliderMarginTop = computed(() => {
		const t = (scale.value - 1) / (1.2 - 1);
		return 0 + t * (-3 - 0);
	});

	const sliderMarginBottom = computed(() => {
		const t = (scale.value - 1) / (1.2 - 1);
		return 0 + t * (-3 - 0);
	});

	const sliderOpacity = computed(() => {
		const t = (scale.value - 1) / (1.2 - 1);
		return 0.7 + t * (1 - 0.7);
	});

	const leftIconTranslateX = computed(() => {
		return region.value === "left" ? -overflow.value / scale.value : 0;
	});

	const rightIconTranslateX = computed(() => {
		return region.value === "right" ? overflow.value / scale.value : 0;
	});

	const animateValue = (target: { value: number }, to: number, duration = 300) => {
		const start = target.value;
		const diff = to - start;
		const startTime = performance.now();

		const animateFrame = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const easeOut = 1 - (1 - progress) ** 3;
			target.value = start + diff * easeOut;

			if (progress < 1) {
				return requestAnimationFrame(animateFrame);
			}
			return null;
		};

		return requestAnimationFrame(animateFrame);
	};

	const animateSpring = (target: { value: number }, to: number, bounce = 0.5, duration = 600) => {
		const start = target.value;
		const startTime = performance.now();

		const mass = 1;
		const stiffness = 170;
		const damping = 26 * (1 - bounce);

		const dampingRatio = damping / (2 * Math.sqrt(mass * stiffness));
		const angularFreq = Math.sqrt(stiffness / mass);
		const dampedFreq = angularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);

		const animateFrame = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const t = elapsed / 1000;

			let displacement: number;

			if (dampingRatio < 1) {
				const envelope = Math.exp(-dampingRatio * angularFreq * t);
				const cos = Math.cos(dampedFreq * t);
				const sin = Math.sin(dampedFreq * t);

				displacement = envelope * (cos + ((dampingRatio * angularFreq) / dampedFreq) * sin);
			} else {
				displacement = Math.exp(-angularFreq * t);
			}

			const currentValue = to + (start - to) * displacement;
			target.value = currentValue;

			const velocity = Math.abs(currentValue - to);
			const isSettled = velocity < 0.01 && elapsed > 100;

			if (!isSettled && elapsed < duration * 3) {
				return requestAnimationFrame(animateFrame);
			} else {
				target.value = to;
				return null;
			}
		};

		return requestAnimationFrame(animateFrame);
	};

	const animate = (
		target: { value: number },
		to: number,
		options: { type?: string, bounce?: number, duration?: number } = {}
	) => {
		const { type = "tween", bounce = 0, duration = 0.3 } = options;

		if (type === "spring") {
			return animateSpring(target, to, bounce, duration);
		} else {
			return animateValue(target, to, duration);
		}
	};

	const animateIconScale = (target: { value: number }, isActive: boolean) => {
		if (isActive) {
			animate(target, 1.4, { duration: 125 });
			setTimeout(() => {
				animate(target, 1, { duration: 125 });
			}, 125);
		} else {
			animate(target, 1, { duration: 250 });
		}
	};

	watch(region, (newRegion, oldRegion) => {
		if (newRegion === "left" && oldRegion !== "left") {
			animateIconScale(leftIconScale, true);
		} else if (newRegion === "right" && oldRegion !== "right") {
			animateIconScale(rightIconScale, true);
		}
	});

	const handlePointerMove = (e: PointerEvent) => {
		if (e.buttons > 0 && sliderRef.value) {
			const { left, width } = sliderRef.value.getBoundingClientRect();

			let newValue = props.startingValue + ((e.clientX - left) / width) * (props.maxValue - props.startingValue);

			if (props.isStepped) {
				newValue = Math.round(newValue / props.stepSize) * props.stepSize;
			}

			newValue = Math.min(Math.max(newValue, props.startingValue), props.maxValue);
			value.value = newValue;

			clientX.value = e.clientX;
		}
	};

	const handlePointerDown = (e: PointerEvent) => {
		handlePointerMove(e);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	};

	const handlePointerUp = () => {
		if (overflowAnimation) {
			cancelAnimationFrame(overflowAnimation);
		}
		overflowAnimation = animate(overflow, 0, { type: "spring", bounce: 0.4, duration: 500 });
	};

	const handleMouseEnter = () => {
		if (scaleAnimation) {
			cancelAnimationFrame(scaleAnimation);
		}
		scaleAnimation = animate(scale, 1.2, { duration: 200 });
	};

	const handleMouseLeave = () => {
		if (scaleAnimation) {
			cancelAnimationFrame(scaleAnimation);
		}
		scaleAnimation = animate(scale, 1, { duration: 200 });
	};

	const handleTouchStart = () => {
		if (scaleAnimation) {
			cancelAnimationFrame(scaleAnimation);
		}
		scaleAnimation = animate(scale, 1.2, { duration: 200 });
	};

	const handleTouchEnd = () => {
		if (scaleAnimation) {
			cancelAnimationFrame(scaleAnimation);
		}
		scaleAnimation = animate(scale, 1, { duration: 200 });
	};

	onMounted(() => {
		value.value = props.defaultValue;
	});
</script>
