/* @local/strata-monitor - Client half: a Harness page that mirrors the Strata
 * server's Monitor tab. Data comes from the Host proxy at /strata-monitor/*
 * (same origin); styling uses only --dsw-alias-* theme tokens. */
window.__ModuleLoader__.load({
  id: 'dsh-strata-monitor',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef } = React

    const NS = 'strata-monitor'

    const zh = {
      panel: '模型监控',
      model: '模型',
      state: '模型状态',
      idle: '空闲', reading: '读取提示词', generating: '生成中', queued: '排队中',
      waiting: '等待请求',
      decode: '解码', prefill: '预填充',
      gpu: 'GPU 负载', vram: '显存', temp: 'GPU 温度', power: '功耗', pcie: 'PCIe', cpu: 'CPU', disk: '磁盘读取',
      cache: '会话缓存',
      slots: '驻留 / 槽位', memory: '内存',
      lastRequest: '上次请求', reusedOf: '{a} / {p} 提示 tokens 复用',
      sinceStart: '启动以来复用', tokensUnit: 'tokens',
      parks: '驻留 / 恢复', evictedUnit: '已逐出', lastSwitch: '最近切换',
      cacheNoteOff: '引擎只保留最近一次会话的状态；要缓存多个会话，在运行配置的 args 里加 "--conversation-cache-mib", "8192"。',
      cacheNoteOn: '延续已驻留会话的请求会直接取回状态，而不是重新读取。',
      requests: '最近请求', time: '时间', status: '状态', prompt: '提示', reused: '复用', output: '输出',
      prefillRate: '预填充 t/s', decodeRate: '解码 t/s', hit: '命中率', duration: '时长',
      noRequests: '暂无请求',
      done: '完成', maxLength: '达到上限', stopped: '已停止', closed: '已断开', error: '错误',
      needKey: 'Strata 需要 API key：点右上角「设置」填入，或在插件配置 cordis.patch.yml 的 apiKey 中填写。',
      keyConfig: 'API Key', keyConfigured: '已配置', keyMissing: '未配置',
      keyPlaceholder: '粘贴 Strata API key', keySave: '保存', keySaving: '保存中…',
      keySaved: '已保存', keyCleared: '已清除', keyFailed: '保存失败',
      keyHint: 'key 只保存在 Host 端本机文件里，不会回传到浏览器；保存后立即生效。',
      settings: '设置', serverPlaceholder: 'http://192.168.10.117:8080',
      serverHint: 'Strata 服务器地址；保存后立即生效，留空则清除。',
      serverSaved: '已保存', serverCleared: '已清除', serverFailed: '保存失败',
      needServer: '尚未配置 Strata 服务器地址：点右上角「设置」填入。',
      down: '无法连接 Strata 服务器',
      totalsSince: '自 {when} 起', totalsRequests: '{n} 次请求',
      totalsRead: '读取 {n} 提示 tokens', totalsReused: '（复用 {n}）', totalsWritten: '写入 {n} tokens',
      justNow: '刚刚', minAgo: '{n} 分钟前', hAgo: '{n} 小时前',
      parkedWord: '驻留', restoredWord: '恢复',
      experts: '{n} 个专家缓存',
      floatWin: '悬浮小窗', floatHint: '可拖动、右下角可改大小；仅在使用该模型 API 的对话中出现', floatNeedKey: '需要 API key：在监控页的 API Key 配置里填入',
      strip: '输入框状态条', stripHint: '在对话输入框下方显示迷你状态；仅在使用该模型 API 的对话中出现',
    }
    const en = {
      panel: 'Model Monitor',
      model: 'Model',
      state: 'Model state',
      idle: 'Idle', reading: 'Reading prompt', generating: 'Generating', queued: 'Queued',
      waiting: 'Waiting for a request',
      decode: 'Decode', prefill: 'Prefill',
      gpu: 'GPU load', vram: 'VRAM', temp: 'GPU temp', power: 'Power', pcie: 'PCIe', cpu: 'CPU', disk: 'Disk read',
      cache: 'Conversation cache',
      slots: 'Parked / slots', memory: 'Memory',
      lastRequest: 'Last request', reusedOf: '{a} of {p} prompt tokens reused',
      sinceStart: 'Reused since start', tokensUnit: 'tokens',
      parks: 'Parked / restored', evictedUnit: 'evicted', lastSwitch: 'Last switch',
      cacheNoteOff: 'The engine keeps only the last conversation\'s state; to keep several, add "--conversation-cache-mib", "8192" to the run config args.',
      cacheNoteOn: 'A request continuing a parked conversation gets its state back instead of reading it again.',
      requests: 'Recent requests', time: 'Time', status: 'Status', prompt: 'Prompt', reused: 'Reused', output: 'Output',
      prefillRate: 'Prefill t/s', decodeRate: 'Decode t/s', hit: 'Hit rate', duration: 'Duration',
      noRequests: 'No requests yet',
      done: 'Done', maxLength: 'Max tokens', stopped: 'Stopped', closed: 'Closed', error: 'Error',
      needKey: 'Strata needs an API key: click "Settings" at the top right, or set apiKey in the strata-monitor plugin config (cordis.patch.yml).',
      keyConfig: 'API Key', keyConfigured: 'Configured', keyMissing: 'Not set',
      keyPlaceholder: 'Paste Strata API key', keySave: 'Save', keySaving: 'Saving…',
      keySaved: 'Saved', keyCleared: 'Cleared', keyFailed: 'Save failed',
      keyHint: 'The key is stored in a Host-side file only and never sent back to the browser; it takes effect immediately.',
      settings: 'Settings', serverPlaceholder: 'http://192.168.10.117:8080',
      serverHint: 'Strata server URL; takes effect immediately after saving, empty clears it.',
      serverSaved: 'Saved', serverCleared: 'Cleared', serverFailed: 'Failed to save',
      needServer: 'No Strata server URL configured: click "Settings" at the top right.',
      down: 'Strata server not reachable',
      totalsSince: 'Since {when}', totalsRequests: '{n} requests',
      totalsRead: '{n} prompt tokens read', totalsReused: '({n} reused)', totalsWritten: '{n} tokens written',
      justNow: 'just now', minAgo: '{n} min ago', hAgo: '{n} h ago',
      parkedWord: 'Parked', restoredWord: 'Restored',
      experts: '{n} experts cached',
      floatWin: 'Floating window', floatHint: 'Draggable, resizable; shows only in conversations using this model API', floatNeedKey: 'Needs an API key: set it on the monitor page',
      strip: 'Composer status line', stripHint: 'A mini status line below the composer; shows only in conversations using this model API',
    }

    // ---------------------------------------------------------------- helpers
    const fmt = (n, d = 0) => (n == null || Number.isNaN(n) ? '–' : Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }))
    const gb = (b, d = 1) => (b == null ? '–' : fmt(b / 1073741824, d))
    const pct = (a, b) => (b ? Math.min(100, (100 * a) / b) : 0)

    const card = {
      background: 'var(--dsw-alias-bg-layer-1)',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 10,
      padding: '12px 14px',
    }
    const cardTitle = { fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', letterSpacing: 0.4, textTransform: 'uppercase' }
    const muted = { color: 'var(--dsw-alias-label-secondary)' }
    const btn = { padding: '5px 12px', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)', fontSize: 12, cursor: 'pointer' }
    const input = { flex: '1 1 260px', minWidth: 200, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)', fontSize: 13 }

    function Spark({ series, max, color }) {
      const pts = Array.isArray(series) ? series.slice(-60).filter((v) => typeof v === 'number') : []
      if (pts.length < 2) return h('div', { style: { height: 32 } })
      const hi = max != null ? max : Math.max(...pts, 1e-9)
      const step = 100 / (pts.length - 1)
      const coords = pts.map((v, i) => `${(i * step).toFixed(1)},${(31 - Math.max(0, Math.min(1, v / hi)) * 30).toFixed(1)}`)
      return h('svg', { viewBox: '0 0 100 32', preserveAspectRatio: 'none', 'aria-hidden': true, style: { width: '100%', height: 32, display: 'block', color: color || 'var(--dsw-alias-brand-primary)' } },
        h('polygon', { points: `0,32 ${coords.join(' ')} 100,32`, fill: 'currentColor', opacity: 0.12 }),
        h('polyline', { points: coords.join(' '), fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }))
    }

    function MetricCard({ label, value, unit, sub, series, max, color }) {
      return h('div', { style: { ...card, display: 'flex', flexDirection: 'column', gap: 4 } },
        h('span', { style: { ...cardTitle, textTransform: 'none', fontWeight: 500 } }, label),
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 4 } },
          h('span', { style: { fontSize: 22, fontWeight: 650, color: 'var(--dsw-alias-label-primary)', fontVariantNumeric: 'tabular-nums' } }, value),
          unit ? h('span', { style: { fontSize: 12, ...muted } }, unit) : null),
        sub ? h('span', { style: { fontSize: 11, ...muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, sub) : null,
        h(Spark, { series, max, color }))
    }

    function Bar({ ratio, color }) {
      return h('div', { style: { height: 6, borderRadius: 3, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' } },
        h('div', { style: { height: '100%', width: `${Math.max(0, Math.min(100, ratio * 100))}%`, background: color || 'var(--dsw-alias-brand-primary)', borderRadius: 3 } }))
    }

    function Badge({ text, color }) {
      return h('span', { style: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l1)', color: color || 'var(--dsw-alias-label-secondary)', flexShrink: 0, whiteSpace: 'nowrap' } }, text)
    }

    function stateColor(state) {
      if (state === 'generating') return 'var(--dsw-alias-state-success-primary)'
      if (state === 'reading' || state === 'queued') return 'var(--dsw-alias-state-warn-primary)'
      return 'var(--dsw-alias-state-idle-primary)'
    }

    function since(t, tt) {
      if (!t) return ''
      const s = Math.max(0, Date.now() / 1000 - t)
      if (s < 60) return tt('justNow')
      if (s < 3600) return tt('minAgo', { n: fmt(s / 60) })
      return tt('hAgo', { n: fmt(s / 3600, 1) })
    }

    // ------------------------------------------------ shared data store
    // One poller for the whole app: the page and the floating window read the
    // same snapshot, so having both open does not double the request rate.
    const store = { m: null, health: null, err: null, timerA: null, timerB: null, fails: 0 }
    const listeners = new Set()
    const emit = () => { for (const fn of Array.from(listeners)) fn() }

    function subscribeStrata() {
      if (store.timerA) return
      const poll = async () => {
        try {
          const r = await fetch('/strata-monitor/metrics')
          if (r.status === 401) { store.err = 'key'; emit(); return }
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          store.m = await r.json()
          store.err = null
          store.fails = 0
          emit()
        } catch (e) {
          if (++store.fails >= 2) { store.err = 'down'; emit() }
        }
      }
      const healthPoll = async () => {
        try {
          const r = await fetch('/strata-monitor/health')
          const j = r.ok ? await r.json() : null
          if (j) { store.health = j; gateHealthModel = j.model || null; evaluateGate(); emit() }
        } catch (e) { /* retried on the next tick */ }
      }
      poll(); healthPoll()
      store.timerA = setInterval(poll, 1000)
      store.timerB = setInterval(healthPoll, 5000)
    }

    function useStrata() {
      const [, bump] = useState(0)
      useEffect(() => {
        const fn = () => bump((x) => x + 1)
        listeners.add(fn)
        subscribeStrata()
        return () => {
          listeners.delete(fn)
          if (!listeners.size && store.timerA) { clearInterval(store.timerA); clearInterval(store.timerB); store.timerA = null; store.timerB = null }
        }
      }, [])
      return store
    }

    // ------------------------------------------- session gate
    // The strip and the floating window only show while the session in the main
    // view is routed to the Strata model (compared against /health's model).
    let gateCtx = null
    let gateHealthModel = null
    let gateMatch = null // null = unknown (show); true/false = decided
    const gateSubs = new Set()
    let gateDir = null
    let gateDirUnsub = null
    let lastSessionId = null

    const setGate = (v) => {
      if (gateMatch === v) return
      gateMatch = v
      for (const fn of Array.from(gateSubs)) fn(v)
    }

    const modelMatches = (a, b) => {
      if (!a || !b) return false
      const x = String(a).toLowerCase()
      const y = String(b).toLowerCase()
      return x === y || x.includes(y) || y.includes(x)
    }

    function evaluateModel() {
      if (!gateHealthModel) return setGate(null)
      let model = null
      try { const s = gateDir && gateDir.store.getSnapshot(); model = s && s.current ? s.current.model : null } catch (e) { /* keep null */ }
      if (!model) return setGate(null)
      setGate(modelMatches(model, gateHealthModel))
    }

    function evaluateGate() {
      if (!gateCtx) return
      const sessions = gateCtx.get && gateCtx.get('sessions')
      if (!sessions) return
      let rows = {}
      try { rows = sessions.list.getSnapshot().byId || {} } catch (e) { return }
      const list = Object.values(rows)
      let cur = list.find((r) => ((r.retainedBy && r.retainedBy.mainView) || 0) > 0)
      if (!cur && lastSessionId) cur = list.find((r) => r.sessionId === lastSessionId)
      if (!cur) return
      lastSessionId = cur.sessionId
      const dirs = gateCtx.get && gateCtx.get('modelDirectories')
      if (!dirs) return setGate(null)
      let dir
      try { dir = dirs.directoryFor(cur.sessionId) } catch (e) { return }
      if (dir !== gateDir) {
        if (gateDirUnsub) { try { gateDirUnsub() } catch (e) { /* ignore */ } }
        gateDir = dir
        try { gateDirUnsub = dir.store.subscribe(() => evaluateModel()) } catch (e) { gateDirUnsub = null }
      }
      evaluateModel()
    }

    function useStrataGate() {
      const [match, setMatch] = useState(gateMatch)
      useEffect(() => {
        const fn = (v) => setMatch(v)
        gateSubs.add(fn)
        evaluateGate()
        let un = null
        const sessions = gateCtx && gateCtx.get && gateCtx.get('sessions')
        if (sessions) { try { un = sessions.list.subscribe(() => evaluateGate()) } catch (e) { /* ignore */ } }
        return () => {
          gateSubs.delete(fn)
          if (un) { try { un() } catch (e) { /* ignore */ } }
        }
      }, [])
      return match
    }

    // ------------------------------------------- floating window (shell.overlay)
    const FLOAT_ON = 'strata-monitor.float.on'
    const FLOAT_POS = 'strata-monitor.float.pos'
    const FLOAT_SIZE = 'strata-monitor.float.size'
    const readFloatSize = () => {
      try { const s = JSON.parse(localStorage.getItem(FLOAT_SIZE) || 'null'); if (s && Number.isFinite(s.w) && Number.isFinite(s.h)) return s } catch (e) { /* fall through to default */ }
      return { w: 296, h: 196 }
    }
    const floatSubs = new Set()
    const readFloatOn = () => { try { return localStorage.getItem(FLOAT_ON) === '1' } catch (e) { return false } }
    const setFloatOn = (v) => {
      try { localStorage.setItem(FLOAT_ON, v ? '1' : '0') } catch (e) { /* private mode */ }
      for (const fn of Array.from(floatSubs)) fn(v)
    }

    function useFloatOn() {
      const [on, setOn] = useState(readFloatOn)
      useEffect(() => { const fn = (v) => setOn(v); floatSubs.add(fn); return () => floatSubs.delete(fn) }, [])
      return [on, setFloatOn]
    }

    function Toggle({ on, onChange }) {
      return h('button', {
        onClick: () => onChange(!on), 'aria-pressed': !!on,
        style: { width: 38, height: 22, flexShrink: 0, borderRadius: 11, padding: 0, cursor: 'pointer', position: 'relative', border: '1px solid var(--dsw-alias-border-l2)', background: on ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-bg-layer-2)', transition: 'background 120ms' },
      }, h('span', { style: { position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--dsw-alias-label-primary)', transition: 'left 120ms' } }))
    }

    function MiniStat({ label, value, unit }) {
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 1 } },
        h('span', { style: { fontSize: 10, ...muted } }, label),
        h('span', { style: { fontSize: 14, fontWeight: 650, fontVariantNumeric: 'tabular-nums' } }, value, unit ? h('span', { style: { fontSize: 10, fontWeight: 400, ...muted } }, ` ${unit}`) : null))
    }

    function FloatBody({ t: tt }) {
      const { m, health, err } = useStrata()
      const [pos, setPos] = useState(() => {
        try { const p = JSON.parse(localStorage.getItem(FLOAT_POS) || 'null'); if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return p } catch (e) { /* fall through to default */ }
        return { x: Math.max(8, window.innerWidth - 312), y: 64 }
      })
      const drag = useRef(null)
      const down = (e) => { drag.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y }; try { e.currentTarget.setPointerCapture(e.pointerId) } catch (e2) { /* ignore */ } }
      const move = (e) => {
        if (!drag.current) return
        const x = Math.min(Math.max(4, e.clientX - drag.current.ox), window.innerWidth - 80)
        const y = Math.min(Math.max(4, e.clientY - drag.current.oy), window.innerHeight - 48)
        setPos({ x, y })
      }
      const up = () => {
        if (!drag.current) return
        drag.current = null
        try { localStorage.setItem(FLOAT_POS, JSON.stringify(pos)) } catch (e) { /* private mode */ }
      }
      const [size, setSize] = useState(readFloatSize)
      const rz = useRef(null)
      const rzDown = (e) => { rz.current = { w: size.w, h: size.h, x: e.clientX, y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId) } catch (e2) { /* ignore */ } }
      const rzMove = (e) => {
        if (!rz.current) return
        setSize({
          w: Math.min(Math.max(220, rz.current.w + (e.clientX - rz.current.x)), window.innerWidth - 8),
          h: Math.min(Math.max(130, rz.current.h + (e.clientY - rz.current.y)), window.innerHeight - 8),
        })
      }
      const rzUp = () => {
        if (!rz.current) return
        rz.current = null
        try { localStorage.setItem(FLOAT_SIZE, JSON.stringify(size)) } catch (e) { /* private mode */ }
      }

      const live = (m && m.live) || {}
      const hw = (m && m.hardware) || {}
      const hist = (m && m.history) || {}
      const last = ((m && m.requests) || [])[0]
      const st = live.queued > 0 ? 'queued' : live.state || 'idle'
      const speed = live.state === 'generating' ? live.tok_s : last ? last.decode_tok_s : null
      let barRatio = 0
      if (live.state === 'reading' && live.prompt_total) barRatio = pct(live.prompt_read, live.prompt_total) / 100
      else if (live.state === 'generating' && live.max_tokens) barRatio = pct(live.generated, live.max_tokens) / 100

      return h('div', { style: { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000, pointerEvents: 'auto', userSelect: 'none', background: 'var(--dsw-alias-bg-overlay)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)', color: 'var(--dsw-alias-label-primary)' } },
        h('div', { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'move', touchAction: 'none', borderBottom: '1px solid var(--dsw-alias-border-l1)' } },
          h('span', { style: { fontSize: 13, fontWeight: 700 } }, tt('panel')),
          h(Badge, { text: tt(st), color: stateColor(st) }),
          health && health.loaded && health.max_context ? h('span', { style: { fontSize: 11, ...muted } }, `${health.max_context / 1024}K`) : null,
          h('button', { onPointerDown: (e) => e.stopPropagation(), onClick: () => setFloatOn(false), style: { marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--dsw-alias-label-secondary)', fontSize: 16, lineHeight: 1, cursor: 'pointer', padding: '0 4px' } }, '×')),
        h('div', { style: { padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0, overflow: 'hidden' } },
          err === 'key' ? h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)' } }, tt('floatNeedKey')) : null,
          err === 'down' ? h('div', { style: { fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' } }, tt('down')) : null,
          barRatio > 0 ? h(Bar, { ratio: barRatio, color: live.state === 'generating' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-brand-primary)' }) : null,
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px 10px' } },
            h(MiniStat, { label: `${tt('decode')} t/s`, value: speed == null ? '–' : fmt(speed, 1) }),
            h(MiniStat, { label: tt('gpu'), value: hw.gpu_util == null ? '–' : fmt(hw.gpu_util), unit: '%' }),
            h(MiniStat, { label: tt('vram'), value: hw.gpu_mem_used == null ? '–' : gb(hw.gpu_mem_used), unit: 'GB' }),
            h(MiniStat, { label: tt('temp'), value: hw.gpu_temp == null ? '–' : fmt(hw.gpu_temp), unit: '°C' }),
            h(MiniStat, { label: tt('power'), value: hw.gpu_power == null ? '–' : fmt(hw.gpu_power), unit: 'W' }),
            h(MiniStat, { label: tt('cpu'), value: hw.cpu == null ? '–' : fmt(hw.cpu), unit: '%' })),
          h(Spark, { series: hist.tok_s })),
        h('div', { onPointerDown: rzDown, onPointerMove: rzMove, onPointerUp: rzUp, onPointerCancel: rzUp, style: { position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'nwse-resize', touchAction: 'none', background: 'linear-gradient(135deg, transparent 45%, var(--dsw-alias-border-l2) 45%, var(--dsw-alias-border-l2) 55%, transparent 55%, transparent 70%, var(--dsw-alias-border-l2) 70%, var(--dsw-alias-border-l2) 80%, transparent 80%)' } }))
    }

    function FloatWindow({ t }) {
      const tt = t || ((k) => k)
      const [on] = useFloatOn()
      const gate = useStrataGate()
      if (!on || gate === false) return null
      return h(FloatBody, { t: tt })
    }

    // ------------------------------------------- one-line strip (composer dock)
    const STRIP_ON = 'strata-monitor.strip.on'
    const stripSubs = new Set()
    const readStripOn = () => { try { return localStorage.getItem(STRIP_ON) === '1' } catch (e) { return false } }
    const setStripOn = (v) => {
      try { localStorage.setItem(STRIP_ON, v ? '1' : '0') } catch (e) { /* private mode */ }
      for (const fn of Array.from(stripSubs)) fn(v)
    }

    function useStripOn() {
      const [on, setOn] = useState(readStripOn)
      useEffect(() => { const fn = (v) => setOn(v); stripSubs.add(fn); return () => stripSubs.delete(fn) }, [])
      return [on, setStripOn]
    }

    function StripBody({ t: tt }) {
      const { m, err } = useStrata()
      const live = (m && m.live) || {}
      const hw = (m && m.hardware) || {}
      const hist = (m && m.history) || {}
      const last = ((m && m.requests) || [])[0]
      const st = live.queued > 0 ? 'queued' : live.state || 'idle'
      const speed = live.state === 'generating' ? live.tok_s : last ? last.decode_tok_s : null
      const cell = (label, value, unit) => h('span', { style: { display: 'inline-flex', alignItems: 'baseline', gap: 3, whiteSpace: 'nowrap', flexShrink: 0 } },
        h('span', { style: { fontSize: 10, ...muted } }, label),
        h('span', { style: { fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' } }, value),
        unit ? h('span', { style: { fontSize: 10, ...muted } }, unit) : null)
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'nowrap', minWidth: 0, overflow: 'hidden' } },
        h(Badge, { text: tt(st), color: stateColor(st) }),
        err === 'key' ? h('span', { style: { fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, color: 'var(--dsw-alias-state-warn-primary)' } }, tt('floatNeedKey')) : null,
        err === 'down' ? h('span', { style: { fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, color: 'var(--dsw-alias-state-error-primary)' } }, tt('down')) : null,
        cell(tt('decode'), speed == null ? '–' : fmt(speed, 1), 't/s'),
        cell(tt('gpu'), hw.gpu_util == null ? '–' : fmt(hw.gpu_util), '%'),
        cell(tt('vram'), hw.gpu_mem_used == null ? '–' : gb(hw.gpu_mem_used), 'GB'),
        cell(tt('temp'), hw.gpu_temp == null ? '–' : fmt(hw.gpu_temp), '°C'),
        cell(tt('power'), hw.gpu_power == null ? '–' : fmt(hw.gpu_power), 'W'),
        h('span', { style: { width: 90, minWidth: 0, flexShrink: 1, overflow: 'hidden' } }, h(Spark, { series: hist.tok_s })))
    }

    function StripLine({ t }) {
      const tt = t || ((k) => k)
      const [on] = useStripOn()
      const gate = useStrataGate()
      if (!on || gate === false) return null
      return h(StripBody, { t: tt })
    }

    // ---------------------------------------------------------------- page
    function MonitorPage({ t: tt }) {
      const { m, health, err } = useStrata()
      const [keyState, setKeyState] = useState(null)
      const [cfgOpen, setCfgOpen] = useState(false)
      const [keyInput, setKeyInput] = useState('')
      const [baseInput, setBaseInput] = useState('')
      const [baseSaving, setBaseSaving] = useState(false)
      const [baseMsg, setBaseMsg] = useState(null)
      const [noBase, setNoBase] = useState(false)
      const [saving, setSaving] = useState(false)
      const [saveMsg, setSaveMsg] = useState(null)
      const [floatOnState, setFloatOnToggle] = useFloatOn()
      const [stripOnState, setStripOnToggle] = useStripOn()

      useEffect(() => {
        let dead = false
        const keyPoll = async () => {
          try {
            const r = await fetch('/strata-monitor/key')
            const j = r.ok ? await r.json() : null
            if (!dead && j) setKeyState(j)
          } catch (e) { /* best effort */ }
        }
        keyPoll()
        const cfgPoll = async () => {
          try {
            const r = await fetch('/strata-monitor/config')
            const j = r.ok ? await r.json() : null
            if (!dead && j) { setBaseInput(j.baseUrl || ''); setNoBase(!j.baseUrl) }
          } catch (e) { /* best effort */ }
        }
        cfgPoll()
        return () => { dead = true }
      }, [])

      useEffect(() => { if (err === 'key') setCfgOpen(true) }, [err])

      const saveKey = async () => {
        setSaving(true); setSaveMsg(null)
        try {
          const r = await fetch('/strata-monitor/key', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ apiKey: keyInput.trim() }),
          })
          const j = await r.json().catch(() => null)
          if (r.ok && j) { setKeyState(j); setKeyInput(''); setSaveMsg(j.configured ? 'saved' : 'cleared') }
          else setSaveMsg('failed')
        } catch (e) { setSaveMsg('failed') }
        setSaving(false)
      }

      const saveBase = async () => {
        setBaseSaving(true); setBaseMsg(null)
        try {
          const r = await fetch('/strata-monitor/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ baseUrl: baseInput.trim() }),
          })
          const j = await r.json().catch(() => null)
          if (r.ok && j) { setBaseInput(j.baseUrl || ''); setNoBase(!j.baseUrl); setBaseMsg(j.baseUrl ? 'saved' : 'cleared') }
          else setBaseMsg('failed')
        } catch (e) { setBaseMsg('failed') }
        setBaseSaving(false)
      }

      const live = (m && m.live) || {}
      const hw = (m && m.hardware) || {}
      const st = (m && m.hardware_static) || {}
      const eng = (m && m.engine) || {}
      const hist = (m && m.history) || {}
      const requests = (m && m.requests) || []
      const totals = m && m.totals
      const cache = m && m.conversation_cache
      const last = requests[0]

      const on = live.queued > 0 ? 'queued' : live.state || 'idle'
      let stateLabel = tt('waiting'), stateDetail = '', barPct = 0
      if (live.state === 'reading') {
        stateLabel = tt('reading')
        if (live.prompt_total) { barPct = pct(live.prompt_read, live.prompt_total); stateDetail = `${fmt(live.prompt_read)} / ${fmt(live.prompt_total)} tokens · ${fmt(barPct)}%` }
        else stateDetail = `${fmt(live.prompt_tokens)} tokens`
      } else if (live.state === 'generating') {
        stateLabel = tt('generating')
        barPct = live.max_tokens ? Math.min(100, pct(live.generated, live.max_tokens)) : 0
        stateDetail = `${fmt(live.generated)} tokens · ${fmt(live.tok_s, 1)} tok/s`
      } else if (last) {
        stateDetail = `last: ${fmt(last.output_tokens)} tokens${last.decode_tok_s ? ` at ${fmt(last.decode_tok_s, 1)} tok/s` : ''}`
      }

      const speed = live.state === 'generating' ? live.tok_s : last ? last.decode_tok_s : null
      const fresh = last && last.prompt_tokens != null ? Math.max(0, last.prompt_tokens - (last.reused || 0)) : null
      const prefill = live.state !== 'idle' ? live.prefill_tok_s_mean
        : last && last.prompt_ms > 0 && fresh > 0 ? fresh / (last.prompt_ms / 1000) : null
      const gpus = hw.gpus || []
      const multi = gpus.length > 1
      const perGpu = (f) => gpus.map((g) => `GPU ${g.index} ${f(g)}`).join(' · ')

      const finishBadge = { stop: ['done', 'var(--dsw-alias-state-success-primary)'], length: ['maxLength', 'var(--dsw-alias-state-warn-primary)'], cancel: ['stopped', 'var(--dsw-alias-state-warn-primary)'], disconnect: ['closed', 'var(--dsw-alias-label-secondary)'], error: ['error', 'var(--dsw-alias-state-error-primary)'] }

      return h('div', { style: { maxWidth: 1080, margin: '0 auto', padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--dsw-alias-label-primary)' } },
        // header
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
          h('span', { style: { fontSize: 18, fontWeight: 700 } }, tt('panel')),
          health ? h(Badge, { text: `${health.model || 'Strata'}${health.max_context ? ` · ${health.max_context / 1024}K` : ''}`, color: health.loaded ? 'var(--dsw-alias-state-success-primary)' : undefined }) : null,
          h(Badge, { text: tt(on), color: stateColor(on) }),
          h('button', { onClick: () => setCfgOpen((v) => !v), style: { ...btn, marginLeft: 'auto' } },
            `${tt('settings')}${keyState ? ` · ${keyState.configured ? tt('keyConfigured') : tt('keyMissing')}` : ''}`)),
        err === 'key' ? h('div', { style: { ...card, borderLeft: '3px solid var(--dsw-alias-state-warn-primary)', fontSize: 13 } }, tt('needKey')) : null,
        err === 'down' ? h('div', { style: { ...card, borderLeft: '3px solid var(--dsw-alias-state-error-primary)', fontSize: 13 } }, tt('down')) : null,
        noBase ? h('div', { style: { ...card, borderLeft: '3px solid var(--dsw-alias-state-warn-primary)', fontSize: 13 } }, tt('needServer')) : null,
        cfgOpen ? h('div', { style: { ...card, display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
            h('input', { type: 'text', value: baseInput, placeholder: tt('serverPlaceholder'), onChange: (e) => setBaseInput(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') saveBase() }, style: input, autoFocus: true }),
            h('button', { onClick: saveBase, disabled: baseSaving, style: btn }, baseSaving ? tt('keySaving') : tt('keySave'))),
          baseMsg ? h('div', { style: { fontSize: 12, color: baseMsg === 'failed' ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)' } }, tt(baseMsg === 'failed' ? 'serverFailed' : baseMsg === 'cleared' ? 'serverCleared' : 'serverSaved')) : null,
          h('div', { style: { fontSize: 11, ...muted } }, tt('serverHint')),
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--dsw-alias-border-l1)' } },
            h('input', { type: 'password', value: keyInput, placeholder: tt('keyPlaceholder'), onChange: (e) => setKeyInput(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') saveKey() }, style: input }),
            h('button', { onClick: saveKey, disabled: saving, style: btn }, saving ? tt('keySaving') : tt('keySave'))),
          saveMsg ? h('div', { style: { fontSize: 12, color: saveMsg === 'failed' ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)' } }, tt(saveMsg === 'failed' ? 'keyFailed' : saveMsg === 'cleared' ? 'keyCleared' : 'keySaved')) : null,
          h('div', { style: { fontSize: 11, ...muted } }, tt('keyHint')),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--dsw-alias-border-l1)' } },
            h(Toggle, { on: floatOnState, onChange: setFloatOnToggle }),
            h('span', { style: { fontSize: 13 } }, tt('floatWin')),
            h('span', { style: { fontSize: 11, ...muted } }, tt('floatHint'))),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 } },
            h(Toggle, { on: stripOnState, onChange: setStripOnToggle }),
            h('span', { style: { fontSize: 13 } }, tt('strip')),
            h('span', { style: { fontSize: 11, ...muted } }, tt('stripHint')))) : null,
        // model state
        h('div', { style: card },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 } },
            h('span', { style: cardTitle }, tt('state')),
            h('span', { style: { fontSize: 12, ...muted } }, stateDetail)),
          h('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 8 } }, stateLabel),
          h(Bar, { ratio: barPct / 100, color: live.state === 'generating' ? 'var(--dsw-alias-state-success-primary)' : live.state === 'reading' ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-state-idle-primary)' })),
        // metric cards
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 } },
          h(MetricCard, { label: `${tt('decode')} t/s`, value: speed == null ? '–' : fmt(speed, 1), series: hist.tok_s }),
          h(MetricCard, { label: `${tt('prefill')} t/s`, value: prefill == null ? '–' : fmt(prefill), series: hist.prefill_tok_s_mean }),
          h(MetricCard, { label: tt('gpu'), value: hw.gpu_util == null ? '–' : fmt(hw.gpu_util), unit: '%', max: 100, sub: multi ? perGpu((g) => (g.util == null ? '–' : `${fmt(g.util)}%`)) : st.gpu_name, series: hist.gpu_util }),
          h(MetricCard, { label: tt('vram'), value: hw.gpu_mem_used == null ? '–' : gb(hw.gpu_mem_used), unit: hw.gpu_mem_total ? `/ ${gb(hw.gpu_mem_total, 0)} GB` : 'GB', sub: multi ? perGpu((g) => (g.mem_used == null ? '–' : `${gb(g.mem_used)} GB`)) : eng.expert_slots ? tt('experts', { n: fmt(eng.expert_slots) }) : undefined, series: hist.gpu_mem_used, max: hw.gpu_mem_total }),
          h(MetricCard, { label: tt('temp'), value: hw.gpu_temp == null ? '–' : fmt(hw.gpu_temp), unit: '°C', color: 'var(--dsw-alias-state-warn-primary)', series: hist.gpu_temp, max: 110 }),
          h(MetricCard, { label: tt('power'), value: hw.gpu_power == null ? '–' : fmt(hw.gpu_power), unit: 'W', series: hist.gpu_power }),
          h(MetricCard, { label: tt('pcie'), value: hw.gpu_pcie_rx_mb == null ? '–' : fmt(hw.gpu_pcie_rx_mb), unit: 'MB/s', series: hist.gpu_pcie_rx_mb }),
          h(MetricCard, { label: tt('cpu'), value: hw.cpu == null ? '–' : fmt(hw.cpu), unit: '%', max: 100, series: hist.cpu }),
          h(MetricCard, { label: tt('disk'), value: hw.disk_read_mb == null ? '–' : fmt(hw.disk_read_mb), unit: 'MB/s', series: hist.disk_read_mb })),
        // cache + requests
        h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.6fr)', gap: 10 } },
          h('div', { style: card },
            h('div', { style: { ...cardTitle, marginBottom: 10 } }, tt('cache')),
            cache && cache.enabled
              ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                  h('div', null,
                    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 } }, h('span', { style: muted }, tt('slots')), h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, `${fmt(cache.parked)} / ${fmt(cache.slots)}`)),
                    h(Bar, { ratio: pct(cache.parked, cache.slots) / 100 })),
                  h('div', null,
                    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 } }, h('span', { style: muted }, tt('memory')), h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, `${gb(cache.bytes)} / ${gb(cache.budget_mib * 1048576)} GB`)),
                    h(Bar, { ratio: pct(cache.bytes, cache.budget_mib * 1048576) / 100 })),
                  h('div', { style: { fontSize: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', ...muted } },
                    h('span', null, tt('lastRequest')), h('span', { style: { color: 'var(--dsw-alias-label-primary)' } }, cache.last_prompt != null ? tt('reusedOf', { a: fmt(cache.last_reused || 0), p: fmt(cache.last_prompt) }) : '–'),
                    h('span', null, tt('sinceStart')), h('span', { style: { color: 'var(--dsw-alias-label-primary)' } }, cache.requests ? `${fmt(cache.reused_tokens)} ${tt('tokensUnit')}${cache.prompt_tokens ? ` (${fmt((100 * cache.reused_tokens) / cache.prompt_tokens)}%)` : ''}` : '–'),
                    h('span', null, tt('parks')), h('span', { style: { color: 'var(--dsw-alias-label-primary)' } }, `${fmt(cache.parks)} / ${fmt(cache.restores)}${cache.evictions ? ` · ${fmt(cache.evictions)} ${tt('evictedUnit')}` : ''}`),
                    h('span', null, tt('lastSwitch')), h('span', { style: { color: 'var(--dsw-alias-label-primary)' } }, cache.last_event ? `${cache.last_event === 'parked' ? tt('parkedWord') : tt('restoredWord')} ${fmt(cache.last_tokens)} tokens, ${since(cache.last_at, tt)}` : '–')),
                  h('div', { style: { fontSize: 11, ...muted } }, tt('cacheNoteOn')))
              : h('div', { style: { fontSize: 12, ...muted } }, cache ? (cache.requests ? `${fmt(cache.requests_reused)} / ${fmt(cache.requests)} ${tt('sinceStart')}` : tt('cacheNoteOff')) : tt('cacheNoteOff'))),
          h('div', { style: { ...card, overflowX: 'auto' } },
            h('div', { style: { ...cardTitle, marginBottom: 10 } }, tt('requests')),
            h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12, fontVariantNumeric: 'tabular-nums' } },
              h('thead', null, h('tr', { style: { color: 'var(--dsw-alias-label-secondary)', textAlign: 'left' } },
                [tt('time'), tt('status'), tt('prompt'), tt('reused'), tt('output'), tt('decodeRate'), tt('hit'), tt('duration')].map((c, i) => h('th', { key: i, style: { padding: '4px 8px', borderBottom: '1px solid var(--dsw-alias-border-l1)', fontWeight: 500, textAlign: i >= 2 ? 'right' : 'left' } }, c)))),
              h('tbody', null,
                requests.length === 0
                  ? h('tr', null, h('td', { colSpan: 8, style: { padding: '10px 8px', ...muted } }, tt('noRequests')))
                  : requests.slice(0, 12).map((r, i) => {
                      const fb = finishBadge[r.finish] || [r.finish || '–', undefined]
                      const hit = r.hit_rate == null ? '–' : `${(r.hit_rate * 100).toFixed(1)}%`
                      const time = r.time ? new Date(r.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '–'
                      return h('tr', { key: i },
                        h('td', { style: { padding: '4px 8px' } }, time),
                        h('td', { style: { padding: '4px 8px' } }, h(Badge, { text: tt(fb[0]) || fb[0], color: fb[1] })),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right' } }, fmt(r.prompt_tokens)),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right', ...muted } }, fmt(r.reused)),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right' } }, fmt(r.output_tokens)),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right' } }, fmt(r.decode_tok_s, 1)),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right' } }, hit),
                        h('td', { style: { padding: '4px 8px', textAlign: 'right', ...muted } }, r.duration_s == null ? '–' : `${fmt(r.duration_s, 1)} s`))
                    }))),
            totals && totals.requests ? h('div', { style: { fontSize: 11, ...muted, marginTop: 8 } },
              `${tt('totalsSince', { when: new Date(totals.since * 1000).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) })} · ${tt('totalsRequests', { n: fmt(totals.requests) })} · ${tt('totalsRead', { n: fmt(totals.prompt_tokens - totals.reused) })} ${tt('totalsReused', { n: fmt(totals.reused) })} · ${tt('totalsWritten', { n: fmt(totals.output_tokens) })}`) : null)),
      )
    }

    function PanelIcon() {
      return h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { x: 2.5, y: 3.5, width: 19, height: 17, rx: 3 }),
        h('path', { d: 'M5 14.5l3.2-4 2.6 3 2.4-5.5 2.2 6 1.6-2.5H19' }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        gateCtx = ctx
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'strata-monitor: dictionaries')
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('main', () => ctx.slots.register(
          { name: 'main', key: 'strata-monitor', locale: NS, inject: () => ({ t }) },
          MonitorPage,
        ))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
          { name: 'sidebar.panellist', id: 'strata-monitor', order: 60, locale: NS, label: () => t('panel') },
          PanelIcon,
        ))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register(
          { name: 'shell.overlay', id: 'strata-monitor-float', order: 100, locale: NS, label: () => t('floatWin'), inject: () => ({ t }) },
          FloatWindow,
        ))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
          { name: 'conversation.composer.dock', id: 'strata-monitor-strip', order: 100, locale: NS, label: () => t('strip'), inject: () => ({ t }) },
          StripLine,
        ))
      },
    }
  },
})
