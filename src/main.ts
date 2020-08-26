import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueI18n from 'vue-i18n'

// @ts-ignore
import VueWorker from 'vue-worker'
import './style/global.less'
import './style/overlay-vuetify.less'
import './libs/ws'
import './filters'

Vue.config.productionTip = false
Vue.use(VueI18n)
Vue.use(VueWorker)

const i18n = new VueI18n({
  locale: 'en-US',
  messages: {
    'en-US': {
      'Stashware wallet': 'Stashware Wallet'
    }
  }
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
