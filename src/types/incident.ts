export type Incident = {
    id: number;
    incident: string;
    information: string;
    line: number;
    name: string;
    services: string;
};

export type IncidentDescription = {
    id: number;
    name: string;
    description: string;
};

export const incidents: IncidentDescription[] = [
  {
    id: 1,
    name: "Fallas técnicas",
    description: "Problemas con el vehículo o la infraestructura",
  },
  {
    id: 2,
    name: "Accidente",
    description: "Colisión o atropello",
  },
  {
    id: 3,
    name: "Operación",
    description: "Problemas con el personal o el servicio",
  },
  {
    id: 4,
    name: "Factores externos",
    description: "Clima, tráfico u otros factores externos",
  },
  {
    id: 5,
    name: "Seguridad",
    description: "Robo, vandalismo o agresión",
  },
  {
    id: 6,
    name: "Otro",
    description: "Otro tipo de incidente",
  },
];