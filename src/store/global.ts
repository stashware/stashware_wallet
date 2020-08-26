import store from './index'
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
import ws from '@/libs/ws'
import { getAddressByPublicKey, getPublicKeyByPrivateKey } from '@/libs/keygen'
import { pick } from 'lodash'
import { swr } from '@/filters'

export interface TransactionHistory {
  block_indep_hash: string
  confirmations: number
  data: string
  from: string
  id: string
  last_tx: string
  owner: string
  quantity: number
  reward: number
  signature: string
  tags: string[]
  target: string
  type: 'send' | 'receive'
}

@Module({
  name: 'global',
  dynamic: true,
  store,
  namespaced: true
})
export class MGlobal extends VuexModule {
  wallet = {
    address: '',
    publicKey: '',
    privateKey: '',
    filename: '',
  }
  balance = {
    balance: 0,
    pending: 0,
    last_tx: '',
  }
  chain = {
    current: '',
    peers: 0,
    height: 0,
  }
  histories: TransactionHistory[] = []
  @Mutation
  setWallet(wallet: {
    privateKey: string
    filename: string
  } | null) {
    if (wallet === null) {
      this.wallet.privateKey = ''
      this.wallet.publicKey = ''
      this.wallet.address = ''
      this.wallet.filename = ''
      localStorage.removeItem('privateKey')
    } else {
      this.wallet.privateKey = wallet.privateKey
      this.wallet.publicKey = getPublicKeyByPrivateKey(wallet.privateKey)
      this.wallet.address = getAddressByPublicKey(this.wallet.publicKey)
      this.wallet.filename = wallet.filename
      localStorage.setItem('privateKey', wallet.privateKey)
    }
  }
  @Mutation
  setChain(chain: { current: string, peers: number, height: number }) {
    this.chain = chain
  }
  @Mutation
  setBalance(balance: { balance: number, pending: number, last_tx: string }) {
    this.balance = balance
  }
  @Mutation
  setHistories(histories: TransactionHistory[]) {
    this.histories = histories
  }
  @Action
  async initWallet() {
    if (this.wallet.address === '') return
    this.fetchHistories()
    await this.fetchBalance()
  }
  @Action
  async fetchBalance() {
    const { para } = await ws.request('wallet_by_addr', {
      address: this.wallet.address,
    })
    this.setBalance({
      balance: swr(para.balance),
      pending: swr(para.pending),
      last_tx: para.last_tx
    })
  }
  @Action
  async fetchHistories() {
    const { para } = await ws.request('get_addr_txs', {
      address: this.wallet.address,
    })
    const allId = para.data || []
    const histories = []
    for (const id of allId) {
      try {
        const { para } = await ws.request('tx_by_id', { txid: id })
        para.type = para.from === this.wallet.address ? 'send' : 'receive'
        para.total = para.quantity + para.reward
        histories.push(para)
      } catch (err) { console.error(err) }
    }
    this.setHistories(histories)
  }
}

const module = getModule(MGlobal)
const privateKey = localStorage.getItem('privateKey')
if (privateKey) {
  module.setWallet({ privateKey, filename: '' })
}

export function getInfo(para: any) {
  module.setChain(pick(para, Object.keys(module.chain)) as any)
}

setInterval(async () => {
  module.initWallet()
}, 10000)


export default module