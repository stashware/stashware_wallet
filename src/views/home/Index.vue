<template>
  <section>
    <div class="d-flex pt-4 mb-2 ml-4">
      <img :src="require('@/assets/logo.png')" contain a height="30px" class="mr-2" />
      <div class="title font-weight-bold">Stashware wallet</div>
    </div>
    <v-tabs v-model="tab" background-color="background" dark hide-slider optional>
      <v-tab
        v-for="(item,i) in tabs"
        :key="i"
        class="text-capitalize"
        @click="$router.push({name:item.name})"
      >
        <img :src="require(`@/assets/icons/${item.icon}${tab===i?'_highlight':''}.png`)" />
        <span
          :style="{color:$vuetify.theme.themes.light[tab===i?'primary':'inactive']}"
        >{{ item.name }}</span>
      </v-tab>
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        small
        class="background--text text-capitalize mr-5 mt-2"
        @click="logout"
      >Logout</v-btn>
    </v-tabs>
    <v-divider dark class="mb-5 mx-5"></v-divider>
    <router-view></router-view>
    <div class="bottom background px-5 secondary--text d-flex justify-space-between">
      <small>Current: {{chain.current}}</small>
      <small>Height: {{chain.height}}</small>
      <small>Peers: {{chain.peers}}</small>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import globalModule from '@/store/global'
import { Watch } from 'vue-property-decorator'

@Component
export default class Index extends Vue {
  tabs = [
    {
      name: 'Overview',
      icon: 'home',
    },
    {
      name: 'Send',
      icon: 'share',
    },
    {
      name: 'Transactions',
      icon: 'transaction',
    },
  ]
  tab = -1
  @Watch('tab')
  onTabChange() {
    globalModule.initWallet()
  }

  get chain() {
    return globalModule.chain
  }
  created() {
    if (!globalModule.wallet.address) {
      return this.$router.push('/')
    }
    globalModule.initWallet()
  }
  async logout() {
    const res = await this.$dialog.confirm({
      title: 'Confirm',
      text: 'Confirm logout of your account.',
      actions: ['Ok', 'Cancel'],
    })
    if (res === 'Cancel') return
    globalModule.setWallet(null)
    this.$router.push('/')
  }
}
</script>

<style scoped lang="less">
.bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  line-height: 40px;
  height: 40px;
}
</style>
