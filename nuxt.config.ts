export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/image",
		"@nuxt/eslint",
		"@nuxt/icon",
		"@nuxtjs/tailwindcss"
	],
	eslint: {
		config: {
			standalone: false
		}
	}
});
