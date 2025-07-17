import { addComponentsDir, addImportsDir, addVitePlugin, createResolver, defineNuxtModule, installModule } from "@nuxt/kit";

export interface ModuleOptions {
	prefix?: string
}

const componentsFolders = ["Animations", "Backgrounds", "Components", "TextAnimations"];

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: "nuxt-bits",
		configKey: "bits",
		compatibility: {
			nuxt: ">=3.6.0"
		}
	},
	defaults: {
		prefix: "Bits"
	},
	async setup(options, nuxt) {
		const { resolve } = createResolver(import.meta.url);

		nuxt.options.css.push(resolve("./runtime/assets/styles.css"));

		if (nuxt.options.builder === "@nuxt/vite-builder") {
			const plugin = await import("@tailwindcss/vite").then((r) => r.default);
			addVitePlugin(plugin);
		} else {
			nuxt.options.postcss.plugins["@tailwindcss/postcss"] = {};
		}

		await installModule("@vueuse/nuxt");

		componentsFolders.forEach((folder) => {
			addComponentsDir({
				path: resolve(`./runtime/components/${folder}`),
				prefix: options.prefix,
				pathPrefix: false
			});
		});

		addImportsDir(resolve("./runtime/composables"));
	}
});
