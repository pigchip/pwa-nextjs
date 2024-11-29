import { DetailedTransport, TransportName } from "@/types/transport";


export function getTransportByLineId(lineId: number): DetailedTransport {
  let transportName: TransportName;
  let incident = "No incident reported";
  let information = "No additional information available";

  if (lineId >= 1 && lineId <= 12) {
    transportName = "Sistema de Transporte Colectivo Metro";
  } else if (lineId >= 13 && lineId <= 21) {
    transportName = "Metrobús";
  } else if (lineId === 22) {
    transportName = "Red de Transporte de Pasajeros, Servicio Ordinario";
  } else if (lineId === 23) {
    transportName = "Red de Transporte de Pasajeros, Servicio Expreso";
  } else if (lineId === 24) {
    transportName = "Red de Transporte de Pasajeros, Servicio Ecobús";
  } else if (lineId === 25) {
    transportName = "Red de Transporte de Pasajeros, Servicio Nochebús";
  } else if (lineId === 26) {
    transportName = "Red de Transporte de Pasajeros, Servicio Ordinario";
  } else if (lineId === 27) {
    transportName = "Red de Transporte de Pasajeros, Servicio Expreso";
  } else if (lineId === 28) {
    transportName = "Red de Transporte de Pasajeros, Servicio Ecobús";
  } else if (lineId === 29) {
    transportName = "Red de Transporte de Pasajeros, Servicio Ordinario";
  } else if (lineId === 30) {
    transportName = "Red de Transporte de Pasajeros, Servicio Expreso";
  } else if (lineId >= 43 && lineId <= 54) {
    transportName = "Trolebús";
  } else if (lineId === 55) {
    transportName = "Nochebús";
  } else if (lineId === 56) {
    transportName = "Tren Ligero";
  } else if (lineId >= 57 && lineId <= 59) {
    transportName = "Cablebús";
  } else {
    throw new Error(`Invalid lineId: ${lineId}`);
  }

  return {
    id: lineId,
    transport: transportName,
    name: transportName,
    speed: 0, // Default speed, you can adjust as needed
    incident,
    information,
  };
}