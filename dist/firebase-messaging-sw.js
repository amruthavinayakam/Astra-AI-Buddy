self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = (data.notification && data.notification.title) || 'Astra'
    const body = (data.notification && data.notification.body) || 'New update'
    event.waitUntil(self.registration.showNotification(title, { body }))
  } catch (e) {
    // no-op
  }
})


