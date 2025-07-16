<template>
	<div
		class="relative"
		:style="{ width: `${cardDimensions?.width}px`, height: `${cardDimensions?.height}px`, perspective: 600 }"
	>
		<ClientOnly>
			<template v-for="(card, index) in cards" :key="card.id">
				<Motion
					as="div"
					class="absolute cursor-grab"
					:style="{
						x: cardStates.get(card.id)?.x,
						y: cardStates.get(card.id)?.y,
						rotateX: cardStates.get(card.id)?.rotateX,
						rotateY: cardStates.get(card.id)?.rotateY,
					}"
					drag
					:drag-constraints="{ top: 0, right: 0, bottom: 0, left: 0 }"
					:drag-elastic="0.6"
					:while-tap="{ cursor: 'grabbing', scale: 1.02 }"
					:on-drag-end="(e, info) => handleDragEnd(e, info, card.id)"
				>
					<Motion
						as="div"
						class="rounded-2xl overflow-hidden border-4 border-white"
						:animate="{
							rotateZ: (cards.length - index - 1) * 4 + (randomRotation ? Math.random() * 10 - 5 : 0),
							scale: 1 + index * 0.06 - cards.length * 0.06,
							transformOrigin: '90% 90%',
						}"
						:initial="false"
						:transition="{
							type: 'spring',
							stiffness: animationConfig?.stiffness,
							damping: animationConfig?.damping,
						}"
						:style="{
							width: `${cardDimensions?.width}px`,
							height: `${cardDimensions?.height}px`,
						}"
						@click="sendToBackOnClick && sendToBack(card.id)"
					>
						<img :src="card.img" :alt="`card-${card.id}`" className="w-full h-full object-cover pointer-events-none">
					</Motion>
				</Motion>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
	import type { PanInfo } from "motion-v";
	import { Motion, useMotionValue, useTransform } from "motion-v";
	import { onBeforeMount, ref } from "vue";

	interface StackProps {
		className?: string
		randomRotation?: boolean
		sensitivity?: number
		cardDimensions?: { width: number, height: number }
		cardsData: { id: number, img: string }[]
		animationConfig?: { stiffness: number, damping: number }
		sendToBackOnClick?: boolean
	}

	const props = withDefaults(defineProps<StackProps>(), {
		randomRotation: false,
		sensitivity: 200,
		cardDimensions: () => ({ width: 208, height: 208 }),
		cardsData: () => [],
		animationConfig: () => ({ stiffness: 260, damping: 20 }),
		sendToBackOnClick: false
	});

	const cards = ref(
		props.cardsData.length
			? props.cardsData
			: [
				{ id: 1, img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format" },
				{ id: 2, img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format" },
				{ id: 3, img: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format" },
				{ id: 4, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format" }
			]
	);

	interface CardState {
		x: ReturnType<typeof useMotionValue<number>>
		y: ReturnType<typeof useMotionValue<number>>
		rotateX: ReturnType<typeof useMotionValue<number>>
		rotateY: ReturnType<typeof useMotionValue<number>>
		reset: () => void
	}

	const cardStates = new Map<number, CardState>();

	function createCardState(): CardState {
		const x = useMotionValue(0);
		const y = useMotionValue(0);

		const rotateX = useTransform(y, [-100, 100], [60, -60]);
		const rotateY = useTransform(x, [-100, 100], [-60, 60]);

		return {
			x,
			y,
			rotateX,
			rotateY,
			reset() {
				x.set(0);
				y.set(0);
			}
		};
	}

	onBeforeMount(() => {
		cards.value.forEach((card) => {
			if (!cardStates.has(card.id)) {
				cardStates.set(card.id, createCardState());
			}
		});
	});

	function getCardState(cardId: number): CardState {
		let state = cardStates.get(cardId);
		if (!state) {
			state = createCardState();
			cardStates.set(cardId, state);
		}
		return state;
	}

	const sendToBack = (id: number) => {
		const newCards = [...cards.value];
		const index = newCards.findIndex((card) => card.id === id);
		const [card] = newCards.splice(index, 1);
		newCards.unshift(card);
		cards.value = newCards;
	};

	function handleDragEnd(_: PointerEvent, info: PanInfo, cardId: number) {
		if (Math.abs(info.offset.x) > props.sensitivity || Math.abs(info.offset.y) > props.sensitivity) {
			sendToBack(cardId);
		} else {
			getCardState(cardId).reset();
		}
	}
</script>
