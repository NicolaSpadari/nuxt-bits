import { addComponentsDir, addImportsDir, createResolver, defineNuxtModule, installModule } from "@nuxt/kit";

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

		await installModule("@vueuse/nuxt");

		await installModule("@nuxtjs/tailwindcss", {
			exposeConfig: true,
			config: {
				darkMode: "class",
				content: {
					files: [
						resolve("./runtime/components/**/*.{vue,mjs,ts}"),
						resolve("./runtime/*.{mjs,js,ts}")
					]
				}
			}
		});

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
