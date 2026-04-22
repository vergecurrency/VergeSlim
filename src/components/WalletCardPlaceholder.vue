<template>
  <div class="wallet-card-placeholder">
    <p class="wallet-card-placeholder-title" v-t="'createWallet.addYourFirstWallet'"/>
    <small v-t="'createWallet.itsReallyEasy'"/>
  </div>
</template>

<script>
export default {
  name: 'WalletCardPlaceholder'
}
</script>

<style scoped>
  .wallet-card-placeholder {
    border: 2px dashed rgba(83, 243, 255, 0.28);
    border-radius: 22px;
    padding: 10px;
    height: 90px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: var(--rv-text-soft);
    background: linear-gradient(180deg, rgba(13, 19, 46, 0.78), rgba(10, 16, 38, 0.72));
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }
  .wallet-card-placeholder > small {
    font-size: .72rem;
    color: var(--rv-text-muted);
  }

  .wallet-card-placeholder-title {
    font-family: inherit;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .wallet-card-placeholder:hover {
    transform: translateY(-2px);
    border-color: rgba(83, 243, 255, 0.42);
    box-shadow: 0 18px 36px rgba(1, 4, 18, 0.28), 0 0 28px rgba(83, 243, 255, 0.1);
  }
</style>
