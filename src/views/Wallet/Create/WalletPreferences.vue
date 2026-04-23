<template>
  <div>
    <form @submit.prevent="proceed">
      <div class="block">
        <h3 class="is-size-3 is-family-display wallet-preferences-title" v-html="$i18n.t('createWallet.aWalletName')"/>
        <p v-html="$i18n.t('createWallet.aWalletNameDescription')"/>
      </div>

      <div class="columns">
        <div class="column card-column">

          <b-field label="Card example">
            <wallet-card :wallet="wallet"/>
          </b-field>

        </div>
        <div class="column">

          <b-field :label="$i18n.t('createWallet.walletName')">
            <b-input
              :placeholder="$i18n.t('createWallet.enterYourWalletName')"
              v-model="name"
              maxlength="15"
            />
          </b-field>

          <b-field :label="$i18n.t('createWallet.walletColor')">
            <b-select v-model="color" expanded>
              <option value="blue" selected v-html="$i18n.t('main.colors.blue')"/>
              <option value="red" v-html="$i18n.t('main.colors.red')"/>
              <option value="green" v-html="$i18n.t('main.colors.green')"/>
              <option value="purple" v-html="$i18n.t('main.colors.purple')"/>
              <option value="orange" v-html="$i18n.t('main.colors.orange')"/>
            </b-select>
          </b-field>

          <b-field>
            <b-switch v-model="showAdvanced"><span v-html="$i18n.t('createWallet.advanced')"/></b-switch>
          </b-field>

          <div class="box wallet-preferences__advanced__box" v-show="showAdvanced">
            <b-field v-if="!restore" :label="$i18n.t('createWallet.singleAddress')">
              <b-switch
                v-model="singleAddress"
              />
            </b-field>

            <b-field :label="$i18n.t('createWallet.serviceURL')" :type="vwsApiValid ? '' : 'is-danger'">
              <b-input
                ref="vwsApi"
                type="url"
                :use-html5-validation="true"
                v-model="vwsApi"
              />
            </b-field>
          </div>

        </div>
      </div>

      <b-field align="right">
        <b-button
          native-type="submit"
          icon-left="edit"
          :label="$i18n.t('createWallet.writeDownPaperKey')"
          type="is-primary"
          :disabled="!preferencesAreValid"
        />
      </b-field>
    </form>
  </div>
</template>

<script>
import WalletCard from '@/components/WalletCard'
import { mapGetters } from 'vuex'
import { isValidVwsApiUrl, resolveVwsApiUrl } from '@/utils/vwsApi'

export default {
  name: 'WalletPreferences',
  components: { WalletCard },
  data () {
    return {
      showAdvanced: false,
      name: '',
      color: 'blue',
      singleAddress: false,
      vwsApi: ''
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    restore: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['allWalletIdentifiers']),
    wallet () {
      return {
        ...this.value,
        name: this.name,
        color: this.color,
        singleAddress: this.singleAddress,
        vwsApi: this.vwsApi
      }
    },
    nameLongEnough () {
      return this.wallet.name.length < 1 || this.wallet.name.length > 4
    },
    nameNotTooLong () {
      return this.wallet.name.length <= 15
    },
    nameExists () {
      return this.$walletManager.getWallets().map(wallet => wallet.name).includes(this.wallet.name)
    },
    vwsApiValid () {
      return isValidVwsApiUrl(this.vwsApi)
    },
    preferencesAreValid () {
      return this.wallet.name !== '' && this.nameLongEnough && this.nameNotTooLong && !this.nameExists && this.vwsApiValid
    }
  },
  created () {
    this.name = this.value.name
    this.color = this.value.color
    this.singleAddress = this.value.singleAddress
    this.vwsApi = resolveVwsApiUrl(this.value.vwsApi)
  },
  methods: {
    proceed () {
      if (!this.preferencesAreValid) {
        return
      }

      this.vwsApi = resolveVwsApiUrl(this.vwsApi)
      this.$emit('input', this.wallet)
      this.$emit('next')
    }
  }
}
</script>

<style scoped>
.wallet-preferences-title {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rv-text);
  text-shadow:
    0 0 10px rgba(124, 255, 242, 0.18),
    0 0 24px rgba(50, 239, 222, 0.24);
}

.card-column {
  max-width: 250px;
}
.wallet-preferences__advanced__box {
  margin: 0 -20px;
}
</style>
