import React, { useState, useEffect } from 'react';

interface AccountDetailsComponentProps {
  onClose: () => void;
}

interface UserDetails {
  id: number;
  name: string;
  lastname_pat: string;
  lastname_mat: string;
  ocuparion: string;
  phone: string;
  curp: string; // Ahora obligatorio
  email: string; // Agregado
}

interface FormErrors {
  name?: string;
  lastname_pat?: string;
  lastname_mat?: string;
  phone?: string;
  password?: string;
  curp?: string; // Agregado
}

// Funciones de validación
const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePassword = (value: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);
const validateName = (value: string) =>
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim()) && value.trim() !== '';
const validatePhone = (value: string) => /^[0-9]{10}$/.test(value);
const validateCURP = (value: string) =>
  /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i.test(value);

const AccountDetailsComponent: React.FC<AccountDetailsComponentProps> = ({
  onClose,
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullFormData, setFullFormData] = useState<{
    id: number;
    name: string;
    lastname_pat: string;
    lastname_mat: string;
    phone: string;
    curp: string; // Agregado
  }>({ id: 0, name: '', lastname_pat: '', lastname_mat: '', phone: '', curp: '' });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await fetch(`${apiUrl}/api/userByEmail/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener los detalles del usuario.');
      } else {
        const data: UserDetails = await response.json();
        console.log('Datos del usuario (GET by Email):', data); // Debug
        setUserDetails(data);
        setFullFormData({
          id: data.id,
          name: data.name,
          lastname_pat: data.lastname_pat,
          lastname_mat: data.lastname_mat,
          phone: data.phone || '',
          curp: data.curp || '',
        });
      }
    } catch (error) {
      setError('No se pudo conectar con la API externa.');
    }

    setLoading(false);
  };

  const handleEditClick = () => {
    setShowPasswordModal(true);
  };

  const handleChangeFull = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFullFormData({ ...fullFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedData = {
      name: fullFormData.name.trim(),
      lastname_pat: fullFormData.lastname_pat.trim(),
      lastname_mat: fullFormData.lastname_mat.trim(),
      phone: fullFormData.phone.trim(),
      curp: fullFormData.curp.trim(), // Agregado
    };

    let hasError = false;
    const errors: FormErrors = {};

    if (!validateName(trimmedData.name)) {
      errors.name = 'El nombre debe contener solo letras y espacios.';
      hasError = true;
    }

    if (!validateName(trimmedData.lastname_pat)) {
      errors.lastname_pat = 'El apellido paterno debe contener solo letras y espacios.';
      hasError = true;
    }

    if (!validateName(trimmedData.lastname_mat)) {
      errors.lastname_mat = 'El apellido materno debe contener solo letras y espacios.';
      hasError = true;
    }

    if (!trimmedData.phone) {
      errors.phone = 'El teléfono es obligatorio.';
      hasError = true;
    } else if (!validatePhone(trimmedData.phone)) {
      errors.phone = 'El teléfono debe contener 10 dígitos.';
      hasError = true;
    }

    if (!trimmedData.curp) {
      errors.curp = 'El CURP es obligatorio.';
      hasError = true;
    } else if (!validateCURP(trimmedData.curp)) {
      errors.curp = 'El CURP no tiene un formato válido.';
      hasError = true;
    }

    setFormErrors(errors);

    if (hasError) {
      return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
      setError('No se encontró un correo electrónico en el localStorage.');
      return;
    }

    if (!userDetails) {
      setError('No se encontraron detalles del usuario.');
      return;
    }

    const { name, lastname_pat, lastname_mat, phone, curp } = trimmedData;

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await fetch(`${apiUrl}/api/update/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userDetails.id,
          name,
          lastname_pat,
          lastname_mat,
          email,
          curp, // Enviado desde el formulario
          ocuparion: "*", // Asignación fija
          password: localPassword,
          phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar el perfil.');
      } else {
        const updatedData: UserDetails = await response.json();
        console.log('Datos actualizados (PUT):', updatedData); // Debug
        setUserDetails(updatedData);
        setFullFormData({
          id: updatedData.id,
          name: updatedData.name,
          lastname_pat: updatedData.lastname_pat,
          lastname_mat: updatedData.lastname_mat,
          phone: updatedData.phone || '',
          curp: updatedData.curp || '',
        });
        setShowEditModal(false);
        setShowPasswordModal(false);
        onClose();
      }
    } catch (error) {
      setError('No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPassword = password.trim();

    let hasError = false;

    if (!validatePassword(trimmedPassword)) {
      setFormErrors({
        password:
          "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número. No se permiten caracteres especiales.",
      });
      hasError = true;
    } else {
      setFormErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
    }

    if (hasError) {
      return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
      setError('No se encontró un correo electrónico en el localStorage.');
      return;
    }

    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: trimmedPassword }),
      });

      const data = await response.json();
      console.log('Respuesta de sign-in:', data); // Debug

      if (response.ok && data.usuario && data.usuario.id !== null) {
        const fetchedUserDetails: UserDetails = {
          id: data.usuario.id,
          name: data.usuario.name,
          lastname_pat: data.usuario.lastname_pat,
          lastname_mat: data.usuario.lastname_mat,
          ocuparion: data.usuario.ocuparion,
          phone: data.usuario.phone || '',
          curp: data.usuario.curp || "*",
          email: data.usuario.email, // Asegurar que email está presente
        };
        setUserDetails(fetchedUserDetails);
        setFullFormData({
          id: fetchedUserDetails.id,
          name: fetchedUserDetails.name,
          lastname_pat: fetchedUserDetails.lastname_pat,
          lastname_mat: fetchedUserDetails.lastname_mat,
          phone: fetchedUserDetails.phone || '',
          curp: fetchedUserDetails.curp || '',
        });
        setLocalPassword(trimmedPassword);
        setShowPasswordModal(false);
        setShowEditModal(true);
      } else {
        setError("Ocurrió un error al verificar la contraseña o al obtener los detalles del usuario. Verifica que los datos sean correctos.");
      }
    } catch (error) {
      setError("No se pudo conectar al servidor. Por favor, verifica tu conexión a Internet.");
    }

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
              <p className="text-gray-700"><strong>Email:</strong> {userDetails.email}</p>
              <p className="text-gray-700"><strong>CURP:</strong> {userDetails.curp || 'No especificado'}</p> {/* Opcional */}
              <p className="text-gray-700"><strong>Ocupación:</strong> {userDetails.ocuparion || '*'}</p>
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
                  <form onSubmit={handlePasswordSubmit}>
                    <label htmlFor="password" className="sr-only">Contraseña</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      className="w-full px-4 py-2 mt-2 border rounded-lg"
                      required
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      Confirmar
                    </button>
                  </form>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
                    style={{ width: '40px', height: '40px' }}
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
                    {/* Nombre */}
                    <div className="flex flex-col mb-4">
                      <label htmlFor="name" className="sr-only">Nombre</label>
                      <div className="flex items-center border rounded-lg w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">person</span>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={fullFormData.name}
                          onChange={handleChangeFull}
                          placeholder="Nombre"
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          required
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Apellido Paterno */}
                    <div className="flex flex-col mb-4">
                      <label htmlFor="lastname_pat" className="sr-only">Apellido Paterno</label>
                      <div className="flex items-center border rounded-lg w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">man</span>
                        <input
                          type="text"
                          id="lastname_pat"
                          name="lastname_pat"
                          value={fullFormData.lastname_pat}
                          onChange={handleChangeFull}
                          placeholder="Apellido Paterno"
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          required
                        />
                      </div>
                      {formErrors.lastname_pat && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.lastname_pat}
                        </p>
                      )}
                    </div>

                    {/* Apellido Materno */}
                    <div className="flex flex-col mb-4">
                      <label htmlFor="lastname_mat" className="sr-only">Apellido Materno</label>
                      <div className="flex items-center border rounded-lg w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">woman</span>
                        <input
                          type="text"
                          id="lastname_mat"
                          name="lastname_mat"
                          value={fullFormData.lastname_mat}
                          onChange={handleChangeFull}
                          placeholder="Apellido Materno"
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          required
                        />
                      </div>
                      {formErrors.lastname_mat && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.lastname_mat}
                        </p>
                      )}
                    </div>

                    {/* CURP */}
                    <div className="flex flex-col mb-4">
                      <label htmlFor="curp" className="sr-only">CURP</label>
                      <div className="flex items-center border rounded-lg w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">assignment_ind</span>
                        <input
                          type="text"
                          id="curp"
                          name="curp"
                          value={fullFormData.curp}
                          onChange={handleChangeFull}
                          placeholder="CURP"
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          required
                        />
                      </div>
                      {formErrors.curp && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.curp}
                        </p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div className="flex flex-col mb-4">
                      <label htmlFor="phone" className="sr-only">Teléfono</label>
                      <div className="flex items-center border rounded-lg w-full px-4 py-2 bg-[#f2f3f2]">
                        <span className="material-icons text-black mr-2">phone</span>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={fullFormData.phone}
                          onChange={handleChangeFull}
                          placeholder="Teléfono"
                          className="flex-1 outline-none bg-[#f2f3f2] text-gray-800 placeholder-[#79807e]"
                          required
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
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
                    style={{ width: '40px', height: '40px' }}
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
          style={{ width: '40px', height: '40px' }}
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
};

export default AccountDetailsComponent;
