(function() {
  try {
    if (sessionStorage.getItem('lr_welcome_session_seen')) return;
    sessionStorage.setItem('lr_welcome_session_seen', '1');
  } catch(e) { /* storage may be unavailable */ }

  const toast = document.createElement('div');
  toast.className = 'welcome-toast';
  toast.setAttribute('role','status');
  toast.setAttribute('aria-live','polite');
  toast.setAttribute('aria-label','Welcome notification');
  toast.tabIndex = -1; 

  toast.innerHTML = `
    <button class="toast-close" aria-label="Dismiss welcome" type="button">×</button>
    <h3><span class="toast-run-icon" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-right:6px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="6" r="3" fill="#ffd166" stroke="#f16c6b" stroke-width="1.3" />
        <path d="M12 9v3l2 3m-2-3-2 2" stroke="#f16c6b" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7 19c.6-2.2 2.4-3.5 5-3.5s4.4 1.3 5 3.5" stroke="#ffd166" stroke-width="1.3" stroke-linecap="round" />
      </svg>
    </span>Welcome!</h3>
    <p>Made with <span style="color:#f16c6b">love</span> by <strong>X</strong>. Enjoy your run.</p>
    <div class="toast-progress" aria-hidden="true"></div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => { try { toast.focus(); } catch(_) {} }, 10);

  const btn = toast.querySelector('.toast-close');
  btn.addEventListener('click', () => toast.remove());
  // Escape key dismissal
  document.addEventListener('keydown', function escHandler(ev) {
    if (ev.key === 'Escape') {
      toast.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 10000);
})();
