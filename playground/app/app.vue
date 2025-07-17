<template>
	<div class="flex flex-col items-center justify-center gap-y-24 py-10">
		<BitsSplitText
			text="Hello, NuxtBits!"
			class-name="text-5xl font-semibold text-center"
			:delay="100"
			:duration="0.6"
			ease="power3.out"
			split-type="chars"
			:from="{ opacity: 0, y: 40 }"
			:to="{ opacity: 1, y: 0 }"
			:threshold="0.1"
			root-margin="-100px"
			text-align="center"
			@animation-complete="handleAnimationComplete"
		/>

		<BitsCurvedLoop
			marquee-text="Be ✦ Creative ✦ With ✦ Nuxt ✦ Bits ✦"
			:speed="2"
			:curve-amount="400"
			direction="left"
			:interactive="true"
			class-name="fill-white"
		/>
	</div>
</template>

<script lang="ts" setup>
	const handleAnimationComplete = () => {
		console.log("Animation completed!");
	};
</script>
