// src/queries/queries.ts
export const ITINERARY_QUERY = (fromLat: number, fromLon: number, toLat: number, toLon: number, currentDate: string, currentTime: string, maxTransfers: number) => `
  query {
    plan(
      from: { lat: ${fromLat}, lon: ${fromLon} }
      to: { lat: ${toLat}, lon: ${toLon} }
      date: "${currentDate}"
      time: "${currentTime}"
      numItineraries: 10
      maxTransfers: ${maxTransfers}
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