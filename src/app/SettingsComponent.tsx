import React from 'react';

const SettingsComponent: React.FC = () => {
  
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.setItem('showTutorial', 'false'); // Cambiar el estado de showTutorial en localStorage
    window.location.reload(); // Recargar la página para simular cierre de sesión
  };

  return (
    <div className="flex flex-col h-full justify-between bg-gray-100 overflow-hidden"> {/* Asegura que el componente no se desborde */}
      {/* Main Content */}
      <div className="flex flex-col flex-grow items-start space-y-6 w-full pl-4 mt-4 overflow-y-auto"> {/* Habilitar scroll dentro si es necesario */}
        {/* User Avatar and Options Title */}
        <div className="flex flex-col items-start space-y-2 w-full"> {/* Alineación a la izquierda */}
          <span className="material-icons text-[#6ABDA6]">account_circle</span>
          <h2 className="text-xl font-bold text-black">Opciones</h2>
        </div>
      </div>

      {/* Bottom Buttons and Image */}
      <div className="pb-4 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4">
          <button className="w-64 py-2 bg-[#602e2e] text-white font-semibold rounded-lg">
            Borrar historial búsquedas
          </button>
          <button className="w-64 py-2 bg-red-400 text-white font-semibold rounded-lg">
            Eliminar cuenta
          </button>
          {/* Botón de cerrar sesión */}
          <button 
            className="w-64 py-2 bg-blue-500 text-white font-semibold rounded-lg"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
        <img src="/icon-512.png" alt="Logo" className="h-16 w-16 mt-4" />
      </div>
    </div>
  );
};

export default SettingsComponent;
