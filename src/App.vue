<template>
  <div id="app" class="app-container is-unselectable">
    <NavBar>
      <template slot="navbar-items">
        <IconListBar/>
      </template>
    </NavBar>
    <div class="app-content-container is-marginless" :class="{'update-notification': hasUpdateNotification}">
      <UpdateNotification v-if="hasUpdateNotification" />
      <div class="columns is-gapless" style="height: 100%">
        <MainMenu class="column is-one-quarter" :wallets="wallets"/>
        <ContentContainer>
          <RouterView class="app-content-box-container"/>
        </ContentContainer>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar'
import IconListBar from '@/components/layout/IconListBar'
import MainMenu from '@/components/layout/MainMenu'
import ContentContainer from '@/components/layout/ContentContainer'
import UpdateNotification from '@/components/UpdateNotification'
import { ipcRenderer } from 'electron'
import AddPinModal from '@/views/Settings/AddPinModal'
import { eventConstants } from '@/utils/constants'

export default {
  name: 'my-vergies',
  components: {
    UpdateNotification,
    ContentContainer,
    MainMenu,
    NavBar,
    IconListBar
  },

  data () {
    return {
      wallets: this.$walletManager.wallets,
      hasUpdateNotification: false
    }
  },

  created () {
    this.$authManager.registerRouterGuard()
    this.$authManager.pinIsSet().then(isSet => {
      if (!isSet) {
        this.$buefy.modal.open({
          component: AddPinModal,
          parent: this,
          canCancel: false,
          hasModalCard: true,
          trapFocus: true
        })
      }
    }).catch(error => {
      this.$authManager.showKeychainAccessError(error, 'Keychain Access Needed')
    })

    ipcRenderer.on('open-settings', () => {
      this.$router.push('/settings')
    })

    ipcRenderer.on('lock-application', () => {
      this.$authManager.lock()
    })

    ipcRenderer.on('user-idle', () => {
      this.$authManager.lock()
    })

    ipcRenderer.on('update-available', () => {
      this.hasUpdateNotification = true
    })

    ipcRenderer.on(eventConstants.torConnectionError, (event, error) => {
      this.$buefy.dialog.alert({
        message: `Tor couldn't be started: <b>${error.message}</b>`,
        type: 'is-danger'
      })
    })
  }
}
</script>

<style lang="scss">
  @import '~@/assets/scss/main';

  .app-container {
    position: relative;
    height: 100%;
    background: linear-gradient(180deg, rgba(18, 12, 38, 0.94), rgba(6, 8, 20, 1));
    cursor: default;
    overflow: hidden;
  }

  .app-container::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(circle at 12% 18%, rgba(83, 243, 255, 0.18), transparent 24%),
      radial-gradient(circle at 78% 12%, rgba(255, 87, 210, 0.18), transparent 22%),
      radial-gradient(circle at 50% 70%, rgba(255, 154, 61, 0.1), transparent 32%);
    animation: rv-drift 14s ease-in-out infinite;
  }

  .app-container::after {
    content: "";
    position: fixed;
    left: -10%;
    right: -10%;
    bottom: -18vh;
    height: 42vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.38;
    background:
      linear-gradient(to top, rgba(255, 96, 180, 0.18), transparent 55%),
      repeating-linear-gradient(90deg, rgba(83, 243, 255, 0.2) 0 1px, transparent 1px 52px),
      repeating-linear-gradient(180deg, rgba(83, 243, 255, 0.22) 0 1px, transparent 1px 26px);
    transform: perspective(420px) rotateX(78deg);
    transform-origin: bottom;
    animation: rv-grid-pulse 7s ease-in-out infinite;
  }

  .app-container > * {
    position: relative;
    z-index: 1;
  }

  .app-content-container {
    position: relative;
    height: calc(100% - 53px);
  }

  .app-content-container.update-notification {
    height: calc(100% - 101px);
  }

  .app-content-box-container {
    max-width: 1120px;
    margin: auto;
  }

  @media (max-width: 1023px) {
    .app-container::after {
      opacity: 0.24;
      bottom: -24vh;
    }

    .app-content-box-container {
      max-width: 100%;
    }
  }
</style>
