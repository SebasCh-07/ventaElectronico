(function(){
  function initStickyHeader(){
    const header = document.querySelector('.site-header');
    if(!header) return;
    
    let lastScrollY = window.scrollY;
    
    function updateHeader(){
      const currentScrollY = window.scrollY;
      
      if(currentScrollY > 50){
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    function onScroll(){
      if(!ticking){
        requestAnimationFrame(() => {
          updateHeader();
          ticking = false;
        });
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  
  document.addEventListener('DOMContentLoaded', initStickyHeader);
})();
