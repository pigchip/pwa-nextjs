// types/supervisor.ts

import { User } from "./user";

export interface Supervisor {
    sup: string;
    user: number;
    admin: string;
    line: number;
    station: number;
    userDetails: User | null;
  }