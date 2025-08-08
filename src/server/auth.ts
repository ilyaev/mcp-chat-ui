import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function requireOAuthBearerToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (process.env.NODE_ENV === "development") {
    (req as any).user = { role: "dev", name: "Local Dev User" };
    return next();
  }
  const OAUTH_SECRET = process.env.OAUTH_SECRET || "";
  const DEV_ACCESS_TOKEN = process.env.DEV_ACCESS_TOKEN || "";
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    // Allow bypass if running on development machine (e.g., NODE_ENV=development)
    if (token === DEV_ACCESS_TOKEN) {
      // Special case for super user token, allow access without JWT validation
      (req as any).user = { role: "superuser", name: "Super Dev User" };
      return next();
    }
    // Validate JWT. Use the correct secret/public key and options for your provider.
    const decoded = jwt.verify(token, OAUTH_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
