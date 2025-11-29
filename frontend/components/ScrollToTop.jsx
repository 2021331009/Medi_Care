//Enhance UX: scroll to top on normal navigation, preserve on back/forward "
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top if it's a PUSH navigation (forward/normal navigation)
    // For POP (back/forward button) navigation, maintain scroll position
    if (navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop; 