<template>
  <div ref="header" class="navigation-header" :class="{ 'has-update-notification': hasUpdateNotification }">
    <div class="box">
      <div class="columns is-vcentered">
        <div v-if="back" class="column is-narrow">
          <router-link
            class="button"
            :to="back"
          >
            <b-icon icon="angle-left" size="is-small"/>
          </router-link>
        </div>
        <div class="column">
          <p class="navigation-header-title is-size-3" v-html="title"/>
        </div>
        <div class="column is-narrow">
          <slot name="right"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navigation-header',

  props: {
    back: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      required: true
    }
  },

  mounted () {
    const header = this.$refs.header
    const sticky = header.offsetTop - (this.hasUpdateNotification ? 101 : 52)

    let appContentBox = null
    let parent = this.$parent
    while (appContentBox === null && parent !== null) {
      if (parent.$refs.appContentBox) {
        appContentBox = parent.$refs.appContentBox
      }

      parent = parent.$parent
    }

    appContentBox.onscroll = (e) => {
      if (appContentBox.scrollTop > sticky) {
        header.classList.add('sticky')
        this.$parent.$el.classList.add('has-sticky')
      } else {
        header.classList.remove('sticky')
        this.$parent.$el.classList.remove('has-sticky')
      }
    }
  },

  computed: {
    hasUpdateNotification () {
      if (this.$root.$children[0]) {
        return this.$root.$children[0].hasUpdateNotification ?? false
      }

      return false
    }
  }
}
</script>

<style>
.navigation-header {
  transition: transform 0.3s ease, opacity 0.3s ease;
  padding-bottom: 28px;
}

.navigation-header.sticky {
  position: fixed;
  width: calc(100% - 68px);
  top: 52px;
  margin: 0 -34px;
  z-index: 10;
}

.navigation-header.sticky.has-update-notification {
  top: 101px;
}

.navigation-header.sticky .box {
  width: 100%;
  padding: 12px 22px;
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(1, 4, 18, 0.36), 0 0 22px rgba(83, 243, 255, 0.08);
}

.has-sticky {
  padding-top: 120px;
}

.navigation-header .box {
  background: linear-gradient(135deg, rgba(13, 19, 46, 0.9), rgba(20, 12, 42, 0.86));
  border: 1px solid rgba(83, 243, 255, 0.14);
}

.navigation-header-title {
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rv-text);
  text-shadow: 0 0 18px rgba(83, 243, 255, 0.14);
}

@media (max-width: 768px) {
  .navigation-header.sticky {
    width: calc(100% - 36px);
    margin: 0 -18px;
  }
}
</style>
