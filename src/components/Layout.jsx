import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);   // true = expandida no desktop
  const [mobileOpen, setMobileOpen] = useState(false);   // controle de mobile separado

  return (
    <div className="h-screen flex overflow-hidden relative" style={{ background: '#02000a' }}>
      {/* Global subtle nebula */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#a855f7] opacity-10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#3b82f6] opacity-10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <Sidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="flex flex-col w-0 flex-1 overflow-hidden transition-all duration-300">
        <Header
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
          toggleMobile={() => setMobileOpen(prev => !prev)}
        />
        
        {/* Mobile menu trigger - fixed when sidebar is closed */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-accent text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200"
            style={{ backgroundColor: '#4C562A' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
