/**
 * @local/strata-monitor — Host half.
 *
 * Registers a same-origin prefix route `/strata-monitor` on the Web server and
 * proxies the Strata server's `/health` and `/metrics` through it. The API key
 * stays on the Host and never reaches the browser; the Client panel fetches
 * `/strata-monitor/*` same-origin, so there is no CORS problem.
 *
 * Key management: `GET /strata-monitor/key` reports whether a key is set
 * (never the key itself); `POST /strata-monitor/key {apiKey}` updates it at
 * runtime and persists it to a state file in the profile directory, which
 * takes precedence over the patch-config `apiKey` on next activation.
 * `GET|POST /strata-monitor/config` reads/sets the upstream baseUrl the same
 * way (the URL is not secret, so GET returns it).
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export const inject = ['webServer']

const ROUTE = '/strata-monitor'

function stateFile() {
  const dir = process.env.DSH_PROFILE_DIR || path.join(os.homedir(), '.dsh')
  return path.join(dir, 'strata-monitor.json')
}

export function apply(ctx, config = {}) {
  let base = String(config.baseUrl || '').replace(/\/+$/, '')

  // Runtime key: the panel-saved state file wins over the patch config.
  let apiKey = String(config.apiKey || '')
  const file = stateFile()
  try {
    if (fs.existsSync(file)) {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (typeof saved?.apiKey === 'string') apiKey = saved.apiKey
      if (typeof saved?.baseUrl === 'string') base = saved.baseUrl.replace(/\/+$/, '')
    }
  } catch (error) {
    ctx.logger?.warn?.(`strata-monitor: could not read ${file}: ${error?.message || error}`)
  }

  const persist = (value) => {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, JSON.stringify({ apiKey: value, baseUrl: base }), 'utf8')
      return true
    } catch (error) {
      ctx.logger?.warn?.(`strata-monitor: could not persist key: ${error?.message || error}`)
      return false
    }
  }

  const readBody = async (req) => {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 65536) throw new Error('body too large')
      chunks.push(chunk)
    }
    return Buffer.concat(chunks).toString('utf8')
  }

  const json = (res, status, payload) => {
    res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    res.end(JSON.stringify(payload))
  }

  const handler = async (req, res) => {
    const url = new URL(req.url || '/', 'http://dsh.local')
    const sub = url.pathname.slice(ROUTE.length)

    // API key management from the panel UI; the key never travels back to the browser.
    if (sub === '/key') {
      if (req.method === 'GET') return json(res, 200, { configured: apiKey.length > 0 })
      if (req.method === 'POST') {
        try {
          const body = JSON.parse((await readBody(req)) || '{}')
          apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
          const persisted = persist(apiKey)
          ctx.logger?.info?.(`strata-monitor: API key ${apiKey ? 'set' : 'cleared'}${persisted ? '' : ' (not persisted)'}`)
          return json(res, 200, { ok: true, configured: apiKey.length > 0, persisted })
        } catch {
          return json(res, 400, { error: 'bad-request' })
        }
      }
      res.writeHead(405, { allow: 'GET, POST' })
      res.end()
      return
    }

    // Upstream server address management from the panel UI.
    if (sub === '/config') {
      if (req.method === 'GET') return json(res, 200, { baseUrl: base })
      if (req.method === 'POST') {
        try {
          const body = JSON.parse((await readBody(req)) || '{}')
          const raw = typeof body.baseUrl === 'string' ? body.baseUrl.trim() : ''
          if (raw) {
            let u
            try { u = new URL(raw) } catch { return json(res, 400, { error: 'bad-url' }) }
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return json(res, 400, { error: 'bad-url' })
            base = raw.replace(/\/+$/, '')
          } else base = ''
          const persisted = persist(apiKey)
          ctx.logger?.info?.(`strata-monitor: baseUrl set to ${base || '(cleared)'}`)
          return json(res, 200, { ok: true, baseUrl: base, persisted })
        } catch {
          return json(res, 400, { error: 'bad-request' })
        }
      }
      res.writeHead(405, { allow: 'GET, POST' })
      res.end()
      return
    }

    if (sub !== '/health' && sub !== '/metrics') return json(res, 404, { error: 'not-found' })

    if (!base) return json(res, 502, { error: 'no-base-url' })

    const query = sub === '/metrics' && url.searchParams.get('requests') === 'all' ? '?requests=all' : ''
    try {
      const upstream = await fetch(base + sub + query, {
        headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {},
        signal: AbortSignal.timeout(8000),
      })
      const body = await upstream.text()
      res.writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store',
      })
      res.end(body)
    } catch (error) {
      ctx.logger?.warn?.(`strata-monitor: upstream ${sub} failed: ${error?.message || error}`)
      json(res, 502, { error: 'upstream-unreachable', baseUrl: base })
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: ROUTE, handler }),
    'strata-monitor: proxy route',
  )
}
