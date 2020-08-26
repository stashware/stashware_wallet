/** @ts-ignore */
import WS from './WSClient'
/** @ts-ignore */
import Interrupt from './interrupt'
import { getInfo } from '@/store/global'

const interrupt = new Interrupt({ msec: 50 })

let ws: WSClient
export function initWS() {
  const hash = (location.hash || '').replace('#', '')
  const host = location.host
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  ws = new WS({
    origin: process.env.NODE_ENV === 'development' ? 'ws://192.168.1.30:1981/' : `${protocol}://${host}/`,
    hbCmd: 'info',
    heartCb: getInfo
  })
  ws.setCommonMonErrcb((res: any) => {
    console.error(res.err)
  })
  console.log('WS initiated')
  return ws
}
ws = initWS()
interrupt.registe(ws)
export default ws


