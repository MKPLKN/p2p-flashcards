class ServiceProvider {
  constructor () {
    this.services = new Map()
  }

  register (name, instance) {
    if (Array.isArray(name)) {
      name.forEach(n => {
        this.services.set(n, instance)
      })
    } else {
      this.services.set(name, instance)
    }
  }

  get (name) {
    return this.services.get(name)
  }
}

module.exports = new ServiceProvider()
