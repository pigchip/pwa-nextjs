"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationIcon from '@mui/icons-material/Navigation';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssigmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';

const FooterComponent: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getButtonClass = (paths: string | string[]) => {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.includes(currentPath)
      ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]'
      : 'text-black';
  };

  return (
    <footer className="flex justify-between bg-gray-100 flex-shrink-0 w-full">
      <div className="flex-1 relative">
        <button
          onClick={() => handleNavigation('/navigation')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass('/navigation')}`}
        >
          <NavigationIcon className="mt-2" />
        </button>
      </div>

      {/* Botón Rutas Guardadas */}
      <div className="flex-1 relative">
        <button
          onClick={() => handleNavigation('/search-history')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass('/search-history')}`}
        >
          <BookmarkIcon className="mt-2" />
        </button>
      </div>

{/* Botón Reportes */}
<div className="flex-1 relative">
  <button
    onClick={() => handleNavigation('/reports')}
    className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass(['/reports', '/reports/create', '/reports/status'])}`}
  >
    <AssigmentIcon className="mt-2" />
  </button>
</div>

      {/* Botón Configuración */}
      <div className="flex-1 relative">
        <button
          onClick={() => handleNavigation('/settings')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${getButtonClass('/settings')}`}
        >
          <SettingsIcon className="mt-2" />
        </button>
      </div>
    </footer>
  );
};

export default FooterComponent;