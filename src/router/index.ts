import Vue from 'vue'
import VueRouter from 'vue-router'
import WelcomeView from '@/views/WelcomeView.vue'
import WalletView from '@/views/Wallet/WalletView.vue'
import SendView from '@/views/Wallet/Send/SendView.vue'
import ReceiveView from '@/views/Wallet/Receive/ReceiveView.vue'
import TransactionView from '@/views/Wallet/Transaction/TransactionView.vue'
import WalletCreateView from '@/views/Wallet/Create/CreateView.vue'
import WalletSetupView from '@/views/Wallet/Create/WalletSetupView.vue'
import ImportWallet from '@/views/Wallet/Create/ImportWallet.vue'
import WalletSettingsView from '@/views/Wallet/Settings/SettingsView.vue'
import BlockchainView from '@/views/Blockchain/BlockchainView.vue'
import ContactsView from '@/views/Contacts/ContactsView.vue'
import SettingsView from '@/views/Settings/SettingsView.vue'
import TradeView from '@/views/TradeView.vue'
import GamesView from '@/views/GamesView.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/wallets/:walletIdentifier',
      name: 'wallets',
      component: WalletView,
      props: true
    },
    {
      path: '/wallets/:walletIdentifier/send',
      name: 'wallets.send',
      component: SendView,
      props: true,
      meta: {
        needsAuthentication: true
      }
    },
    {
      path: '/wallets/:walletIdentifier/receive',
      name: 'wallets.receive',
      component: ReceiveView,
      props: true
    },
    {
      path: '/wallets/:walletIdentifier/transactions/:txid',
      name: 'wallets.transactions',
      component: TransactionView,
      props: true
    },
    {
      path: '/wallets/:walletIdentifier/settings',
      name: 'wallets.settings',
      component: WalletSettingsView,
      props: true,
      meta: {
        needsAuthentication: true
      }
    },
    {
      path: '/wallets/create',
      name: 'wallets.create',
      component: WalletCreateView
    },
    {
      path: '/wallets/create/new',
      name: 'wallets.create.new',
      component: WalletSetupView,
      props: { restore: false },
      meta: {
        needsAuthentication: true
      }
    },
    {
      path: '/wallets/create/restore',
      name: 'wallets.create.restore',
      component: WalletSetupView,
      props: { restore: true },
      meta: {
        needsAuthentication: true
      }
    },
    {
      path: '/wallets/create/import',
      name: 'wallets.create.import',
      component: ImportWallet,
      meta: {
        needsAuthentication: true
      }
    },
    {
      path: '/blockchain',
      name: 'blockchain',
      component: BlockchainView
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: ContactsView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/trade',
      name: 'trade',
      component: TradeView
    },
    {
      path: '/games',
      name: 'games',
      component: GamesView
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

export default router
