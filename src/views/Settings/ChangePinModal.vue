<template>
  <div class="modal-card box modal-panel">
    <div class="columns">
      <div class="column">
        <p class="is-size-3 is-family-handwritten" v-html="$i18n.t('settings.changeYourPin')"/>
        <span v-html="$i18n.t('settings.changeYourPinDesc')"/>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="box-with-pins">
          <form-box
            :title="$i18n.t('settings.currentPin')"
            :description="stage === 0 ? $i18n.t('settings.currentPinDesc') : ''"
            :type="currentPinType"
            :is-narrow="false"
          >
            <pin-input
              @submit="validateCurrentPin"
              @changed="wrongCurrentPin = false"
              :class="{'is-hidden': stage !== 0}"
            />
            <b-icon
              v-if="stage !== 0"
              icon="check"
              type="is-success"
              class="is-pulled-right"
            />
          </form-box>

          <form-box
            :disabled="stage < 1"
            :title="$i18n.t('settings.newPin')"
            :description="stage === 1 ? $i18n.t('settings.newPinDesc') : ''"
            :is-narrow="false"
          >
            <pin-input
              @submit="newPinSubmitted"
              :class="{'is-hidden': stage !== 1}"
            />
            <b-icon
              v-if="stage > 1"
              icon="check"
              type="is-success"
              class="is-pulled-right"
            />
          </form-box>

          <form-box
            :disabled="stage < 2"
            :title="$i18n.t('settings.newPinConfirmation')"
            :description="stage === 2 ? $i18n.t('settings.newPinConfirmationDesc') : ''"
            :is-narrow="false"
            :type="newPinNotConfirmedType"
          >
            <pin-input
              @submit="newPinSubmittedConfirmed"
              @changed="newPinNotConfirmed = false"
              :class="{'is-hidden': stage !== 2}"
            />
            <b-icon
              v-if="stage > 2"
              icon="check"
              type="is-success"
              class="is-pulled-right"
            />
          </form-box>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <b-button @click="$emit('close')" v-html="$i18n.t('settings.cancel')"/>
      </div>
      <div v-if="pin != ''" class="column is-narrow">
        <b-button type="is-primary" @click="change" v-html="$i18n.t('settings.changePin')"/>
      </div>
    </div>
  </div>
</template>

<script>
import PinInput from '@/components/PinInput'
import FormBox from '@/components/layout/FormBox'

export default {
  name: 'ChangePinModal',
  components: { FormBox, PinInput },
  data () {
    return {
      stage: 0,
      wrongCurrentPin: false,
      newPinNotConfirmed: false,
      pin: ''
    }
  },

  computed: {
    currentPinType () {
      return this.wrongCurrentPin ? 'is-danger' : ''
    },

    newPinNotConfirmedType () {
      return this.newPinNotConfirmed ? 'is-danger' : ''
    }
  },

  methods: {
    change () {
      this.$authManager.changePin(this.pin).then(changed => {
        if (!changed) {
          this.$buefy.toast.open({
            message: this.$i18n.t('settings.couldntChangePin'),
            type: 'is-danger'
          })

          return
        }

        this.$emit('close')

        this.$buefy.toast.open({
          message: this.$i18n.t('settings.pinChanged'),
          type: 'is-success'
        })
      }).catch(error => {
        this.$authManager.showKeychainAccessError(error, 'Could Not Change PIN')
      })
    },

    validateCurrentPin (currentPin) {
      this.$authManager.validateAuthentication(currentPin).then(authenticated => {
        if (!authenticated) {
          this.wrongCurrentPin = true
        } else {
          this.stage = 1
        }
      }).catch(error => {
        this.$authManager.showKeychainAccessError(error, 'Could Not Read PIN')
      })
    },

    newPinSubmitted (newPin) {
      this.pin = newPin
      this.stage = 2
    },

    newPinSubmittedConfirmed (confirmedPin) {
      if (this.pin === confirmedPin) {
        this.stage = 3

        return
      }

      this.newPinNotConfirmed = true
    }
  }
}
</script>
