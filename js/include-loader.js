// include-loader.js
// Purpose: Load HTML fragments declared with `data-include` into pages.
// - Handles file:// detection and warns about starting a local server.
// - Initializes navbar toggle and simple site search filter after includes load.
(function(){
  // If page is opened via file://, browsers block fetch/XHR for local files.
  // Detect and show a helpful message instead of repeatedly trying to fetch.
  if(location.protocol === 'file:'){
    const warn = document.createElement('div');
    warn.style.background = '#FFFAEB';
    warn.style.border = '1px solid #FDE68A';
    warn.style.color = '#92400E';
    warn.style.padding = '12px';
    warn.style.fontSize = '14px';
    warn.style.textAlign = 'center';
    warn.textContent = 'Navigation include loader blocked when opening files directly. Run a local server (for example: `python -m http.server 8000`) and open http://localhost:8000 to enable the shared navbar.';
    document.addEventListener('DOMContentLoaded', ()=>{ document.body.insertBefore(warn, document.body.firstChild); });
    console.error('Include loader: fetch is blocked on file:// pages. Serve the site over http(s) to enable includes.');
    // Do not attempt to fetch includes under file://
    return;
  }

  async function loadIncludes(){
    const nodes = document.querySelectorAll('[data-include]');
    for(const node of nodes){
      const url = node.getAttribute('data-include');
      try{
        const res = await fetch(url, {cache: 'no-cache'});
        if(!res.ok) throw new Error('Failed to load '+url);
        const html = await res.text();
        node.innerHTML = html;
      }catch(e){
        console.error(e);
      }
    }
    initNav();
    initSearchFilter();
  }

  function initNav(){
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mainMenu');
    if(toggle && menu){
      toggle.addEventListener('click', ()=>{
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
    }
  }

  function initSearchFilter(){
    const input = document.getElementById('siteSearch');
    const clearBtn = document.getElementById('clearSearch');
    if(!input) return;
    function filter(){
      const q = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.grid .card');
      cards.forEach(card=>{
        const title = (card.querySelector('h3')||{}).textContent||'';
        const desc = (card.querySelector('p')||{}).textContent||'';
        const text = (title+' '+desc).toLowerCase();
        card.style.display = q && !text.includes(q) ? 'none' : '';
      });
    }
    input.addEventListener('input', filter);
    if(clearBtn) clearBtn.addEventListener('click', ()=>{input.value=''; input.dispatchEvent(new Event('input'));});
  }

  // Run on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadIncludes);
  else loadIncludes();
})();
