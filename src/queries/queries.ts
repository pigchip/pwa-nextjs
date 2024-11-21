// queries.ts

import { Agency } from "@/utils/fetchGtfsData";

export const generateBannedBlocks = (
  selectedAgencies: string[],
  selectedRoutes: string[],
  routeData: Agency[] | null
): { bannedAgencies: string[]; bannedRoutes: string[] } => {
  const bannedAgencies: string[] = [];
  const bannedRoutes: string[] = [];

  if (!routeData) return { bannedAgencies, bannedRoutes };

  // Generate bannedAgencies and bannedRoutes based on gtfsId
  selectedAgencies.forEach((agencyId) => {
    const agency = routeData.find((a) => a.gtfsId === agencyId);
    if (agency?.gtfsId) {
      bannedAgencies.push(agency.gtfsId);
    }
  });

  selectedRoutes.forEach((routeId) => {
    routeData.forEach((agency) => {
      const route = agency.routes.find((r) => r.gtfsId === routeId);
      if (route?.gtfsId) {
        bannedRoutes.push(route.gtfsId);
      }
    });
  });

  return { bannedAgencies, bannedRoutes };
};

export const ITINERARY_QUERY = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number,
  bannedAgencies: string[] = [],
  bannedRoutes: string[] = []
) => {
  const bannedBlock =
    bannedAgencies.length > 0 || bannedRoutes.length > 0
      ? `banned: {
        ${bannedAgencies.length > 0 ? `agencies: "${bannedAgencies.join(",")}",` : ""}
        ${bannedRoutes.length > 0 ? `routes: "${bannedRoutes.join(",")}"` : ""}
      },`
      : "";

  return `
    query {
      plan(
        from: { lat: ${fromLat}, lon: ${fromLon} }
        to: { lat: ${toLat}, lon: ${toLon} }
        date: "${currentDate}"
        time: "${currentTime}"
        numItineraries: ${numItineraries}
        maxTransfers: ${maxTransfers}
        walkReluctance: 4.0
        ${bannedBlock}
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
              stop {
                id
                name
              }
              name
              lat
              lon
            }
            to {
              stop {
                id
                name
              }
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
              id
              gtfsId
              shortName
              longName
              color
              agency {
                id
                gtfsId
                name
                url
              }
            }
          }
        }
      }
    }
  `;
};

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
            stop {
              id
              name
            }
            name
            lat
            lon
          }
          to {
            stop {
              id
              name
            }
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

const generateWalkCombinationQuery = (mode: string) => (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number,
  bannedAgencies: string[] = [],
  bannedRoutes: string[] = []
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
      ${bannedAgencies.length > 0 || bannedRoutes.length > 0
        ? `banned: {
        ${bannedAgencies.length > 0 ? `agencies: "${bannedAgencies.join(",")}",` : ""}
        ${bannedRoutes.length > 0 ? `routes: "${bannedRoutes.join(",")}"` : ""}
        },`
        : ""
      }
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
            stop {
              id
              name
            }
            name
            lat
            lon
          }
          to {
            stop {
              id
              name
            }
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
            id
            gtfsId
            shortName
            longName
            color
            agency {
              id
              gtfsId
              name
              url
            }
          }
        }
      }
    }
  }
`;

export const ITINERARY_QUERY_BUS_WALK = generateWalkCombinationQuery('BUS');
export const ITINERARY_QUERY_SUBWAY_WALK = generateWalkCombinationQuery('SUBWAY');
export const ITINERARY_QUERY_TRAM_WALK = generateWalkCombinationQuery('TRAM');
export const ITINERARY_QUERY_RAIL_WALK = generateWalkCombinationQuery('RAIL');
export const ITINERARY_QUERY_FERRY_WALK = generateWalkCombinationQuery('FERRY');
export const ITINERARY_QUERY_GONDOLA_WALK = generateWalkCombinationQuery('GONDOLA');
export const ITINERARY_QUERY_CABLE_CAR_WALK = generateWalkCombinationQuery('CABLE_CAR');
export const ITINERARY_QUERY_FUNICULAR_WALK = generateWalkCombinationQuery('FUNICULAR');

export const ITINERARY_QUERY_ALL_MODES_WALK = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number,
  bannedAgencies: string[] = [],
  bannedRoutes: string[] = []
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
      ${bannedAgencies.length > 0 || bannedRoutes.length > 0
        ? `banned: {
        ${bannedAgencies.length > 0 ? `agencies: "${bannedAgencies.join(",")}",` : ""}
        ${bannedRoutes.length > 0 ? `routes: "${bannedRoutes.join(",")}"` : ""}
        },`
        : ""
      }
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
            stop {
              id
              name
            }
            name
            lat
            lon
          }
          to {
            stop {
              id
              name
            }
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
            id
            gtfsId
            shortName
            longName
            color
            agency {
              id
              gtfsId
              name
              url
            }
          }
        }
      }
    }
  }
`;

export const GTFS_EXAMPLE_QUERY = `
  query {
    agencies {
      id
      gtfsId
      name
      routes {
        id
        gtfsId
        shortName
        longName
        stops {
          id
          name
          lat
          lon
        }
      }
    }
  }
`;


export const ITINERARY_QUERY_BUS_SUBWAY_WALK = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  currentDate: string,
  currentTime: string,
  maxTransfers: number,
  numItineraries: number,
  bannedAgencies: string[] = [],
  bannedRoutes: string[] = []
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
      ${bannedAgencies.length > 0 || bannedRoutes.length > 0
        ? `banned: {
        ${bannedAgencies.length > 0 ? `agencies: "${bannedAgencies.join(",")}",` : ""}
        ${bannedRoutes.length > 0 ? `routes: "${bannedRoutes.join(",")}"` : ""}
        },`
        : ""
      }
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
            stop {
              id
              name
            }
            name
            lat
            lon
          }
          to {
            stop {
              id
              name
            }
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
            id
            gtfsId
            shortName
            longName
            color
            agency {
              id
              gtfsId
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
  numItineraries: number,
  bannedAgencies: string[] = [],
  bannedRoutes: string[] = []
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
      ${bannedAgencies.length > 0 || bannedRoutes.length > 0
        ? `banned: {
        ${bannedAgencies.length > 0 ? `agencies: "${bannedAgencies.join(",")}",` : ""}
        ${bannedRoutes.length > 0 ? `routes: "${bannedRoutes.join(",")}"` : ""}
        },`
        : ""
      }
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
            stop {
              id
              name
            }
            name
            lat
            lon
          }
          to {
            stop {
              id
              name
            }
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
            id
            gtfsId
            shortName
            longName
            color
            agency {
              id
              gtfsId
              name
              url
            }
          }
        }
      }
    }
  }
`;
