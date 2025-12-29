// nav-helper.js
// Dynamically generates breadcrumbs and related links based on data/links.json
// Call setupNav() after page loads to initialize

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
      console.log('nav-helper: links.json loaded, found', Object.keys(linksData.pages).length, 'pages');
    }catch(e){
      console.error('nav-helper: Could not load links data:', e.message);
    }
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
        // For parent crumbs, just display as text or link to home
        if(crumb === 'Home'){
          html += '<a href="' + getHomeUrl() + '">Home</a>';
        } else {
          html += '<span>' + crumb + '</span>';
        }
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
