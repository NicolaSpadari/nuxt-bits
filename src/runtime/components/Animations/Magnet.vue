<template>
	<div
		ref="magnetRef"
		:class="wrapperClassName"
		:style="{ position: 'relative', display: 'inline-block' }"
		v-bind="$attrs"
	>
		<div
			:class="innerClassName"
			:style="{
				transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
				transition: transitionStyle,
				willChange: 'transform',
			}"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";

	interface Props {
		padding?: number
		disabled?: boolean
		magnetStrength?: number
		activeTransition?: string
		inactiveTransition?: string
		wrapperClassName?: string
		innerClassName?: string
	}

	defineOptions({
		inheritAttrs: false
	});

	const props = withDefaults(defineProps<Props>(), {
		padding: 100,
		disabled: false,
		magnetStrength: 2,
		activeTransition: "transform 0.3s ease-out",
		inactiveTransition: "transform 0.5s ease-in-out",
		wrapperClassName: "",
		innerClassName: ""
	});

	const magnetRef = ref<HTMLDivElement | null>(null);
	const isActive = ref(false);
	const position = ref({ x: 0, y: 0 });

	const transitionStyle = computed(() => (isActive.value ? props.activeTransition : props.inactiveTransition));

	const handleMouseMove = (e: MouseEvent) => {
		if (!magnetRef.value || props.disabled) return;

		const { left, top, width, height } = magnetRef.value.getBoundingClientRect();
		const centerX = left + width / 2;
		const centerY = top + height / 2;

		const distX = Math.abs(centerX - e.clientX);
		const distY = Math.abs(centerY - e.clientY);

		if (distX < width / 2 + props.padding && distY < height / 2 + props.padding) {
			isActive.value = true;
			const offsetX = (e.clientX - centerX) / props.magnetStrength;
			const offsetY = (e.clientY - centerY) / props.magnetStrength;
			position.value = { x: offsetX, y: offsetY };
		} else {
			isActive.value = false;
			position.value = { x: 0, y: 0 };
		}
	};

	onMounted(() => {
		window.addEventListener("mousemove", handleMouseMove);
	});

	onUnmounted(() => {
		window.removeEventListener("mousemove", handleMouseMove);
	});

	watch(
		() => props.disabled,
		(newDisabled) => {
			if (newDisabled) {
				position.value = { x: 0, y: 0 };
				isActive.value = false;
			}
		}
	);
</script>
