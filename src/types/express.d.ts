export interface AuthPayload {
  id: string;
  email: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      payload?: AuthPayload;
    }
  }
}
import type { Role } from "@prisma/client";
