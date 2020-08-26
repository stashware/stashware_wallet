import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'

Vue.use(Vuetify)

const light = {
  background: '#18191D',
  quote: '#2A2B31',
  primary: '#A9D640',
  secondary: '#CCCCCC',
  accent: '#82B1FF',
  error: '#FF5252',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9D02',
  inactive: '#cccccc'
}

const vuetify = new Vuetify({
  icons: {
    iconfont: 'md',
  },
  theme: {
    themes: {
      light,
    },
  },
})
Vue.use(VuetifyDialog, {
  context: {
    vuetify
  },
  prompt: {
    actions: [
      {
        text: 'OK',
        color: 'primary',
      },
      {
        text: 'Cancel',
      },
    ]
  },
  confirm: {
    showClose: false,
    actions: [
      {
        text: 'OK',
        color: 'primary',
      },
      {
        text: 'Cancel',
      },
    ]
  },
})

export default vuetify