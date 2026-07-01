(function registerPacjent360Pwa() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {
      // PWA registration is progressive enhancement; the app must keep working without it.
    });
  });
})();
