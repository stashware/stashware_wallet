<template>
  <section class="home d-flex flex-column align-center">
    <div class="my-10"></div>
    <div class="my-7"></div>
    <v-img class="mb-2" :src="require('@/assets/logo.png')"></v-img>
    <div class="text-h4 font-weight-bold">Stashware wallet</div>
    <div class="my-8"></div>
    <v-btn class="ma-5" x-large width="350px" to="/generate-wallet" color="#A9D640" dark>
      <img
        :src="require('@/assets/icons/create_account.png')"
        height="30px"
        width="30px"
        class="mr-2"
      />
      Create a new account
    </v-btn>
    <v-btn class="ma-5" x-large width="350px" to="/import-wallet">
      <img :src="require('@/assets/icons/import.png')" height="30px" width="30px" class="mr-2" />
      Import existing account
    </v-btn>
    <v-img :src="require('@/assets/logo_bg.png')" class="logo-bg"></v-img>
  </section>
</template>

<script>
import globalModule from '@/store/global'
export default {
  name: 'Guide',
  components: {},
  created() {
    if (globalModule.wallet.address) {
      // this.$router.push('/home')
    }
  },
}
</script>

<style lang="less" scoped>
.home {
  position: relative;
  .logo-bg {
    position: absolute;
    left: 75%;
    top: 50%;
  }
}
</style>
