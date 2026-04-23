<template>
  <form @submit.prevent="confirm">

    <div class="block">
      <h3 class="is-size-3 is-family-display send-form-title" v-html="$i18n.t('send.send')"/>
      <p v-html="$i18n.t('send.formDescription')"/>
    </div>

    <div class="columns">
      <div class="column">

        <div class="box">
          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label has-text-left has-text-grey" v-html="$i18n.t('send.recipient')"/>
            </div>
            <div class="field-body">
              <div class="field is-expanded">
                <div class="field has-addons">
<!--                  <p class="control">-->
<!--                    <a class="button">-->
<!--                      <b-icon icon="address-book" size="is-small"/>-->
<!--                    </a>-->
<!--                  </p>-->
                  <p class="control is-expanded">
                    <input
                      class="input"
                      type="text"
                      :placeholder="$i18n.t('send.recipientPlaceholder')"
                      v-model="toAddress"
                      @input="handleRecipientInput"
                      @blur="resolveRecipientOnBlur"
                    >
                  </p>
                  <p v-if="shouldOfferResolution" class="control">
                    <b-button
                      :label="$i18n.t('send.resolveRecipient')"
                      :loading="resolvingRecipient"
                      @click.prevent="resolveRecipient"
                    />
                  </p>
                </div>
                <div v-if="showHelp" class="help notification is-small" v-html="$i18n.t('send.recipientDetails')"/>
                <div
                  v-if="resolvedDomain"
                  class="help has-text-success"
                  v-html="$i18n.t('send.recipientResolved', { domain: resolvedDomain })"
                />
                <div
                  v-if="resolutionError"
                  class="help has-text-danger"
                  v-html="resolutionError"
                />
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label">
              <label class="label has-text-left has-text-grey" v-html="$i18n.t('send.amount')"/>
            </div>
            <div class="field-body">
              <div class="field is-expanded ">
                <div class="field has-addons">
                  <p class="control">
                    <a class="button is-static">
                      XVG
                    </a>
<!--                    <span class="select">-->
<!--                      <select>-->
<!--                        <option>XVG</option>-->
<!--                        <option>$</option>-->
<!--                        <option>£</option>-->
<!--                        <option>€</option>-->
<!--                      </select>-->
<!--                    </span>-->
                  </p>
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Amount you want to send" v-model="amount">
                  </p>
                  <p class="control">
                    <b-button :label="$i18n.t('send.sendMax')" @click="sendMax" :loading="loadingMax"/>
                  </p>
                </div>
                <div v-if="showHelp" class="help notification" v-html="$i18n.t('send.amountDetails')"/>
              </div>
            </div>
          </div>

          <div v-if="showMemo" class="field is-horizontal">
            <div class="field-label">
              <label class="label has-text-left has-text-grey" v-html="$i18n.t('send.internalMemo')"/>
            </div>
            <div class="field-body">
              <div class="field is-expanded">
                <input class="input" type="text" placeholder="Gift to Swen" v-model="message">
                <div v-if="showHelp" class="help notification" v-html="$i18n.t('send.internalMemoDetails')"/>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="notification">
          <small class="has-text-grey" v-html="$i18n.t('send.transactionWarning')"/>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="buttons is-centered">
          <a class="button is-light" v-html="$i18n.t('send.reset')" @click="reset"/>
          <button
            type="submit"
            class="button is-primary"
            :disabled="resolvingRecipient"
            v-html="$i18n.t('send.confirm')"
          />
        </div>
      </div>
    </div>

  </form>
</template>

<script>
import { ipcRenderer } from 'electron'
import constants, { eventConstants } from '@/utils/constants'
import { looksLikeWeb3Domain, normalizeWeb3Domain } from '@/utils/unstoppableDomains'

export default {
  name: 'SendForm',
  props: {
    value: {
      type: Object,
      required: true
    },
    wallet: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showHelp: false,
      showMemo: false,
      loadingMax: false,
      resolvingRecipient: false,
      resolvedDomain: '',
      resolutionError: '',
      resolvedAddress: '',
      toAddress: '',
      amount: '',
      message: ''
    }
  },
  created () {
    this.toAddress = this.value.recipientLabel || this.value.toAddress
    this.amount = this.value.amount
    this.message = this.value.message
    this.resolvedDomain = this.value.resolvedDomain || ''
    this.resolvedAddress = this.value.resolvedAddress || ''
  },
  computed: {
    shouldOfferResolution () {
      return looksLikeWeb3Domain(this.toAddress)
    }
  },
  methods: {
    sendMax () {
      this.loadingMax = true

      this.wallet.getSendMaxInfo().then(info => {
        this.amount = info.amount / constants.satoshiDivider
        this.loadingMax = false
      })
    },

    handleRecipientInput () {
      this.resolvedDomain = ''
      this.resolvedAddress = ''
      this.resolutionError = ''
    },

    async resolveRecipientOnBlur () {
      if (!this.shouldOfferResolution || this.resolvingRecipient) {
        return
      }

      await this.resolveRecipient()
    },

    async resolveRecipient () {
      const domain = this.toAddress.trim()
      const normalizedDomain = normalizeWeb3Domain(domain)

      if (!looksLikeWeb3Domain(domain) || this.resolvingRecipient) {
        return this.toAddress
      }

      if (this.resolvedDomain === normalizedDomain && this.resolvedAddress) {
        return this.resolvedAddress
      }

      this.resolutionError = ''
      this.resolvingRecipient = true

      try {
        const response = await ipcRenderer.invoke(eventConstants.resolveUnstoppableDomain, { domain })

        if (!response || response.success !== true || !response.address) {
          const errorKey = response && response.error ? response.error : 'UNSTOPPABLE_LOOKUP_FAILED'
          this.resolutionError = this.$i18n.t(`send.errors.${errorKey}`)
          return null
        }

        this.resolvedDomain = response.domain
        this.resolvedAddress = response.address
        this.resolutionError = ''

        return response.address
      } finally {
        this.resolvingRecipient = false
      }
    },

    async confirm () {
      const resolvedRecipient = await this.resolveRecipient()

      if (resolvedRecipient === null) {
        return
      }

      this.$emit('input', {
        ...this.value,
        toAddress: resolvedRecipient || this.toAddress,
        recipientLabel: this.resolvedDomain || this.toAddress,
        resolvedDomain: this.resolvedDomain,
        resolvedAddress: this.resolvedAddress,
        amount: this.amount,
        message: this.message
      })
    },

    reset () {
      this.resolvedDomain = ''
      this.resolvedAddress = ''
      this.resolutionError = ''
      this.toAddress = ''
      this.amount = 0
      this.message = ''
    }
  }
}
</script>

<style scoped>
  .send-form-title {
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--rv-text);
    text-shadow: 0 0 18px rgba(83, 243, 255, 0.14);
  }
</style>
