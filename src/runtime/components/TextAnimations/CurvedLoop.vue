<template>
	<div
		class="min-h-screen flex items-center justify-center w-full"
		:style="{
			visibility: isHydrated && ready ? 'visible' : 'hidden',
			cursor: cursorStyle,
		}"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="endDrag"
		@pointerleave="endDrag"
	>
		<svg
			class="select-none w-full overflow-visible block aspect-[100/12] text-[6rem] font-bold tracking-[5px] uppercase leading-none"
			viewBox="0 0 1440 120"
		>
			<text ref="measureRef" xml:space="preserve" style="visibility: hidden; opacity: 0; pointer-events: none;">
				{{ text }}
			</text>

			<defs>
				<path :id="pathId" ref="pathRef" :d="pathD" fill="none" stroke="transparent" />
			</defs>

			<text v-if="isHydrated && ready" xml:space="preserve" :class="className">
				<textPath :href="`#${pathId}`" xml:space="preserve">
					<tspan
						v-for="i in repeats"
						:key="i"
						:ref="(el: SVGTSpanElement) => {
							if (el) tspansRef[i - 1] = el
						}"
						:x="(i - 1) * spacing"
					>
						{{ text }}
					</tspan>
				</textPath>
			</text>
		</svg>
	</div>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

	interface CurvedLoopProps {
		marqueeText?: string
		speed?: number
		className?: string
		curveAmount?: number
		direction?: "left" | "right"
		interactive?: boolean
	}

	const props = withDefaults(defineProps<CurvedLoopProps>(), {
		marqueeText: "",
		speed: 2,
		className: "fill-black",
		curveAmount: 400,
		direction: "left",
		interactive: true
	});

	const isHydrated = ref(false);

	const text = computed(() => {
		const hasTrailing = /\s/.test(props.marqueeText);
		return (
			`${hasTrailing ? props.marqueeText.replace(/\s+$/, "") : props.marqueeText}\u00A0`
		);
	});

	const measureRef = ref<SVGTextElement | null>(null);
	const tspansRef = ref<SVGTSpanElement[]>([]);
	const pathRef = ref<SVGPathElement | null>(null);

	const pathLength = ref(0);
	const spacing = ref(0);

	let idCounter = 0;
	const pathId = `curve-${++idCounter}`;

	const pathD = computed(() => `M-100,40 Q500,${40 + props.curveAmount} 1540,40`);

	const dragRef = ref(false);
	const lastXRef = ref(0);
	const dirRef = ref<"left" | "right">(props.direction);
	const velRef = ref(0);

	let animationFrame: number | null = null;

	const updateSpacing = () => {
		if (measureRef.value && isHydrated.value) {
			spacing.value = measureRef.value.getComputedTextLength();
		}
	};

	const updatePathLength = () => {
		if (pathRef.value && isHydrated.value) {
			pathLength.value = pathRef.value.getTotalLength();
		}
	};

	const animate = () => {
		if (!spacing.value || !isHydrated.value) return;

		const step = () => {
			tspansRef.value.forEach((t) => {
				if (!t) return;
				let x = Number.parseFloat(t.getAttribute("x") || "0");
				if (!dragRef.value) {
					const delta = dirRef.value === "right" ? Math.abs(props.speed) : -Math.abs(props.speed);
					x += delta;
				}
				const maxX = (tspansRef.value.length - 1) * spacing.value;
				if (x < -spacing.value) x = maxX;
				if (x > maxX) x = -spacing.value;
				t.setAttribute("x", x.toString());
			});
			animationFrame = requestAnimationFrame(step);
		};
		step();
	};

	const stopAnimation = () => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
	};

	const repeats = computed(() => {
		if (!isHydrated.value) return 0;
		return pathLength.value && spacing.value ? Math.ceil(pathLength.value / spacing.value) + 2 : 0;
	});

	const ready = computed(() => {
		return isHydrated.value && pathLength.value > 0 && spacing.value > 0;
	});

	const onPointerDown = (e: PointerEvent) => {
		if (!props.interactive || !isHydrated.value) return;
		dragRef.value = true;
		lastXRef.value = e.clientX;
		velRef.value = 0;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	};

	const onPointerMove = (e: PointerEvent) => {
		if (!props.interactive || !dragRef.value || !isHydrated.value) return;
		const dx = e.clientX - lastXRef.value;
		lastXRef.value = e.clientX;
		velRef.value = dx;
		tspansRef.value.forEach((t) => {
			if (!t) return;
			let x = Number.parseFloat(t.getAttribute("x") || "0");
			x += dx;
			const maxX = (tspansRef.value.length - 1) * spacing.value;
			if (x < -spacing.value) x = maxX;
			if (x > maxX) x = -spacing.value;
			t.setAttribute("x", x.toString());
		});
	};

	const endDrag = () => {
		if (!props.interactive || !isHydrated.value) return;
		dragRef.value = false;
		dirRef.value = velRef.value > 0 ? "right" : "left";
	};

	const cursorStyle = computed(() => {
		if (!isHydrated.value) return "auto";
		return props.interactive
			? dragRef.value
				? "grabbing"
				: "grab"
			: "auto";
	});

	onMounted(() => {
		isHydrated.value = true;

		nextTick(() => {
			updateSpacing();
			updatePathLength();
			animate();
		});
	});

	onUnmounted(() => {
		stopAnimation();
	});

	watch([text, () => props.className], () => {
		if (isHydrated.value) {
			nextTick(() => {
				updateSpacing();
			});
		}
	});

	watch(() => props.curveAmount, () => {
		if (isHydrated.value) {
			nextTick(() => {
				updatePathLength();
			});
		}
	});

	watch([spacing, () => props.speed], () => {
		if (isHydrated.value) {
			stopAnimation();
			if (spacing.value) {
				animate();
			}
		}
	});

	watch(repeats, () => {
		tspansRef.value = [];
	});
</script>
