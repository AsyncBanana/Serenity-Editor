import { Router } from 'itty-router'
import { Client as ClientConstructor, query as q } from 'faunadb'
import { jwtVerify } from 'jose-browser-runtime/jwt/verify'
import { createRemoteJWKSet } from 'jose-browser-runtime/jwks/remote'
import { AwsClient } from 'aws4fetch' // used for Storj S3 compatible API
/* Perms:
0: Viewer,
1: Suggester,
2: Editor
*/
declare global {
  const FAUNA_SECRET: string
  const STORJ_KEY: string
  const STORJ_PASSPHRASE: string
  const STORJ_ID: string
}
const storjClient = new AwsClient({
  accessKeyId: STORJ_ID,
  secretAccessKey: STORJ_KEY,
  region: 'us1',
  service: 's3',
})
const storjEndpoint = 'https://documents.gateway.us1.storjshare.io'
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
const router = Router({ base: '/api/' })
const Faunaclient = new ClientConstructor({
  secret: FAUNA_SECRET,
  domain: 'db.us.fauna.com',
})
interface RequestWithParams extends Request {
  params: Record<string, unknown>
}
async function handleAuth(request: Request) {
  const auth = request.headers
    .get('Authorization')
    ?.split(' ')
    .pop()
  if (!auth) {
    return { error: new Response('No JWT', { status: 401 }) }
  }
  const userId = await getUserId(auth)
  if (!userId) {
    return { error: new Response('No userId', { status: 401 }) }
  }
  return { id: userId }
}
interface Document {
  data: Record<string, unknown>
  ref: Record<string, unknown>
  ts: number
}
router.get('login', () => Response.redirect(''))
router.get('documents/:id', async (request: RequestWithParams) => {
  if (!request.params.id) {
    return new Response('No id provided', { status: 400 })
  }
  const userResponse = await handleAuth(request)
  if (userResponse.error) {
    return userResponse.error
  }
  const userId = userResponse.id
  console.log(userId)
  try {
    const res: Document = await Faunaclient.query(
      q.Get(q.Ref(q.Collection('Documents'), request.params.id)),
    )
    console.log(JSON.stringify(res))
    if (!res.data.Access[userId]) {
      return new Response('Not allowed to access document', { status: 403 })
    }
    const signedRequest = await storjClient.sign(
      `${storjEndpoint}/${request.params.id}`,
      {
        method: 'GET',
      },
    )
    const response = await fetch(signedRequest)
    // stream result
    const { readable, writable } = new TransformStream()
    response.body.pipeTo(writable)
    return new Response(readable, { status: 200 })
  } catch (err) {
    console.error(err)
    if (typeof err === 'object' && err.name === 'NotFound') {
      return new Response('No document found', { status: 404 })
    } else {
      return new Response('Unknown error finding document', { status: 500 })
    }
  }
})
router.put('documents/:id', async (request: RequestWithParams) => {
  if (!request.params.id) {
    return new Response('No id provided', { status: 400 })
  }
  const userResponse = await handleAuth(request)
  if (userResponse.error) {
    return userResponse.error
  }
  const userId = userResponse.id
  try {
    const res: Document = await Faunaclient.query(
      q.Get(q.Ref(q.Collection('Documents'), request.params.id)),
    )
    console.log(JSON.stringify(res))
    if (!res.data.Access[userId]) {
      return new Response('Not allowed to access document', { status: 403 })
    }
    const signedRequest = await storjClient.sign(
      `${storjEndpoint}/${request.params.id}`,
      {
        method: 'GET',
      },
    )
    const response = await fetch(signedRequest)
    // stream result
    const { readable, writable } = new TransformStream()
    response.body.pipeTo(writable)
    return new Response(readable, { status: 200 })
  } catch (err) {
    console.error(err)
    if (typeof err === 'object' && err.name === 'NotFound') {
      return new Response('No document found', { status: 404 })
    } else {
      return new Response('Unknown error finding document', { status: 500 })
    }
  }
})
router.post('documents', async (request: Request) => {
  if (request.headers.get('Content-Type') !== 'application/msgpack') {
    return new Response('Invalid content type/encoding', { status: 400 })
  }
  const userResponse = await handleAuth(request)
  if (!userResponse.error) {
    return userResponse.error
  }
  const userId = userResponse.id
  if (!request.headers.get('title')) {
    return new Response('No document title', { status: 401 })
  }
  const body = await request.arrayBuffer()
  if (body.byteLength > 50000000) {
    return new Response('Document too large')
  }
  const id: string = await Faunaclient.query(
    q.Select(
      ['ref', 'id'],
      q.Create(q.Collection('Documents'), {
        data: {
          Name: request.headers.get('title') || 'Untitled',
          Access: {
            [userId]: {
              Perms: 2,
            },
          },
        },
      }),
    ),
  )
  const signedRequest = await storjClient.sign(`${storjEndpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Encoding': 'application/msgpack',
      'Cache-Control': 'max-age=0',
    },
    body: body,
  })
  await fetch(signedRequest)
  return new Response(id, { status: 200 })
})
router.options(
  '*',
  () =>
    new Response(null, {
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
    }),
)
// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
