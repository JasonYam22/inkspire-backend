import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

// POST "/api/auth/signup" => receive user credentials and create the document in the DB
router.post("/signup", async(req, res, next) => {
  // console.log(req.body)
  const {email, password, username, role} = req.body
  
  // server validators
  // email and password are required
  if (!email || !password) {
    res.status(400).json({errorMessage: "both email and password are mandatory"})
    return 
  }

  // password strength
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
  if (passwordRegex.test(password) === false) {
    res.status(400).json({errorMessage: "Password not strong enough.8 characters, one uppercase, one lowercase and one number needed", field: "password"})
    return 
  }

  // email has a valid structure
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  res.status(400).json({ errorMessage: "Please provide a valid email address." });
  return;
}

  try {

    // email should be unique
    const foundUser = await prisma.user.findUnique( { where: {email} } )
    if (foundUser) {
      res.status(400).json({errorMessage: "User already exists with this email"})
      return 
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    await prisma.user.create({
      data: {
        email,
      password: hashedPassword,
      username: username,
      role,
      },
    })
    
    res.sendStatus(201)
    
  } catch (error) {
    next(error)
  }

})

// POST "/api/auth/login" => validate user credentials and create the JWT
router.post("/login", async (req: Request, res: Response, next) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ errorMessage: "Email is mandatory" });
    return;
  }
  if (!password) {
  res.status(400).json({ errorMessage: "Password is mandatory" });
    return;
  }
 
  try {
    const foundUser = await prisma.user.findUnique({ where: {email} });
    if (!foundUser) {
      res.status(400).json({ errorMessage: "Invalid email or password" });
      return;
    }

    const passwordCorrect = await bcrypt.compare(password, foundUser.password);
    if (!passwordCorrect) {
      res.status(400).json({ errorMessage: "Invalid email or password" });
      return;
    }

    // generate the Token JWT
    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
       role: foundUser.role 
    }

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET!, {
      expiresIn: "7d"
    })

    res.status(200).json( { authToken, payload } )

  } catch (error) {
    next(error);
  }
});

// GET "/api/auth/verify" => received the token, and validates it and will send to the FE who the owner of the token it.
router.get("/verify", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ payload: req.payload })
})

export default router