import { addComponentsDir, createResolver, defineNuxtModule, installModule } from "@nuxt/kit";

export interface ModuleOptions {
	prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: "nuxt-bits",
		configKey: "bits"
	},
	defaults: {
		prefix: "Bits"
	},
	async setup(options, nuxt) {
		const resolver = createResolver(import.meta.url);

		nuxt.options.css.push(resolver.resolve("./runtime/assets/styles.css"));

		await installModule("@vueuse/nuxt");

		await installModule("@nuxtjs/tailwindcss", {
			exposeConfig: true,
			config: {
				darkMode: "class",
				content: {
					files: [
						resolver.resolve("./runtime/components/**/*.{vue,mjs,ts}"),
						resolver.resolve("./runtime/*.{mjs,js,ts}")
					]
				}
			}
		});

		addComponentsDir({
			path: resolver.resolve("./runtime/components"),
			prefix: options.prefix,
			pathPrefix: false
		});
	}
});
