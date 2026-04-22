<template>
  <div class="modal-card modal-panel">
    <div class="modal-card-head is-warning">
      <h3 class="modal-card-title" v-html="$i18n.t('createWallet.exportWallet')"/>
    </div>
    <div class="modal-card-body">
      <b-field>
        <p v-html="$i18n.t('export.description')"/>
      </b-field>

      <b-field>
        <ul class="warning-list">
          <li v-html="$i18n.t('export.condition1')"/>
          <li v-html="$i18n.t('export.condition2')"/>
          <li v-html="$i18n.t('export.condition3')"/>
        </ul>
      </b-field>

      <form-box
        :title="$i18n.t('export.fileEncryption')"
        :description="$i18n.t('export.fileEncryptionDesc')"
        :is-narrow="false"
        :is-enabled="false"
        toggleable
      >
        <b-input
          type="password"
          :placeholder="$i18n.t('export.passwordPlaceholder')"
          password-reveal
          v-model="encryptionPassword"
        />
      </form-box>

      <div class="box">
        <b-field>
          <b-switch type="is-warning" v-model="confirmed">
            <span v-html="$i18n.t('export.confirmation')"/>
          </b-switch>
        </b-field>
      </div>

      <div class="columns">
        <div class="column">
          <b-button @click="$parent.close()" :label="$i18n.t('settings.cancel')"/>
        </div>
        <div class="column is-narrow">
          <b-button type="is-warning" :disabled="!confirmed" @click="exportWallet" v-html="$i18n.t('export.exportFile')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormBox from '@/components/layout/FormBox'
import ExportImportManager from '@/walletManager/ExportImportManager'

export default {
  name: 'ExportModal',
  components: { FormBox },

  data () {
    return {
      confirmed: false,
      encryptionPassword: ''
    }
  },

  props: {
    wallet: {
      type: Object,
      required: true
    }
  },

  methods: {
    exportWallet () {
      if (!this.confirmed) {
        return
      }

      const exportImportManager = new ExportImportManager()

      this.$walletManager.getWalletPassphrase(this.wallet).then(async passphrase => {
        return exportImportManager.exportWallet(this.wallet, passphrase, this.encryptionPassword)
      }).then(exported => {
        if (!exported) {
          return
        }

        this.$parent.close()

        this.$buefy.toast.open({
          message: this.$i18n.t('export.successfulExport'),
          type: 'is-success',
          position: 'is-top'
        })
      }).catch(e => {
        this.$buefy.dialog.alert({
          message: `${this.$i18n.t('export.unknownError')}: ${e.message}`
        })
      })
    }
  }
}
</script>

<style scoped>
  .warning-list {
    list-style: disc;
    padding-inline-start: 30px;
    margin: 30px 0px;
    line-height: 30px;
    color: var(--rv-text-soft);
  }
</style>
