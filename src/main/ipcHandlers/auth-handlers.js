function createAuthHandlers (userService) {
  return {
    login: async function (event, payload) {
      try {
        await userService.authenticate(payload)
        return { success: true, settings: await userService.getSettings() }
      } catch (error) {
        console.log(error)
        return { error, success: false }
      }
    },

    restore: async (event, payload) => {
      try {
        const { username, password, confirmPassword, seed: seedPhrase } = payload
        if (password !== confirmPassword) {
          throw new Error('Password and confirmPassword should match.')
        }

        await userService.restore({ seedPhrase, username, password })

        return { success: true, settings: await userService.getSettings() }
      } catch (error) {
        return { succress: false, error: 'Restoring a user failed' }
      }
    }
  }
}

module.exports = { createAuthHandlers }
