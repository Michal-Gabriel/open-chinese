(() => {
  const namespace = "open-chinese";
  const key = "site-visits";
  const cacheKey = "open-chinese:visit-count-cache";
  const lastHitKey = "open-chinese:visit-count-last-hit";
  const hitCooldownMs = 30 * 60 * 1000;

  function safeRead(storageKey, fallback = null) {
    try {
      return localStorage.getItem(storageKey) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function safeWrite(storageKey, value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Ignore storage failures. The live counter can still render from the network.
    }
  }

  function readCachedCount() {
    const raw = safeRead(cacheKey, "");
    if (!raw) return 0;

    try {
      const parsed = JSON.parse(raw);
      const value = Number(parsed?.count ?? parsed?.value ?? parsed);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    }
  }

  function writeCachedCount(count) {
    const value = Number.isFinite(count) && count >= 0 ? count : 0;
    safeWrite(cacheKey, JSON.stringify({ count: value, updatedAt: Date.now() }));
    return value;
  }

  function readLastHit() {
    const raw = safeRead(lastHitKey, "0");
    const value = Number.parseInt(raw || "0", 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function shouldCountVisit() {
    return Date.now() - readLastHit() >= hitCooldownMs;
  }

  function markVisitHit() {
    safeWrite(lastHitKey, String(Date.now()));
  }

  function renderCount(count = readCachedCount()) {
    document.querySelectorAll("[data-visit-count]").forEach((node) => {
      node.textContent = String(count);
    });
  }

  async function fetchRemoteCount() {
    const response = await fetch(`https://api.countapi.xyz/get/${namespace}/${key}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not read visit counter.");
    }

    const data = await response.json();
    const count = Number(data?.value ?? data?.count ?? 0);

    if (!Number.isFinite(count) || count < 0) {
      throw new Error("Unexpected visit counter response.");
    }

    return writeCachedCount(count);
  }

  async function hitRemoteCount() {
    const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not update visit counter.");
    }

    const data = await response.json();
    const count = Number(data?.value ?? data?.count ?? 0);

    if (!Number.isFinite(count) || count < 0) {
      throw new Error("Unexpected visit counter response.");
    }

    markVisitHit();
    return writeCachedCount(count);
  }

  async function refresh() {
    let count = readCachedCount();

    try {
      count = shouldCountVisit() ? await hitRemoteCount() : await fetchRemoteCount();
    } catch {
      count = readCachedCount();
    }

    renderCount(count);
    return count;
  }

  window.OpenChineseVisits = {
    refresh,
    render: () => renderCount(readCachedCount()),
    readCount: readCachedCount,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      refresh();
    }, { once: true });
  } else {
    refresh();
  }
})();
