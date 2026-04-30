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
          <div class="welcome-title-stack">
            <h1 class="welcome-title welcome-title-foreground is-family-display">
              <template v-if="titleSecretSegments">
                <template v-for="segment in titleSecretSegments">
                  <span v-if="segment.type === 'text'" :key="segment.key" v-text="segment.value"/>
                  <button
                    v-else
                    :key="segment.key"
                    type="button"
                    class="welcome-title-secret-trigger"
                    aria-label="Secret trigger"
                    @click="handleSecretLetterClick(segment.expected)"
                    v-text="segment.value"
                  />
                </template>
              </template>
              <template v-else>
                <span v-text="$i18n.t('welcome.welcomeToMyVergies')"/>
              </template>
            </h1>
          </div>
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
const SECRET_TITLE_SEQUENCE = ['v', 'e', 'r', 'g', 'e']

export default {
  name: 'WelcomeView',

  components: { VersionBlock, FormBox },

  data () {
    return {
      fitWindowTimer: null,
      secretSequenceIndex: 0,
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
      const triggerIndices = []
      let searchIndex = 0

      for (const triggerLetter of SECRET_TITLE_SEQUENCE) {
        const nextIndex = welcomeTitleLowerCase.indexOf(triggerLetter, searchIndex)

        if (nextIndex === -1) {
          return null
        }

        triggerIndices.push(nextIndex)
        searchIndex = nextIndex + 1
      }

      const segments = []
      let previousIndex = 0

      triggerIndices.forEach((triggerIndex, index) => {
        if (triggerIndex > previousIndex) {
          segments.push({
            type: 'text',
            key: `text-${index}-${previousIndex}`,
            value: welcomeTitle.slice(previousIndex, triggerIndex)
          })
        }

        segments.push({
          type: 'trigger',
          key: `trigger-${index}-${triggerIndex}`,
          expected: SECRET_TITLE_SEQUENCE[index],
          value: welcomeTitle.charAt(triggerIndex)
        })

        previousIndex = triggerIndex + 1
      })

      if (previousIndex < welcomeTitle.length) {
        segments.push({
          type: 'text',
          key: `text-tail-${previousIndex}`,
          value: welcomeTitle.slice(previousIndex)
        })
      }

      return segments
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
      const normalizedLetter = String(letter).toLowerCase()
      const expectedLetter = SECRET_TITLE_SEQUENCE[this.secretSequenceIndex]

      if (normalizedLetter !== expectedLetter) {
        this.resetSecretSequence()
        return
      }

      if (this.secretSequenceIndex === 0) {
        this.startSecretSequenceTimer()
      }

      this.secretSequenceIndex += 1

      if (this.secretSequenceIndex >= SECRET_TITLE_SEQUENCE.length) {
        this.revealSunglassesOverlay()
      }
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
      this.secretSequenceIndex = 0
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

  .welcome-title-stack {
    display: inline-grid;
    align-items: start;
    justify-items: start;
  }

  .welcome-title {
    display: block;
    font-size: 3.5rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 0.95;
    color: var(--rv-text);
    text-wrap: balance;
  }

  .welcome-title-foreground {
    position: relative;
    z-index: 0;
    text-shadow:
      0 0 8px rgba(124, 255, 242, 0.2),
      0 0 20px rgba(50, 239, 222, 0.32),
      0 0 38px rgba(50, 239, 222, 0.18);
    animation: welcome-title-teal-pulse 7.2s ease-in-out infinite;
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
    text-shadow: inherit;
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

  @keyframes welcome-title-teal-pulse {
    0%, 100% {
      text-shadow:
        0 0 8px rgba(124, 255, 242, 0.16),
        0 0 18px rgba(50, 239, 222, 0.24),
        0 0 34px rgba(50, 239, 222, 0.14);
    }

    50% {
      text-shadow:
        0 0 10px rgba(124, 255, 242, 0.28),
        0 0 26px rgba(50, 239, 222, 0.44),
        0 0 52px rgba(50, 239, 222, 0.24);
    }
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
