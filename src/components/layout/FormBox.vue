<template>
  <div class="box form-box is-relative" :class="[formattedType, isGrouped]">
    <b-switch v-if="toggleable" v-model="enabled" class="form-box-toggle"/>
    <div class="columns is-vcentered">
      <div class="column">
        <h4 class="has-text-weight-semibold" v-html="title"/>
        <p v-if="enabled" v-html="description"/>
      </div>
      <div v-if="enabled" class="column" :class="contentColumnClasses">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormBox',

  data () {
    return {
      enabled: this.isEnabled
    }
  },

  computed: {
    formattedType () {
      switch (this.type) {
        case 'is-info':
          return 'has-background-info-light'
        case 'is-success':
          return 'has-background-success has-text-white'
        case 'is-warning':
          return 'has-background-warning'
        case 'is-danger':
          return 'has-background-danger has-text-white'
        default:
          return ''
      }
    },

    contentColumnClasses () {
      return {
        'is-narrow': this.isNarrow
      }
    },

    isGrouped () {
      return this.grouped ? 'is-grouped' : ''
    }
  },

  watch: {
    isEnabled (enabled) {
      this.enabled = enabled
    }
  },

  props: {
    type: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    isNarrow: {
      type: Boolean,
      default: true
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    toggleable: {
      type: Boolean,
      default: false
    },
    grouped: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
  .box[disabled] {
    pointer-events: none;
    opacity: 0.8;
    background: rgba(18, 22, 42, 0.74);
  }

  .form-box {
    overflow: hidden;
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .form-box::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%),
      radial-gradient(circle at top right, rgba(83, 243, 255, 0.08), transparent 30%);
    opacity: 0.9;
    pointer-events: none;
  }

  .form-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 40px rgba(1, 4, 18, 0.28), 0 0 26px rgba(83, 243, 255, 0.08);
  }

  .form-box.is-grouped:not(:first-child) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    clip-path: inset(0px -15px -15px -15px);
  }

  .form-box.is-grouped:not(:last-child) {
    margin-bottom: -1px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .form-box-toggle {
    position: absolute;
    right: 0;
    z-index: 1;
  }
</style>
