function createCloudHandlers (userService) {
  return {
    disconnect: async (event, payload) => {
      try {
        userService.disconnect()
        return { success: true }
      } catch (error) {
        console.log(error)
        return { success: false }
      }
    },

    connect: async (event, payload) => {
      try {
        const { pubkey } = payload
        if (!pubkey) return

        if ((await userService.getSettings('backup_pub_key')) !== pubkey) {
          await userService.setSettings({ backup_pub_key: pubkey })
        }
        userService.connect(pubkey)

        return { success: true }
      } catch (error) {
        console.log(error)
        return { success: false }
      }
    }
  }
}

module.exports = { createCloudHandlers }
