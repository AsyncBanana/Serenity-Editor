import { Router } from 'itty-router'
import { Client as ClientConstructor, query as q } from 'faunadb'
import { jwtVerify } from 'jose-browser-runtime/jwt/verify'
import { createRemoteJWKSet } from 'jose-browser-runtime/jwks/remote'
import { AwsClient } from 'aws4fetch' // used for Storj S3 compatible API
import { nanoid } from 'nanoid'
declare global {
  const FAUNA_SECRET: string
  const STORJ_KEY: string
  const STORJ_PASSPHRASE: string
  const STORJ_ID: string
}
const storjClient = new AwsClient({
  accessKeyId: STORJ_ID,
  secretAccessKey: STORJ_KEY,
})
const storjEndpoint = 'https://gateway.us1.storjshare.io'
// Makes standard web fetch Cloudflare compatible
const valueOverrides = {
  mode: undefined,
  credentials: undefined,
  referrerPolicy: undefined,
  signal: undefined,
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply: (target, thisArg, argumentsList) => {
    if (argumentsList[1]) {
      for (const override in valueOverrides) {
        if (argumentsList[1][override]) {
          argumentsList[1][override] = valueOverrides[override]
        }
      }
    }
    return Reflect.apply(target, thisArg, argumentsList)
  },
})
const JWKS = createRemoteJWKSet(
  new URL('https://serenityeditor.us.auth0.com/.well-known/jwks.json'),
)
async function getUserId(jwt: string) {
  const res = await jwtVerify(jwt, JWKS, {
    algorithms: ['RS256'],
    audience: 'https://serenityeditor.com/api',
  })
  return res.payload.sub
}
const router = Router()
const Faunaclient = new ClientConstructor({ secret: FAUNA_SECRET })
router.get('/api/', () => new Response('Hello Worker!'))
router.get('/api/login', () => Response.redirect(''))
router.post('/api/documents/create', async (request: Request) => {
  if (
    request.headers.get('Content-Type') !== 'application/x-msgpack' ||
    request.headers.get('Content-Encoding') !== 'zstd'
  ) {
    return new Response('Invalid content type/encoding')
  }
  const auth = request.headers
    .get('Authorization')
    .split(' ')
    .pop()
  if (!auth) {
    return new Response('No JWT')
  }
  const userId = await getUserId(auth)
  if (!userId) {
    return new Response('No userId')
  }
  if (!request.headers.get('title')) {
    return new Response('No document title')
  }
  const body = await request.arrayBuffer()
  if (body.byteLength > 50000000) {
    return new Response('Document too large')
  }
  const id = nanoid()
  storjClient.fetch(storjEndpoint,{
    method: 'PUT'
  })
  Faunaclient.query(
    q.Create(q.Collection('Posts'), {
      data: { Name: request.headers.get('title'), Id: },
    }),
  )
})

// 404 for everything else
router.all('/api/*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
