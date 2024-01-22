function createUserHandlers (userService) {
  return {
    get: async function (event) {
      try {
        return {
          isAuthenticated: userService.isAuthenticated,
          settings: await userService.getSettings(),
          backupService: userService.getStatuses()
        }
      } catch (error) {
        return { isAuthenticated: false }
      }
    },

    create: async (event, payload) => {
      try {
        const { mnemonic } = await userService.create(payload)
        return { success: true, settings: await userService.getSettings(), seed: mnemonic }
      } catch (error) {
        return { succress: false, error }
      }
    }
  }
}

module.exports = { createUserHandlers }
