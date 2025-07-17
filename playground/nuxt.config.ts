export default defineNuxtConfig({
	modules: ["@nuxt/ui", "../src/module"],
	bits: {
		prefix: "Bits"
	},
	css: [
		"@/assets/css/main.css"
	],
	devtools: { enabled: true },
	compatibilityDate: "2025-07-01"
});
