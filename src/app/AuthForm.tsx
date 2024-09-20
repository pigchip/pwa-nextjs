"use client";

import { useState } from 'react';
import Tutorial from './Tutorial';

import React from 'react';

export default function AuthForm({ setShowTutorial, showTutorial }: { setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>, showTutorial: boolean }) {
  const [isRegister, setIsRegister] = useState(true);
  const [isUser, setIsUser] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [lastname_pat, setLastnamePat] = useState("");
  const [lastname_mat, setLastnameMat] = useState("");
  const [curp, setCurp] = useState("");
  const [ocuparion, setOccupation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);  
  const [nameError, setNameError] = useState(false);
  const [lastnamePatError, setLastnamePatError] = useState(false);
  const [lastnameMatError, setLastnameMatError] = useState(false);
  const [curpError, setCurpError] = useState(false);
  const [occupationError, setOccupationError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", description: "" });

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [lastnamePatErrorMessage, setLastnamePatErrorMessage] = useState("");
  const [lastnameMatErrorMessage, setLastnameMatErrorMessage] = useState("");
  const [curpErrorMessage, setCurpErrorMessage] = useState("");
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");
  const [occupationErrorMessage, setOccupationErrorMessage] = useState("");

  const [id, setId] = useState("");
  const [idError, setIdError] = useState(false);
  const idErrorMessage = "ID no válido"; 

  const openSignInModal = (title: string, description: string) => {
    setModalContent({ title, description });
    setShowModal(true);
  };  

  const validateName = (value: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  const validateCurp = (value: string) => /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(value);
  const validatePhone = (value: string) => /^[0-9]{10}$/.test(value);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);
  const validateOccupation = (value: string) => value !== "";
  const validateId = (value: string) => /^\d{10}$/.test(value);

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

  const handleSupervisorClick = async (e: React.FormEvent) => {
    // Guardar el email en localStorage
    localStorage.setItem("email", email);

    e.preventDefault();

    let hasError = false;

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
  
    // Continuar con la solicitud a la API
    try {
      const response = await fetch("/api/supervisor/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.id !== null) {
        // Caso exitoso
        openSignInModal(
          "Inicio de Sesión Exitoso",
          `Bienvenido, Supervisor.`
        );

        setShowTutorial(true); // Agregado
  
        // Limpiar los campos después del éxito
        setName("");
        setLastnamePat("");
        setLastnameMat("");
        setCurp("");
        setOccupation("");
        setPhone("");
        setId(""); // Cambiado a id
        setPassword("");
      } else if (response.status === 400 || data.id === null) {
        // Caso de datos incorrectos o bad request
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
  
  const handleAdminClick = async (e: React.FormEvent) => {
    // Guardar el email en localStorage
    localStorage.setItem("email", email);
    
    e.preventDefault();

    let hasError = false;

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
  
    // Continuar con la solicitud a la API
    try {
      const response = await fetch("/api/administrator/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.id !== null) {
        // Caso exitoso
        openSignInModal(
          "Inicio de Sesión Exitoso",
          `Bienvenido, Administrador.`
        );

        setShowTutorial(true); // Agregado
  
        // Limpiar los campos después del éxito
        setName("");
        setLastnamePat("");
        setLastnameMat("");
        setCurp("");
        setOccupation("");
        setPhone("");
        setId(""); // Cambiado a id
        setPassword("");
      } else if (response.status === 400 || data.id === null) {
        // Caso de datos incorrectos o bad request
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage("El correo electrónico no es válido.");
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (!validatePassword(password)) {
      setPasswordError(true);
      setPasswordErrorMessage("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Continuar con la solicitud a la API
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.id !== null) {
        // Guardar el email en localStorage
        localStorage.setItem("email", email);

        // Caso exitoso
        openSignInModal(
          "Inicio de Sesión Exitoso",
          `Bienvenido, ${data.name} ${data.lastname_pat} ${data.lastname_mat}.`
        );
        
        setShowTutorial(true); // Agregado

        // Limpiar los campos después del éxito
        setName("");
        setLastnamePat("");
        setLastnameMat("");
        setCurp("");
        setOccupation("");
        setPhone("");
        setEmail("");
        setPassword("");
      } else if (response.status === 400 || data.id === null) {
        // Caso de datos incorrectos o bad request
        openSignInModal(
          "Error de Inicio de Sesión :(",
          "Ocurrio un error al iniciar sesión, verifica que tus datos sean correctos."
        );
      }
    } catch (error) {
      openSignInModal(
        "Error de Conexión",
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  };  

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

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
    
      
    const termsAccepted = (document.getElementById("terms-checkbox") as HTMLInputElement).checked;
    const privacyAccepted = (document.getElementById("privacy-checkbox") as HTMLInputElement).checked;
  
    if (!termsAccepted || !privacyAccepted) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos y acepta los términos.");
      return;
    }

    if (hasError) {
      openSignInModal("Campos requeridos", "Por favor, completa todos los campos correctamente.");
      return;
    }

    // Continuar con la solicitud a la API
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

      if (response.ok && data.id !== null) {
        if(data == true){
          openSignInModal(
            "Te has registrado con éxito :)", 
            `Inicia sesión para empezar a utilizar Mobility Time Saver`
          );

          // Limpiar los campos después del éxito
          setName("");
          setLastnamePat("");
          setLastnameMat("");
          setCurp("");
          setOccupation("");
          setPhone("");
          setEmail("");
          setPassword("");
        }
        else{
          openSignInModal(
            "El registro ha fallado :(",
            "Ocurrió un error al realizar tu registro, verifica que tus datos sean correctos y sea una cuenta nueva."
        );
      }
      } else if (response.status === 400 || data.id === null) {
        // Caso de datos incorrectos o bad request
        openSignInModal(
          "El registro ha fallado :(",
          "Ocurrió un error al realizar tu registro, verifica que tus datos sean correctos y sea una cuenta nueva."
        );
      }
    } catch (error) {
      openSignInModal(
        "Error de Conexión",
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet."
      );
    }
  }; 

  const inputStyle = isRegister
  ? "flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100"
  : "flex flex-col items-center justify-center h-[93vh] sm:h-screen p-4 bg-gray-100";

  return (
    <>
      {showTutorial ? (
        <Tutorial />
      ) : (
        <div className={inputStyle}>
          <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg"> {/* Cambié max-w-sm a max-w-md */}
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
            {isUser && (
                  <div className='text-[#6ABDA6] text-center'>
                    Usuario
                  </div>
                )}
            {!isRegister && (
              <>
                {isSupervisor && (
                  <div className='text-[#005aa7] text-center'>
                    Supervisor
                  </div>
                )}
                {isAdmin && (
                  <div className='text-[#fe8423] text-center'>
                    Administrador
                  </div>
                )}
              </>
            )}
            <form className="space-y-4" onSubmit={isRegister ? handleSignUp : handleSignIn}>
              {isRegister && (
                <>
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
                        setName(e.target.value)
                        setNameError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {nameError && <p className="text-red-500">{nameErrorMessage}</p>}
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
                        setLastnamePat(e.target.value)
                        setLastnamePatError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {lastnamePatError && <p className="text-red-500">{lastnamePatErrorMessage}</p>}
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
                      onChange={(e) =>{
                        setLastnameMat(e.target.value)
                        setLastnameMatError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {lastnamePatError && <p className="text-red-500">{lastnameMatErrorMessage}</p>}
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
                        setCurp(e.target.value)
                        setCurpError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {curpError && <p className="text-red-500">{curpErrorMessage}</p>}
                  <div
                    className={`flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2] ${
                      occupationError ? 'border-red-500' : 'border-gray-300'
                    } focus-within:border-green-500`}
                  >
                    <span className="material-icons text-black mr-2">work</span>
                    <select
                      value={ocuparion}
                      onChange={(e) => {
                        setOccupation(e.target.value)
                        setOccupationError(false); // Resetea el error al escribir
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
                        setPhone(e.target.value)
                        setPhoneError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {phoneError && <p className="text-red-500">{phoneErrorMessage}</p>}
                </>
              )}
              {isUser ? (
                <>
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
                        setEmailError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {emailError && <p className="text-red-500">{emailErrorMessage}</p>}
                </>
              ) : (
                <>
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
                        setIdError(false); // Resetea el error al escribir
                      }}
                      className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                    />
                  </div>
                  {idError && <p className="text-red-500">{idErrorMessage}</p>}
                </>
              )}
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
                    setPasswordError(false); // Resetea el error al escribir
                  }}
                  className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                />
              </div>
              {passwordError && <p className="text-red-500">{passwordErrorMessage}</p>}
              {isRegister && (
              <>
                <div className="flex items-start mt-4">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    className="w-4 h-4 text-[#6ABDA6] border-gray-300 rounded focus:ring-[#6ABDA6] mt-1"
                  />
                  <label className="ml-2 text-sm text-gray-700 leading-tight">
                    He leído y acepto los{" "}
                    <a
                      href="#"
                      className="text-[#6ABDA6] underline"
                      onClick={() => openModal("Términos y Condiciones")}
                    >
                      Términos y Condiciones
                    </a>.
                  </label>
                </div>

                <div className="flex items-start mt-4">
                  <input
                    id="privacy-checkbox"
                    type="checkbox"
                    className="w-4 h-4 text-[#6ABDA6] border-gray-300 rounded focus:ring-[#6ABDA6] mt-1"
                  />
                  <label className="ml-2 text-sm text-gray-700 leading-tight">
                    ¿Usted ha leído y acepta los términos y condiciones para el tratamiento
                    de sus datos personales contenidos en la{" "}
                    <a
                      href="#"
                      className="text-[#6ABDA6] underline"
                      onClick={() => openModal("Política de Privacidad Web")}
                    >
                      Política de Privacidad Web
                    </a>?
                  </label>
                </div>
              </>
            )}

            {isUser && (
              <button
                type="submit"
                className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700"
              >
                {isRegister ? 'Regístrate aquí' : 'Iniciar sesión'}
              </button>
            )}

            {isSupervisor && (
              <button
                type="submit"
                className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#2f72ac] rounded-lg hover:bg-[#005aa7]"
                onClick={handleSupervisorClick}
              >
                Iniciar sesión
              </button>
            )}

            {isAdmin && (
              <button
                type="submit"
                className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#fea35a] rounded-lg hover:bg-[#fe8423]"
                onClick={handleAdminClick}
              >
                Iniciar sesión
              </button>
            )}

            {!isRegister && !isUser && (
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
            )}

            {!isRegister && !isSupervisor && (
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
            )}

            {!isRegister && !isAdmin && (
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
            )}
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
      )}
    </>
  );
}
