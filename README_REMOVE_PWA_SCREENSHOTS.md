# LabRat PWA install sheet cleanup

This patch removes the manifest `screenshots` entries and disables old screenshot snippet files so Chrome/Android uses the simpler standard PWA install prompt without the large screenshot preview panel.

It does not touch Firebase, service worker registration, compounds, shop logic, cycle logic, or theme layout.
