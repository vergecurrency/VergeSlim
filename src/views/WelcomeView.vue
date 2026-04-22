<template>
  <div class="welcome-view">
    <div v-if="isSunglassesOverlayVisible" class="welcome-secret-overlay" aria-hidden="true">
      <img
        :key="sunglassesOverlayKey"
        :src="sunglassesGif"
        alt=""
        class="welcome-secret-overlay-image"
      >
    </div>

    <div class="columns">
      <div class="column welcome-header">
        <div class="header-logo">
          <img src="@/assets/headers/logo@2x.png"/>
        </div>
        <div class="welcome-copy">
          <h1 class="welcome-title is-family-display">
            <template v-if="titleSecretSegments">
              <span v-text="titleSecretSegments.beforeO"/>
              <button
                type="button"
                class="welcome-title-secret-trigger"
                aria-label="Secret trigger"
                @click="handleSecretLetterClick('o')"
                v-text="titleSecretSegments.triggerO"
              />
              <span v-text="titleSecretSegments.beforeG"/>
              <button
                type="button"
                class="welcome-title-secret-trigger"
                aria-label="Secret trigger"
                @click="handleSecretLetterClick('g')"
                v-text="titleSecretSegments.triggerG"
              />
              <span v-text="titleSecretSegments.afterG"/>
            </template>
            <template v-else>
              <span v-text="$i18n.t('welcome.welcomeToMyVergies')"/>
            </template>
          </h1>
        </div>
      </div>
    </div>

    <div class="box">

      <form-box
        :title="$i18n.t('welcome.addAWallet')"
        :description="$i18n.t('welcome.addAWalletDesc')"
      >
        <router-link class="button is-success is-cta welcome-action-button" :to="{ name: 'wallets.create' }" v-html="$i18n.t('welcome.addWallet')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.changeThings')"
        :description="$i18n.t('welcome.changeThingsDesc')"
      >
        <router-link class="button is-primary is-cta welcome-action-button" :to="{ name: 'settings' }" v-html="$i18n.t('welcome.tweakSettings')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.helpImprove')"
        :description="$i18n.t('welcome.helpImproveDesc')"
        type="is-info"
      >
        <router-link class="button is-info is-cta welcome-action-button" :to="{ name: 'trade' }" v-html="$i18n.t('welcome.goToGithub')"/>
      </form-box>

    </div>

    <version-block/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import FormBox from '@/components/layout/FormBox'
import VersionBlock from '@/components/VersionBlock'
import { eventConstants } from '@/utils/constants'
import sunglassesGif from '@/assets/sunglasses.gif'

const SECRET_SEQUENCE_TIMEOUT_MS = 1500
const SUNGLASSES_GIF_LOOP_MS = 840
const SUNGLASSES_GIF_TOTAL_LOOPS = 4

export default {
  name: 'WelcomeView',

  components: { VersionBlock, FormBox },

  data () {
    return {
      fitWindowTimer: null,
      secretSequenceStep: null,
      secretSequenceTimer: null,
      secretOverlayTimer: null,
      isSunglassesOverlayVisible: false,
      sunglassesOverlayKey: 0,
      sunglassesGif
    }
  },

  mounted () {
    this.queueWindowFit()
    window.setTimeout(() => {
      this.queueWindowFit()
    }, 240)
  },

  beforeDestroy () {
    if (this.fitWindowTimer) {
      clearTimeout(this.fitWindowTimer)
      this.fitWindowTimer = null
    }

    this.clearSecretSequenceTimer()
    this.clearSecretOverlayTimer()
  },

  computed: {
    titleSecretSegments () {
      const welcomeTitle = String(this.$i18n.t('welcome.welcomeToMyVergies'))
      const welcomeTitleLowerCase = welcomeTitle.toLowerCase()
      const toWordIndex = welcomeTitleLowerCase.indexOf(' to ')
      const myVergiesIndex = welcomeTitleLowerCase.indexOf('myvergies')

      if (toWordIndex === -1 || myVergiesIndex === -1) {
        return null
      }

      const triggerOIndex = toWordIndex + 2
      const triggerGIndex = welcomeTitleLowerCase.indexOf('g', myVergiesIndex)

      if (triggerGIndex === -1) {
        return null
      }

      return {
        beforeO: welcomeTitle.slice(0, triggerOIndex),
        triggerO: welcomeTitle.charAt(triggerOIndex),
        beforeG: welcomeTitle.slice(triggerOIndex + 1, triggerGIndex),
        triggerG: welcomeTitle.charAt(triggerGIndex),
        afterG: welcomeTitle.slice(triggerGIndex + 1)
      }
    }
  },

  methods: {
    queueWindowFit () {
      if (this.fitWindowTimer) {
        clearTimeout(this.fitWindowTimer)
      }

      this.$nextTick(() => {
        this.fitWindowTimer = window.setTimeout(() => {
          this.fitWindowToContent()
        }, 80)
      })
    },

    async fitWindowToContent () {
      const appRoot = document.getElementById('app')
      const appContentBox = this.$el.closest('.app-content-box')

      if (!appRoot || !appContentBox) {
        return
      }

      const contentBoxStyles = window.getComputedStyle(appContentBox)
      const appRootRect = appRoot.getBoundingClientRect()
      const welcomeViewRect = this.$el.getBoundingClientRect()
      const paddingBottom = parseFloat(contentBoxStyles.paddingBottom || '0')
      const contentHeight = Math.ceil(
        (welcomeViewRect.bottom - appRootRect.top) +
        paddingBottom
      )

      if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
        return
      }

      await ipcRenderer.invoke(eventConstants.fitWindowToContent, { height: contentHeight })
    },

    handleSecretLetterClick (letter) {
      if (letter === 'o') {
        this.secretSequenceStep = 'o'
        this.startSecretSequenceTimer()
        return
      }

      if (letter === 'g' && this.secretSequenceStep === 'o') {
        this.revealSunglassesOverlay()
        return
      }

      this.resetSecretSequence()
    },

    startSecretSequenceTimer () {
      this.clearSecretSequenceTimer()
      this.secretSequenceTimer = window.setTimeout(() => {
        this.resetSecretSequence()
      }, SECRET_SEQUENCE_TIMEOUT_MS)
    },

    clearSecretSequenceTimer () {
      if (!this.secretSequenceTimer) {
        return
      }

      clearTimeout(this.secretSequenceTimer)
      this.secretSequenceTimer = null
    },

    clearSecretOverlayTimer () {
      if (!this.secretOverlayTimer) {
        return
      }

      clearTimeout(this.secretOverlayTimer)
      this.secretOverlayTimer = null
    },

    resetSecretSequence () {
      this.secretSequenceStep = null
      this.clearSecretSequenceTimer()
    },

    revealSunglassesOverlay () {
      this.resetSecretSequence()
      this.clearSecretOverlayTimer()
      this.isSunglassesOverlayVisible = true
      this.sunglassesOverlayKey += 1
      this.secretOverlayTimer = window.setTimeout(() => {
        this.isSunglassesOverlayVisible = false
        this.secretOverlayTimer = null
      }, SUNGLASSES_GIF_LOOP_MS * SUNGLASSES_GIF_TOTAL_LOOPS)
    }
  }
}
</script>

<style>
  .welcome-secret-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    pointer-events: none;
  }

  .welcome-secret-overlay-image {
    display: block;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }

  .welcome-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
    margin-bottom: 0.75rem;
  }

  .header-logo > img {
    width: 256px;
    filter: drop-shadow(0 0 28px rgba(83, 243, 255, 0.18));
    animation: rv-drift 9s ease-in-out infinite;
  }

  .welcome-copy {
    min-width: 340px;
    text-align: left;
  }

  .welcome-title {
    font-size: 3.5rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 0.95;
    color: var(--rv-text);
    text-wrap: balance;
    text-shadow: 0 0 22px rgba(83, 243, 255, 0.18), 0 0 38px rgba(255, 87, 210, 0.08);
    animation: rv-glow-breathe 5.8s ease-in-out infinite;
  }

  .welcome-title-secret-trigger {
    appearance: none;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    text-transform: inherit;
    cursor: default;
  }

  .welcome-title-secret-trigger:focus-visible {
    outline: 2px solid rgba(83, 243, 255, 0.75);
    outline-offset: 0.14em;
    border-radius: 0.14em;
  }

  .welcome-action-button {
    min-width: 15.5rem;
  }

  .welcome-view .form-box h4 {
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--rv-text);
  }

  @media (max-width: 768px) {
    .welcome-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .welcome-title {
      font-size: 2.75rem;
      text-align: left;
      letter-spacing: 0.06em;
    }

    .welcome-copy {
      min-width: 0;
    }

    .welcome-action-button {
      min-width: 100%;
    }
  }
</style>
