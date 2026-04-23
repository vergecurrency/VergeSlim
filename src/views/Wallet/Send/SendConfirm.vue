<template>
  <div v-if="value.txp">

    <div class="block">
      <h3 class="is-size-3 is-family-display section-display-title" v-html="$i18n.t('send.confirm')"/>
      <p v-html="$i18n.t('send.confirmDescription')"/>
    </div>

    <div class="columns is-size-7">
      <div class="column has-text-left" v-html="$i18n.t('send.send')"/>
      <div class="column has-text-right has-text-weight-bold">
        <money :amount="value.txp.amount" crypto/>
      </div>
    </div>
    <div class="columns is-size-7">
      <div class="column has-text-left" v-html="$i18n.t('send.transactionFee')"/>
      <div class="column has-text-right has-text-weight-bold">
        <money :amount="value.txp.fee || 0" crypto/>
      </div>
    </div>

    <div class="navbar-divider"/>

    <div class="columns is-size-5">
      <div class="column has-text-left" v-html="$i18n.t('send.total')"/>
      <div class="column has-text-right has-text-weight-bold has-text-primary">
        <money :amount="totalAmount" crypto/>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-right has-text-weight-bold has-text-primary">
        <money :amount="totalAmount" convert/>
      </div>
    </div>

    <div class="navbar-divider"/>

    <div class="columns">
      <div class="column has-text-left" v-html="$i18n.t('send.recipient')" />
      <div class="column has-text-right has-text-weight-bold">
        <span class="tag is-large is-selectable" :class="{ 'is-family-monospace': !value.resolvedDomain }" v-html="recipientLabel"/>
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
          <button class="button is-light is-cta" @click="$emit('cancel')" v-html="$i18n.t('send.cancel')"/>
          <button class="button is-primary is-cta" @click="$emit('confirmed')" v-html="$i18n.t('send.confirmTransaction')"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Money from '@/components/labels/Money'

export default {
  name: 'SendConfirm',
  components: { Money },
  props: {
    value: {
      required: true,
      type: Object
    }
  },

  computed: {
    recipientLabel () {
      return this.value.recipientLabel || this.value.toAddress
    },
    totalAmount () {
      return this.value.txp.amount + this.value.txp.fee || 0
    }
  }
}
</script>

<style scoped>
  .section-display-title {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rv-text);
    text-shadow:
      0 0 10px rgba(124, 255, 242, 0.18),
      0 0 24px rgba(50, 239, 222, 0.24);
  }
</style>
