<template>
  <content-view
    :title="$i18n.t('createWallet.importWallet')"
    :back="{ name: 'wallets.create' }"
  >
    <template slot="section">

      <b-steps
        v-model="activeStep"
        size="is-small"
        :animated="false"
        :has-navigation="false"
      >

        <br/>

        <b-step-item :label="$i18n.t('createWallet.openFile')" :clickable="false">

          <div class="block">
            <p v-html="$i18n.t('createWallet.openFileDesc')"/>
          </div>

          <div class="box">
            <b-field class="file">
              <b-upload v-model="importFile" expanded>
                <a class="button is-primary is-fullwidth">
                  <b-icon icon="folder-open"/>
                  <p v-html="$i18n.t('createWallet.openWalletFile')"/>
                </a>
              </b-upload>
            </b-field>
            <b-field>
              <b-upload v-model="importFile" drag-drop expanded>
                <section class="section">
                  <div class="content has-text-centered">
                    <p>
                      <b-icon icon="file-contract" size="is-large"></b-icon>
                    </p>
                    <p v-html="$i18n.t('createWallet.dropWalletFile')"/>
                  </div>
                </section>
              </b-upload>
            </b-field>
          </div>

        </b-step-item>

        <b-step-item :label="$i18n.t('createWallet.confirm')" :clickable="false">

          <div class="block">
            <p v-html="$i18n.t('createWallet.confirmImportDesc')"/>
          </div>

          <div v-if="wallet" class="box">
            <b-notification v-if="!preferencesAreValid" v type="is-danger">
              <p v-if="nameExists" v-html="$i18n.t('createWallet.walletNameAlreadyExists')"/>
              <p v-else-if="!vwsApiValid" v-html="$i18n.t('settings.invalidVwsServer')"/>
            </b-notification>

            <table class="table is-fullwidth">
              <tbody>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.walletName')"/>
                <td>
                  <b-input
                    :placeholder="$i18n.t('createWallet.enterYourWalletName')"
                    v-model="wallet.name"
                    maxlength="15"
                  />
                </td>
              </tr>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.walletColor')"/>
                <td>
                  <b-select v-model="wallet.color" expanded>
                    <option value="blue" selected v-html="$i18n.t('main.colors.blue')"/>
                    <option value="red" v-html="$i18n.t('main.colors.red')"/>
                    <option value="green" v-html="$i18n.t('main.colors.green')"/>
                    <option value="purple" v-html="$i18n.t('main.colors.purple')"/>
                    <option value="orange" v-html="$i18n.t('main.colors.orange')"/>
                  </b-select>
                </td>
              </tr>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.serviceURL')"/>
                <td>
                  <b-input
                    ref="vwsApi"
                    type="url"
                    :use-html5-validation="true"
                    v-model="wallet.vwsApi"
                  />
                </td>
              </tr>
              <tr v-if="wallet.singleAddress">
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.usesSingleAddress')"/>
                <td>
                  <b-icon icon="check" type="is-success"/>
                </td>
              </tr>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.coin')"/>
                <td>{{ wallet.coin }}</td>
              </tr>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.network')"/>
                <td>{{ wallet.network }}</td>
              </tr>
              <tr>
                <td class="has-text-weight-bold" v-html="$i18n.t('createWallet.paperKey')"/>
                <td>{{ wallet.paperkey }}</td>
              </tr>
              </tbody>
            </table>

            <div class="columns is-vcentered">
              <div class="column">
                <b-button
                  :label="$i18n.t('createWallet.back')"
                  @click="activeStep = 0"
                />
              </div>
              <div class="column is-narrow">
                <b-button
                  :disabled="!preferencesAreValid"
                  icon-left="file-import"
                  type="is-primary"
                  :label="$i18n.t('createWallet.import')"
                  @click="importWallet"
                />
              </div>
            </div>
          </div>

        </b-step-item>

        <b-step-item :label="$i18n.t('Geïmporteerd')" :clickable="false">

          <create :wallet="createdWallet" skip-confirmation done @next="walletCreated"/>

        </b-step-item>
      </b-steps>

    </template>
  </content-view>
</template>

<script>
import ContentView from '@/components/layout/ContentView'
import ExportImportManager from '@/walletManager/ExportImportManager'
import { mapGetters } from 'vuex'
import Create from '@/views/Wallet/Create/Create'
import { isValidVwsApiUrl, resolveVwsApiUrl } from '@/utils/vwsApi'

export default {
  name: 'ImportWallet',

  components: { Create, ContentView },

  data () {
    return {
      activeStep: 0,
      importFile: null,
      wallet: null,
      createdWallet: null
    }
  },

  watch: {
    importFile (newValue) {
      if (newValue) {
        this.openFile()
      }
    }
  },

  computed: {
    ...mapGetters(['allWalletIdentifiers', 'currentVwsApi']),
    nameLongEnough () {
      return this.wallet.name.length < 1 || this.wallet.name.length > 4
    },
    nameNotTooLong () {
      return this.wallet.name.length <= 15
    },
    nameExists () {
      return this.allWalletIdentifiers.includes(this.wallet.name)
    },
    vwsApiValid () {
      return this.wallet && isValidVwsApiUrl(this.wallet.vwsApi)
    },
    preferencesAreValid () {
      return this.wallet.name !== '' && this.nameLongEnough && this.nameNotTooLong && !this.nameExists && this.vwsApiValid
    }
  },

  methods: {
    openFile () {
      const exportImportManager = new ExportImportManager()

      const passwordPromise = () => new Promise((resolve, reject) => {
        this.$buefy.dialog.prompt({
          message: 'File seems to be encrypted, what\'s the file encryption password?',
          inputAttrs: {
            type: 'password'
          },
          confirmText: 'Import',
          trapFocus: true,
          onConfirm: (value) => resolve(value),
          onCancel: () => reject(new Error('No password given, import was cancelled'))
        })
      })

      exportImportManager.readWallet(this.importFile, passwordPromise).then(wallet => {
        this.wallet = {
          ...wallet,
          vwsApi: resolveVwsApiUrl(wallet.vwsApi || this.currentVwsApi)
        }
        this.activeStep = 1
      }).catch(e => {
        this.$buefy.dialog.alert({
          message: e.message
        })

        this.importFile = null
        this.wallet = null
        this.createdWalletthis = null
      })
    },

    importWallet () {
      if (!this.preferencesAreValid) {
        return
      }

      this.wallet.vwsApi = resolveVwsApiUrl(this.wallet.vwsApi)
      this.$walletManager.addWallet(this.wallet).then(wallet => {
        this.$store.dispatch('addWalletIdentifier', wallet.identifier)

        this.createdWallet = wallet
        this.activeStep = 2
      }).catch(error => {
        this.$buefy.dialog.alert({
          message: error.toString(),
          onConfirm: () => {
            // decide what to do.
          }
        })
      })
    },

    walletCreated (event) {
      this.$router.push({ name: event.route, params: { walletIdentifier: this.wallet.identifier, wallet: this.createdWallet } })
    }
  }
}
</script>
