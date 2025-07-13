<template>
	<div ref="svgRef" class="relative" :style="{ width: `${width}px`, height: `${height}px` }">
		<svg
			viewBox="-60 -75 720 900"
			preserveAspectRatio="xMidYMid slice"
			class="relative size-full block [will-change:transform]"
		>
			<filter id="imgFilter">
				<feTurbulence
					type="turbulence"
					baseFrequency="0.015"
					numOctaves="5"
					seed="4"
					stitchTiles="stitch"
					x="0%"
					y="0%"
					width="100%"
					height="100%"
					result="turbulence1"
				/>

				<feDisplacementMap
					ref="displacementMapRef"
					in="SourceGraphic"
					in2="turbulence1"
					scale="0"
					xChannelSelector="R"
					yChannelSelector="B"
					x="0%"
					y="0%"
					width="100%"
					height="100%"
					result="displacementMap3"
				/>
			</filter>

			<g>
				<image
					:href="image"
					x="0"
					y="0"
					width="600"
					height="750"
					filter="url(#imgFilter)"
					preserveAspectRatio="xMidYMid slice"
				/>
			</g>
		</svg>

		<div
			class="absolute bottom-[1.2em] left-[1em] tracking-[-0.5px] font-black text-[2rem] leading-[1.5em] first-line:text-[4rem]"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { gsap } from "gsap";
	import { onMounted, onUnmounted, ref } from "vue";

	interface Props {
		width?: number
		height?: number
		image?: string
	}

	withDefaults(defineProps<Props>(), {
		width: 300,
		height: 400,
		image: "https://picsum.photos/300/400?grayscale"
	});

	const svgRef = ref<HTMLDivElement | null>(null);
	const displacementMapRef = ref<SVGFEDisplacementMapElement | null>(null);

	let cursor = {
		x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
		y: typeof window !== "undefined" ? window.innerHeight / 2 : 0
	};

	let cachedCursor = { ...cursor };

	let winsize = {
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0
	};

	let animationFrameId: number | null = null;

	const lerp = (a: number, b: number, n: number): number => (1 - n) * a + n * b;

	const map = (x: number, a: number, b: number, c: number, d: number): number => ((x - a) * (d - c)) / (b - a) + c;

	const distance = (x1: number, x2: number, y1: number, y2: number): number => Math.hypot(x1 - x2, y1 - y2);

	const handleResize = (): void => {
		winsize = {
			width: window.innerWidth,
			height: window.innerHeight
		};
	};

	const handleMouseMove = (ev: MouseEvent): void => {
		cursor = { x: ev.clientX, y: ev.clientY };
	};

	const imgValues = {
		imgTransforms: { x: 0, y: 0, rz: 0 },
		displacementScale: 0
	};

	const render = () => {
		let targetX = lerp(imgValues.imgTransforms.x, map(cursor.x, 0, winsize.width, -120, 120), 0.1);
		let targetY = lerp(imgValues.imgTransforms.y, map(cursor.y, 0, winsize.height, -120, 120), 0.1);
		const targetRz = lerp(imgValues.imgTransforms.rz, map(cursor.x, 0, winsize.width, -10, 10), 0.1);

		const bound = 50;
		if (targetX > bound) targetX = bound + (targetX - bound) * 0.2;
		if (targetX < -bound) targetX = -bound + (targetX + bound) * 0.2;
		if (targetY > bound) targetY = bound + (targetY - bound) * 0.2;
		if (targetY < -bound) targetY = -bound + (targetY + bound) * 0.2;

		imgValues.imgTransforms.x = targetX;
		imgValues.imgTransforms.y = targetY;
		imgValues.imgTransforms.rz = targetRz;

		if (svgRef.value) {
			gsap.set(svgRef.value, {
				x: imgValues.imgTransforms.x,
				y: imgValues.imgTransforms.y,
				rotateZ: imgValues.imgTransforms.rz
			});
		}

		const cursorTravelledDistance = distance(cachedCursor.x, cursor.x, cachedCursor.y, cursor.y);
		imgValues.displacementScale = lerp(imgValues.displacementScale, map(cursorTravelledDistance, 0, 200, 0, 400), 0.06);

		if (displacementMapRef.value) {
			gsap.set(displacementMapRef.value, {
				attr: { scale: imgValues.displacementScale }
			});
		}

		cachedCursor = { ...cursor };

		animationFrameId = requestAnimationFrame(render);
	};

	onMounted(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("resize", handleResize);
			window.addEventListener("mousemove", handleMouseMove);
			render();
		}
	});

	onUnmounted(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
		}
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	});
</script>
