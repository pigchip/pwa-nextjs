import { Leg } from "./map";

export interface FrequentedRoute {
    duration: number;
    endNameIti: string;
    endTime: number;
    legs: Leg[];
    numberOfTransfers: number;
    startNameIti: string;
    startTime: number;
    waitingTime: number;
    walkDistance: number;
    walkTime: number;
    frequency: number;
}