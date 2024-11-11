export function getAgencyIcon(agencyName: string): string {
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