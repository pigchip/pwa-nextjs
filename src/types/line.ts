import { Opinion } from "./opinion";
import { Schedule } from "./schedule";

export interface ApiRoute {
    id: number;
    name: string;
    price: number;
    schedules?: Schedule[];
  }
export interface Line {
    id: number;
    name: string;
    transport: string;
    incident: string;
    speed: number;
    information: string;
    routes?: ApiRoute[];
    opinions?: Opinion[];
}