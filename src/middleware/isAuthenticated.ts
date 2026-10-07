import { expressjwt as jwt } from "express-jwt";
import type { Request } from "express";

export const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET!,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: (req: Request) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

 const [tokenType, token] = authHeader.split(" ");

    if (tokenType !== "Bearer") {
      return undefined;
    }

    return token;
  },
});

export default isAuthenticated