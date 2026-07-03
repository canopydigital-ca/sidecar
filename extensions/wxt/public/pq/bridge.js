window.alert = function (msg) {
  console.warn('PQ Internal Alert:', msg);
  if (typeof msg === 'string' && msg.includes('Error loading')) {
    window.parent.postMessage({ type: 'pq:internalError', error: msg }, '*');
    try {
      localStorage.clear();
    } catch {}
  }
};

window.onerror = function (msg, url, line, col, error) {
  console.error('PQ Runtime Error:', msg, error);
  if (typeof msg === 'string' && (msg.includes('Name') || msg.includes('undefined'))) {
    window.parent.postMessage({ type: 'pq:internalError', error: 'GameStateMissing' }, '*');
    return true;
  }
  return false;
};

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('shell-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('#shell-gold') || (target.closest('#Stats') && target.textContent?.includes('Gold'))) {
      window.parent.postMessage({ type: 'pq:uiAction', action: 'gold' }, '*');
    }

    if (target.closest('#Equips') || target.closest('#Inventory')) {
      window.parent.postMessage({ type: 'pq:uiAction', action: 'inventory' }, '*');
    }
  });

  const initGame = () => {
    if (!document.querySelector('.cgpt-window')) return;

    let hasSave = false;
    try {
      if (window.location.hash && window.location.hash.length > 1) {
        hasSave = true;
      } else {
        const roster = JSON.parse(localStorage.getItem('roster') || '{}');
        hasSave = Object.keys(roster).length > 0;
      }
    } catch (error) {
      console.warn('PQ: Roster check failed', error);
    }

    if (hasSave) {
      console.log('PQ: Loading Main Game...');
      if (!window.location.hash || window.location.hash.length <= 1) {
        try {
          const roster = JSON.parse(localStorage.getItem('roster') || '{}');
          const names = Object.keys(roster);
          if (names.length > 0) {
            window.location.hash = names[names.length - 1];
          }
        } catch {}
      }

      const script = document.createElement('script');
      script.src = 'main.js';
      document.body.appendChild(script);
      return;
    }

    console.log('PQ: No save found, loading New Character...');
    const mainDiv = document.getElementById('main');
    if (mainDiv) mainDiv.style.display = 'none';

    const template = document.getElementById('tmpl-newguy');
    if (template instanceof HTMLTemplateElement) {
      const clone = template.content.cloneNode(true);
      document.querySelector('.cgpt-content')?.appendChild(clone);
    }

    if (typeof window.storage !== 'undefined' && typeof window.storage.addToRoster === 'function') {
      const originalAddToRoster = window.storage.addToRoster;
      window.storage.addToRoster = function (newguy, callback) {
        console.log('PQ: Intercepted addToRoster');
        originalAddToRoster.call(window.storage, newguy, function () {
          console.log('PQ: Character saved, reloading...');
          window.location.reload();
          if (typeof callback === 'function') callback();
        });
      };
    }

    const script = document.createElement('script');
    script.src = 'newguy.js';
    document.body.appendChild(script);
  };

  setTimeout(initGame, 10);
});
