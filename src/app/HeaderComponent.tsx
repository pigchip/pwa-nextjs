import React, { useState } from 'react';
import AccountDetailsComponent from './AccountDetailsComponent';

const HeaderComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAccountDetailsClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="bg-[#f3f4f6] text-white p-5">
      <div className="flex flex-col items-start space-y-6 w-full ">
        <div className="flex flex-col items-start space-y-2 w-full">
          <span
            className="material-icons text-[#6ABDA6] text-3xl cursor-pointer"
            onClick={handleAccountDetailsClick}
          >
            account_circle
          </span>
        </div>
      </div>

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
