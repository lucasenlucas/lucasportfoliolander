<script>
;(() => {
  const KEY = "sgdc.bits";
  const CHANNEL = new BroadcastChannel("sgdc-bits");
  const DEFAULT = 100; // startwaarde

  const listeners = new Set();
  const read = () => {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) ? v : DEFAULT;
  };
  const write = (val) => {
    const v = Math.max(0, Math.floor(val));
    localStorage.setItem(KEY, String(v));
    CHANNEL.postMessage({ type: "bits:update", value: v });
  };

  window.Bits = {
    get() { return read(); },
    set(v) { write(v); fire(); },
    add(d) { window.Bits.set(read() + Math.floor(d || 0)); },
    canSpend(a) { return read() >= Math.floor(a || 0); },
    spend(a) {
      a = Math.floor(a || 0);
      if (a <= 0) return true;
      if (!window.Bits.canSpend(a)) return false;
      window.Bits.set(read() - a);
      return true;
    },
    onChange(fn) { listeners.add(fn); fn(read()); return () => listeners.delete(fn); },
    reset(start = DEFAULT) { window.Bits.set(start); },
    key: KEY
  };

  function fire(){ const v = read(); listeners.forEach(fn => fn(v)); }

  // sync tussen tabs/routes
  window.addEventListener("storage", (e) => { if (e.key === KEY) fire(); });
  CHANNEL.addEventListener("message", (e) => { if (e.data?.type === "bits:update") fire(); });

  // init
  if (localStorage.getItem(KEY) == null) write(DEFAULT);
})();
</script>
