export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/image",
		"@nuxt/eslint",
		"@nuxt/icon"
	],
	eslint: {
		config: {
			standalone: false
		}
	}
});
