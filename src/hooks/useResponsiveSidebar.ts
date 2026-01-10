import { useState, useEffect } from 'react';

export const useResponsiveSidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On desktop, keep sidebar open by default
      // On mobile, keep sidebar closed by default
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  return {
    isMobile,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    shouldShowSidebar: isMobile ? sidebarOpen : true
  };
};