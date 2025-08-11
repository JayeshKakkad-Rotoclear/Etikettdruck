import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use Node.js adapter for production deployment
		adapter: adapter({
			out: 'build',
			precompress: true,
			env: {
				socketPath: false,
				host: '0.0.0.0',
				port: 3000
			}
		})
	}
};

export default config;
