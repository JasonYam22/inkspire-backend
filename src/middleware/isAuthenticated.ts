import { expressjwt as jwt } from "express-jwt";
import type { Request } from "express";

const tokenSecret = process.env.TOKEN_SECRET;

if (!tokenSecret) {
  throw new Error("TOKEN_SECRET is not defined");
}

// Check the login token before a protected route runs.
export const isAuthenticated = jwt({
  secret: tokenSecret,
  algorithms: ["HS256"],
  // Put the user details from the token on req.payload.
  requestProperty: "payload",
  getToken: (req: Request) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(/\s+/);

    if (type?.toLowerCase() !== "bearer" || !token) {
      return undefined;
    }

    return token;
  },
});

export default isAuthenticated;
