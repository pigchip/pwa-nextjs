import { GTFS_EXAMPLE_QUERY } from "@/queries/queries";

// fetchGtfsData.ts
export interface Stop {
    id: string;
    name: string;
    lat: number;
    lon: number;
  }
  
  export interface Route {
    id: string;
    gtfsId: string;
    shortName: string;
    longName: string;
    stops: Stop[];
  }
  
  export interface Agency {
    id: string;
    gtfsId: string;
    name: string;
    routes: Route[];
  }
  
  export const fetchGtfsData = async (): Promise<Agency[]> => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_OTP_API_BASE_URL}otp/routers/default/index/graphql`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GTFS_EXAMPLE_QUERY }),
      });
  
      if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
  
      const data = await response.json();
  
      if (data.errors || !data.data?.agencies) {
        console.error('GraphQL response error:', data.errors || 'No agencies found.');
        return [];
      }
  
      return data.data.agencies;
    } catch (error) {
      console.error('Error fetching GTFS data:', error);
      return [];
    }
  };
  