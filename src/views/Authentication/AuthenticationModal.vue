<template>
  <div class="modal-card is-modal-auth modal-panel" :class="{'is-auth-failed': wrongPin}">
    <div class="modal-content">
      <button
        v-if="showCloseButton"
        class="delete is-pulled-right"
        aria-label="close"
        @click="$emit('close')"
      />

      <div v-if="forgotPin">
        <h1 class="is-size-1 has-text-grey is-family-handwritten" v-html="$i18n.t('unlock.youForgotYourPin')"/>
        <p v-html="$i18n.t('unlock.youForgotYourPinDesc')"/>
        <br/>
        <div class="columns">
          <div class="column">
            <b-button @click="forgotPin = false" v-html="$i18n.t('settings.cancel')">Cancel</b-button>
          </div>
          <div class="column is-narrow">
            <b-button type="is-primary" @click="$emit('reset')" :label="$i18n.t('unlock.resetPin')"/>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="columns has-text-centered">
          <div class="column">
            <img src="@/assets/headers/id-card@2x.png" class="id-card"/>
            <h1 class="is-size-1 has-text-grey is-family-handwritten" v-html="$i18n.t('unlock.unlockYourWallet')"/>
          </div>
        </div>

        <div class="box" :class="{'has-background-danger-light': wrongPin}">
          <b-field
            :type="{ 'is-danger': wrongPin }"
          >
            <div class="columns is-centered">
              <div class="column is-two-thirds">
                <pin-input @submit="authenticationSubmit" @changed="wrongPin = false"/>
              </div>
            </div>
          </b-field>

          <b-field class="has-text-centered">
            <p class="control">
              <a class="button is-text" v-html="$i18n.t('unlock.forgotPin')" @click="forgotPin = true"/>
            </p>
          </b-field>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import PinInput from '@/components/PinInput'

export default {
  name: 'AuthenticationModal',
  components: { PinInput },
  data () {
    return {
      wrongPin: false,
      forgotPin: false
    }
  },

  computed: {
    showCloseButton () {
      return !(this.$route.meta.needsAuthentication || false)
    }
  },

  methods: {
    authenticationSubmit (pin) {
      this.$authManager.authenticate(pin).then(authenticated => {
        if (!authenticated) {
          this.shakeCard()
        } else {
          this.$emit('authenticated')
        }
      }).catch(error => {
        this.$authManager.showKeychainAccessError(error, 'Could Not Unlock Wallet')
      })
    },

    shakeCard () {
      this.wrongPin = true
    }
  }
}
</script>

<style>
  .modal-card.is-modal-auth {
    background: linear-gradient(180deg, rgba(14, 20, 48, 0.98), rgba(7, 11, 28, 0.96));
    backdrop-filter: brightness(130%) saturate(140%) blur(30px);
    padding: 30px;
  }

  .modal-card.is-modal-auth > .modal-content {
    overflow: visible;
    max-width: 600px;
  }

  .modal.is-full-screen > .animation-content > .modal-card.is-modal-auth {
    display: flex;
    justify-content: center;
    width: auto;
  }

  .id-card {
    width: 250px;
    filter: drop-shadow(0 0 28px rgba(83, 243, 255, 0.16));
    animation: rv-drift 8s ease-in-out infinite;
  }

  .modal-card.is-modal-auth.is-auth-failed {
    animation: shake 0.5s;
    animation-iteration-count: 1;
  }

  @keyframes shake {
    10%, 90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%, 80% {
      transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .modal-card.is-modal-auth .box {
    background: rgba(13, 19, 46, 0.86);
  }

  .modal-card.is-modal-auth .box.has-background-danger-light {
    background: linear-gradient(180deg, rgba(58, 23, 45, 0.88), rgba(38, 16, 31, 0.84)) !important;
  }
</style>
