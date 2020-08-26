<template>
  <section class="mx-5">
    <div class="d-flex mb-5">
      <div class="primary--text text-h6" style="width:120px;">Pay to:</div>
      <v-text-field
        v-model="to"
        dark
        full-width
        hide-details
        dense
        outlined
        placeholder="Enter a SWR address"
        @blur="calculate"
      ></v-text-field>
      <div class="d-flex ml-3">
        <v-btn icon dark @click="importFromHistories">
          <img :src="require('@/assets/icons/contacts.png')" />
        </v-btn>
        <v-btn icon dark @click="to = ''">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex mb-5 align-center">
      <div class="primary--text text-h6" style="width:120px;">Amount:</div>
      <div class="d-flex align-center mr-10">
        <v-text-field
          v-model="amount"
          dark
          hide-details
          dense
          outlined
          type="number"
          placeholder="0.00000000"
        ></v-text-field>
        <div class="primary--text ml-2">SWR</div>
      </div>
      <v-checkbox
        label="Subtract fee from amount"
        class="white--text ma-0 custom-checkbox mr-10"
        on-icon="check_circle"
        off-icon="lens"
        color="primary"
        dark
        v-model="subtract"
        hide-details
      ></v-checkbox>
      <v-btn
        class="background--text text-capitalize"
        small
        dark
        color="secondary"
        @click="useAvailableBalance"
      >Use available balance</v-btn>
    </div>
    <div class="d-flex mb-5 align-center">
      <div class="primary--text text-h6" style="width:120px;">Data:</div>
      <v-btn
        class="white--text text-capitalize mr-5"
        dark
        color="primary"
        @click="selectFile"
      >Browse</v-btn>
      <template v-if="file">
        <span class="mr-5 primary--text">{{file.name}}</span>
        <span class="mr-5">{{(file.size/1024).toFixed(2)}}KB</span>
      </template>
    </div>
    <div class="d-flex mb-5 align-center">
      <div class="primary--text text-h6 mr-2" style="width:120px;">Tags:</div>
      <v-card
        width="100%"
        dark
        color="background"
        flat
        :style="{border: `1px solid ${$vuetify.theme.themes.light.inactive}!important`}"
      >
        <v-simple-table dark class="background" fixed-header dense height="150px">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left text-body-2">Key</th>
                <th class="text-left text-body-2">Value</th>
                <th class="text-right text-body-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,i) in tags" :key="i">
                <td>
                  <input type="text" v-model="item.key" class="white--text" />
                </td>
                <td>
                  <input type="text" v-model="item.value" class="white--text" />
                </td>
                <td class="text-right">
                  <v-btn icon small color="secondary" @click="tags.splice(i,1)">
                    <v-icon>highlight_off</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr class="transparent">
                <td style="position:absolute;bottom:5px;">
                  <v-btn
                    small
                    text
                    color="primary"
                    class="text-capitalize pa-0"
                    @click="tags.push({key:'key',value:'value'})"
                  >
                    <v-icon color="primary">add_circle_outline</v-icon>Add
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </div>
    <div class="d-flex mb-5 align-center">
      <div class="primary--text text-h6 mr-2">Transaction fee:</div>
      <span class="mr-2">{{transFee | amount}}</span>
      <span class="primary--text mr-5">SWR</span>
      <v-btn
        class="background--text text-capitalize mr-5"
        dark
        small
        color="secondary"
        @click="calculate"
      >Estimate</v-btn>
      <small class="mr-5 warning--text">Warning: Fee estimation is currently not possible.</small>
    </div>
    <div class="bottom px-5">
      <v-divider dark class="mb-5"></v-divider>
      <div class="d-flex justify-end align-center">
        <span class="text-h6 font-weight-regular primary--text mr-2">Balance</span>
        <span class="text-h6 font-weight-regular mr-2">{{balance.balance | amount}}</span>
        <span class="text-h6 font-weight-regular primary--text mr-10">SWR</span>
        <v-btn
          dark
          color="warning"
          width="200px"
          class="text-capitalize"
          @click="send"
          :disabled="!sendable"
          :loading="sending"
        >
          <img
            :src="require('@/assets/icons/share.png')"
            alt
            style="filter: brightness(0) invert(1);"
            :style="{opacity: sendable ? '1':'0.3'}"
          />
          Send
        </v-btn>
      </div>
      <div class="d-flex justify-end align-end" style="height:50px;">
        <div ref="status" class="caption warning--text"></div>
      </div>
    </div>
    <v-dialog v-model="dialog.show" width="400px">
      <v-card dark class="background lighten-1 dialog d-flex flex-column">
        <div class="pa-5 text-center title primary--text">Historical use address</div>
        <v-list dense color="background lighten-1" height="100%">
          <v-list-item-group>
            <v-list-item v-for="(address, i) in contacts" :key="i" @click="selectContact(address)">
              <!-- <v-list-item-icon>
                <v-icon>person</v-icon>
              </v-list-item-icon>-->
              <v-list-item-content>
                <v-list-item-title v-text="address"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-spacer></v-spacer>
        <div class="text-right pa-5">
          <v-divider dark class="my-5"></v-divider>
          <v-btn class="text-capitalize white--text primary" @click="dialog.show = false">Close</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <!-- <v-snackbar
      dark
      color="primary"
      content-class="white--text font-weight-bold"
      :timeout="-1"
      :value="!!snackbar"
      @input="snackbar = ''"
    >
      {{ snackbar }}
      <template v-slot:action="{ attrs }">
        <v-btn icon text v-bind="attrs" @click="snackbar = ''">
          <v-icon>close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>-->
  </section>
</template>

<script lang="tsx">
import Vue from 'vue'
import Component from 'vue-class-component'
import { selectFile, readFile, delay } from '../../libs/helper'
import globalModule from '@/store/global'
import ws from '../../libs/ws'
import {
  obj2buf,
  buf2hex,
  str2buf,
  appendBuffer,
  hex2buf,
  num2buf,
} from '@/libs/keygen'
import { sha256 } from 'js-sha256'
// @ts-ignore
import NodeRsa from 'node-rsa'
// @ts-ignore
import base58 from 'bs58'
import { Buffer } from 'buffer'
import { get } from 'lodash'
import { DECIMAL } from '@/libs/meta'
import { swr, base64 } from '@/filters'
import { Watch } from 'vue-property-decorator'
import { create, all, MathJsStatic, sign } from 'mathjs'

const math = create(all, { number: 'BigNumber' }) as MathJsStatic

@Component
export default class Send extends Vue {
  dialog = {
    show: false,
  }
  file = null as File | null
  // BtjToi346EQ7RGXvWeDQC5JcEx8rC2WkTn2fntzCnowA
  to = ''
  amount = ''
  @Watch('amount')
  onAmountChange(amount: string) {
    const MAX_DECIMAL_LENGTH = 10
    if (amount.indexOf('.') === -1) return
    const arr = amount.split('.')
    if (arr[1].length <= MAX_DECIMAL_LENGTH) return

    const newVal = `${arr[0]}.${arr[1].slice(0, MAX_DECIMAL_LENGTH)}`
    this.amount = ''
    this.$nextTick().then(() => {
      this.amount = newVal
    })
  }
  subtract = false
  fileData = new Uint8Array()
  transFee = 0
  tags = []
  sending = false
  // snackbar = ''
  get wallet() {
    return globalModule.wallet
  }
  get balance() {
    return globalModule.balance
  }
  get histories() {
    return globalModule.histories
  }
  get contacts() {
    const contacts: string[] = []
    this.histories.forEach((history) => {
      if (
        !contacts.includes(history.target) &&
        history.target !== this.wallet.address
      ) {
        contacts.push(history.target)
      }
      if (
        !contacts.includes(history.from) &&
        history.from !== this.wallet.address
      ) {
        contacts.push(history.from)
      }
    })
    return contacts
  }
  get sendable() {
    return !!(this.to || this.amount || this.fileData.length > 0)
  }
  mounted() {
    this.init()
  }
  init() {
    this.to = ''
    this.amount = ''
    this.file = null
    this.fileData = new Uint8Array()
    this.tags = []
    this.transFee = 0
    this.sending = false
    this.calculate()
  }
  async importFromHistories() {
    this.dialog.show = true
  }
  async selectFile() {
    const file = (await selectFile({ asText: false, accept: '' })) as File
    this.file = file
    this.fileData = file
      ? new Uint8Array(await readFile(this.file as File, 'buffer'))
      : new Uint8Array()
    this.calculate()
  }
  async send() {
    const status = this.$refs.status as Element
    try {
      this.sending = true
      const to = this.to || ''
      let amount = parseFloat(this.amount || '0')
      if (!this.to) {
        amount = 0
      } else if (this.subtract) {
        amount = math
          .evaluate(`${amount} * ${DECIMAL} - ${this.transFee} * ${DECIMAL}`)
          .toNumber()
      } else {
        amount = math.evaluate(`${amount} * ${DECIMAL}`).toNumber()
      }
      if (amount < 0) {
        throw 'amount can not be a number less than 0'
      }

      const transFee = math.evaluate(`${this.transFee} * ${DECIMAL}`).toNumber()

      status.innerHTML = 'Encrypting data...'
      await delay(100)

      const key = new NodeRsa(hex2buf(this.wallet.privateKey), 'private-der')
      const sha256data =
        this.fileData.length > 0 ? sha256.array(this.fileData) : []
      const hash = buf2hex(new Uint8Array(sha256data))
      const bufferedTags = this.tags.reduce((pre, cur: any, i) => {
        const buf = appendBuffer(str2buf(cur.key), str2buf(cur.value))
        return appendBuffer(pre, buf)
      }, new Uint8Array())
      const base = {
        owner: hex2buf(this.wallet.publicKey),
        target: base58.decode(this.to),
        data: new Uint8Array(sha256data),
        quantity: amount,
        reward: transFee,
        last_tx: hex2buf(this.balance.last_tx),
        tags: bufferedTags,
      }
      const buffer = obj2buf(base)

      status.innerHTML = 'Signing Tx...'
      await delay(100)
      const signature = buf2hex(key.sign(Buffer.from(buffer)))
      const id = buf2hex(new Uint8Array(sha256.array(buffer)))

      status.innerHTML = 'Submitting transaction...'
      await delay(100)

      console.log(base, buf2hex(buffer))
      await ws.request('submit_tx', {
        ...base,
        id,
        from: globalModule.wallet.address,
        owner: this.wallet.publicKey,
        target: this.to,
        signature,
        tags: this.tags.map((item: any) => ({
          name: item.key,
          value: item.value,
        })),
        last_tx: this.balance.last_tx,
        data: buf2hex(this.fileData),
        data_hash: hash,
      })
      this.$dialog.message.success('Send successfully', { position: 'bottom' })
      // this.snackbar = 'Send successfully'
      status.innerHTML = `Send successfully (TxID: ${id})`
      this.init()
    } catch (err) {
      console.error(err)
      status.innerHTML = ``
      this.$dialog.message.error('Failed to send', { position: 'bottom' })
    }
    this.sending = false
    globalModule.initWallet()
  }
  async useAvailableBalance() {
    const balance = this.balance.balance
    this.amount = balance + ''
    this.subtract = true
  }
  selectContact(address: string) {
    this.to = address
    this.dialog.show = false
    this.calculate()
  }
  async calculate() {
    const { para } = await ws.request('price', {
      target: this.to,
      bytes: this.file && this.file.size,
    })
    this.transFee = swr(para.amount || 0)
  }
}
</script>

<style scoped lang="less">
.bottom {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 100%;
}
.dialog {
  min-height: 40vh;
}
input {
  border: none;
  outline: none;
  width: 100%;
}
</style>
