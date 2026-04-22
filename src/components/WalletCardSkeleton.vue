<template>
  <div class="wallet-card-skeleton">
    <div class="wallet-card-skeleton-content">
      <b-skeleton height="15px" width="50%"/>
      <b-skeleton height="20px" width="85%"/>
      <b-skeleton height="12px" width="30%"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletCardSkeleton'
}
</script>

<style scoped>
  .wallet-card-skeleton {
    background: linear-gradient(180deg, rgba(13, 19, 46, 0.82), rgba(10, 16, 38, 0.78));
    border-radius: 22px;
    height: 90px;
    border: 1px solid rgba(83, 243, 255, 0.12);
    box-shadow: 0 18px 36px rgba(1, 4, 18, 0.24);
  }

  .wallet-card-skeleton-content {
    padding: 12px 13px;
  }

  ::v-deep .b-skeleton .b-skeleton-item {
    background: linear-gradient(90deg, rgba(83, 243, 255, 0.18), rgba(255, 87, 210, 0.18));
  }
</style>
