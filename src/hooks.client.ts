// Polyfill crypto.randomUUID for older browsers so UI libs/notifications don't crash
(function () {
  const g: any = globalThis as any;
  if (!g.crypto) g.crypto = {};
  if (typeof g.crypto.randomUUID !== 'function') {
    g.crypto.randomUUID = function randomUUID() {
      const b = new Uint8Array(16);
      if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
        g.crypto.getRandomValues(b);
      } else {
        for (let i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0;
      }
      b[6] = (b[6] & 0x0f) | 0x40; // version 4
      b[8] = (b[8] & 0x3f) | 0x80; // variant
      const h = (n: number) => n.toString(16).padStart(2, '0');
      const s = Array.from(b, h).join('');
      return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
    };
  }
})();
