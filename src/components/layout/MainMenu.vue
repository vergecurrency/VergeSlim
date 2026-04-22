<template>
  <div class="main-menu">
    <aside class="menu">
      <ul class="menu-list menu-list-wallet">
        <li>
          <div class="wallet-status-strip" :class="statusToneClass">
            <div class="wallet-status-copy">
              <span class="wallet-status-kicker">Live Status</span>
              <span class="wallet-status-title">{{ statusTitle }}</span>
              <span class="wallet-status-detail">{{ statusDetail }}</span>
            </div>
            <span class="wallet-status-dot"></span>
          </div>
          <a class="is-size-2 has-text-weight-semibold is-not-clickable" v-html="$i18n.t('main.menu.wallets')"/>
          <ul class="menu-wallets">
            <li v-if="hasNoWallets">
              <router-link
                :to="{ name: 'wallets.create' }"
                active-class=""
                class="menu-wallets-card"
              >
                <wallet-card-placeholder/>
              </router-link>
            </li>
            <li v-else v-for="wallet in walletPlaceholders" :key="wallet.identifier">
              <a v-if="wallet.isLoading" class="menu-wallets-card"><wallet-card-skeleton/></a>
              <router-link
                v-else
                :to="{ name: 'wallets', params: { walletIdentifier: wallet.identifier, wallet }}"
                class="menu-wallets-card"
                @click="selectedWallet = wallet"
              >
                <wallet-card :wallet="wallet"></wallet-card>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'wallets.create' }">
                <b-icon icon="plus" size="is-small"/>
                <span v-t="'main.menu.add'"/>
              </router-link>
            </li>
          </ul>
        </li>
        <li class="is-hidden">
          <router-link
            class="is-size-4 has-text-weight-semibold"
            :to="{ name: 'blockchain' }"
            v-html="$i18n.t('main.menu.blockchain')"
          />
        </li>
        <li class="is-hidden">
          <router-link
            class="is-size-4 has-text-weight-semibold"
            :to="{ name: 'settings' }"
            v-html="$i18n.t('main.menu.settings')"
          />
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WalletCard from '@/components/WalletCard'
import WalletCardPlaceholder from '@/components/WalletCardPlaceholder'
import WalletCardSkeleton from '@/components/WalletCardSkeleton'

export default {
  name: 'main-menu',
  components: { WalletCardSkeleton, WalletCardPlaceholder, WalletCard },
  props: {
    wallets: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selectedWallet: null
    }
  },
  computed: {
    ...mapGetters(['allWalletIdentifiers', 'torStatusPhase', 'walletStatusPhase', 'isTorEnabled']),

    walletPlaceholders () {
      return this.allWalletIdentifiers.map(identifier => {
        const wallet = this.wallets.find(wallet => wallet.identifier === identifier)

        if (wallet) {
          wallet.isLoading = false
          return wallet
        }

        return {
          identifier,
          isLoading: true
        }
      })
    },

    hasNoWallets () {
      return this.allWalletIdentifiers.length === 0
    },

    hasLoadingWalletPlaceholders () {
      return this.walletPlaceholders.some(wallet => wallet.isLoading)
    },

    statusTitle () {
      if (!this.isTorEnabled || this.torStatusPhase === 'disconnected') {
        return this.$i18n.t('main.status.torDisabled')
      }

      if (this.torStatusPhase === 'error') {
        return this.$i18n.t('main.status.torError')
      }

      if (this.torStatusPhase !== 'connected') {
        return this.$i18n.t('main.status.bootstrappingTor')
      }

      if (this.hasLoadingWalletPlaceholders || this.walletStatusPhase === 'connecting') {
        return this.$i18n.t('main.status.connectingWallet')
      }

      if (this.walletStatusPhase === 'syncing') {
        return this.$i18n.t('main.status.syncingWallet')
      }

      if (this.hasNoWallets) {
        return this.$i18n.t('main.status.torBootstrapped')
      }

      return this.$i18n.t('main.status.walletReady')
    },

    statusDetail () {
      if (!this.isTorEnabled || this.torStatusPhase === 'disconnected') {
        return this.$i18n.t('main.status.torDisabledDetail')
      }

      if (this.torStatusPhase === 'error') {
        return this.$i18n.t('main.status.torErrorDetail')
      }

      if (this.torStatusPhase !== 'connected') {
        return this.$i18n.t('main.status.bootstrappingTorDetail')
      }

      if (this.hasLoadingWalletPlaceholders || this.walletStatusPhase === 'connecting') {
        return this.$i18n.t('main.status.connectingWalletDetail')
      }

      if (this.walletStatusPhase === 'syncing') {
        return this.$i18n.t('main.status.syncingWalletDetail')
      }

      if (this.hasNoWallets) {
        return this.$i18n.t('main.status.readyForWallet')
      }

      return this.$i18n.t('main.status.walletReadyDetail')
    },

    statusToneClass () {
      if (!this.isTorEnabled || this.torStatusPhase === 'disconnected') {
        return 'is-clearnet'
      }

      if (this.torStatusPhase === 'error') {
        return 'is-danger'
      }

      if (this.torStatusPhase !== 'connected') {
        return 'is-bootstrapping'
      }

      if (this.hasLoadingWalletPlaceholders || this.walletStatusPhase === 'connecting') {
        return 'is-connecting'
      }

      if (this.walletStatusPhase === 'syncing') {
        return 'is-syncing'
      }

      return 'is-ready'
    }
  },
  mounted () {
    this.selectedWallet = this.wallets[0]
  }
}
</script>

<style scoped lang="scss">
  .main-menu {
    background: #fbfbfb;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;
    max-width: 280px;
  }

  .menu-list.menu-list-wallet a {
    padding: 10px 30px;
  }

  .menu-list.menu-list-wallet a.is-active,
  .menu-wallets a.menu-wallets-card:hover,
  .menu-list a.is-not-clickable:hover {
    background-color: transparent;
  }

  .menu-list.menu-list-wallet li ul {
    border-left: none;
    margin: 0;
    padding-left: 0;
  }

  .menu-list-wallet a {
    position: relative;
  }

  .menu-list-wallet a.router-link-active::after {
    position: absolute;
    content: "•";
    font-size: 50px;
    line-height: 0;
    color: #252525;
    right: 5px;
    top: calc(50% - 5px);
  }

  .main-menu .icon {
    display: -webkit-inline-box;
    height: 1.5em;
    width: 1.5em;
  }

  .main-menu .icon:first-child:not(:last-child) {
    margin-right: 0.1875em;
  }

  @media (prefers-color-scheme: dark) {
    .main-menu {
      background: #1f2123;
      border-right: 1px solid #333333;
      color: white;
    }

    .menu-list a:hover {
      background-color: #1d1d1d;
      color: whitesmoke;
    }

    .menu-list-wallet a.router-link-active::after {
      color: whitesmoke;
    }
  }

  .main-menu {
    position: relative;
    background: linear-gradient(180deg, rgba(9, 13, 31, 0.96), rgba(11, 15, 34, 0.9));
    border-right: 1px solid rgba(83, 243, 255, 0.12);
    max-width: 296px;
    padding: 1.25rem 1rem 1.5rem;
    box-shadow: inset -1px 0 0 rgba(255, 87, 210, 0.06);
  }

  .main-menu::before {
    content: "";
    position: absolute;
    inset: 1rem 0 auto;
    height: 180px;
    background: radial-gradient(circle at left center, rgba(255, 87, 210, 0.12), transparent 62%);
    pointer-events: none;
  }

  .menu-list.menu-list-wallet a {
    padding: 0.75rem 1rem;
  }

  .menu-list.menu-list-wallet > li > a.is-size-2 {
    padding-left: 0;
    color: var(--rv-text);
    font-size: 1.85rem !important;
    text-shadow: 0 0 18px rgba(83, 243, 255, 0.12);
    margin-top: 0.2rem;
  }

  .menu-wallets {
    display: grid;
    gap: 0.85rem;
    margin-top: 1rem;
  }

  .menu-wallets-card {
    display: block;
    padding: 0 !important;
    border-radius: 22px;
  }

  .menu-list-wallet a.router-link-active::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--rv-cyan);
    box-shadow: 0 0 16px rgba(83, 243, 255, 0.85);
    right: 0.75rem;
    top: calc(50% - 5px);
  }

  .wallet-status-strip {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.9rem;
    padding: 0.9rem 1rem;
    margin-bottom: 0.9rem;
    border-radius: 18px;
    border: 1px solid rgba(83, 243, 255, 0.16);
    background: linear-gradient(135deg, rgba(15, 22, 48, 0.94), rgba(28, 12, 47, 0.84));
    overflow: hidden;
    box-shadow: 0 18px 38px rgba(1, 4, 18, 0.28), 0 0 24px rgba(83, 243, 255, 0.08);
  }

  .wallet-status-strip::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.16) 28%, transparent 56%);
    background-size: 220% 100%;
    animation: wallet-status-sheen 6.5s linear infinite;
    opacity: 0.4;
    pointer-events: none;
  }

  .wallet-status-strip.is-bootstrapping {
    background: linear-gradient(135deg, rgba(20, 27, 67, 0.96), rgba(20, 12, 44, 0.9));
  }

  .wallet-status-strip.is-connecting {
    background: linear-gradient(135deg, rgba(28, 18, 70, 0.96), rgba(15, 34, 69, 0.9));
  }

  .wallet-status-strip.is-syncing {
    background: linear-gradient(135deg, rgba(14, 44, 67, 0.96), rgba(18, 14, 58, 0.9));
  }

  .wallet-status-strip.is-ready {
    background: linear-gradient(135deg, rgba(10, 49, 54, 0.96), rgba(12, 24, 56, 0.9));
  }

  .wallet-status-strip.is-clearnet {
    background: linear-gradient(135deg, rgba(52, 33, 16, 0.96), rgba(33, 18, 48, 0.9));
  }

  .wallet-status-strip.is-danger {
    background: linear-gradient(135deg, rgba(68, 19, 43, 0.96), rgba(34, 12, 33, 0.9));
  }

  .wallet-status-copy {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    z-index: 1;
  }

  .wallet-status-kicker {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
  }

  .wallet-status-title {
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--rv-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wallet-status-detail {
    font-size: 0.72rem;
    color: var(--rv-text-muted);
  }

  .wallet-status-dot {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: var(--rv-cyan);
    box-shadow: 0 0 18px rgba(83, 243, 255, 0.85);
    animation: wallet-status-pulse 1.9s ease-in-out infinite;
  }

  .wallet-status-strip.is-danger .wallet-status-dot {
    background: #ff5ba4;
    box-shadow: 0 0 18px rgba(255, 91, 164, 0.75);
  }

  .wallet-status-strip.is-clearnet .wallet-status-dot {
    background: #ffb04d;
    box-shadow: 0 0 18px rgba(255, 176, 77, 0.75);
  }

  @keyframes wallet-status-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }

    50% {
      transform: scale(1.18);
      opacity: 0.7;
    }
  }

  @keyframes wallet-status-sheen {
    0% {
      background-position: 140% 0;
    }

    100% {
      background-position: -120% 0;
    }
  }

  @media (max-width: 1023px) {
    .main-menu {
      max-width: 100%;
      border-right: 0;
      border-bottom: 1px solid rgba(83, 243, 255, 0.12);
    }
  }
</style>
