// Production Anti-Inspect & Code Protection Shield
export function initSecurityShield() {
  if (typeof window === 'undefined') return;
  if (!import.meta.env.PROD) return;

  // Disable right-click context menu outside text inputs
  document.addEventListener('contextmenu', (e) => {
    const tag = (e.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    e.preventDefault();
  });

  // Block common DevTools & View-Source shortcuts
  document.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    const ctrlOrCmd = e.ctrlKey || e.metaKey;

    if (
      key === 'f12' ||
      (ctrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
      (ctrlOrCmd && key === 'u')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
}
