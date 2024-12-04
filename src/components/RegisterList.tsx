import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Register, Status } from "@/types/register";
import { useRouter } from "next/navigation";
import { useReports } from "@/contexts/ReportsContext";
import { useLinesStations } from "@/stores/LinesStationsContext";
import { useUsers } from "@/contexts/UsersContext";
import { useRoutes } from "@/contexts/RoutesContext";
import { Route, Station } from "@/types";
import sendKnockNotification, {
  recipients,
} from "@/utils/knock/sendNotification";

const RegisterList: React.FC = () => {
  const [filteredRegisters, setFilteredRegisters] = useState<Register[]>([]);
  const [filters, setFilters] = useState({
    user: "",
    transport: "",
    line: "",
    route: "",
    station: "",
    status: "",
    sort: "mostRecent", // Default sorting order
    search: "", // Search term
    sortField: "date", // Default sort field
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page
  const router = useRouter();
  const { reports, setSelectedReport } = useReports();
  const { lines, stations, getFirstAndLastStations } = useLinesStations();
  const { users } = useUsers();
  const { routes } = useRoutes();
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | "">("");

  const fetchUserById = useCallback(async (userId: number) => {
    const user = users.find((user) => user.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }, [users]);

  const fetchRouteById = useCallback(async (routeId: number) => {
    const route = routes.find((route: Route) => route.id === routeId);
    if (!route) {
      throw new Error("Route not found");
    }
    return route;
  }, [routes]);

  const filterRegisters = useCallback(async () => {
    let filtered = reports;

    if (filters.user) {
      filtered = filtered.filter((register) =>
        register.user.toString().includes(filters.user)
      );
    }
    if (filters.transport) {
      filtered = filtered.filter((register) =>
        register.transport.includes(filters.transport)
      );
    }
    if (filters.line) {
      filtered = filtered.filter((register) =>
        register.line.toString().includes(filters.line)
      );
    }
    if (filters.route) {
      filtered = filtered.filter((register) =>
        register.route.toString().includes(filters.route)
      );
    }
    if (filters.station) {
      filtered = filtered.filter((register) =>
        register.station.toString().includes(filters.station)
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (register) => register.status === filters.status
      );
    }
    if (filters.search) {
      filtered = filtered.filter((register) =>
        Object.values(register).some((value) =>
          value.toString().toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }

    // Exclude registers with coordinates (0, 0)
    filtered = filtered.filter(
      (register) => !(Number(register.x) === 0 && Number(register.y) === 0)
    );

    // Sort by selected field
    filtered = filtered.sort((a, b) => {
      const fieldA = a[filters.sortField as keyof Register];
      const fieldB = b[filters.sortField as keyof Register];
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return filters.sort === "mostRecent"
          ? fieldB.localeCompare(fieldA)
          : fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return filters.sort === "mostRecent"
          ? fieldB - fieldA
          : fieldA - fieldB;
      } else {
        return 0;
      }
    });

    const registersWithDetails = await Promise.all(
      filtered.map(async (register) => {
        const userDetails = await fetchUserById(register.user);
        const routeDetails = await fetchRouteById(register.route);
        return { ...register, userDetails, routeDetails };
      })
    );

    setFilteredRegisters(registersWithDetails);
  }, [reports, filters, fetchUserById, fetchRouteById]);

  useEffect(() => {
    filterRegisters();
    setFilteredStations(
      stations.filter((station) => station.line === Number(filters.line))
    );
  }, [filters, currentPage, filterRegisters, lines, stations]);

  const handleFilterChange = async (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      user: "",
      transport: "",
      line: "",
      route: "",
      station: "",
      status: "",
      sort: "mostRecent",
      search: "",
      sortField: "date",
    });
    setCurrentPage(1); // Reset to first page when filters reset
  };

  const uniqueValues = (key: keyof Register) => {
    return Array.from(new Set(reports.map((register) => register[key])));
  };

  const availableUsers = useMemo(() => {
    const userIds = new Set(reports.map((register) => register.user));
    return users.filter((user) => userIds.has(user.id));
  }, [reports, users]);

  const availableRoutes = useMemo(() => {
    const routeIds = new Set(reports.map((register) => register.route));
    return routes.filter((route) => routeIds.has(route.id));
  }, [reports, routes]);

  // Calculate paginated data
  const paginatedRegisters = filteredRegisters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewMore = (register: Register) => {
    setSelectedReport(register);
    router.push("/reports/details");
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;

    try {
      for (const register of filteredRegisters) {
        const response = await fetch("/api/reports/update/status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: register.id,
            status: selectedStatus,
          }),
        });

        if (selectedStatus === Status.Validado && response.ok) {
          sendKnockNotification(recipients, {
            value: register.body,
            station:
              stations.find(
                (station) => station.id === Number(register.station)
              )?.name || register.station.toString(),
          });
        }

        if (!response.ok) {
          throw new Error(
            `Failed to update status for register ID ${register.id}`
          );
        }
      }

      alert("Estado de los reportes actualizado correctamente");
      filterRegisters(); // Refresh the filtered registers
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          name="search"
          placeholder="Buscar"
          value={filters.search}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todos los usuarios</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} {user.lastname_pat}
            </option>
          ))}
        </select>
        <select
          name="transport"
          value={filters.transport}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todos los transportes</option>
          {uniqueValues("transport").map((transport) => (
            <option
              key={String(transport)}
              value={
                transport !== null && transport !== undefined
                  ? String(transport)
                  : ""
              }
            >
              {transport !== null && transport !== undefined
                ? String(transport)
                : ""}
            </option>
          ))}
        </select>
        <select
          name="line"
          value={filters.line}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todas las líneas</option>
          {lines.map((line) => {
            const { firstStation, lastStation } = getFirstAndLastStations(
              line.id
            );
            return (
              <option key={line.id} value={line.id.toString()}>
                {line.transport} - {line.name} ({firstStation?.name} -{" "}
                {lastStation?.name})
              </option>
            );
          })}
        </select>
        <select
          name="route"
          value={filters.route}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todas las rutas</option>
          {availableRoutes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
        <select
          name="station"
          value={filters.station}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todas las estaciones</option>
          {filteredStations.map((station) => (
            <option key={station.id} value={station.id.toString()}>
              {station.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todos los status</option>
          {Object.values(Status).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="mostRecent">Más reciente</option>
          <option value="leastRecent">Menos reciente</option>
        </select>
        <select
          name="sortField"
          value={filters.sortField}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="date">Fecha</option>
          <option value="user">Usuario</option>
          <option value="transport">Transporte</option>
          <option value="line">Línea</option>
          <option value="route">Ruta</option>
          <option value="station">Estación</option>
          <option value="status">Estado</option>
        </select>
      </div>
      <button
        onClick={resetFilters}
        className="mb-4 p-2 bg-[#6ABDA6] text-white rounded"
      >
        Reiniciar filtros
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="ml-6 mb-4 p-2 bg-[#6ABDA6] text-white rounded"
      >
        Actualizar estado de los reportes filtrados
      </button>
      <ul className="space-y-4">
        {paginatedRegisters.map((register) => (
          <li
            key={register.id}
            className="p-4 border border-gray-300 rounded shadow"
          >
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p>
                  <strong>Usuario:</strong> {register.userDetails?.name}{" "}
                  {register.userDetails?.lastname_pat}
                </p>
                <p>
                  <strong>Transporte:</strong> {register.transport}
                </p>
                <p>
                  <strong>Línea:</strong>{" "}
                  {lines.find(
                    (line: { id: number }) => line.id === Number(register.line)
                  )?.information || register.line}
                </p>
                <p>
                  <strong>Ruta:</strong>{" "}
                  {register.routeDetails?.name ||
                    register.routeDetails?.id ||
                    register.route}
                </p>
                <p>
                  <strong>Estación:</strong>{" "}
                  {stations.find(
                    (station: { id: number }) =>
                      station.id === Number(register.station)
                  )?.name || register.station}
                </p>
                <p>
                  <strong>Fecha:</strong> {register.date}
                </p>
                <p>
                  <strong>Estado:</strong> {register.status}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p>
                  <strong>Hora:</strong> {register.time}
                </p>
                <p>
                  <strong>Descripción:</strong> {register.body}
                </p>
                <p>
                  <strong>Coordenadas:</strong> ({register.x}, {register.y})
                </p>
                <button
                  onClick={() => handleViewMore(register)}
                  className="mt-2 p-2 bg-[#6ABDA6] text-white rounded"
                >
                  Ver más
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-1 border rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Seleccionar nuevo estado</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Status)}
              className="p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Seleccione un estado</option>
              {Object.values(Status).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="mr-2 p-2 bg-gray-300 text-black rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                className="p-2 bg-[#6ABDA6] text-white rounded"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterList;