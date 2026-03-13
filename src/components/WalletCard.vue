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
        <Money class="is-size-5 has-text-weight-bold" :amount="wallet.info.balance.totalAmount || 0" crypto/>
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
    background: white;
    border-radius: 16px;
    color: white;
    height: 120px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 3px 0 #111111;
    transition: all 0.5s ease-in-out;
  }

  .wallet-menu-card.is-clickable {
    cursor: pointer;
  }

  .wallet-menu-card-background {
    mix-blend-mode: overlay;
    height: 100%;
    opacity: 0.75;
  }

  .wallet-menu-card-background.xvg {
    background: url('~@/assets/coins/xvg.svg') no-repeat right;
  }

  .wallet-menu-card-background.btc {
    background: url('~@/assets/coins/btc.svg') no-repeat right;
  }

  .wallet-menu-card-background-blue {
    background: rgb(27,154,220);
    background: linear-gradient(145deg, rgb(0, 30, 220) 0%, rgb(14, 149, 202) 20%, rgb(117, 240, 236) 70%);
    box-shadow: 0 4px 20px rgba(14, 149, 202, 0.5), 0 3px 0 #70c4fd;
  }

  .wallet-menu-card-background-blue.is-clickable:hover {
    box-shadow: 0 4px 40px rgb(11, 140, 202), 0 2px 0 #0063cc;
  }

  .wallet-menu-card-background-purple {
    background: rgb(90,0,188);
    background: linear-gradient(145deg, rgb(90, 0, 188) 0%, rgb(228, 62, 120) 100%);
    box-shadow: 0 4px 20px rgba(228, 62, 120, 0.5), 0 3px 0 #940000;
  }

  .wallet-menu-card-background-purple.is-clickable:hover {
    box-shadow: 0 4px 40px rgb(209, 57, 228), 0 2px 0 #940000;
  }

  .wallet-menu-card-background-green {
    background: rgb(27,138,117);
    background: linear-gradient(145deg, rgb(0, 155, 94) 0%, rgb(217, 255, 51) 100%);
    box-shadow: 0 4px 20px rgba(44, 214, 2, 0.5), 0 3px 0 #459e7d;
  }

  .wallet-menu-card-background-green.is-clickable:hover {
    box-shadow: 0 4px 40px rgb(1, 214, 133), 0 2px 0 #186649;
  }

  .wallet-menu-card-background-orange {
    background: rgb(188,76,0);
    background: linear-gradient(145deg, rgb(188, 76, 0) 0%, rgb(254, 255, 29) 100%);
    box-shadow: 0 4px 20px rgba(255, 133, 29, 0.5), 0 3px 0 #d6a46e;
  }

  .wallet-menu-card-background-orange.is-clickable:hover {
    box-shadow: 0 4px 40px rgb(255, 154, 120), 0 2px 0 #ff8400;
  }

  .wallet-menu-card-background-red {
    background: rgb(188,0,89);
    background: linear-gradient(145deg, rgb(188, 0, 89) 0%, rgb(228, 181, 62) 100%);
    box-shadow: 0 4px 20px rgba(228, 181, 62, 0.5), 0 3px 0 #98004d;
  }

  .wallet-menu-card-background-red.is-clickable:hover {
    box-shadow: 0 4px 40px rgb(228, 76, 53), 0 2px 0 #98004d;
  }

  .wallet-menu-card-content {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    padding: 15px;
  }

  .wallet-menu-card.is-shadowless {
    box-shadow: none;
  }

  .wallet-menu-card.is-cornerless {
    border-radius: 0;
  }

  .is-size-6-1 {
    font-size: 1.1rem !important;
  }
</style>
