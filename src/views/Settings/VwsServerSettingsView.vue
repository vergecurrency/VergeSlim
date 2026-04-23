<template>
  <div>
    <navigation-header
      :back="{ name: 'settings' }"
      :title="$i18n.t('settings.walletService')"
    />

    <div class="box">
      <form-section :title="$i18n.t('settings.walletService')" no-divider>
        <form-box
          :title="$i18n.t('settings.vwsServer')"
          :description="$i18n.t('settings.vwsServerDetails')"
          :is-narrow="false"
          type="is-info"
        >
          <b-field
            :type="serverValid ? '' : 'is-danger'"
            :message="serverValid ? $i18n.t('settings.vwsServerHint') : $i18n.t('settings.invalidVwsServer')"
          >
            <b-input
              v-model="server"
              type="url"
              expanded
              @blur="normalizeServer"
            />
          </b-field>

          <div class="buttons">
            <b-button
              class="is-primary is-cta"
              :disabled="!serverValid"
              @click="saveDefaultServer"
              v-html="$i18n.t('settings.saveDefaultVwsServer')"
            />
            <b-button
              class="is-light"
              @click="resetToVergeDefault"
              v-html="$i18n.t('settings.useVergeDefault')"
            />
          </div>
        </form-box>

        <form-box
          :title="$i18n.t('settings.applyToExistingWallets')"
          :description="$i18n.t('settings.applyToExistingWalletsDesc')"
          :is-narrow="false"
        >
          <b-button
            class="is-primary is-cta"
            :disabled="!serverValid || walletCount === 0"
            :loading="applyingToWallets"
            @click="applyToExistingWallets"
            v-html="$i18n.t('settings.applyToAllWallets')"
          />
        </form-box>
      </form-section>
    </div>

    <version-block/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import NavigationHeader from '@/components/layout/NavigationHeader'
import FormSection from '@/components/layout/FormSection'
import FormBox from '@/components/layout/FormBox'
import VersionBlock from '@/components/VersionBlock'
import { getDefaultVwsApiUrl, isValidVwsApiUrl, resolveVwsApiUrl } from '@/utils/vwsApi'

export default {
  name: 'vws-server-settings-view',

  components: {
    FormBox,
    FormSection,
    NavigationHeader,
    VersionBlock
  },

  data () {
    return {
      server: '',
      applyingToWallets: false
    }
  },

  computed: {
    ...mapGetters(['currentVwsApi']),
    serverValid () {
      return isValidVwsApiUrl(this.server)
    },
    walletCount () {
      return this.$walletManager.getWallets().length
    }
  },

  created () {
    this.server = resolveVwsApiUrl(this.currentVwsApi)
  },

  methods: {
    ...mapActions(['updateVwsApi']),

    normalizeServer () {
      if (!this.server) {
        return
      }

      this.server = resolveVwsApiUrl(this.server)
    },

    saveDefaultServer (showToast = true) {
      if (!this.serverValid) {
        this.$buefy.toast.open({
          message: this.$i18n.t('settings.invalidVwsServer'),
          type: 'is-danger'
        })

        return false
      }

      this.normalizeServer()
      this.updateVwsApi(this.server)

      if (showToast) {
        this.$buefy.toast.open({
          message: this.$i18n.t('settings.vwsServerSaved'),
          type: 'is-success'
        })
      }

      return true
    },

    resetToVergeDefault () {
      this.server = getDefaultVwsApiUrl()
      this.saveDefaultServer()
    },

    async applyToExistingWallets () {
      if (this.walletCount === 0) {
        this.$buefy.toast.open({
          message: this.$i18n.t('settings.noWalletsToUpdate'),
          type: 'is-warning'
        })

        return
      }

      if (!this.saveDefaultServer(false)) {
        return
      }

      this.applyingToWallets = true

      try {
        for (const wallet of this.$walletManager.getWallets()) {
          wallet.setApiEndpoint(this.server)
          await this.$walletManager.updateWallet(wallet.identifier, wallet)
        }

        this.$buefy.toast.open({
          message: this.$i18n.t('settings.vwsServerApplied'),
          type: 'is-success'
        })
      } catch (error) {
        this.$buefy.dialog.alert({
          message: error.toString()
        })
      } finally {
        this.applyingToWallets = false
      }
    }
  }
}
</script>
