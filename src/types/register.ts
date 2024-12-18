import { Route } from "./route";
import { User } from "./user";

export interface Register {
    id: number;
    user: number;
    transport: string;
    line: number;
    route: number;
    station: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:MM:SS
    body: string;
    status: Status;
    x: string;
    y: string;
    userDetails?: User | null;
    routeDetails?: Route | null;
}

export enum Status {
    SinValidar = "Sin validar",
    EnProceso = "En proceso",
    Validado = "Validado",
    Rechazado = "Rechazado"
}

export interface RegisterResponse {
    message: string;
    data: Register[];
}