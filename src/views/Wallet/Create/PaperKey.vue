<template>
  <div>
    <div class="block">
      <h3
        class="is-size-3 is-family-handwritten"
        v-html="$i18n.t(this.restore ? 'createWallet.fillInYourPaperKey' : 'createWallet.aPaperKey')"
      />
      <p v-html="$i18n.t(this.restore ? 'createWallet.fillInYourPaperKeyDesc' : 'createWallet.aPaperKeyDescription')"/>
    </div>

    <div class="columns is-multiline">
      <div
        class="column is-one-third"
        v-for="(word, i) in words"
        :key="i+word"
      >
        <div class="tags are-medium has-addons word">
          <span class="tag is-success">{{ i+1 }}</span>
          <span v-if="restore" class="tag expand-word">
            <input v-model="paperkey[i]" class="word-input"/>
          </span>
          <span v-else class="tag word-tag is-family-code has-text-weight-semibold expand-word" v-html="word"/>
        </div>
      </div>
    </div>

    <div v-if="confirm" class="columns">
      <div class="column">
        <div class="tags are-medium">
          <span
            v-for="(word, i) in randomWords" :key="i+word" v-html="word"
            class="tag selectable-word-tag is-family-code has-text-weight-semibold is-clickable"
            @click="selectedPaperkey.push(word)"
          />
        </div>
      </div>
    </div>

    <b-notification
      v-if="confirm && showInvalidPaperkeyError"
      type="is-danger"
      v-html="$i18n.t('createWallet.invalidPaperkeySelected')"
    />

    <b-field grouped>
      <b-field expanded>
        <b-button v-show="confirm" label="Show paper key" @click="confirm = false"/>
      </b-field>

      <b-field v-show="confirm && selectedPaperkey.length > 0">
        <b-button
          label="Reset"
          @click="resetSelectedPaperkey"
        />
      </b-field>

      <b-field>
        <b-button
          icon-left="edit"
          :label="$i18n.t('createWallet.confirmPaperKey')"
          type="is-primary"
          @click="confirmationHandler"
          :disabled="confirm && selectedPaperkey.length < 12"
        />
      </b-field>
    </b-field>
  </div>
</template>

<script>
import Constants from '@/utils/constants'
import Mnemonic from 'bitcore-mnemonic'

export default {
  name: 'PaperKey',
  props: {
    value: {
      type: Object,
      required: true
    },
    restore: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      confirm: false,
      showInvalidPaperkeyError: false,
      selectedPaperkey: [],
      paperkey: []
    }
  },

  mounted () {
    this.generatePaperkey()
  },

  computed: {
    selectedPaperkeyWithPlaceholders () {
      const placeholders = Array(Constants.paperKeyLength).fill('', 0, Constants.paperKeyLength)

      this.selectedPaperkey.forEach(function (value, key) {
        placeholders[key] = value
      })

      return placeholders
    },

    words () {
      if (this.restore) {
        return Array(Constants.paperKeyLength).fill('', 0, Constants.paperKeyLength)
      }

      return this.confirm ? this.selectedPaperkeyWithPlaceholders : this.paperkey
    },

    randomWords () {
      const words = this.paperkey.filter(word => {
        return !this.selectedPaperkey.includes(word)
      })

      return this.shuffleWords(words)
    },

    paperkeyCheckupIsValid () {
      return this.paperkey.join('') === this.selectedPaperkey.join('')
    }
  },

  methods: {
    generatePaperkey () {
      if (this.restore) {
        this.paperkey = Array(Constants.paperKeyLength).fill(undefined, 0, Constants.paperKeyLength)
        return
      }

      let mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH)

      while (!Mnemonic.isValid(mnemonic.toString())) {
        mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH)
      }

      this.paperkey = mnemonic.toString().split(' ')
    },

    shuffleWords (words) {
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]]
      }

      return words
    },

    confirmationHandler () {
      if (!this.restore && !this.confirm) {
        this.confirm = true

        return
      }

      if (!this.restore && !this.paperkeyCheckupIsValid) {
        this.showInvalidPaperkeyError = true

        return
      }

      if (this.restore && (this.paperkey.includes(undefined) || this.paperkey.includes(''))) {
        this.showInvalidPaperkeyError = true

        return
      }

      this.$emit('input', {
        ...this.value,
        paperkey: this.paperkey.join(' ')
      })
      return this.$emit('next')
    },

    resetSelectedPaperkey () {
      this.selectedPaperkey = []
      this.showInvalidPaperkeyError = false
    }
  }
}
</script>

<style>
input.word-input {
  background: transparent;
  border: none;
  box-shadow: none;
  color: #0a0a0a;
  font-family: monospace;
  font-weight: 600;
  font-size: 1rem;
  height: 100%;
  width: 100%;
  outline: none;
}

.word {
  flex-wrap: nowrap;
}

.word-input input:focus {
  border: none;
  box-shadow: none;
}

.expand-word {
  flex-grow: 1;
}

.word-tag,
.selectable-word-tag {
  color: #0a0a0a !important;
}

@media (prefers-color-scheme: dark) {
  .word-tag,
  .selectable-word-tag {
    background: #d8dee6;
    color: #10161d !important;
  }
}
</style>
