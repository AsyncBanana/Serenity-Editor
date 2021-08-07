import { Router } from 'itty-router'
import { Client as ClientConstructor, query as q } from 'faunadb'
import { jwtVerify } from 'jose-browser-runtime/jwt/verify'
import { createRemoteJWKSet } from 'jose-browser-runtime/jwks/remote'
declare global {
  const FAUNA_SECRET: string
}
// Makes standard web fetch Cloudflare compatible
const valueOverrides = {
  mode: undefined,
  credentials: undefined,
  referrerPolicy: undefined,
  signal: undefined
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
// now let's create a router (note the lack of "new")
const router = Router()
const client = new ClientConstructor({ secret: FAUNA_SECRET })
router.get('/api/', () => new Response('Hello Worker!'))
router.get('/api/login', () => Response.redirect(''))
router.post('/api/documents/save', async (request: Request) => {
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
  } else {
    return new Response((await userId).toString())
  }
})
// GET item
router.get('/todos/:id', ({ params }) => new Response(`Todo #${params.id}`))

// POST to the collection (we'll use async here)
router.post('/todos', async (request: Request) => {
  const content = await request.json()

  return new Response('Creating Todo: ' + JSON.stringify(content))
})

// 404 for everything else
router.all('/api/*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
