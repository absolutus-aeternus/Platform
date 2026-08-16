window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  var appId = window.__ONESIGNAL_APP_ID__ || "";
  if (appId) {
    await OneSignal.init({ appId: appId });
  }
});
