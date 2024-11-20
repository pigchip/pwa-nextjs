"use client";
import React, { useState } from 'react';
import AccountDetailsComponent from './AccountDetailsComponent';
import NotificationMenu from '@/components/notifications/NotificationMenu';

const HeaderComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAccountDetailsClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <span
          className="material-icons text-[#6ABDA6] text-3xl cursor-pointer"
          onClick={handleAccountDetailsClick}
        >
          account_circle
        </span>
        <h1 className="text-xl font-semibold text-gray-800">Mobility Time Saver</h1>
      </div>
      <NotificationMenu />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-sm w-full">
            <AccountDetailsComponent onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderComponent;