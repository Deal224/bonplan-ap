export async function initOneSignal(appId) {
  if (!appId || typeof window === 'undefined' || !window.OneSignalDeferred) return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      notifyButton: { enable: false },
    });
    await OneSignal.Notifications.requestPermission();
  });
}

export function setExternalId(userId) {
  if (!userId || typeof window === 'undefined' || !window.OneSignalDeferred) return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push((OneSignal) => {
    OneSignal.login(String(userId));
  });
}
