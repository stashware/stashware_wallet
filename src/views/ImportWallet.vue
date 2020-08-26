<template>
  <section class="d-flex flex-column">
    <v-toolbar color="background" dark flat>
      <img :src="require('@/assets/logo.png')" contain a height="30px" class="mr-2" />
      <div class="title font-weight-bold">Stashware wallet</div>
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        small
        class="background--text text-capitalize"
        @click="$router.back()"
      >
        <img :src="require('@/assets/icons/back.png')" /> Back
      </v-btn>
    </v-toolbar>
    <v-divider dark class="mx-4"></v-divider>
    <div v-if="filename" class="d-flex flex-column pa-5 justify-center" style="height:100%;">
      <div
        v-for="(item,i) in [
        {name:'File name',value:filename},
        {name:'Address',value:address},
        {name:'Public key',value:publicKey},
        {name:'Private key',value:privateKey}
        ]"
        :key="i"
        class="mb-6"
      >
        <div class="sub-title primary--text">{{item.name}}</div>
        <small>{{item.value}}</small>
      </div>
    </div>
    <div v-else class="d-flex flex-row align-center justify-center content">
      <div class="ma-5">Wallet file</div>
      <v-btn
        color="secondary"
        class="background--text text-capitalize"
        small
        @click="selectFile"
      >Import...</v-btn>
      <span class="ma-5 primary--text text-decoration-underline">{{filename}}</span>
    </div>
    <v-divider dark class="mx-4"></v-divider>
    <v-layout class="ma-5">
      <v-spacer></v-spacer>
      <v-btn
        v-if="filename"
        color="secondary"
        width="100px"
        class="ma-5 background--text text-capitalize"
        small
        @click="selectFile"
      >Import</v-btn>
      <v-btn
        small
        width="100px"
        class="ma-5 text-capitalize white--text"
        color="primary"
        @click="ok"
      >Enter</v-btn>
    </v-layout>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { selectFile, delay, readFile } from '../libs/helper'
import globalModule from '@/store/global'
import { getAddressByPublicKey, getPublicKeyByPrivateKey } from '@/libs/keygen'

@Component
export default class ImportWallet extends Vue {
  filename = ''
  publicKey = ''
  privateKey = ''
  address = ''
  mounted() {
    this.filename = globalModule.wallet.filename
    this.publicKey = globalModule.wallet.publicKey
    this.privateKey = globalModule.wallet.privateKey
    this.address = globalModule.wallet.address
  }
  async selectFile() {
    const file = (await selectFile({
      asText: false,
      accept: '',
    })) as File
    this.filename = file.name
    const privateKey = await readFile(file)
    this.privateKey = privateKey
    this.publicKey = getPublicKeyByPrivateKey(privateKey)
    this.address = getAddressByPublicKey(this.publicKey)
  }
  async ok() {
    if (!(this.filename && this.publicKey)) {
      return this.$dialog.message.warning('Please import your wallet file.')
    }
    globalModule.setWallet({
      privateKey: this.privateKey,
      filename: this.filename,
    })
    this.$router.push('/home')
  }
}
</script>

<style scoped lang="less">
section {
  height: 100%;
  .content {
    height: 100%;
  }
  small {
    word-break: break-all;
    display: block;
    max-height: 120px;
    overflow: auto;
  }
}
</style>
