import React from 'react';
import HeaderComponent from '../app/HeaderComponent';
import FooterComponent from '../app/FooterComponent';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
      <div className="flex-none h-16 bg-gray-200">
        <HeaderComponent />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {children}
        </div>
      </div>
      <div className="flex-none h-16 bg-gray-200">
        <FooterComponent />
      </div>
    </div>
  );
};

export default Layout;