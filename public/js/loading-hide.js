var observer = new MutationObserver(function() {
  var loading = document.getElementById("loading-screen");
  if (loading && document.querySelector("[data-v-app]")) {
    loading.style.display = "none";
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(function() {
  var loading = document.getElementById("loading-screen");
  if (loading) loading.style.display = "none";
}, 3000);
