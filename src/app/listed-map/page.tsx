"use client";

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout'; // Importamos el Layout
import Image from 'next/image'; // Si necesitas usar imágenes en el componente
import { Close } from '@mui/icons-material';
import { Opinion } from '@/types/opinion';
import { Line, Station } from '@/types';
import { Schedule } from '@/types/schedule';
import { ApiRoute } from '@/types/line';

const TransportPage: React.FC = () => {
  const [agencies, setAgencies] = useState<string[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [lineStations, setLineStations] = useState<Station[]>([]);
  const [selectedLineStation, setSelectedLineStation] = useState<Station | null>(null);
  const [userOpinions, setUserOpinions] = useState<Opinion[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [showUserOpinionsModal, setShowUserOpinionsModal] = useState<boolean>(false);
  const [editingOpinion, setEditingOpinion] = useState<Opinion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para validar email
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    // Obtener el ID del usuario mediante su email
    const storedEmail = localStorage.getItem('email');
    if (storedEmail && validateEmail(storedEmail)) {
      fetchUserId(storedEmail);
    } else {
      alert('No se encontró un correo electrónico válido en el localStorage.');
    }
  }, []);

  const fetchUserId = async (email: string) => {
    try {
      const response = await fetch(`/api/userByEmail/${email}?timestamp=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
      } else {
        const data = await response.json();
        setUserId(data.id);
      }
    } catch (error) {
      setError('No se pudo conectar con la API externa.');
    }
  };

  useEffect(() => {
    async function fetchData() {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const stationsResponse = await fetch(`${apiUrl}/api/stations`);
      const stationsData: Station[] = await stationsResponse.json();
      setStations(stationsData);

      const linesResponse = await fetch(`${apiUrl}/api/lines`);
      const linesData: Line[] = await linesResponse.json();
      setLines(linesData);

      const uniqueAgencies = Array.from(new Set([...stationsData, ...linesData].map(item => item.transport)));
      setAgencies(uniqueAgencies);
    }
    fetchData();
  }, []);

  const handleAgencyChange = (agency: string) => {
    setSelectedAgency(agency);
    setSelectedStation(null);
    setSelectedLine(null);
    setLineStations([]);
    setSelectedLineStation(null);
  };

  const handleLineChange = async (lineId: number) => {
    const line = lines.find(line => line.id === lineId) || null;
    setSelectedLine(line);
    setSelectedStation(null);
    setSelectedLineStation(null);
    if (line) {
      try {
        // Obtener estaciones de la línea
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
        const stationsResponse = await fetch(`${apiUrl}api/lines/${lineId}/stations`);
        const stationsData: Station[] = await stationsResponse.json();
        setLineStations(stationsData);

        // Obtener rutas de la línea
        const routesResponse = await fetch(`${apiUrl}/api/lines/${lineId}/routes`);
        const routesData: ApiRoute[] = await routesResponse.json();

        // Obtener horarios de las rutas
        for (const route of routesData) {
          const schedulesResponse = await fetch(`${apiUrl}/api/routes/${route.id}/schedules`);
          const schedulesData: Schedule[] = await schedulesResponse.json();
          route.schedules = schedulesData;
        }

        line.routes = routesData;

        // Obtener opiniones de la línea
        const opinionsResponse = await fetch(`${apiUrl}/api/lines/${lineId}/opinions`);
        const opinionsData: Opinion[] = await opinionsResponse.json();
        line.opinions = opinionsData;

      } catch (error) {
        console.error("Error al obtener datos de la línea:", error);
      }
    }
  };

  const handleLineStationChange = async (stationId: number) => {
    const station = lineStations.find(station => station.id === stationId) || null;
    setSelectedLineStation(station);
    if (station) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
        // Obtener transbordos de la estación
        const transfersResponse = await fetch(`${apiUrl}/api/stations/${stationId}/transfers`);
        const transfersData: Station[] = await transfersResponse.json();
        station.transfers = transfersData;

        // Obtener opiniones de la estación
        const opinionsResponse = await fetch(`${apiUrl}/api/stations/${stationId}/opinions`);
        const opinionsData: Opinion[] = await opinionsResponse.json();
        station.opinions = opinionsData;

      } catch (error) {
        console.error("Error al obtener datos de la estación:", error);
      }
    }
  };

  function getAgencyIcon(agencyName: string): string {
    switch (agencyName) {
      case 'Metrobús':
        return '/icons/metrobus.svg';
      case 'Red de Transporte de Pasajeros':
        return '/icons/rtp.svg';
      case 'Servicio de Transportes Eléctricos':
        return '/icons/ste.svg';
      case 'Cablebús':
      case 'Cablebus':
        return '/icons/cablebus.svg';
      case 'Ferrocarriles Suburbanos':
        return '/icons/ferro.svg';
      case 'Corredores Concesionados':
        return '/icons/corredores.svg';
      case 'Tren Ligero':
        return '/icons/ste.svg';
      case 'Sistema de Transporte Colectivo Metro':
        return '/icons/metro.svg';
      case 'Tren El Insurgente':
        return '/icons/tei.svg';
      case 'Trolebús':
        return '/icons/ste.svg';
      case 'Servicio de Tren Ligero':
        return '/icons/ste.svg';
      default:
        return '/icons/default.svg';
    }
  }

  // Función para manejar el envío de opiniones
  const handleOpinionSubmit = async (event: React.FormEvent<HTMLFormElement>, isStation: boolean, id: number) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const body = formData.get('body') as string;
    const type = formData.get('type') as string;

    if (!userId || !body || !type) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    if (body.length > 60) {
      alert('El mensaje no puede tener más de 60 caracteres.');
      return;
    }

    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0];
    const time = currentDate.toTimeString().split(' ')[0];

    const opinionData = {
      user: userId,
      date,
      time,
      body,
      type,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}/api/${isStation ? 'stations' : 'lines'}/${id}/opinions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opinionData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la opinión.');
      }

      alert('Opinión enviada correctamente.');

      // Actualizar las opiniones
      if (isStation && selectedLineStation) {
        setSelectedLineStation({
          ...selectedLineStation,
          opinions: [...(selectedLineStation.opinions || []), { ...opinionData, id: Date.now() }],
        });
      } else if (selectedLine) {
        setSelectedLine({
          ...selectedLine,
          opinions: [...(selectedLine.opinions || []), { ...opinionData, id: Date.now() }],
        });
      }

      // Resetear el formulario
      form.reset();

    } catch (err) {
      console.error('Error al enviar la opinión:', err);
    }
  };

  // Funciones para manejar la sección "Mis comentarios"
  const handleUserOpinions = async () => {
    if (!userId) {
      alert('No se encontró el ID de usuario.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}/api/user/${userId}/opinions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las opiniones del usuario.');
      }

      const data: Opinion[] = await response.json();
      setUserOpinions(data);

    } catch (err) {
      console.error('Error al obtener las opiniones del usuario:', err);
    }
  };

  const handleEditOpinion = (opinion: Opinion) => {
    setEditingOpinion(opinion);
  };

  const handleDeleteOpinion = async (opinionId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}/api/opinions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: opinionId }),
      });

      if (!response.ok) {
        throw new Error('Error al borrar la opinión.');
      }

      alert('Opinión borrada correctamente.');
      setUserOpinions(userOpinions.filter(op => op.id !== opinionId));

    } catch (err) {
      console.error('Error al borrar la opinión:', err);
    }
  };

  const handleUpdateOpinion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingOpinion) return;

    const formData = new FormData(event.currentTarget);
    const body = formData.get('body') as string;
    const type = formData.get('type') as string;

    if (!body || !type) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    if (body.length > 60) {
      alert('El mensaje no puede tener más de 60 caracteres.');
      return;
    }

    const opinionData = {
      id: editingOpinion.id,
      body,
      type,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}/api/opinions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opinionData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la opinión.');
      }

      alert('Opinión actualizada correctamente.');

      setUserOpinions(userOpinions.map(op => op.id === editingOpinion.id ? { ...op, body, type } : op));
      setEditingOpinion(null);

    } catch (err) {
      console.error('Error al actualizar la opinión:', err);
    }
  };

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-center text-2xl font-bold mb-5">Información de Transporte</h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-4 mb-8">
          {/* Selector de Agencia */}
          <label className="flex flex-col">
            <span className="font-semibold">Seleccione Agencia:</span>
            <select
              onChange={(e) => handleAgencyChange(e.target.value)}
              value={selectedAgency || ""}
              className="border rounded px-3 py-2 mt-1"
            >
              <option value="">Seleccionar agencia</option>
              {agencies.map((agency, index) => (
                <option key={index} value={agency}>{agency}</option>
              ))}
            </select>
          </label>

          {/* Selector de Línea */}
          {selectedAgency && (
            <label className="flex flex-col">
              <span className="font-semibold">Seleccione Línea:</span>
              <select
                onChange={(e) => handleLineChange(Number(e.target.value))}
                value={selectedLine ? selectedLine.id : ""}
                className="border rounded px-3 py-2 mt-1"
              >
                <option value="">Seleccionar línea</option>
                {lines
                  .filter(line => line.transport === selectedAgency)
                  .map(line => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
              </select>
            </label>
          )}

          {/* Selector de Estación de Línea */}
          {selectedLine && lineStations.length > 0 && (
            <label className="flex flex-col">
              <span className="font-semibold">Estaciones de la Línea:</span>
              <select
                onChange={(e) => handleLineStationChange(Number(e.target.value))}
                value={selectedLineStation ? selectedLineStation.id : ""}
                className="border rounded px-3 py-2 mt-1"
              >
                <option value="">Seleccionar estación</option>
                {lineStations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </label>
          )}

          {/* Botón "Mis comentarios" */}
          <button
            onClick={() => setShowUserOpinionsModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Mis comentarios
          </button>
        </div>

        <div className="text-left p-5 border border-gray-300 rounded-lg">
          {/* Detalles de la Línea Seleccionada */}
          {selectedLine && (
            <>
              <h2 className="text-xl font-bold mb-3">Detalles de la Línea</h2>
              <Image src={getAgencyIcon(selectedLine.transport)} alt={selectedLine.transport} width={40} height={40} className="mb-2" />
              <p><strong>Nombre:</strong> {selectedLine.name}</p>
              <p><strong>Transporte:</strong> {selectedLine.transport}</p>
              <p><strong>Incidente:</strong> {selectedLine.incident || 'No hay incidentes reportados'}</p>
              <p><strong>Velocidad:</strong> {selectedLine.speed} km/h</p>
              <p><strong>Información:</strong> {selectedLine.information || 'No disponible'}</p>

              {/* Rutas y Horarios de la Línea */}
              {selectedLine.routes && selectedLine.routes.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4">Rutas y Horarios:</h3>
                  {selectedLine.routes.map(route => (
                    <div key={route.id} className="mt-2">
                      <p><strong>Ruta:</strong> {route.name}</p>
                      <p><strong>Precio:</strong> ${route.price}</p>
                      {route.schedules && route.schedules.length > 0 && (
                        <ul className="list-disc list-inside">
                          {route.schedules.map(schedule => (
                            <li key={schedule.id}>
                              {schedule.day}: {schedule.open} - {schedule.close}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Opiniones de la Línea */}
              {selectedLine.opinions && selectedLine.opinions.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4">Opiniones:</h3>
                  <ul className="list-disc list-inside">
                    {selectedLine.opinions.map(opinion => (
                      <li key={opinion.id} className="mt-2">
                        <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                        <p>{opinion.body}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Formulario para agregar opinión a la línea */}
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Agregar comentario</h4>
                <form onSubmit={(e) => handleOpinionSubmit(e, false, selectedLine.id)} className="space-y-3">
                  <div>
                    <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                    <input type="text" name="body" maxLength={60} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold">Tipo:</label>
                    <select name="type" defaultValue="Agradecimiento" className="w-full border rounded px-3 py-2">
                      <option value="Sugerencia">Sugerencia</option>
                      <option value="Queja">Queja</option>
                      <option value="Agradecimiento">Agradecimiento</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                    Enviar comentario
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Detalles de la Estación de Línea Seleccionada */}
          {selectedLineStation && (
            <>
              <h2 className="text-xl font-bold mt-5 mb-3">Detalles de la Estación de Línea</h2>
              <Image src={getAgencyIcon(selectedLineStation.transport)} alt={selectedLineStation.transport} width={40} height={40} className="mb-2" />
              <p><strong>Nombre:</strong> {selectedLineStation.name}</p>
              <p><strong>Línea:</strong> {selectedLineStation.line}</p>
              <p><strong>Incidente:</strong> {selectedLineStation.incident || 'No hay incidentes reportados'}</p>
              <p><strong>Servicios:</strong> {selectedLineStation.services || 'No disponible'}</p>
              <p><strong>Información:</strong> {selectedLineStation.information || 'No disponible'}</p>

              {/* Transbordos de la Estación */}
              {selectedLineStation.transfers && selectedLineStation.transfers.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4">Transbordos:</h3>
                  <ul className="list-disc list-inside">
                    {selectedLineStation.transfers.map(transfer => (
                      <li key={transfer.id}>
                        {transfer.name} - Línea {transfer.line}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Opiniones de la Estación */}
              {selectedLineStation.opinions && selectedLineStation.opinions.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4">Opiniones:</h3>
                  <ul className="list-disc list-inside">
                    {selectedLineStation.opinions.map(opinion => (
                      <li key={opinion.id} className="mt-2">
                        <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                        <p>{opinion.body}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Formulario para agregar opinión a la estación */}
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Agregar comentario</h4>
                <form onSubmit={(e) => handleOpinionSubmit(e, true, selectedLineStation.id)} className="space-y-3">
                  <div>
                    <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                    <input type="text" name="body" maxLength={60} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold">Tipo:</label>
                    <select name="type" defaultValue="Agradecimiento" className="w-full border rounded px-3 py-2">
                      <option value="Sugerencia">Sugerencia</option>
                      <option value="Queja">Queja</option>
                      <option value="Agradecimiento">Agradecimiento</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                    Enviar comentario
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Ventana modal para "Mis comentarios" */}
        {showUserOpinionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={() => {
                  setShowUserOpinionsModal(false);
                  setUserOpinions([]);
                  setEditingOpinion(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                <Close />
              </button>
              <h3 className="text-xl font-bold mb-4">Mis comentarios</h3>

              <button
                onClick={handleUserOpinions}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Ver comentarios
              </button>

              {userOpinions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Comentarios:</h4>
                  <ul className="space-y-4">
                    {userOpinions.map((opinion) => (
                      <li key={opinion.id} className="border p-3 rounded-lg">
                        <p><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</p>
                        <p>{opinion.body}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditOpinion(opinion)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteOpinion(opinion.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                          >
                            Borrar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {editingOpinion && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Editando comentario ID {editingOpinion.id}</h4>
                  <form onSubmit={handleUpdateOpinion} className="space-y-3">
                    <div>
                      <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                      <input
                        type="text"
                        name="body"
                        maxLength={60}
                        defaultValue={editingOpinion.body}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold">Tipo:</label>
                      <select
                        name="type"
                        defaultValue={editingOpinion.type}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="Sugerencia">Sugerencia</option>
                        <option value="Queja">Queja</option>
                        <option value="Agradecimiento">Agradecimiento</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Actualizar comentario
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransportPage;
