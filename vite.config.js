import dsv from '@rollup/plugin-dsv';
import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
	plugins: [dsv()],
	build: {
		target: 'es2022', // or 'esnext'
	},
	esbuild: {
		target: 'es2022',
		supported: {
			'top-level-await': true
		},
	},
	resolve: {
		alias: {
			// eslint-disable-next-line no-undef
			"~": path.resolve(__dirname, './src/'),
		}
	},
	base: '/',
	server: {
		host: '0.0.0.0',
		port: 8194,
		https: {
			key: "crt/localhost.key",
			cert: "crt/localhost.crt"
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2022',
		},
	},
	clearScreen: false,
});
