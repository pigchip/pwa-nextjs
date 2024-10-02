import React from 'react';
import { useRouter } from 'next/navigation';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const Container: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
      <div className="flex-none h-16 bg-gray-200">
        <HeaderComponent />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {/* Render your main content here */}
        </div>
      </div>
      <div className="flex-none h-16 bg-gray-200">
        <FooterComponent />
      </div>
    </div>
  );
};

export default Container;