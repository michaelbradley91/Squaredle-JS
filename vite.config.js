import dsv from '@rollup/plugin-dsv';
import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
	plugins: [dsv()],
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
	clearScreen: false,
});
