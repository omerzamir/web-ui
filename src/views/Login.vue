<template>
  <div id="login">
    <form @submit="submit">
      <img :src="logoURL" alt="File Browser">
      <h1>{{ name }}</h1>
      <div v-if="error !== ''" class="wrong">{{ error }}</div>

      <input class="input input--block" type="text" v-model="username" :placeholder="$t('login.username')">
      <input class="input input--block" type="password" v-model="password" :placeholder="$t('login.password')">
      <input class="input input--block" v-if="createMode" type="password" v-model="passwordConfirm" :placeholder="$t('login.passwordConfirm')" />

      <input class="button button--block" type="submit" :value="createMode ? $t('login.signup') : $t('login.submit')">

      <p @click="toggleMode" v-if="signup">{{ createMode ? $t('login.loginInstead') : $t('login.createAnAccount') }}</p>
    </form>
  </div>
</template>

<script>
import * as auth from '@/utils/auth'
import { name, logoURL, signup } from '@/utils/constants'

export default {
  name: 'login',
  computed: {
    signup: () => signup,
    name: () => name,
    logoURL: () => logoURL
  },
  data: function () {
    return {
      createMode: false,
      error: '',
      username: '',
      password: '',
      passwordConfirm: ''
    }
  },
  mounted () {
    return
  },
  methods: {
    toggleMode () {
      this.createMode = !this.createMode
    },
    async submit (event) {
      event.preventDefault()
      event.stopPropagation()

      let redirect = this.$route.query.redirect
      if (redirect === '' || redirect === undefined || redirect === null) {
        redirect = '/files'
      }

      if (this.createMode) {
        if (this.password !== this.passwordConfirm) {
          this.error = this.$t('login.passwordsDontMatch')
          return
        }
      }

      try {
        if (this.createMode) {
          await auth.signup(this.username, this.password)
        }

        await auth.validateLogin()
        this.$router.push({ path: redirect })
      } catch (e) {
        if (e.message == 409) {
          this.error = this.$t('login.usernameTaken')
        } else {
          this.error = this.$t('login.wrongCredentials')
        }
      }
    }
  }
}
</script>
