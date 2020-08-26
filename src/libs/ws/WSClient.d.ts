declare class WSClient {
  constructor()
  origin: string
  dst: any
  request(cmd: string, params?: any): Promise<any>
  changeUrl(dst: Record<string, any>, origin: string): void
  setCommonMonErrcb(cb: (err: any) => void): void
  initWebSocket(url: string, dst?: any): void
}