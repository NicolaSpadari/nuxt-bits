<template>
	<div
		ref="containerRef"
		class="bg-[#222] text-white rounded-[15px] border-2 border-white w-[300px] max-w-full relative overflow-hidden" :class="[
			props.className,
		]"
		:style="props.style"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
		@click="handleClick"
	>
		<div :style="{ paddingTop: props.aspectRatio }" />

		<div class="absolute inset-0 w-full h-full">
			<slot name="firstContent" />
		</div>

		<div ref="activeRef" class="absolute inset-0 w-full h-full z-[2]" style="display: none">
			<slot name="secondContent" />
		</div>

		<div ref="pixelGridRef" class="absolute inset-0 w-full h-full pointer-events-none z-[3]" />
	</div>
</template>

<script setup lang="ts">
	import { gsap } from "gsap";
	import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

	interface PixelTransitionProps {
		gridSize?: number
		pixelColor?: string
		animationStepDuration?: number
		className?: string
		style?: Record<string, string | number>
		aspectRatio?: string
	}

	const props = withDefaults(defineProps<PixelTransitionProps>(), {
		gridSize: 7,
		pixelColor: "currentColor",
		animationStepDuration: 0.3,
		className: "",
		style: () => ({}),
		aspectRatio: "100%"
	});

	const containerRef = ref<HTMLDivElement | null>(null);
	const pixelGridRef = ref<HTMLDivElement | null>(null);
	const activeRef = ref<HTMLDivElement | null>(null);
	const isActive = ref(false);
	let delayedCall: gsap.core.Tween | null = null;

	const isTouchDevice
		= typeof window !== "undefined"
			&& ("ontouchstart" in window
				|| (navigator && navigator.maxTouchPoints > 0)
				|| (window.matchMedia && window.matchMedia("(pointer: coarse)").matches));

	function buildPixelGrid() {
		const pixelGridEl = pixelGridRef.value;
		if (!pixelGridEl) return;
		pixelGridEl.innerHTML = "";
		for (let row = 0; row < props.gridSize; row++) {
			for (let col = 0; col < props.gridSize; col++) {
				const pixel = document.createElement("div");
				pixel.classList.add("pixelated-image-card__pixel", "absolute", "hidden");
				pixel.style.backgroundColor = props.pixelColor;
				const size = 100 / props.gridSize;
				pixel.style.width = `${size}%`;
				pixel.style.height = `${size}%`;
				pixel.style.left = `${col * size}%`;
				pixel.style.top = `${row * size}%`;
				pixelGridEl.appendChild(pixel);
			}
		}
	}

	async function animatePixels(activate: boolean) {
		isActive.value = activate;
		await nextTick();
		const pixelGridEl = pixelGridRef.value;
		const activeEl = activeRef.value;
		if (!pixelGridEl || !activeEl) return;
		const pixels = pixelGridEl.querySelectorAll<HTMLDivElement>(".pixelated-image-card__pixel");
		if (!pixels.length) return;
		gsap.killTweensOf(pixels);
		if (delayedCall) delayedCall.kill();
		gsap.set(pixels, { display: "none" });
		const totalPixels = pixels.length;
		const staggerDuration = props.animationStepDuration / totalPixels;
		gsap.to(pixels, {
			display: "block",
			duration: 0,
			stagger: {
				each: staggerDuration,
				from: "random"
			}
		});
		delayedCall = gsap.delayedCall(props.animationStepDuration, () => {
			activeEl.style.display = activate ? "block" : "none";
			activeEl.style.pointerEvents = activate ? "none" : "";
		});
		gsap.to(pixels, {
			display: "none",
			duration: 0,
			delay: props.animationStepDuration,
			stagger: {
				each: staggerDuration,
				from: "random"
			}
		});
	}

	function handleMouseEnter() {
		if (isTouchDevice) return;
		if (!isActive.value) animatePixels(true);
	}
	function handleMouseLeave() {
		if (isTouchDevice) return;
		if (isActive.value) animatePixels(false);
	}
	function handleClick() {
		if (!isTouchDevice) return;
		animatePixels(!isActive.value);
	}

	onMounted(async () => {
		await nextTick();
		buildPixelGrid();
	});

	watch(
		() => [props.gridSize, props.pixelColor],
		() => {
			buildPixelGrid();
		}
	);

	onUnmounted(() => {
		if (delayedCall) delayedCall.kill();
	});
</script>

<style scoped>
.pixelated-image-card__pixel {
 @apply transition-none;
}
</style>
