import crypto from 'crypto'
import { createRequestHandler as _createRequestHandler } from '@remix-run/express'
import { installGlobals } from '@remix-run/node'
import * as Sentry from '@sentry/remix'
import { ip as ipAddress } from 'address'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import getPort, { portNumbers } from 'get-port'
import helmet from 'helmet'
import morgan from 'morgan'
installGlobals()
const MODE = process.env.NODE_ENV ?? 'development'
const createRequestHandler =
	MODE === 'production'
		? Sentry.wrapExpressCreateRequestHandler(_createRequestHandler)
		: _createRequestHandler
const viteDevServer =
	MODE === 'production'
		? void 0
		: await import('vite').then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
			)
const app = express()
const getHost = (req) => req.get('X-Forwarded-Host') ?? req.get('host') ?? ''
app.set('trust proxy', true)
app.use((req, res, next) => {
	const proto = req.get('X-Forwarded-Proto')
	const host = getHost(req)
	if (proto === 'http') {
		res.set('X-Forwarded-Proto', 'https')
		res.redirect(`https://${host}${req.originalUrl}`)
		return
	}
	next()
})
app.get('*', (req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
		res.redirect(302, safepath + query)
	} else {
		next()
	}
})
app.use(compression())
app.disable('x-powered-by')
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	app.use(
		'/assets',
		express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
	)
	app.use(express.static('build/client', { maxAge: '1h' }))
}
app.get(['/img/*', '/favicons/*'], (req, res) => {
	return res.status(404).send('Not found')
})
morgan.token('url', (req) => decodeURIComponent(req.url ?? ''))
app.use(
	morgan('tiny', {
		skip: (req, res) =>
			res.statusCode === 200 &&
			(req.url?.startsWith('/resources/note-images') ||
				req.url?.startsWith('/resources/user-images') ||
				req.url?.startsWith('/resources/healthcheck')),
	}),
)
app.use((_, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})
app.use(
	helmet({
		referrerPolicy: { policy: 'same-origin' },
		crossOriginEmbedderPolicy: true,
		xFrameOptions: false,
		contentSecurityPolicy: {
			// NOTE: Remove reportOnly when you're ready to enforce this CSP
			reportOnly: true,
			directives: {
				'connect-src': [
					MODE === 'development' ? 'ws:' : null,
					process.env.SENTRY_DSN ? '*.ingest.sentry.io' : null,
					"'self'",
				].filter(Boolean),
				'font-src': ["'self'"],
				'frame-src': ["'self'"],
				'frame-ancestors': ['http://localhost:5639'],
				'img-src': ["'self'", 'data:'],
				'script-src': [
					"'strict-dynamic'",
					"'self'",
					// @ts-expect-error
					(_, res) => `'nonce-${res.locals.cspNonce}'`,
				],
				'script-src-attr': [
					// @ts-expect-error
					(_, res) => `'nonce-${res.locals.cspNonce}'`,
				],
				'upgrade-insecure-requests': null,
			},
		},
	}),
)
const maxMultiple =
	MODE !== 'production' || process.env.PLAYWRIGHT_TEST_BASE_URL ? 1e4 : 1
const rateLimitDefault = {
	windowMs: 60 * 1e3,
	max: 1e3 * maxMultiple,
	standardHeaders: true,
	legacyHeaders: false,
	// Fly.io prevents spoofing of X-Forwarded-For
	// so no need to validate the trustProxy config
	validate: { trustProxy: false },
}
const strongestRateLimit = rateLimit({
	...rateLimitDefault,
	windowMs: 60 * 1e3,
	max: 10 * maxMultiple,
})
const strongRateLimit = rateLimit({
	...rateLimitDefault,
	windowMs: 60 * 1e3,
	max: 100 * maxMultiple,
})
const generalRateLimit = rateLimit(rateLimitDefault)
app.use((req, res, next) => {
	const strongPaths = [
		'/login',
		'/signup',
		'/verify',
		'/admin',
		'/onboarding',
		'/reset-password',
		'/settings/profile',
		'/resources/login',
		'/resources/verify',
	]
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		if (strongPaths.some((p) => req.path.includes(p))) {
			return strongestRateLimit(req, res, next)
		}
		return strongRateLimit(req, res, next)
	}
	if (req.path.includes('/verify')) {
		return strongestRateLimit(req, res, next)
	}
	return generalRateLimit(req, res, next)
})
async function getBuild() {
	const build = viteDevServer
		? viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: // @ts-ignore this should exist before running the server
			// but it may not exist just yet.
			await import('#build/server/index.js')
	return build
}
app.all(
	'*',
	createRequestHandler({
		getLoadContext: (_, res) => ({
			cspNonce: res.locals.cspNonce,
			serverBuild: getBuild(),
		}),
		mode: MODE,
		// @sentry/remix needs to be updated to handle the function signature
		build: MODE === 'production' ? await getBuild() : getBuild,
	}),
)
const desiredPort = Number(process.env.PORT || 3e3)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})
const server = app.listen(portToUse, () => {
	const addy = server.address()
	const portUsed =
		desiredPort === portToUse
			? desiredPort
			: addy && typeof addy === 'object'
				? addy.port
				: 0
	if (portUsed !== desiredPort) {
		console.warn(
			chalk.yellow(
				`\u26A0\uFE0F  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}
	console.log(`\u{1F680}  We have liftoff!`)
	const localUrl = `http://localhost:${portUsed}`
	let lanUrl = null
	const localIp = ipAddress() ?? 'Unknown'
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portUsed}`
	}
	console.log(
		`
${chalk.bold('Local:')}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold('On Your Network:')}  ${chalk.cyan(lanUrl)}` : ''}
${chalk.bold('Press Ctrl+C to stop')}
		`.trim(),
	)
})
closeWithGrace(async () => {
	await new Promise((resolve, reject) => {
		server.close((e) => (e ? reject(e) : resolve('ok')))
	})
})
//# sourceMappingURL=index.js.map
