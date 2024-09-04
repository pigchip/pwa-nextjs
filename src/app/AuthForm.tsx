"use client";

import { useState } from 'react';

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", description: "" });

  const openModal = (content: string) => {
    if (content === "Términos y Condiciones") {
      setModalContent({
        title: "Términos y Condiciones",
        description: `
1. Información Resguardada y Su Gestión
Conforme al artículo 16 de la Constitución Política de los Estados Unidos Mexicanos, se establece que toda persona tiene derecho a la protección de sus datos personales. Esto incluye el acceso, rectificación, cancelación y oposición al tratamiento de dichos datos. Asimismo, la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO) regula los principios y procedimientos para garantizar estos derechos.

2. Información Requerida
Para utilizar nuestros servicios, recopilamos la siguiente información:
- Nombre
- Correo Electrónico
- CURP
- Datos Laborales
- Número de Teléfono
- Contraseña
- Ubicación

3. Manejo de la Información
La información proporcionada será utilizada de la siguiente manera:
- Nombre, Correo Electrónico, CURP y Contraseña: Se utilizarán para el registro de usuarios y el inicio de sesión. El CURP servirá para verificar la existencia del usuario.
- Datos Laborales: Serán utilizados únicamente por supervisores y administradores para el inicio de sesión.
- Número de Teléfono: Se empleará para el servicio de autenticación de dos factores (2FA).
- Ubicación: Se utilizará para validar reportes, compartir rutas y calcular tiempos de llegada de transporte.

4. Destrucción de la Información
Los usuarios pueden solicitar la eliminación de sus datos, la cual se efectuará en un plazo de 20 días. Para supervisores o administradores, se conservará información relacionada con evidencias laborales. La eliminación de datos almacenados en el dispositivo se puede realizar desinstalando la aplicación o a través de las opciones dentro de las mismas.

5. Confidencialidad e Integridad de la Información
Adoptamos políticas para asegurar que la información de los usuarios se mantenga confidencial e íntegra durante todos los procesos en los que se utiliza.
        `,
      });
    } else if (content === "Política de Privacidad Web") {
      setModalContent({
        title: "Política de Privacidad Web",
        description: `
1. Marco Legal
Nos comprometemos a proteger los datos personales de nuestros usuarios en conformidad con la Constitución Política de los Estados Unidos Mexicanos y la LGPDPPSO. Esto incluye el manejo, almacenamiento y destrucción de la información personal.

2. Uso de la Información
Recopilamos y utilizamos la información personal para:
- Registro y Autenticación: Verificar la identidad del usuario y permitir el acceso a los servicios.
- Servicios Personalizados: Utilizar la ubicación para proporcionar tiempos de llegada, validación de reportes y compartir rutas.
- Comunicación: Enviar notificaciones y alertas relacionadas con el uso de los servicios.

3. Seguridad de la Información
Implementamos medidas para garantizar la seguridad de la información personal, tal como el cifrado de datos sensibles como contraseñas, CURP, número de teléfono y correo electrónico.

4. Derechos ARCO
Los usuarios pueden ejercer sus derechos de acceso, rectificación, cancelación u oposición (ARCO) respecto a sus datos personales, conforme a la LGPDPPSO. Las solicitudes serán respondidas en un plazo no mayor a 20 días.

5. Políticas de Cifrado
Utilizamos técnicas de cifrado avanzadas para proteger la información almacenada, tanto en nuestras bases de datos como en los dispositivos de los usuarios. Esta información incluye contraseñas, CURP, número de teléfono, correo electrónico y el historial de estaciones y líneas que frecuenta el usuario.
        `,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent({ title: "", description: "" });
  };

  const handleClickOutside = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).id === "modal-overlay") {
      closeModal();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg"> {/* Cambié max-w-sm a max-w-md */}
        {/* Título dinámico */}
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Bienvenido a MTS, <br />
          {isRegister ? 'Regístrate ahora :)' : 'Inicia sesión ;)'}
        </h1>
        <div className="flex justify-between mt-4 border-b border-gray-200">
          <button
            onClick={() => setIsRegister(false)}
            className={`text-lg font-semibold pb-2 transition-colors ${
              !isRegister ? 'text-[#6ABDA6] border-b-2 border-[#6ABDA6]' : 'text-gray-500'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`text-lg font-semibold pb-2 transition-colors ${
              isRegister ? 'text-[#6ABDA6] border-b-2 border-[#6ABDA6]' : 'text-gray-500'
            }`}
          >
            Registro
          </button>
        </div>
        <form className="space-y-4">
          {isRegister && (
            <>
              <div className="relative">
                <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
                  <span className="material-icons text-black">person</span>
                </span>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                />
              </div>
              <div className="relative">
                <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
                  <span className="material-icons text-black">badge</span>
                </span>
                <input
                  type="text"
                  placeholder="CURP"
                  className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                />
              </div>
              <div className="relative">
                <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
                  <span className="material-icons text-black">calendar_today</span>
                </span>
                <input
                  type="date"
                  placeholder="DD/MM/AAAA"
                  className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                  style={{ color: '#79807e' }}
                />
              </div>
              <div className="relative">
                <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
                  <span className="material-icons text-black">phone</span>
                </span>
                <input
                  type="tel"
                  placeholder="Teléfono celular"
                  className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                />
              </div>
            </>
          )}
          <div className="relative">
            <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
              <span className="material-icons text-black">email</span>
            </span>
            <input
              type="email"
              placeholder="Correo"
              className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
            />
          </div>
          <div className="relative">
            <span className="absolute top-1/2 transform -translate-y-[45%] left-0 flex items-center pl-3">
              <span className="material-icons text-black">lock</span>
            </span>
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-4 py-2 pl-10 mt-1 border rounded-lg focus:ring focus:ring-[#6ABDA6] focus:outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
            />
          </div>
          <div className="flex items-start mt-4">
            <input
                type="checkbox"
                className="w-4 h-4 text-[#6ABDA6] border-gray-300 rounded focus:ring-[#6ABDA6] mt-1"
                style={{ width: '16px', height: '16px' }}
            />
            <label className="ml-2 text-sm text-gray-700 leading-tight">
                He leído y acepto los{" "}
                <a href="#" className="text-[#6ABDA6] underline" onClick={() => openModal("Términos y Condiciones")}>
                Términos y Condiciones
                </a>.
            </label>
            </div>
            <div className="flex items-start mt-4">
            <input
                type="checkbox"
                className="w-4 h-4 text-[#6ABDA6] border-gray-300 rounded focus:ring-[#6ABDA6] mt-1"
                style={{ width: '16px', height: '16px' }}
            />
            <label className="ml-2 text-sm text-gray-700 leading-tight">
                ¿Usted ha leído y acepta los términos y condiciones
                para el tratamiento de sus datos personales
                contenidos en la{" "}
                <a href="#" className="text-[#6ABDA6] underline" onClick={() => openModal("Política de Privacidad Web")}>
                Política de Privacidad Web
                </a>?
            </label>
            </div>
          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700"
          >
            {isRegister ? 'Registrate aquí' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          id="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClickOutside}
        >
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg h-96 overflow-y-auto relative">
          <button
            className="fixed top-2 right-2 bg-[#6ABDA6] text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={closeModal}
            >
            <span className="material-icons">close</span>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">{modalContent.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{modalContent.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
