<template>
  <div :class="containerClass">
    <div :class="['wallet-menu-card-background', wallet.info.wallet.coin]"></div>
    <div class="wallet-menu-card-content">
      <p class="is-size-6-1 is-family-handwritten is-capitalized">{{ wallet.name }}</p>
      <p
        v-if="!wallet.name || wallet.name === ''"
        class="is-size-6-1 is-family-handwritten is-capitalized"
        v-html="'a proper name'"
        style="opacity: 0.5"
      />
      <p>
        <Money class="is-size-6 has-text-weight-bold" :amount="wallet.info.balance.totalAmount || 0" crypto/>
      </p>
      <p>
        <Money class="is-size-7" :amount="wallet.info.balance.totalAmount || 0" convert/>
      </p>
    </div>
  </div>
</template>

<script>
import Money from '@/components/labels/Money'

export default {
  name: 'WalletCard',
  components: { Money },
  props: {
    wallet: {
      type: Object,
      required: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    shadowless: {
      type: Boolean,
      default: false
    },
    cornerless: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerClass () {
      return [
        'wallet-menu-card',
        'wallet-menu-card-background-' + this.wallet.color,
        this.clickable ? 'is-clickable' : '',
        this.shadowless ? 'is-shadowless' : '',
        this.cornerless ? 'is-cornerless' : ''
      ].join(' ')
    }
  }
}
</script>

<style scoped lang="scss">
  .wallet-menu-card {
    position: relative;
    border-radius: 22px;
    color: white;
    height: 90px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 18px 38px rgba(1, 4, 18, 0.34), 0 0 28px rgba(83, 243, 255, 0.08);
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .wallet-menu-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 42%),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 30px);
    mix-blend-mode: screen;
    opacity: 0.18;
    pointer-events: none;
  }

  .wallet-menu-card::after {
    content: "";
    position: absolute;
    top: -20px;
    right: -20px;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.62) 0, rgba(255, 255, 255, 0.14) 34%, transparent 72%);
    opacity: 0.45;
    pointer-events: none;
  }

  .wallet-menu-card.is-clickable {
    cursor: pointer;
  }

  .wallet-menu-card.is-clickable:hover {
    transform: translateY(-2px);
  }

  .wallet-menu-card-background {
    mix-blend-mode: overlay;
    height: 100%;
    opacity: 0.75;
  }

  .wallet-menu-card-background.xvg {
    background: url('~@/assets/coins/xvg.svg') no-repeat calc(100% + 6px) center;
    background-size: auto 82%;
  }

  .wallet-menu-card-background.btc {
    background: url('~@/assets/coins/btc.svg') no-repeat calc(100% + 6px) center;
    background-size: auto 82%;
  }

  .wallet-menu-card-background-blue {
    background: linear-gradient(135deg, #2025ff 0%, #0bc4ff 46%, #9cfcff 100%);
    box-shadow: 0 18px 38px rgba(32, 37, 255, 0.28), 0 0 32px rgba(11, 196, 255, 0.18);
  }

  .wallet-menu-card-background-blue.is-clickable:hover {
    box-shadow: 0 22px 44px rgba(32, 37, 255, 0.34), 0 0 36px rgba(11, 196, 255, 0.28);
  }

  .wallet-menu-card-background-purple {
    background: linear-gradient(135deg, #6c18ff 0%, #ff4fc8 58%, #ffb057 100%);
    box-shadow: 0 18px 38px rgba(108, 24, 255, 0.3), 0 0 32px rgba(255, 79, 200, 0.18);
  }

  .wallet-menu-card-background-purple.is-clickable:hover {
    box-shadow: 0 22px 44px rgba(108, 24, 255, 0.34), 0 0 36px rgba(255, 79, 200, 0.26);
  }

  .wallet-menu-card-background-green {
    background: linear-gradient(135deg, #00b36c 0%, #26f0a3 52%, #d9ff61 100%);
    box-shadow: 0 18px 38px rgba(0, 179, 108, 0.28), 0 0 32px rgba(38, 240, 163, 0.18);
  }

  .wallet-menu-card-background-green.is-clickable:hover {
    box-shadow: 0 22px 44px rgba(0, 179, 108, 0.34), 0 0 36px rgba(38, 240, 163, 0.24);
  }

  .wallet-menu-card-background-orange {
    background: linear-gradient(135deg, #ff6b3d 0%, #ff9a3d 48%, #ffe16d 100%);
    box-shadow: 0 18px 38px rgba(255, 107, 61, 0.28), 0 0 32px rgba(255, 154, 61, 0.18);
  }

  .wallet-menu-card-background-orange.is-clickable:hover {
    box-shadow: 0 22px 44px rgba(255, 107, 61, 0.32), 0 0 36px rgba(255, 154, 61, 0.26);
  }

  .wallet-menu-card-background-red {
    background: linear-gradient(135deg, #ff2f92 0%, #ff5b9d 46%, #ffbf5f 100%);
    box-shadow: 0 18px 38px rgba(255, 47, 146, 0.28), 0 0 32px rgba(255, 95, 157, 0.18);
  }

  .wallet-menu-card-background-red.is-clickable:hover {
    box-shadow: 0 22px 44px rgba(255, 47, 146, 0.34), 0 0 36px rgba(255, 95, 157, 0.26);
  }

  .wallet-menu-card-content {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    padding: 12px 13px;
    z-index: 1;
  }

  .wallet-menu-card.is-shadowless {
    box-shadow: none;
  }

  .wallet-menu-card.is-cornerless {
    border-radius: 0;
  }

  .is-size-6-1 {
    font-size: 0.98rem !important;
    letter-spacing: 0.04em;
  }
</style>
