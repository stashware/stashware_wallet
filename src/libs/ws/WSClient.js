/* eslint-disable */
class WSClient {
  constructor(args = {}) {
    this.initiating = false
    this.ws = null
    this.state = -1
    this.origin = args.origin
    this.dst = args.dst || {}

    this.heartCmd = args.hbCmd
    this.heartParams = {}
    this.heartCb = args.heartCb || (() => null)

    this.reqMaps = {}
    this.count = 0

    this.subMaps = {}
    this.penddingReqs = []

    this.initFunc = () => { }

    this.requestTimeoutMs = 5 * 1000

    this.hbIntervalMs = 5000
    this.hbSentMs = 0
    this.hbRecvMs = 0

    this.interruptIntervalMs = 200
    this.interruptMs = 0
    this.commonMonErrcb = null
    this.changeState = null

    this.appId = args.appId

    this.checkFunc = msec => {
      if (this.interruptMs + this.interruptIntervalMs > msec) {
        return false
      }
      this.interruptMs = msec
      return true
    }
    this.doFunc = msec => {
      let ws = this.ws
      let ctx = this
      if (ws == null && !this.initiating) {
        ctx.initWebSocket(ctx.origin, ctx.dst)
        return false
      }
      if (ws.readyState !== ctx.state) {
        ctx.state = ws.readyState
        if (typeof ctx.changeState === 'function') {
          ctx.changeState(ctx.state)
        }
      }
      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          break
        case WebSocket.OPEN:
          for (let n in ctx.reqMaps) {
            let realval = ctx.reqMaps[n]
            if (realval.now + ctx.requestTimeoutMs < msec) {
              let callbackFunc = realval.callback
              console.log('outtime:', n)
              typeof callbackFunc === 'function' && callbackFunc({ err: 0 })
              delete ctx.reqMaps[n]
            }
          }
          if (ctx.hbSentMs + ctx.hbIntervalMs < msec) {
            ctx.hbSentMs = msec
            ctx.send(ctx.heartCmd, ctx.heartParams)
          }

          if (ctx.hbRecvMs + ctx.hbIntervalMs * 2.5 < msec) {
            ctx.close()
            break
          }

          // 4. pendding
          ctx.penddingReqs.forEach(v => {
            ctx.request(v.cmd, v.params, v.callback, v.chk)
          })
          ctx.penddingReqs = []

          break
        case WebSocket.CLOSING:
          break
        default:
          ctx.ws = null
          break
      }
      return ctx
    }
    // this.doFunc()
  }
  initWebSocket(url, dst) {
    return new Promise((resolve, reject) => {
      let ctx = this
      this.initiating = true
      let query = []
      let queue = []
      if (this.ws) {
        return resolve(this.ws)
      }
      if (!url || !url.length) {
        return reject(new Error('url is empty'))
      }
      for (let n in dst) {
        if (dst[n] === null || dst[n] === undefined) continue
        query.push(n + '=' + dst[n])
      }
      query = query.length ? '?' + query.join('&') : ''
      ctx.hbRecvMs = Date.now()
      ctx.state = 0

      if (Array.isArray(url)) {
        url.forEach(v => {
          start(v + query)
        })
      } else {
        start(url + query)
      }
      function start(src) {
        let ws = new WebSocket(src)
        queue.push(ws)
        ws.onopen = evt => {
          queue.forEach(v => {
            if (ws !== v) {
              v.close()
            }
          })
          ctx.initFunc()
          ctx.initiating = false
          resolve(ws)
        }

        ws.onmessage = evt => {
          ctx.message(evt)
        }
        ws.onerror = evt => {
          console.error('WS error：', evt)
          ctx.initiating = false
        }
        ws.onclose = evt => {
          console.error('WS closed', evt)
          ctx.initiating = false
        }
        ctx.ws = ws
      }
    })
  }
  changeInitFunc(func) {
    if (typeof func === 'function') {
      this.initFunc = func
    }
  }
  request(cmd, params = {}, callback) {
    params.appid = this.appId
    let now = Date.now()
    this.count++
    const chk = (now * 1000 + (this.count % 1000)).toString()
    const promise = new Promise(async (resolve, reject) => {
      while (!this.ws) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      const pcb = (data) => {
        if (data.err !== undefined) {
          reject(data)
        } else {
          resolve(data)
        }
        typeof callback === 'function' && callback(data)
      }
      if (this.send(cmd, params, chk)) {
        this.reqMaps[chk] = { callback: pcb, now: now }
      } else {
        this.penddingReqs.push({
          cmd: cmd,
          callback: pcb,
          params: params,
          chk: now
        })
      }
    })

    return promise
  }
  changeUrl(dst, origin) {
    // if (JSON.stringify(dst) === JSON.stringify(this.dst)) {
    //   return false
    // }
    this.dst = dst
    origin && (this.origin = origin)
    if (origin) {
      this.close()
    }
  }
  setCommonMonErrcb(cb) {
    this.commonMonErrcb = cb
  }
  setChangeState(cb) {
    this.changeState = cb
  }
  changeHbPara(para) {
    this.heartParams = para
    this.hbSentMs = 0
  }
  changePushCb(cmd, callback) {
    if (typeof cmd === 'string') {
      if (typeof callback !== 'function') {
        delete this.subMaps[cmd]
      } else {
        this.subMaps[cmd] = callback
      }
    }
  }
  close() {
    let ws = this.ws
    if (ws) {
      ws.close()
      this.ws = null
    }
  }
  // send
  send(cmd, params, chk) {
    let ws = this.ws
    if (ws == null || ws.readyState !== WebSocket.OPEN) {
      return false
    }
    // if (!cmd && !Object.keys(params).length) return false
    ws.send(
      JSON.stringify({
        cmd: cmd,
        chk: chk,
        para: JSON.stringify(params) === '{}' ? undefined : params
      })
    )
    return true
  }
  message(evt) {
    let data = JSON.parse(evt.data) || ''
    if (!data) {
      return
    }

    if (data.cmd === this.heartCmd) {
      this.hbRecvMs = this.interruptMs
      this.heartCb(data.para)
      return
    }
    if (data.err && typeof this.commonMonErrcb === 'function') {
      let bret = this.commonMonErrcb(data)
      if (bret) {
        return
      }
    }
    let callback
    if (data.chk) {
      if (this.reqMaps[data.chk]) {
        callback = this.reqMaps[data.chk].callback
        delete this.reqMaps[data.chk]
      }
    } else {
      callback = this.subMaps[data.cmd]
    }
    typeof callback === 'function' && callback(data)
  }
}
export default WSClient
