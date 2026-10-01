import { expressjwt as jwt } from "express-jwt";
export const isAuthenticated = jwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    requestProperty: "payload",
    getToken: (req) => {
        if (!req.headers || !req.headers.authorization) {
            console.log("There is no token");
            return null;
        }
        const tokenArr = req.headers.authorization.split(" ");
        const tokenType = tokenArr[0];
        const token = tokenArr[1];
        if (tokenType !== "Bearer") {
            return null;
        }
        return token;
    },
});
export default isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map