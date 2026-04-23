<template>
  <div>
    <navigation-header :title="$i18n.t('settings.settings')" />
    <div class="box">

      <form-section :title="$i18n.t('settings.settings')" no-divider>
        <form-box
          :title="$i18n.t('settings.language')"
          description="Language, Taal, Idioma, Sprache, Langue, Língua, linguaggio, язык, 語言, 언어, لغة"
          :is-narrow="false"
        >
          <b-select v-model="language" expanded icon="globe">
            <option v-for="(langName, lang) in langs" :key="`Lang${lang}`" :value="lang">
              {{ langName }}
            </option>
          </b-select>
        </form-box>

        <form-box
          :title="$i18n.t('settings.currency')"
          :description="$i18n.t('settings.currencyDetails')"
          :is-narrow="false"
        >
          <b-select v-model="currency" expanded icon="money-bill">
            <option v-for="(currencyName, currency) in currencies" :key="`Currency${currency}`" :value="currency">
              {{ currency }} - {{ currencyName }}
            </option>
          </b-select>
        </form-box>
      </form-section>

      <form-section :title="$i18n.t('settings.security')">
        <form-box
          :title="$i18n.t('settings.pin')"
          :description="$i18n.t('settings.pinDetails')"
          type="is-warning"
        >
          <b-button v-html="$i18n.t('settings.changePin')" type="is-light" @click="changePin"/>
        </form-box>
      </form-section>

      <form-section :title="$i18n.t('settings.connection')">
        <form-box
          :title="$i18n.t('settings.walletService')"
          :description="$i18n.t('settings.walletServiceDetails')"
          :is-narrow="false"
          type="is-info"
        >
          <router-link
            class="button is-primary is-cta"
            :to="{ name: 'settings.wallet-service' }"
            v-html="$i18n.t('settings.manageWalletService')"
          />
        </form-box>
      </form-section>

    </div>

    <version-block/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { localeNames } from '@/locale/locales'
import currencies from '@/utils/currencies'
import NavigationHeader from '@/components/layout/NavigationHeader'
import FormBox from '@/components/layout/FormBox'
import FormSection from '@/components/layout/FormSection'
import ChangePinModal from '@/views/Settings/ChangePinModal'
import VersionBlock from '@/components/VersionBlock'

export default {
  name: 'settings-view',

  components: { FormBox, VersionBlock, FormSection, NavigationHeader },

  data () {
    return {
      langs: localeNames,
      currencies: currencies
    }
  },

  computed: {
    language: {
      get () {
        return this.currentLanguageCode()
      },
      set (value) {
        this.updateLanguage(value)
        this.$i18n.locale = value
      }
    },
    currency: {
      get () {
        return this.currentCurrencyCode()
      },
      set (value) {
        this.updateCurrency(value)
        this.$root.loadData()
      }
    }
  },

  methods: {
    ...mapGetters(['currentCurrencyCode', 'currentLanguageCode']),
    ...mapActions(['updateCurrency', 'updateLanguage']),

    changePin () {
      this.$buefy.modal.open({
        component: ChangePinModal,
        parent: this,
        canCancel: ['escape', 'outside'],
        hasModalCard: true,
        trapFocus: true
      })
    }
  }
}
</script>
