import Vue, { PluginFunction } from 'vue'
import VueRouter, { NavigationGuardNext, Route } from 'vue-router'
import { BuefyNamespace } from 'buefy'
import Log from 'electron-log'
import SudoPrompt from 'sudo-prompt'
import Keytar from '@/utils/keytar'
import AuthenticationModal from '@/views/Authentication/AuthenticationModal.vue'
import AddPinModal from '@/views/Settings/AddPinModal.vue'

class AuthManager {
  protected authenticated: boolean = false
  protected authenticationModalShown: boolean = false
  protected $parent!: Vue
  protected $router!: VueRouter
  protected $buefy!: BuefyNamespace

  public get isAuthenticated (): boolean {
    return this.authenticated
  }

  public injectVue (vue: Vue): void {
    this.$parent = vue
    this.$router = vue.$router
    this.$buefy = vue.$buefy
  }

  public showKeychainAccessError (error: any, title: string = Keytar.accessErrorTitle): void {
    const details = error && error.originalMessage ? `<br/><br/><small>${error.originalMessage}</small>` : ''

    this.$buefy.dialog.alert({
      title,
      message: `${Keytar.accessErrorMessage}${details}`,
      type: 'is-danger',
      hasIcon: true,
      ariaRole: 'alertdialog',
      ariaModal: true
    })
  }

  public async authenticate (pin: string): Promise<boolean> {
    this.authenticated = await this.validateAuthentication(pin)

    Log.info(this.authenticated ? 'authenticated' : 'authication failed')

    return this.authenticated
  }

  public lock (): void {
    if (!this.authenticated) {
      return
    }

    Log.info('lock application')

    this.authenticated = false

    if (this.$router.currentRoute.meta.needsAuthentication || false) {
      this.showAuthenticationModal({
        canCancel: false
      })
    }
  }

  public showAuthenticationModal (config: object = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.authenticationModalShown) {
        resolve(this.authenticated)
      }

      Log.info('authenticate')

      this.authenticationModalShown = true
      const manager = this
      const closeHandler = () => {
        manager.authenticated = false
        manager.authenticationModalShown = false

        resolve(false)
      }

      const modal = this.$buefy.modal.open({
        // @ts-ignore
        component: AuthenticationModal,
        customClass: 'is-modal-auth',
        parent: this.$parent,
        hasModalCard: true,
        trapFocus: true,
        canCancel: ['escape', 'outside'],
        onCancel: closeHandler,
        events: {
          reset () {
            Log.info('user wants to reset PIN')

            const options = {
              name: 'MyVergies'
            }

            SudoPrompt.exec('echo hello', options, (error, stdout, stderr) => {
              if (error) {
                return Log.info('user didn\'t system authenticate for PIN reset')
              }

              Log.info('user did system authenticate for PIN reset')

              manager.authenticationModalShown = false
              manager.authenticated = false
              modal.close()
              manager.showPinResetModal().then(pinReset => {
                resolve(pinReset)
              })
            })
          },

          authenticated () {
            manager.authenticationModalShown = false
            modal.close()
            resolve(true)
          },
          close: closeHandler
        },
        ...config
      })
    })
  }

  protected showPinResetModal (): Promise<boolean> {
    Log.info('show PIN reset modal')

    return new Promise((resolve) => {
      this.$buefy.modal.open({
        // @ts-ignore
        component: AddPinModal,
        parent: this.$parent,
        hasModalCard: true,
        trapFocus: true,
        canCancel: ['escape', 'outside'],
        onCancel () {
          resolve(false)
        },
        events: {
          close (reset: boolean) {
            resolve(reset)
          }
        }
      })
    })
  }

  public async changePin (pin: string): Promise<boolean> {
    await Keytar.setCredentials(Keytar.appService, 'application', pin)

    this.authenticated = true

    Log.info('changed PIN, authenticated')

    return true
  }

  public async validateAuthentication (pin: string): Promise<boolean> {
    return await Keytar.getCredentials(Keytar.appService, 'application') === pin
  }

  public registerRouterGuard () {
    this.authenticated = false

    this.$router.beforeEach((to: Route, from: Route, next: NavigationGuardNext) => {
      if (!((to.meta.needsAuthentication || false) && !this.authenticated)) {
        next()

        return
      }

      next(false)

      this.showAuthenticationModal().then(authenticated => {
        if (!authenticated) {
          return
        }

        this.$router.push({
          name: to.name || 'welcome',
          params: to.params
        })
      })
    })
  }

  public toggleAuthentication (): void {
    this.authenticated ? this.lock() : this.showAuthenticationModal()
  }

  public async pinIsSet (): Promise<boolean> {
    return await Keytar.getCredentials(Keytar.appService, 'application') !== null
  }
}

const authManagerPlugin: PluginFunction<any> = function (vue: typeof Vue, options: any): void {
  vue.prototype.$authManager = new AuthManager()
  vue.observable(vue.prototype.$authManager)

  vue.mixin({
    beforeCreate (): void {
      if (!vue.prototype.$authManager.$parent) {
        Log.info('inject Vue in auth manager')

        vue.prototype.$authManager.injectVue(this)
      }
    },

    computed: {
      isAuthenticated (): boolean {
        return vue.prototype.$authManager.isAuthenticated
      }
    }
  })
}

export default authManagerPlugin
