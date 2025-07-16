<template>
	<canvas
		ref="grainRef"
		class="pointer-events-none absolute top-0 left-0 h-screen w-screen"
		:style="`image-rendering: pixelated; mix-blend-mode: ${props.mixBlendMode}`"
	/>
</template>

<script setup lang="ts">
	import { onBeforeUnmount, onMounted, ref } from "vue";

	interface NoiseProps {
		patternRefreshInterval?: number
		patternAlpha?: number
		mixBlendMode?: string
	}

	const props = withDefaults(defineProps<NoiseProps>(), {
		patternRefreshInterval: 2,
		patternAlpha: 10,
		mixBlendMode: "normal"
	});

	const grainRef = ref<HTMLCanvasElement | null>(null);

	let animationId = 0;
	let frame = 0;
	const canvasSize = 1024;

	const resize = () => {
		const canvas = grainRef.value;
		if (!canvas) return;
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
	};

	let noiseData: ImageData;
	let noise32: Uint32Array;

	const initImageData = (ctx: CanvasRenderingContext2D) => {
		noiseData = ctx.createImageData(canvasSize, canvasSize);
		noise32 = new Uint32Array(noiseData.data.buffer);
	};

	const drawGrain = () => {
		const a = props.patternAlpha << 24;
		for (let i = 0; i < noise32.length; i++) {
			const v = (Math.random() * 255) | 0;
			noise32[i] = a | (v << 16) | (v << 8) | v;
		}
	};

	const loop = (ctx: CanvasRenderingContext2D) => {
		if (frame % Math.max(1, Math.round(props.patternRefreshInterval)) === 0) {
			drawGrain();
			ctx.putImageData(noiseData, 0, 0);
		}
		frame++;
		animationId = requestAnimationFrame(() => loop(ctx));
	};

	onMounted(() => {
		const canvas = grainRef.value;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		resize();
		initImageData(ctx);
		drawGrain();
		ctx.putImageData(noiseData, 0, 0);
		loop(ctx);

		window.addEventListener("resize", resize);
	});

	onBeforeUnmount(() => {
		window.removeEventListener("resize", resize);
		cancelAnimationFrame(animationId);
	});
</script>
