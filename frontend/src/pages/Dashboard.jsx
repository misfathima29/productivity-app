// Dashboard.jsx - COMPLETE VERSION
import { useEffect, useRef } from 'react';
import Layout from "./Layout";

const Dashboard = () => {
  const scrollLocked = useRef(true);

  useEffect(() => {
    console.log('🚫 Scroll locking activated');
    
    // IMMEDIATE force scroll to top
    const forceScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also try to scroll any scrollable containers
      document.querySelectorAll('.overflow-auto, .overflow-y-auto').forEach(el => {
        el.scrollTop = 0;
      });
    };

    // Call immediately
    forceScroll();
    
    // Call again after a microtask
    setTimeout(forceScroll, 0);
    
    // Call again after components mount
    setTimeout(forceScroll, 100);
    
    // Prevent ALL scroll events
    const preventScroll = (e) => {
      if (scrollLocked.current) {
        e.preventDefault();
        e.stopPropagation();
        forceScroll();
        return false;
      }
    };

    // Block every possible scroll event
    window.addEventListener('scroll', preventScroll, { passive: false, capture: true });
    window.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    window.addEventListener('keydown', (e) => {
      if (scrollLocked.current && (e.key === 'PageDown' || e.key === 'PageUp' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        forceScroll();
      }
    }, { passive: false });

    // Release after 5 seconds (long enough for everything to load)
    const releaseTimer = setTimeout(() => {
      scrollLocked.current = false;
      window.removeEventListener('scroll', preventScroll, { capture: true });
      window.removeEventListener('wheel', preventScroll, { capture: true });
      window.removeEventListener('touchmove', preventScroll, { capture: true });
      console.log('🔓 Scroll lock released after 5 seconds');
    }, 5000);

    // Prevent browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      clearTimeout(releaseTimer);
      window.removeEventListener('scroll', preventScroll, { capture: true });
      window.removeEventListener('wheel', preventScroll, { capture: true });
      window.removeEventListener('touchmove', preventScroll, { capture: true });
    };
  }, []);

  return <Layout />;
};

export default Dashboard;