// Interfaces para los datos
export interface Place {
  name: string;
  lat: number;
  lon: number;
  stop?: Stop;
}

export interface LegGeometry {
  points: string;
}

export interface Route {
  id: string;
  gtfsId: string;
  shortName: string;
  longName: string;
  color?: string;
  agency?: {
    gtfsId?: string;
    id: string;
    name: string;
    url: string;
  };
}

export interface Leg {
  gtfsId: string;
  mode: string;
  startTime: number;
  endTime: number;
  from: Place;
  to: Place;
  distance: number;
  duration: number;
  legGeometry?: LegGeometry;
  route?: Route;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  name: string;
}

export interface Itinerary {
  id?: string;
  startTime: number;
  endTime: number;
  duration: number;
  numberOfTransfers: number;
  walkTime: number;
  walkDistance: number;
  legs: Leg[];
  startNameIti: string;
  endNameIti: string;
  waitingTime: number;
}

export interface PlanResponse {
  data?: {
    plan?: {
      itineraries: Itinerary[];
      messageStrings: string[];
    };
  };
  errors?: any;
}

export interface ItineraryMapComponentProps {
  startLocation: {
    lat: number;
    lon: number;
    name: string;
    display_name: string;
  } | null;
  endLocation: {
    lat: number;
    lon: number;
    name: string;
    display_name: string;
  } | null;
}

export interface Location {
    lat: number;
    lon: number;
    name: string;
    display_name: string;
}

export interface UserLocation {
    lat: number;
    lon: number;
    name: string;
}

export type NullableUserLocation = UserLocation | null;

export type NullableLocation = Location | null;
