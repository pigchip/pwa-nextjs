// Interfaces para los datos
export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface LegGeometry {
  points: string;
}

export interface Route {
  shortName: string;
  color?: string;
  agency?: {
    id: string;
    name: string;
    url: string;
  };
}

export interface Leg {
  mode: string;
  startTime: number;
  endTime: number;
  from: Place;
  to: Place;
  distance: number;
  duration: number;
  legGeometry?: LegGeometry;
  route?: Route;
}

export interface Itinerary {
  startTime: number;
  endTime: number;
  duration: number;
  numberOfTransfers: number;
  walkTime: number;
  walkDistance: number;
  legs: Leg[];
  startNameIti: string;
  endNameIti: string;
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
