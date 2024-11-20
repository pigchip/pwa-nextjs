// queries.ts

export const ITINERARY_QUERY = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: TRANSIT },
        { mode: WALK },
        { mode: BUS },
        { mode: SUBWAY },
        { mode: TRAM },
        { mode: RAIL },
        { mode: FERRY },
        { mode: GONDOLA },
        { mode: CABLE_CAR },
        { mode: FUNICULAR }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        numberOfTransfers
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
          route {
            shortName
            color
            agency {
              id
              name
              url
            }
          }
        }
      }
    }
  }
`;

// Consulta solo caminata
export const ITINERARY_QUERY_WALK_ONLY = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: WALK }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
        }
      }
    }
  }
`;

// Función genérica para combinaciones de WALK + modo
const generateWalkCombinationQuery = (
  mode: string
) => (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: ${mode} },
        { mode: WALK }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        numberOfTransfers
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
          route {
            shortName
            color
            agency {
              id
              name
              url
            }
          }
        }
      }
    }
  }
`;

// Exportar funciones específicas para cada modo de transporte

export const ITINERARY_QUERY_BUS_WALK = generateWalkCombinationQuery('BUS');

export const ITINERARY_QUERY_SUBWAY_WALK = generateWalkCombinationQuery('SUBWAY');

export const ITINERARY_QUERY_TRAM_WALK = generateWalkCombinationQuery('TRAM');

export const ITINERARY_QUERY_RAIL_WALK = generateWalkCombinationQuery('RAIL');

export const ITINERARY_QUERY_FERRY_WALK = generateWalkCombinationQuery('FERRY');

export const ITINERARY_QUERY_GONDOLA_WALK = generateWalkCombinationQuery('GONDOLA');

export const ITINERARY_QUERY_CABLE_CAR_WALK = generateWalkCombinationQuery('CABLE_CAR');

export const ITINERARY_QUERY_FUNICULAR_WALK = generateWalkCombinationQuery('FUNICULAR');

// Puedes añadir combinaciones de múltiples modos si es necesario

export const ITINERARY_QUERY_BUS_SUBWAY_WALK = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: BUS },
        { mode: SUBWAY },
        { mode: WALK }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        numberOfTransfers
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
          route {
            shortName
            color
            agency {
              id
              name
              url
            }
          }
        }
      }
    }
  }
`;

export const ITINERARY_QUERY_SUBWAY_TRAM_WALK = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: SUBWAY },
        { mode: TRAM },
        { mode: WALK }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        numberOfTransfers
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
          route {
            shortName
            color
            agency {
              id
              name
              url
            }
          }
        }
      }
    }
  }
`;

// Consulta con todos los modos principales y caminata

export const ITINERARY_QUERY_ALL_MODES_WALK = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number
) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: ${numItineraries}
      maxTransfers: ${maxTransfers}
      walkReluctance: 4.0
      transportModes: [
        { mode: BUS },
        { mode: SUBWAY },
        { mode: TRAM },
        { mode: RAIL },
        { mode: FERRY },
        { mode: GONDOLA },
        { mode: CABLE_CAR },
        { mode: FUNICULAR },
        { mode: WALK }
      ]
    ) {
      itineraries {
        startTime
        endTime
        duration
        numberOfTransfers
        walkTime
        walkDistance
        waitingTime
        legs {
          mode
          startTime
          endTime
          from {
            name
            lat
            lon
          }
          to {
            name
            lat
            lon
          }
          distance
          duration
          legGeometry {
            points
          }
          route {
            shortName
            color
            agency {
              id
              name
              url
            }
          }
        }
      }
    }
  }
`;
