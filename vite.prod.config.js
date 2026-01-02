import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	base: '/Squaredle-JS/',
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
