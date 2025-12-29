// nav-helper.js
// Purpose: Render breadcrumb and related-links UI from a centralized JSON
// Data: `data/links.json` — contains `pages` mapping and `titles` shortcuts.
// Behavior:
// - Loads links.json (tries several relative paths for local/served environments)
// - Exposes `window.linksData` and `window.crumbToPage` for debugging
// - Provides `setupNav()` to render breadcrumbs and related links on the page

let linksData = null;  // Global so it's accessible for debugging

(function(){

  async function loadLinksData(){
    try{
      // Try multiple paths for better compatibility
      let paths = ['/data/links.json', 'data/links.json', '../../data/links.json'];
      let res = null;
      
      for(let dataPath of paths){
        try{
          res = await fetch(dataPath, {cache: 'no-cache'});
          if(res.ok){
            console.log('nav-helper: loaded from', dataPath);
            break;
          }
        }catch(e){}
      }
      
      if(!res || !res.ok) throw new Error('Failed to load links.json from any path');
      linksData = await res.json();
      window.linksData = linksData; // Expose globally for debugging
      // Build a map from page titles to page keys for breadcrumb linking
      window.crumbToPage = {};
      Object.keys(linksData.pages || {}).forEach(key => {
        const p = linksData.pages[key];
        if(p && p.title) window.crumbToPage[p.title] = key;
      });
      // Ensure Home and top-level fallbacks exist
      if(!window.crumbToPage.Home) {
        if(linksData.pages['index.html']) window.crumbToPage.Home = 'index.html';
        else if(linksData.titles && linksData.titles.Home) window.crumbToPage.Home = linksData.titles.Home;
      }

      console.log('nav-helper: links.json loaded, found', Object.keys(linksData.pages).length, 'pages');
    }catch(e){
      console.error('nav-helper: Could not load links data:', e.message);
    }
  }

  function computeRelativeHref(fromPath, toPath){
    // fromPath and toPath are workspace-relative paths like 'countries/netherlands/salary.html'
    if(!fromPath) return toPath || '';
    if(!toPath) return '#';

    // Normalize
    const fromParts = fromPath.split('/');
    fromParts.pop(); // remove file
    const toParts = toPath.split('/');

    // If target is absolute-like (starts with /) return as-is
    if(toPath.startsWith('/')) return toPath.substring(1);

    // Find common prefix
    let i = 0;
    while(i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++;

    const up = fromParts.length - i;
    const rel = [];
    for(let j=0;j<up;j++) rel.push('..');
    rel.push(...toParts.slice(i));
    return rel.join('/') || './';
  }

  function getPagePath(){
    // Get current page path and normalize it
    let path = window.location.pathname;
    console.log('nav-helper: pathname =', path);
    
    // Handle file:// protocol
    if(path.includes(':\\')) {
      // Windows file path like: E:\Project\GlobalNRI\countries\netherlands\salary.html
      // Extract relative path from project root
      const match = path.match(/GlobalNRI[\\\/](.+?)$/i);
      if(match) {
        path = match[1].replace(/\\/g, '/');
        console.log('nav-helper: extracted file:// path =', path);
        return path;
      }
    }
    
    // Remove leading slash for web paths
    if(path.startsWith('/')) path = path.substring(1);
    
    // Remove host/domain if present
    if(path.includes('localhost') || path.includes('127.0.0.1')){
      const parts = path.split('/');
      path = parts.slice(parts.findIndex((p, i) => i > 1 && p !== '')).join('/');
    }
    
    // Default to index.html if empty
    if(!path || path === '') {
      path = 'index.html';
    }
    
    console.log('nav-helper: final page path =', path);
    return path;
  }

  function renderBreadcrumb(){
    const breadcrumbContainer = document.querySelector('[data-breadcrumb]');
    if(!breadcrumbContainer) {
      console.warn('nav-helper: breadcrumb container not found');
      return;
    }
    if(!linksData) {
      console.warn('nav-helper: links data not loaded');
      return;
    }

    const pagePath = getPagePath();
    const pageConfig = linksData.pages[pagePath];
    
    if(!pageConfig) {
      console.warn('nav-helper: page config not found for path:', pagePath, 'Available pages:', Object.keys(linksData.pages).slice(0, 5));
      return;
    }
    
    if(!pageConfig.breadcrumb) {
      console.warn('nav-helper: no breadcrumb config for path:', pagePath);
      return;
    }

    let html = '';
    const crumbs = pageConfig.breadcrumb;
    crumbs.forEach((crumb, idx) => {
      if(idx > 0) html += ' / ';
      if(idx === crumbs.length - 1){
        // Last crumb is current page - no link
        html += '<span>' + crumb + '</span>';
      } else {
        // Try to resolve a page key for this crumb
        let targetKey = (window.crumbToPage && window.crumbToPage[crumb]) || null;
        let href = '#';
        if(targetKey){
          href = computeRelativeHref(pagePath, targetKey);
        } else if(linksData.titles && linksData.titles[crumb]){
          // titles may contain relative hrefs already
          href = linksData.titles[crumb];
        } else if(crumb === 'Home'){
          href = computeRelativeHref(pagePath, window.crumbToPage && window.crumbToPage.Home ? window.crumbToPage.Home : 'index.html');
        }

        html += '<a href="' + href + '">' + crumb + '</a>';
      }
    });
    
    breadcrumbContainer.innerHTML = html;
    console.log('nav-helper: breadcrumb rendered for path:', pagePath);
  }

  function getHomeUrl(){
    // Get home URL based on current depth
    const depth = (getPagePath().match(/\//g) || []).length;
    return new Array(depth + 1).join('../') + 'index.html';
  }

  function renderRelatedLinks(){
    const relatedContainer = document.querySelector('[data-related-links]');
    if(!relatedContainer) return;
    if(!linksData) return;

    const pagePath = getPagePath();
    const pageConfig = linksData.pages[pagePath];
    if(!pageConfig || !pageConfig.related || pageConfig.related.length === 0) {
      console.log('nav-helper: no related links for path:', pagePath);
      return;
    }

    let html = '';
    pageConfig.related.forEach(relPath => {
      const relConfig = linksData.pages[relPath];
      if(relConfig){
        html += '<a href="' + relPath + '" class="related-link">' + relConfig.title + '</a>';
      }
    });
    relatedContainer.innerHTML = html;
    console.log('nav-helper: rendered', pageConfig.related.length, 'related links');
  }

  window.setupNav = async function(){
    await loadLinksData();
    renderBreadcrumb();
    renderRelatedLinks();
    console.log('nav-helper: setup complete');
  };

  // Auto-setup if DOM ready
  if(document.readyState !== 'loading'){
    window.setupNav();
  } else {
    document.addEventListener('DOMContentLoaded', window.setupNav);
  }
})();
