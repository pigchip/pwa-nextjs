import React, { useState, useEffect } from 'react';

interface AccountDetailsComponentProps {
  onClose: () => void;
}

// Validaciones de campos
const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);
const validateName = (value: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
const validatePhone = (value: string) => /^[0-9]{10}$/.test(value);
const validateOccupation = (value: string) => value !== "";

const AccountDetailsComponent: React.FC<AccountDetailsComponentProps> = ({ onClose }) => {
  const [userDetails, setUserDetails] = useState({ name: '', lastname_pat: '', lastname_mat: '', ocuparion: '' , phone: ''});
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');  
  const [localPassword, setLocalPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false); 
  const [fullFormData, setFullFormData] = useState({ name: '', lastname_pat: '', lastname_mat: '', ocuparion: '' , phone: ''});

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail && validateEmail(storedEmail)) {
      fetchUserDetails(storedEmail);
    } else {
      setError('No se encontró un correo electrónico válido en el localStorage.');
    }
  }, []);

  const fetchUserDetails = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/userByEmail/${email}?timestamp=${new Date().getTime()}`, {// Parametro timestap, se puede utilizar para asegurar que no se almacene en caché
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Adicionalmente se puede utilizar para asegurar que no se almacene en caché
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
      } else {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      setError('No se pudo conectar con la API externa.');
    }

    setLoading(false);
};

  

  const handleEditClick = () => {
    setShowPasswordModal(true);
  };

  const handleChangeFull = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFullFormData({ ...fullFormData, [e.target.name]: e.target.value });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;

    if (!validateName(fullFormData.name)) {
      alert("El nombre debe contener solo letras y espacios.");
      hasError = true;
    }

    if (!validateName(fullFormData.lastname_pat)) {
      alert("El apellido paterno debe contener solo letras y espacios.");
      hasError = true;
    }

    if (!validateName(fullFormData.lastname_mat)) {
      alert("El apellido materno debe contener solo letras y espacios.");
      hasError = true;
    }

    if (!validateOccupation(fullFormData.ocuparion)) {
      alert("Selecciona una ocupación válida.");
      hasError = true;
    }

    if (fullFormData.phone && !validatePhone(fullFormData.phone)) {
      alert("El teléfono debe contener 10 dígitos.");
      hasError = true;
    }

    if (hasError) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const email = localStorage.getItem('email');

    // Continuar con la solicitud a la API para actualizar los datos
    const id = 0;
    const curp = "";

    const { name, lastname_pat, lastname_mat, ocuparion, phone } = fullFormData;

    fetch("/api/update/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, lastname_pat, lastname_mat, email, curp, ocuparion, password: localPassword, phone }),
    })

    // Limpiar los campos del formulario
    setFullFormData({ name: '', lastname_pat: '', lastname_mat: '', ocuparion: '', phone: '' });
    setLocalPassword('');

    // Cerrar el modal de edición
    setShowEditModal(false);
    setShowPasswordModal(false);
    onClose();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    let hasError = false;
  
    if (!validatePassword(password)) {
      alert("La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.");
      hasError = true;
    }
  
    if (hasError) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }
  
    const email = localStorage.getItem('email');

    // Continuar con la solicitud a la API para verificar la contraseña
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
        // Caso exitoso
        setUserDetails(data);
        setFullFormData({ name: data.name, lastname_pat: data.lastname_pat, lastname_mat: data.lastname_mat, ocuparion: data.ocuparion, phone: data.phone || '' });
        setShowPasswordModal(false);
        setShowEditModal(true);
      } else {
        // Caso de datos incorrectos o bad request
        alert("Ocurrió un error al verificar la contraseña, verifica que los datos sean correctos.");
      }
    } catch (error) {
      alert("No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet.");
    }

    setLocalPassword(password);

    // Limpiar el campo de contraseña
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <h2 className="text-xl font-bold text-black mb-4 text-center">Detalles de cuenta</h2>
        {loading ? (
          <p className="text-gray-700">Cargando detalles de la cuenta...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : userDetails ? (
          <>
            <div className="space-y-2">
              <p className="text-gray-700"><strong>Nombre:</strong> {userDetails.name}</p>
              <p className="text-gray-700"><strong>Apellido Paterno:</strong> {userDetails.lastname_pat}</p>
              <p className="text-gray-700"><strong>Apellido Materno:</strong> {userDetails.lastname_mat}</p>
              <p className="text-gray-700"><strong>Email:</strong> {localStorage.getItem('email')}</p>
              <p className="text-gray-700"><strong>Ocupación:</strong> {userDetails.ocuparion}</p>
              <p className="text-gray-700"><strong>Teléfono:</strong> {userDetails.phone || 'No especificado'}</p>
            </div>

            <button
              className="flex items-center justify-center w-full px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-400 transition"
              onClick={handleEditClick}
            >
              <span className="material-icons text-lg mr-2">edit</span> Editar
            </button>

            {showPasswordModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black">
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Ingrese su contraseña</h2>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-2 mt-2 border rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit(e);
                      }
                    }}
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
                    style={{ width: '40px', height: '40px', top: '10px', right: '10px' }}
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
            )}


            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Editar Cuenta</h2>
                  <form onSubmit={handleSubmit}>
                    {['name', 'lastname_pat', 'lastname_mat', 'phone'].map((field, index) => (
                      <div key={index} className="flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">
                          {field === 'name' ? 'person' : field === 'lastname_pat' ? 'man' : field === 'lastname_mat' ? 'woman' : field === 'phone' ? 'phone' : ''}
                        </span>
                        <input
                          type="text"
                          name={field}
                          value={fullFormData[field as keyof typeof fullFormData]}
                          onChange={handleChangeFull}
                          placeholder={
                            field === 'name' ? 'Nombre' :
                            field === 'lastname_pat' ? 'Apellido Paterno' :
                            field === 'lastname_mat' ? 'Apellido Materno' :
                            field === 'phone' ? 'Teléfono' :
                            ''
                          }
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                    ))}

                    <div className="flex items-center border rounded-lg mt-1 w-full px-4 py-2 bg-[#f2f3f2]">
                      <span className="material-icons text-black mr-2">work</span>
                      <select
                        name="ocuparion"
                        value={fullFormData.ocuparion}
                        onChange={handleChangeFull}
                        className="flex-1 outline-none bg-[#f2f3f2] text-gray-800"
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

                    <button
                      type="submit"
                      className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#6ABDA6] rounded-lg hover:bg-green-700 transition"
                    >
                      Guardar Cambios
                    </button>
                  </form>

                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
                    style={{ width: '40px', height: '40px', top: '10px', right: '10px' }}
                    onClick={() => setShowEditModal(false)}
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-700">No se encontraron detalles de la cuenta.</p>
        )}

        <button
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
          style={{ width: '40px', height: '40px', top: '10px', right: '10px' }}
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
};

export default AccountDetailsComponent;
