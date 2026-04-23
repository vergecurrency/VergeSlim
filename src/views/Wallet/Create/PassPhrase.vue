<template>
  <div>
    <div class="block">
      <h3 class="is-size-3 is-family-display create-flow-title" v-html="$i18n.t('createWallet.passPhrase')"/>
      <p v-html="$i18n.t('createWallet.passPhraseDescription')"/>
    </div>

    <div v-show="!confirm" class="block">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <requirement-marker :label="$i18n.t('createWallet.setupPassphraseReq1')" :checked="isMinimumSize"/>
        </div>
        <div class="column is-narrow">
          <requirement-marker :label="$i18n.t('createWallet.setupPassphraseReq2')" :checked="containsCapsAndSmalls"/>
        </div>
        <div class="column is-narrow">
          <requirement-marker :label="$i18n.t('createWallet.setupPassphraseReq3')" :checked="containsSpecials"/>
        </div>
      </div>
    </div>

    <b-notification v-if="confirm && !passphraseInvalid" v-html="$i18n.t('createWallet.confirmPassphrase')"/>
    <b-notification
      type="is-danger"
      v-if="confirm && passphraseInvalid"
      v-html="$i18n.t('createWallet.passphraseInvalid')"
    />

    <b-field :label="confirm ? $i18n.t('createWallet.confirm') : $i18n.t('createWallet.passPhrase')">
      <b-input
        ref="passphraseInput"
        v-model="passphrase"
        size="is-large"
        type="password"
        :placeholder="$i18n.t('createWallet.setupPassphrasePassPlaceholder')"
        password-reveal
        @keyup.enter.native="confirm ? done() : proceed()"
      />
    </b-field>

    <b-field grouped>
      <b-field expanded>
        <b-button v-if="confirm" @click="back" v-html="$i18n.t('createWallet.back')"/>
      </b-field>

      <b-field align="right">
        <b-button
          v-if="!confirm"
          :label="$i18n.t('createWallet.proceed')"
          type="is-primary"
          @click="proceed"
          :disabled="!isValid"
        />

        <b-button
          v-if="confirm"
          :label="$i18n.t('createWallet.proceed')"
          type="is-primary"
          @click="done"
        />
      </b-field>
    </b-field>
  </div>
</template>

<script>
import RequirementMarker from '@/views/Wallet/Create/RequirementMarker'
export default {
  name: 'PassPhrase',
  components: { RequirementMarker },
  props: {
    value: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      confirm: false,
      passphrase: '',
      confirmPassphrase: '',
      passphraseInvalid: false
    }
  },

  computed: {
    isMinimumSize () {
      return this.passphrase.length >= 8
    },

    containsCapsAndSmalls () {
      return !!(this.passphrase.match(/[A-Z]/g) && this.passphrase.match(/[a-z]/g))
    },

    containsSpecials () {
      return !!this.passphrase.match(/[!@#$%^&*()_+-=\\[\]{};':"\\|,.<>/?]/g)
    },

    isValid () {
      return this.isMinimumSize && this.containsCapsAndSmalls && this.containsSpecials
    }
  },

  methods: {
    proceed () {
      this.passphraseInvalid = false
      this.confirmPassphrase = this.passphrase
      this.passphrase = ''
      this.confirm = true

      this.$refs.passphraseInput.$el.focus()
    },

    done () {
      if (this.confirmPassphrase !== this.passphrase) {
        this.passphraseInvalid = true

        return
      }

      this.$emit('input', {
        ...this.value,
        passphrase: this.passphrase
      })
      this.$emit('next')
    },

    back () {
      this.passphrase = ''
      this.confirm = false
    }
  }
}
</script>

<style scoped>
  .create-flow-title {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rv-text);
    text-shadow:
      0 0 10px rgba(124, 255, 242, 0.18),
      0 0 24px rgba(50, 239, 222, 0.24);
  }
</style>
