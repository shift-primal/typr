import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, lazyPlugins } from "vite-plus";

const config = defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt: {
		useTabs: true,
		printWidth: 80,
		sortImports: true,
		ignorePatterns: [
			"src/routeTree.gen.ts",
			"src/styles.css",
			"./node_modules/*",
		],
	},
	lint: {
		ignorePatterns: ["src/routeTree.gen.ts", "./node_modules/*"],
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
	resolve: { tsconfigPaths: true },
	test: { include: ["src/**/*.test.{ts,tsx}"] },
	plugins: lazyPlugins(() =>
		process.env.VITEST
			? []
			: [
					devtools(),
					nitro({
						features: { websocket: true },
						routes: { "/api/ws": "./src/server/realtime/socket.ts" },
						plugins: ["./src/server/plugins/shutdown.ts"],
					}),
					tailwindcss(),
					tanstackStart(),
					viteReact(),
					babel({ presets: [reactCompilerPreset()] }),
				],
	),
});

export default config;
