;(() => {
  const KEY = "sgdc.bits";
  const DEFAULT = 100; // startwaarde (pas aan als je iets anders wilt)
  const CHANNEL = new BroadcastChannel("sgdc-bits");

  const listeners = new Set();

  function read() {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) ? v : DEFAULT;
  }

  function write(val) {
    const v = Math.max(0, Math.floor(val));
    localStorage.setItem(KEY, String(v));
    CHANNEL.postMessage({ type: "bits:update", value: v });
    fire();
  }

  function fire() {
    const v = read();
    listeners.forEach(fn => fn(v));
  }

  window.Bits = {
    get() { return read(); },
    set(v) { write(v); },
    add(d) { write(read() + Math.floor(d || 0)); },
    spend(a) {
      a = Math.floor(a || 0);
      if (a <= 0) return true;
      if (read() < a) return false;
      write(read() - a);
      return true;
    },
    reset(start = DEFAULT) { write(start); },
    onChange(fn) { listeners.add(fn); fn(read()); return () => listeners.delete(fn); },
    key: KEY
  };

  // sync tussen tabs/routes
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) fire();
  });
  CHANNEL.addEventListener("message", (e) => {
    if (e.data?.type === "bits:update") fire();
  });

  // init: als nog niks bestaat, startwaarde instellen
  if (localStorage.getItem(KEY) == null) {
    localStorage.setItem(KEY, String(DEFAULT));
  }

  // expose voor debug
  console.log("[Bits] init met", read(), "Bits");
})();
