<template>
  <section class="px-5">
    <v-row>
      <v-col cols="6">
        <div class="title primary--text mb-5">Balances:</div>
        <div style="width:75%;">
          <div class="balance mb-5">
            <div>Available</div>
            <div>{{balance.balance | amount}} SWR</div>
          </div>
          <div class="balance mb-5">
            <div>Pending</div>
            <div>{{balance.pending | amount}} SWR</div>
          </div>
          <v-divider dark class="mb-5"></v-divider>
          <div class="balance mb-5">
            <div>Total</div>
            <div>{{(balance.balance + balance.pending) | amount}} SWR</div>
          </div>
        </div>
        <div class="mt-10 mb-2 title primary--text">Receive address:</div>
        <div class="mb-5">{{wallet.address}}</div>
        <v-btn
          class="copy"
          color="primary"
          dark
          small
          @click="copy"
          :data-clipboard-text="wallet.address"
        >Copy</v-btn>
      </v-col>
      <v-col cols="6">
        <div class="title primary--text mb-5">Recent transactions:</div>
        <div class="record mb-5" v-for="(history,i) in histories.slice(0,6)" :key="i">
          <div class="d-flex justify-space-between mb-2">
            <div class="d-flex align-center">
              <img
                :src="require(`@/assets/icons/${history.type === 'send'?'payout':'receive'}.png`)"
                class="mr-2"
              />
              <span v-if="history.timestamp">{{history.timestamp | timestamp}}</span>
              <span v-else>pending</span>
            </div>
            <div
              class="amount"
              :class="[history.type === 'send'?'warning--text':'primary--text']"
            >{{history.type === 'send'?'-':'+'}}{{history.total | swr}}</div>
          </div>
          <div
            class="ml-7 secondary--text"
          >{{history.type === 'send' ? history.target : history.from}}</div>
        </div>
        <div class="text-center inactive--text" v-if="histories.length===0">none</div>
      </v-col>
    </v-row>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ws from '@/libs/ws'
import globalModule from '@/store/global'
// @ts-ignore
import Clipboard from 'clipboard'
import { delay } from '../../libs/helper'

@Component
export default class Overview extends Vue {
  get wallet() {
    return globalModule.wallet
  }
  get balance() {
    return globalModule.balance
  }
  get histories() {
    return globalModule.histories
  }
  async created() {
    new Clipboard('.copy')
  }

  copy() {
    this.$dialog.message.success('Copy successfully')
  }
}
</script>

<style lang="less" scoped>
.balance {
  display: flex;
  justify-content: space-between;
}
</style>