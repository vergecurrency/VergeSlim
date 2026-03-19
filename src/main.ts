import Vue from 'vue'
import axios from 'axios'
import electron from 'electron'

import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/locale'
import '@/mixins'
import '@/icons'
import { mapActions, mapGetters } from 'vuex'
import constants from './utils/constants'
import walletManager from '@/walletManager'
import authManager from '@/authentication'
import { applyNodeProxyState } from '@/utils/nodeProxy'
import { ensureTorProxyState, markPrimaryApiReady } from '@/utils/torStartup'

applyNodeProxyState(store.getters.isTorEnabled)

Vue.use(walletManager, { store })
Vue.use(authManager)
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$electron = electron

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
  computed: {
    ...mapGetters(['currentLanguageCode', 'currentCurrencyCode'])
  },
  methods: {
    ...mapActions(['updatePriceRate']),
    loadData () {
      return axios.get(`${constants.priceApi}/${this.currentCurrencyCode}`)
        .then(response => {
          // @ts-ignore
          this.updatePriceRate(response.data.price)
        })
    }
  },
  async mounted () {
    try {
      await ensureTorProxyState(this.$store.getters.isTorEnabled)

      setInterval(() => {
        this.loadData()
      }, 30000)

      await this.loadData()
    } finally {
      markPrimaryApiReady()
    }

    this.$i18n.locale = this.currentLanguageCode
  }
}).$mount('#app')
