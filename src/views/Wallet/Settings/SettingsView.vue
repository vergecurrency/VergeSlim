<template>
  <div>
    <navigation-header
      :back="{ name: 'wallets', params: { walletIdentifier: wallet.identifier, wallet }}"
      :title="$i18n.t('walletSettings.walletSettings')"
    />

    <div class="box settings-hide-overlay">

      <div class="wallet-header">
        <wallet-card
          :wallet="wallet"
          :clickable="false"
          cornerless
          shadowless
        />
      </div>

      <br>

      <form-section
        :title="$i18n.t('walletSettings.preferences')"
        no-divider
      >
        <form-box
          :title="$i18n.t('walletSettings.name')"
          :description="$i18n.t('walletSettings.nameDesc')"
          :is-narrow="false"
          grouped
        >
          <b-field
            :type="nameType"
          >
            <b-input
              v-model="name"
              maxlength="15"
              @blur="save"
            />
          </b-field>
        </form-box>

        <form-box
          :title="$i18n.t('walletSettings.color')"
          :description="$i18n.t('walletSettings.colorDesc')"
          :is-narrow="false"
          grouped
        >
          <b-select v-model="color" expanded @input="save">
            <option value="blue" selected v-html="$i18n.t('main.colors.blue')"/>
            <option value="red" v-html="$i18n.t('main.colors.red')"/>
            <option value="green" v-html="$i18n.t('main.colors.green')"/>
            <option value="purple" v-html="$i18n.t('main.colors.purple')"/>
            <option value="orange" v-html="$i18n.t('main.colors.orange')"/>
          </b-select>
        </form-box>
      </form-section>

      <form-section
        :title="$i18n.t('walletSettings.service')"
      >
        <form-box
          :title="$i18n.t('walletSettings.serviceUrl')"
          :description="$i18n.t('walletSettings.serviceUrlDesc')"
          :is-narrow="false"
          type="is-info"
        >
          <b-field :type="apiEndpointValid ? '' : 'is-danger'">
            <b-input v-model="apiEndpoint" @blur="save"/>
          </b-field>
        </form-box>
      </form-section>

      <form-section
        :title="$i18n.t('walletSettings.credentials')"
      >
        <form-box
          :title="$i18n.t('walletSettings.paperKey')"
          :description="$i18n.t('createWallet.aPaperKeyDescription')"
          :is-narrow="false"
        >
          <credential-box :credential="wallet.vwc.credentials.mnemonic"/>
        </form-box>

        <form-box
          :title="$i18n.t('walletSettings.passphrase')"
          :description="$i18n.t('walletSettings.passphraseDesc')"
        >
          <b-button v-html="$i18n.t('walletSettings.showPassphrase')" type="is-primary" @click="showPassphrase"/>
        </form-box>

        <form-box
          :title="$i18n.t('createWallet.exportYourWallet')"
          :description="$i18n.t('createWallet.exportYourWalletDesc')"
          type="is-warning"
        >
          <b-button v-html="$i18n.t('createWallet.exportWallet')" @click="exportWallet"/>
        </form-box>
      </form-section>

      <form-section
        :title="$i18n.t('walletSettings.dangerZone')"
      >
        <form-box
          :title="$i18n.t('walletSettings.delete')"
          :description="$i18n.t('walletSettings.deleteWalletDesc')"
          type="is-danger"
        >
          <b-button
            v-html="$i18n.t('walletSettings.deleteWallet')"
            @click="removeWallet"
          />
        </form-box>
      </form-section>

    </div>

  </div>
</template>

<style>
.settings-hide-overlay {
  overflow: hidden;
}

.wallet-header {
  margin: -20px -20px 0;
}
</style>

<script>
import NavigationHeader from '@/components/layout/NavigationHeader'
import FormSection from '@/components/layout/FormSection'
import { mapActions, mapGetters } from 'vuex'
import CredentialBox from '@/components/CredentialBox'
import FormBox from '@/components/layout/FormBox'
import WalletCard from '@/components/WalletCard'
import ExportModal from '@/views/Wallet/Settings/ExportModal'
import { isValidVwsApiUrl, resolveVwsApiUrl } from '@/utils/vwsApi'

export default {
  name: 'wallet-settings-view',
  components: { WalletCard, FormBox, CredentialBox, FormSection, NavigationHeader },

  data () {
    return {
      previousWalletName: this.wallet.name,
      name: '',
      color: '',
      apiEndpoint: ''
    }
  },

  props: {
    wallet: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters(['allWalletIdentifiers']),
    nameLongEnough () {
      return this.name.length < 1 || this.name.length > 4
    },
    nameNotTooLong () {
      return this.name.length <= 15
    },
    nameExists () {
      if (this.previousWalletName === this.name) {
        return false
      }

      return this.$walletManager.getWallets().map(wallet => wallet.name).includes(this.name)
    },
    apiEndpointValid () {
      return isValidVwsApiUrl(this.apiEndpoint)
    },
    namePreferencesAreValid () {
      return this.wallet.name !== '' && this.nameLongEnough && this.nameNotTooLong && !this.nameExists
    },
    preferencesAreValid () {
      return this.namePreferencesAreValid && this.apiEndpointValid
    },
    nameType () {
      return this.namePreferencesAreValid ? '' : 'is-danger'
    }
  },

  created () {
    this.name = this.wallet.name
    this.color = this.wallet.color
    this.apiEndpoint = resolveVwsApiUrl(this.wallet.vwc.request.baseUrl)
  },

  methods: {
    save () {
      if (!this.namePreferencesAreValid) {
        this.name = this.previousWalletName

        return
      }

      if (!this.apiEndpointValid) {
        return
      }

      this.apiEndpoint = resolveVwsApiUrl(this.apiEndpoint)
      this.wallet.setName(this.name)
      this.wallet.setColor(this.color)
      this.wallet.setApiEndpoint(this.apiEndpoint)

      this.$walletManager.updateWallet(this.wallet.identifier, this.wallet).then(wallet => {
        this.previousWalletName = this.wallet.name
      }).catch(e => {
        this.$buefy.dialog.alert(e.message)
      })
    },

    showPassphrase () {
      this.$walletManager.getWalletPassphrase(this.wallet).then(passphrase => {
        this.$buefy.dialog.alert({
          message: `<div class="box has-background-warning"><h4 class="has-text-weight-semibold">${this.$i18n.t('walletSettings.yourWalletsPassphrase')}:</h4><p>${passphrase}</p></div>`
        })
      }).catch(e => {
        this.$buefy.dialog.alert(e.message)
      })
    },

    exportWallet () {
      this.$buefy.modal.open({
        component: ExportModal,
        parent: this,
        hasModalCard: true,
        canCancel: ['escape', 'outside'],
        props: {
          wallet: this.wallet
        }
      })
    },

    removeWallet () {
      this.$buefy.dialog.confirm({
        message: this.$i18n.t('walletSettings.deleteWalletConfirm', { name: this.wallet.name }),
        onConfirm: this.handleRemovingWallet
      })
    },

    handleRemovingWallet () {
      this.$walletManager.removeWallet(this.wallet).then(succeeded => {
        if (succeeded) {
          this.removeWalletIdentifier(this.wallet.identifier)

          this.$router.push({ name: 'wallets.create' })

          this.$buefy.toast.open({
            message: this.$i18n.t('walletSettings.walletDeleted', { name: this.wallet.name }),
            type: 'is-success'
          })
        }
      })
    },

    ...mapActions(['removeWalletIdentifier'])
  }
}
</script>
