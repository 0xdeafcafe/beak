/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const reactRefresh = require('@vitejs/plugin-react-refresh');

const environment = process.env.NODE_ENV;
// const buildEnvironment = process.env.BUILD_ENVIRONMENT;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
	mode: environment,
	jsx: 'react',
	root: './src',
	publicDir: '../public',
	resolve: {
		alias: {
			'@beak/website': path.join(__dirname, './src'),
			'@beak/common': path.join(__dirname, '../common/src'),
			'@beak/design-system': path.join(__dirname, '../design-system/src'),
		},
	},
	plugins: [
		reactRefresh({ include: '**/*.tsx' }),
	],
	build: {
		target: 'chrome93',
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: true,
		assetsDir: '.',
		minify: environment === 'development' ? false : 'terser',
		rollupOptions: {
			external: ['electron'],
			output: {
				entryFileNames: '[name].[format].js',
				chunkFileNames: '[name].[format].js',
				assetFileNames: '[name].[ext]',
			},
		},
	},
};
