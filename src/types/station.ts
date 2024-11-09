import { Opinion } from "./opinion";

export interface Station {
    id: number;
    name: string;
    line: number;
    incident: string;
    services: string;
    information: string;
    transport: string;
    transfers?: Station[];
    opinions?: Opinion[];
}