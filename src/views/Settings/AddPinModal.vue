<template>
  <div class="modal-card box">
    <div class="columns">
      <div class="column">
        <p class="is-size-3 is-family-handwritten" v-html="$i18n.t('settings.addPin')"/>
        <span v-html="$i18n.t('settings.addPinDesc')"/>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="box-with-pins">
          <form-box
            :title="$i18n.t('settings.newPin')"
            :description="stage === 0 ? $i18n.t('settings.newPinDesc') : ''"
            :is-narrow="false"
          >
            <pin-input
              @submit="newPinSubmitted"
              :class="{'is-hidden': stage !== 0}"
            />
            <b-icon
              v-if="stage > 0"
              icon="check"
              type="is-success"
              class="is-pulled-right"
            />
          </form-box>

          <form-box
            :disabled="stage < 1"
            :title="$i18n.t('settings.newPinConfirmation')"
            :description="stage === 1 ? $i18n.t('settings.newPinConfirmationDesc') : ''"
            :is-narrow="false"
            :type="newPinNotConfirmedType"
          >
            <pin-input
              @submit="newPinSubmittedConfirmed"
              @changed="newPinNotConfirmed = false"
              :class="{'is-hidden': stage !== 1}"
            />
            <b-icon
              v-if="stage > 1"
              icon="check"
              type="is-success"
              class="is-pulled-right"
            />
          </form-box>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column"/>
      <div v-if="pin != ''" class="column is-narrow">
        <b-button type="is-primary" @click="change" v-html="$i18n.t('settings.addPin')"/>
      </div>
    </div>
  </div>
</template>

<script>
import PinInput from '@/components/PinInput'
import FormBox from '@/components/layout/FormBox'

export default {
  name: 'AddPinModal',
  components: { FormBox, PinInput },
  data () {
    return {
      stage: 0,
      newPinNotConfirmed: false,
      pin: ''
    }
  },

  computed: {
    newPinNotConfirmedType () {
      return this.newPinNotConfirmed ? 'is-danger' : ''
    }
  },

  methods: {
    change () {
      this.$authManager.changePin(this.pin).then(changed => {
        if (!changed) {
          this.$buefy.toast.open({
            message: this.$i18n.t('settings.couldntSetPin'),
            type: 'is-danger'
          })

          return
        }

        this.$emit('close', true)

        this.$buefy.toast.open({
          message: this.$i18n.t('settings.pinAdded'),
          type: 'is-success'
        })
      }).catch(error => {
        this.$authManager.showKeychainAccessError(error, 'Could Not Save PIN')
      })
    },

    newPinSubmitted (newPin) {
      this.pin = newPin
      this.stage = 1
    },

    newPinSubmittedConfirmed (confirmedPin) {
      if (this.pin === confirmedPin) {
        this.stage = 2

        return
      }

      this.newPinNotConfirmed = true
    }
  }
}
</script>
