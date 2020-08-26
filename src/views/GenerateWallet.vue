<template>
  <section class="d-flex justify-start flex-column" style="height:100%;">
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
    <div class="ma-4" style="height:100%;">
      <div v-if="address">
        <div class="primary--text mb-4">Your account has been created</div>
        <div class="quote pa-4 d-flex mb-5">
          <div class="mr-4">
            <img :src="require('@/assets/icons/info.png')" />
          </div>
          <div>
            Please store this private key in a secure place. This private key is needed in order to access your SWR account.
            If you lose the private key you won't be able to do any transactions, i.e. your coins are lost. The private key is not recoverable. Keep this private key secret. Everybody who knows the private key is de facto the owner of the account.
          </div>
        </div>
      </div>
      <div v-else class="my-5"></div>
      <div
        v-for="(item,i) in [
        {name:'Address',value:address},
        {name:'Public key',value:publicKey},
        {name:'Private Key',value:privateKey}
        ]"
        :key="i"
        class="mb-6"
      >
        <div class="sub-title primary--text">{{item.name}}</div>
        <small>{{item.value || 'generating...'}}</small>
      </div>
    </div>
    <v-divider dark></v-divider>
    <div class="d-flex py-3">
      <v-spacer></v-spacer>
      <v-btn
        v-if="address"
        small
        width="100px"
        class="ma-5 text-capitalize background--text"
        color="secondary"
        @click="download"
      >
        <img :src="require('@/assets/icons/download.png')" class="mr-2" />
        Save
      </v-btn>
      <v-btn
        small
        width="100px"
        class="ma-5 text-capitalize background--text"
        color="secondary"
        @click="generate"
      >{{generating ? 'Generating...': publicKey ? 'Regenerate' : 'Generate'}}</v-btn>
      <v-btn
        small
        width="100px"
        class="ma-5 text-capitalize white--text"
        color="primary"
        @click="enter"
      >Enter</v-btn>
    </div>
    <v-dialog v-model="showConfirmation" width="500px" dark persistent>
      <v-card dark class="background lighten-1">
        <div class="pa-4 d-flex mb-5">
          <div class="mr-4">
            <img :src="require('@/assets/icons/info.png')" />
          </div>
          <div>
            <p>Continue to enter the wallet will use this account by default.</p>
            <p>Please store this private key in a secure place. This private key is needed in order to access your SWR account.</p>
          </div>
        </div>
        <v-divider></v-divider>
        <div class="text-right py-4">
          <v-btn
            class="text-capitalize px-5 mr-4 background--text"
            small
            color="inactive"
            @click="showConfirmation = false"
          >Back</v-btn>
          <v-btn class="text-capitalize px-5 mr-4" small color="primary" @click="push">Enter</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { generateKeys } from '@/libs/keygen'
// @ts-ignore
import downlaod from 'downloadjs'
import globalModule from '@/store/global'
import { delay } from '@/libs/helper'
import { Watch } from 'vue-property-decorator'

@Component
export default class GenerateWallet extends Vue {
  address = ''
  privateKey = ''
  publicKey = ''
  generating = false
  downloaded = false
  @Watch('downloaded')
  onDownloaded() {
    this.showConfirmation = false
    this.downloaded = true
  }
  showConfirmation = false
  created() {
    this.generate()
  }
  async generate() {
    this.generating = true
    this.$forceUpdate()
    await delay(0)
    const { address, privateKey, publicKey } = generateKeys()
    this.address = address
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.generating = false
  }
  download() {
    this.downloaded = true
    downlaod(this.privateKey, 'swr_wallet.dat')
  }
  async enter() {
    if (['', '-'].includes(this.publicKey)) {
      this.$dialog.message.warning('Please generate a wallet.')
    }
    if (!this.downloaded) {
      this.showConfirmation = true
    } else {
      this.push()
    }
  }
  push() {
    globalModule.setWallet({
      privateKey: this.privateKey,
      filename: '',
    })
    this.$router.push('/home')
  }
}
</script>

<style scoped lang="less">
small {
  word-break: break-all;
  display: block;
  max-height: 120px;
  overflow: auto;
}
</style>
