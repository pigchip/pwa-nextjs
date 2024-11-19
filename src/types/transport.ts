export interface Transport {
    name: TransportName;
    speed: number;
}

export type TransportName =
  | 'Sistema de Transporte Colectivo Metro'
  | 'Metrobús'
  | 'Red de Transporte de Pasajeros, Servicio Ordinario'
  | 'Red de Transporte de Pasajeros, Servicio Expreso'
  | 'Red de Transporte de Pasajeros, Servicio Ecobús'
  | 'Red de Transporte de Pasajeros, Servicio Nochebús'
  | 'Trolebús'
  | 'Trolebús Elevado'
  | 'Nochebús'
  | 'Tren Ligero'
  | 'Cablebús';