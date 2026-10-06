export interface AuthPayload {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ARTIST";
}

declare global {
  namespace Express {
    interface Request {
      payload?: AuthPayload;
    }
  }
}