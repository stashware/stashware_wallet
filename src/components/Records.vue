<template>
  <v-simple-table class="background px-5" dark height="550" fixed-header>
    <template v-slot:default>
      <thead>
        <tr>
          <th
            class="white--text text-body-2 background"
            v-for="(item,i) in ['Status','Date','Data','Address','Amount(SWR)']"
            :key="i"
          >{{item}}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(history,i) in histories">
          <tr :key="i" class="transparent white--text">
            <td>
              <img
                :src="require(`@/assets/icons/status_${history.confirmations >0?'done':'pending'}.png`)"
                class="mr-2"
                style="vertical-align:middle;"
              />
            </td>
            <td>{{history.timestamp | timestamp}}</td>
            <td v-if="history.data_hash">
              <v-btn icon @click="openLink(history)">
                <img :src="require('@/assets/icons/attach.png')" />
              </v-btn>
            </td>
            <td v-else></td>
            <td>
              <img
                :src="require(`@/assets/icons/${history.type === 'send'?'payout':'receive'}.png`)"
                class="mr-2"
                style="vertical-align:middle;"
              />
              {{history.type === 'send' ? history.target : history.from}}
            </td>
            <td
              :class="[history.type === 'send'?'warning--text':'primary--text']"
            >{{history.total | swr}}</td>
          </tr>
          <tr :key="i+'divider'" style="height:10px;"></tr>
        </template>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import globalModule, { TransactionHistory } from '@/store/global'

@Component
export default class Records extends Vue {
  get histories() {
    return globalModule.histories
  }
  openLink(history: TransactionHistory) {
    const protocol = location.protocol
    const hostname = location.hostname
    const port = 2080
    const id = history.id
    const url = `${protocol}//${hostname}:${port}/${id}`
    open(url, '_blank')
  }
}
</script>

<style scoped lang="less">
</style>