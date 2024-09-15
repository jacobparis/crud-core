import { vitePlugin as remix } from '@remix-run/dev'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { glob } from 'glob'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'

const MODE = process.env.NODE_ENV

export default defineConfig({
	build: {
		cssMinify: MODE === 'production',

		rollupOptions: {
			external: [/node:.*/, 'fsevents'],
		},

		assetsInlineLimit: (source: string) => {
			if (
				source.endsWith('sprite.svg') ||
				source.endsWith('favicon.svg') ||
				source.endsWith('apple-touch-icon.png')
			) {
				return false
			}
		},
	},
	server: {
		port: Number(process.env.PORT) || 3000,
		host: process.env.HOST || 'localhost',
		fs: {
			allow: ['..'],
		},
	},
	plugins: [
		envOnlyMacros(),
		// it would be really nice to have this enabled in tests, but we'll have to
		// wait until https://github.com/remix-run/remix/issues/9871 is fixed
		process.env.NODE_ENV === 'test'
			? null
			: remix({
					ignoredRouteFiles: ['**/*'],
					serverModuleFormat: 'esm',
					routes: async (defineRoutes) => {
						return flatRoutes('routes', defineRoutes, {
							ignoredRouteFiles: [
								'.*',
								'**/*.css',
								'**/*.test.{js,jsx,ts,tsx}',
								'**/__*.*',
								// This is for server-side utilities you want to colocate
								// next to your routes without making an additional
								// directory. If you need a route that includes "server" or
								// "client" in the filename, use the escape brackets like:
								// my-route.[server].tsx
								'**/*.server.*',
								'**/*.client.*',
							],
						})
					},
				}),
		process.env.SENTRY_AUTH_TOKEN
			? sentryVitePlugin({
					disable: MODE !== 'production',
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					authToken: process.env.SENTRY_AUTH_TOKEN,
					release: {
						name: process.env.COMMIT_SHA,
					},
					sourcemaps: {
						filesToDeleteAfterUpload: await glob([
							'./build/client/**/*.js.map',
							'./build/server/**/*.js.map',
						]),
					},
				})
			: null,
	],
})
