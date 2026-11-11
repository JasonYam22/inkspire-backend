import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("GET /", () => {
  it("returns the server running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Server is running!" });
  });
});

describe("random", () => {
  it("returns 404 for a route that doesn't exist", async () => {
    const res = await request(app).get("/random");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });
});

describe("POST /api/auth/login", () => {
  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errorMessage: "Both email and password are required.",
    });
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errorMessage: "Both email and password are required.",
    });
  });
});

describe("POST /api/auth/signup", () => {
  it("returns 400 when email and password are missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errorMessage: "Both email and password are mandatory.",
    });
  });

  it("returns 400 when password is too weak", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "a@b.com", password: "abc" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errorMessage:
        "Password not strong enough. 10 characters, one uppercase, one lowercase, and one number needed.",
      field: "password",
    });
  });
  it("returns 400 when email form is too invalid", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not an email", password: "Abcdefghi1" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      errorMessage: "Please provide a valid email address.",
    });
  });

  it("rejects public signup as an admin", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "artist@example.com",
      username: "artist",
      password: "Abcdefghi1",
      role: "ADMIN",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errorMessage: "Choose a valid account type." });
  });
});
