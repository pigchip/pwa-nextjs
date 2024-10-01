// FooterComponent.tsx
import React from 'react';

type ActiveComponent = 'navigation' | 'search-history' | 'reports' | 'settings';

interface FooterProps {
  activeComponent: ActiveComponent;
  setActiveComponent: (component: ActiveComponent) => void;
}

const FooterComponent: React.FC<FooterProps> = ({ activeComponent, setActiveComponent }) => {
  return (
    <footer className="flex justify-between bg-gray-100 flex-shrink-0 w-full"> {/* Evita que los botones crezcan */}
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('navigation')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'navigation' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
        >
          <i className="material-icons mt-2">navigation</i>
        </button>
      </div>
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('search-history')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'search-history' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
        >
          <i className="material-icons mt-2">save</i>
        </button>
      </div>
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('reports')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'reports' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
        >
          <i className="material-icons mt-2">assignment</i>
        </button>
      </div>
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('settings')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'settings' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
        >
          <i className="material-icons mt-2">settings</i>
        </button>
      </div>
    </footer>
  );
};

export default FooterComponent;
