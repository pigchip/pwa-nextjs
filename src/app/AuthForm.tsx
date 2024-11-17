"use client";

import { useState } from 'react';
import Tutorial from './Tutorial';
import React from 'react';
import { useRole } from '@/contexts/RoleContext';

interface ModalContent {
  title: string;
  description: string;
}

export default function AuthForm({
  setShowTutorial,
  showTutorial,
}: {
  setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  showTutorial: boolean;
}) {
  // Estados para registro e inicio de sesión
  const [isRegister, setIsRegister] = useState<boolean>(true);
  const [isUser, setIsUser] = useState<boolean>(true);
  const [isSupervisor, setIsSupervisor] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Estados para campos de registro
  const [name, setName] = useState<string>('');
  const [lastname_pat, setLastnamePat] = useState<string>('');
  const [lastname_mat, setLastnameMat] = useState<string>('');
  const [curp, setCurp] = useState<string>('');
  const [ocuparion, setOccupation] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [id, setId] = useState<string>('');

  // Estados para errores
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const [lastnamePatError, setLastnamePatError] = useState<boolean>(false);
  const [lastnameMatError, setLastnameMatError] = useState<boolean>(false);
  const [curpError, setCurpError] = useState<boolean>(false);
  const [occupationError, setOccupationError] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [idError, setIdError] = useState<boolean>(false);

  // Mensajes de error
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
  const [nameErrorMessage, setNameErrorMessage] = useState<string>('');
  const [lastnamePatErrorMessage, setLastnamePatErrorMessage] = useState<string>('');
  const [lastnameMatErrorMessage, setLastnameMatErrorMessage] = useState<string>('');
  const [curpErrorMessage, setCurpErrorMessage] = useState<string>('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState<string>('');
  const [occupationErrorMessage, setOccupationErrorMessage] = useState<string>('');
  const idErrorMessage: string = "ID no válido";

  // Estados para 2FA
  const [is2FA, setIs2FA] = useState<boolean>(false);
  const [received2FA, setReceived2FA] = useState<number | null>(null);
  const [entered2FA, setEntered2FA] = useState<string>('');
  const [twoFAError, setTwoFAError] = useState<boolean>(false);
  const [twoFAErrorMessage, setTwoFAErrorMessage] = useState<string>('');

  // Estados para el modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', description: '' });

  const { setRole } = useRole();

  // Funciones de validación
  const validateName = (value: string): boolean => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  const validateCurp = (value: string): boolean => /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(value);
  const validatePhone = (value: string): boolean => /^[0-9]{10}$/.test(value);
  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string): boolean => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);
  const validateOccupation = (value: string): boolean => value !== '';
  const validateId = (value: string): boolean => /^\d{10}$/.test(value);

  // Función para abrir el modal
  const openModal = (content: string): void => {
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

  // Función para cerrar el modal
  const closeModal = (): void => {
    setShowModal(false);
    setModalContent({ title: '', description: '' });
  };

  // Manejar clic fuera del modal para cerrarlo
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).id === "modal-overlay") {
      closeModal();
    }
  };

  // Función para abrir el modal con mensajes
  const openSignInModal = (title: string, description: string): void => {
    setModalContent({ title, description });
    setShowModal(true);
  };

  // Función para manejar el envío del formulario de inicio de sesión de Usuario
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    let hasError = false;

    // Validaciones
    if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage("El correo electrónico no es válido.");
      hasError = true;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Guardar el email en localStorage
    localStorage.setItem("email", email);

    // Solicitud a la API
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data._2fa) {
          // Se requiere 2FA
          setReceived2FA(data._2fa);
          setIs2FA(true);
          openSignInModal(
            "Autenticación de Dos Factores",
            "Se ha enviado un código de verificación a tu dispositivo. Por favor, ingresa el código para continuar."
          );
        } else {
          // Inicio de sesión exitoso sin 2FA
          if (data.usuario) {
            openSignInModal(
              "Inicio de Sesión Exitoso",
              `Bienvenido, ${data.usuario.name} ${data.usuario.lastname_pat} ${data.usuario.lastname_mat}.`
            );
          }

          setShowTutorial(true);

          // Limpiar campos
          setEmail('');
          setPassword('');
          setRole("user");
        }
      } else {
        // Error en las credenciales
        openSignInModal(
          "Error de Inicio de Sesión :(",
          "Ocurrió un error al iniciar sesión, verifica que tus datos sean correctos."
        );
      }
    } catch (error) {
      openSignInModal(
        (error instanceof Error ? error.message : 'Unknown error'),
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  };

  // Función para manejar la verificación del código 2FA
  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!entered2FA) {
      setTwoFAError(true);
      setTwoFAErrorMessage("Por favor, ingresa el código 2FA.");
      return;
    }

    if (received2FA === null) {
      setTwoFAError(true);
      setTwoFAErrorMessage("No se ha recibido un código 2FA válido.");
      return;
    }

    if (entered2FA !== received2FA.toString()) {
      setTwoFAError(true);
      setTwoFAErrorMessage("El código de verificación es incorrecto.");
      return;
    }

    // Verificación exitosa de 2FA
    openSignInModal(
      "Autenticación Exitosa",
      "Has ingresado correctamente el código de verificación."
    );

    setShowTutorial(true);

    // Limpiar campos y estados de 2FA
    setEmail('');
    setPassword('');
    setEntered2FA('');
    setIs2FA(false);
    setReceived2FA(null);
    setRole("user");
  };

  // Función para manejar el envío del formulario de inicio de sesión de Supervisor
  const handleSupervisorClick = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    let hasError = false;

    // Validaciones
    if (!validateId(id)) {
      setIdError(true);
      hasError = true;
    } else {
      setIdError(false);
    }

    if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Guardar el ID en localStorage
    localStorage.setItem("id", id);

    // Solicitud a la API
    try {
      const response = await fetch("/api/supervisor/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok) {
          // Inicio de sesión exitoso sin 2FA
          openSignInModal(
            "Inicio de Sesión Exitoso",
            "Bienvenido, Supervisor."
          );

          setShowTutorial(true);

          // Limpiar campos
          setId('');
          setPassword('');
          setRole("supervisor");
      } else {
        // Error en las credenciales
        openSignInModal(
          "Error de Inicio de Sesión :(",
          "Ocurrió un error al iniciar sesión, verifica que tus datos sean correctos."
        );
      }
    } catch (error) {
      openSignInModal(
        "Error de Conexión",
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  };

  // Función para manejar el envío del formulario de inicio de sesión de Administrador
  const handleAdminClick = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    let hasError = false;

    // Validaciones
    if (!validateId(id)) {
      setIdError(true);
      hasError = true;
    } else {
      setIdError(false);
    }

    if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Guardar el ID en localStorage
    localStorage.setItem("id", id);

    // Solicitud a la API
    try {
      const response = await fetch("/api/administrator/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok) {
          // Inicio de sesión exitoso sin 2FA
          openSignInModal(
            "Inicio de Sesión Exitoso",
            "Bienvenido, Administrador."
          );

          setShowTutorial(true);

          // Limpiar campos
          setId('');
          setPassword('');
          setRole("admin");
      } else {
        // Error en las credenciales
        openSignInModal(
          "Error de Inicio de Sesión :(",
          "Ocurrió un error al iniciar sesión, verifica que tus datos sean correctos."
        );
      }
    } catch (error) {
      openSignInModal(
        "Error de Conexión",
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  };

  // Función para manejar el envío del formulario de registro
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    let hasError = false;

    // Validaciones
    if (!validateName(name)) {
      setNameError(true);
      setNameErrorMessage("El nombre solo debe contener letras y espacios.");
      hasError = true;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    if (!validateName(lastname_pat)) {
      setLastnamePatError(true);
      setLastnamePatErrorMessage("El apellido paterno solo debe contener letras y espacios.");
      hasError = true;
    } else {
      setLastnamePatError(false);
      setLastnamePatErrorMessage("");
    }

    if (!validateName(lastname_mat)) {
      setLastnameMatError(true);
      setLastnameMatErrorMessage("El apellido materno solo debe contener letras y espacios.");
      hasError = true;
    } else {
      setLastnameMatError(false);
      setLastnameMatErrorMessage("");
    }

    if (!validateCurp(curp)) {
      setCurpError(true);
      setCurpErrorMessage("La CURP no es válida.");
      hasError = true;
    } else {
      setCurpError(false);
      setCurpErrorMessage("");
    }

    if (!validatePhone(phone)) {
      setPhoneError(true);
      setPhoneErrorMessage("El número de teléfono no es válido.");
      hasError = true;
    } else {
      setPhoneError(false);
      setPhoneErrorMessage("");
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage("El correo electrónico no es válido.");
      hasError = true;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!validateOccupation(ocuparion)) {
      setOccupationError(true);
      setOccupationErrorMessage("La ocupación no es válida.");
      hasError = true;
    } else {
      setOccupationError(false);
      setOccupationErrorMessage("");
    }

    // Validar aceptación de términos y políticas
    const termsAccepted = (document.getElementById("terms-checkbox") as HTMLInputElement)?.checked;
    const privacyAccepted = (document.getElementById("privacy-checkbox") as HTMLInputElement)?.checked;

    if (!termsAccepted || !privacyAccepted) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos y acepta los términos.");
      return;
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Solicitud a la API
    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lastname_pat,
          lastname_mat,
          email,
          curp,
          ocuparion,
          password,
          phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data === true) {
          openSignInModal(
            "Te has registrado con éxito :)",
            "Inicia sesión para empezar a utilizar Mobility Time Saver."
          );

          // Limpiar campos después del éxito
          setName('');
          setLastnamePat('');
          setLastnameMat('');
          setCurp('');
          setOccupation('');
          setPhone('');
          setEmail('');
          setPassword('');
        } else {
          openSignInModal(
            "El registro ha fallado :(",
            "Ocurrió un error al realizar tu registro, verifica que tus datos sean correctos y que sea una cuenta nueva."
          );
        }
      } else {
        // Error en el registro
        openSignInModal(
          "El registro ha fallado :(",
          "Ocurrió un error al realizar tu registro, verifica que tus datos sean correctos y que sea una cuenta nueva."
        );
      }
    } catch (error) {
      openSignInModal(
        "Error de Conexión",
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  };

  // Estilos condicionales para el contenedor
  const inputStyle = isRegister
    ? "flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100"
    : "flex flex-col items-center justify-center h-[93vh] sm:h-screen p-4 bg-gray-100";

  return (
    <>
      {showTutorial ? (
        <Tutorial />
      ) : (
        <div className={inputStyle}>
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
            {/* Título dinámico */}
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Bienvenido a MTS, <br />
              {isRegister ? 'Regístrate ahora :)' : 'Inicia sesión ;)'}
            </h1>

            {/* Botones para cambiar entre Registro e Iniciar Sesión */}
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
                onClick={() => {
                  setIsRegister(true);
                  setIsUser(true);
                  setIsSupervisor(false);
                  setIsAdmin(false);
                }}
                className={`text-lg font-semibold pb-2 transition-colors ${
                  isRegister ? 'text-[#6ABDA6] border-b-2 border-[#6ABDA6]' : 'text-gray-500'
                }`}
              >
                Registro
              </button>
            </div>

            {/* Indicador de Rol */}
            {isUser && (
              <div className='text-[#6ABDA6] text-center mt-2'>
                Usuario
              </div>
            )}
            {!isRegister && (
              <>
                {isSupervisor && (
                  <div className='text-[#005aa7] text-center mt-2'>
                    Supervisor
                  </div>
                )}
                {isAdmin && (
                  <div className='text-[#fe8423] text-center mt-2'>
                    Administrador
                  </div>
                )}
              </>
            )}

            {/* Formulario */}
            <form
              className="space-y-4"
              onSubmit={
                isRegister
                  ? handleSignUp
                  : is2FA
                  ? handle2FASubmit
                  : isUser
                  ? handleSignIn
                  : isSupervisor
                  ? handleSupervisorClick
                  : handleAdminClick
              }
            >
              {isRegister && (
                <>
                  {/* Campos de Registro */}
                  {/* Nombre */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      nameError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">person</span>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {nameError && <p className="text-red-500">{nameErrorMessage}</p>}

                  {/* Apellido Paterno */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      lastnamePatError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">man</span>
                    <input
                      type="text"
                      placeholder="Apellido Paterno"
                      value={lastname_pat}
                      onChange={(e) => {
                        setLastnamePat(e.target.value);
                        setLastnamePatError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {lastnamePatError && <p className="text-red-500">{lastnamePatErrorMessage}</p>}

                  {/* Apellido Materno */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      lastnameMatError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">woman</span>
                    <input
                      type="text"
                      placeholder="Apellido Materno"
                      value={lastname_mat}
                      onChange={(e) => {
                        setLastnameMat(e.target.value);
                        setLastnameMatError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {lastnameMatError && <p className="text-red-500">{lastnameMatErrorMessage}</p>}

                  {/* CURP */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      curpError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">badge</span>
                    <input
                      type="text"
                      placeholder="CURP"
                      value={curp}
                      onChange={(e) => {
                        setCurp(e.target.value);
                        setCurpError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {curpError && <p className="text-red-500">{curpErrorMessage}</p>}

                  {/* Ocupación */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      occupationError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">work</span>
                    <select
                      value={ocuparion}
                      onChange={(e) => {
                        setOccupation(e.target.value);
                        setOccupationError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    >
                      <option value="">Selecciona tu ocupación</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Comerciante">Comerciante</option>
                      <option value="Estudiante">Estudiante</option>
                      <option value="Profesional de la Salud">Profesional de la Salud</option>
                      <option value="Educador">Educador</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Construcción">Construcción</option>
                      <option value="Tecnologías de la Información">Tecnologías de la Información</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  {occupationError && <p className="text-red-500">{occupationErrorMessage}</p>}

                  {/* Teléfono */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      phoneError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">phone</span>
                    <input
                      type="tel"
                      placeholder="Teléfono celular"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {phoneError && <p className="text-red-500">{phoneErrorMessage}</p>}

                  {/* Correo Electrónico */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      emailError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">email</span>
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {emailError && <p className="text-red-500">{emailErrorMessage}</p>}

                  {/* Contraseña */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">lock</span>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {passwordError && <p className="text-red-500">{passwordErrorMessage}</p>}

                  {/* Checkboxes de Términos y Condiciones y Política de Privacidad */}
                  <div className="flex items-center space-x-2 mt-4">
                    <input type="checkbox" id="terms-checkbox" className="h-4 w-4 text-[#6ABDA6] focus:ring-[#6ABDA6] border-gray-300 rounded" />
                    <label htmlFor="terms-checkbox" className="text-sm text-gray-700">
                      Acepto los <span className="text-blue-500 cursor-pointer" onClick={() => openModal("Términos y Condiciones")}>Términos y Condiciones</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" id="privacy-checkbox" className="h-4 w-4 text-[#6ABDA6] focus:ring-[#6ABDA6] border-gray-300 rounded" />
                    <label htmlFor="privacy-checkbox" className="text-sm text-gray-700">
                      He leído y acepto la <span className="text-blue-500 cursor-pointer" onClick={() => openModal("Política de Privacidad Web")}>Política de Privacidad</span>
                    </label>
                  </div>
                </>
              )}

              {!isRegister && !is2FA && (
                <>
                  {/* Campos de Inicio de Sesión */}
                  {isUser ? (
                    <>
                      {/* Correo Electrónico */}
                      <div
                        className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                          emailError ? 'border-red-500' : 'border-gray-300'
                        } focus-within:border-green-500`}
                      >
                        <span className="material-icons text-black mr-2">email</span>
                        <input
                          type="email"
                          placeholder="Correo"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(false);
                          }}
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                        />
                      </div>
                      {emailError && <p className="text-red-500">{emailErrorMessage}</p>}
                    </>
                  ) : (
                    <>
                      {/* ID para Supervisor y Administrador */}
                      <div
                        className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                          idError ? 'border-red-500' : 'border-gray-300'
                        } focus-within:border-green-500`}
                      >
                        <span className="material-icons text-black mr-2">badge</span>
                        <input
                          type="text"
                          placeholder="ID"
                          value={id}
                          onChange={(e) => {
                            setId(e.target.value);
                            setIdError(false);
                          }}
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                        />
                      </div>
                      {idError && <p className="text-red-500">{idErrorMessage}</p>}
                    </>
                  )}

                  {/* Contraseña */}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">lock</span>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {passwordError && <p className="text-red-500">{passwordErrorMessage}</p>}
                </>
              )}

              {/* Campo para 2FA */}
              {is2FA && (
                <>
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      twoFAError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">verified_user</span>
                    <input
                      type="text"
                      placeholder="Código 2FA"
                      value={entered2FA}
                      onChange={(e) => {
                        setEntered2FA(e.target.value);
                        setTwoFAError(false);
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {twoFAError && <p className="text-red-500">{twoFAErrorMessage}</p>}
                </>
              )}

              {/* Botón de Envío */}
              {!is2FA && (
                <button
                  type="submit"
                  className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700"
                >
                  {isRegister ? 'Regístrate aquí' : 'Iniciar sesión'}
                </button>
              )}
              {is2FA && (
                <button
                  type="submit"
                  className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700"
                >
                  Verificar Código
                </button>
              )}
            </form>

            {/* Botones para cambiar de rol en inicio de sesión */}
            {!isRegister && !is2FA && isUser && (
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700"
                  onClick={() => {
                    setIsUser(true);
                    setIsSupervisor(false);
                    setIsAdmin(false);
                  }}
                >
                  ¿Eres Usuario?
                </button>
                <button
                  className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#2f72ac] rounded-lg hover:bg-[#005aa7]"
                  onClick={() => {
                    setIsUser(false);
                    setIsSupervisor(true);
                    setIsAdmin(false);
                  }}
                >
                  ¿Eres Supervisor?
                </button>
                <button
                  className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#fea35a] rounded-lg hover:bg-[#fe8423]"
                  onClick={() => {
                    setIsUser(false);
                    setIsSupervisor(false);
                    setIsAdmin(true);
                  }}
                >
                  ¿Eres Administrador?
                </button>
              </div>
            )}

            {/* Modal */}
            {showModal && (
              <div
                id="modal-overlay"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={handleClickOutside}
              >
                <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg h-auto overflow-y-auto relative max-h-[80vh] sm:max-h-[90vh]">
                  <button
                    className="absolute top-2 right-2 bg-[#6ABDA6] text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
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
        </div>
      )}
    </>
  );
}
