import { Router, NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import cors from "cors";

const router = Router();

// Set your Google Client ID here or via env var
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(CLIENT_ID);

process.env.NODE_ENV === "development"
  ? router.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    )
  : router.use(cors());

router.post("/auth/google", async (req: any, res: any) => {
  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ success: false, error: "Missing id_token" });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // Optionally, create a session/JWT here
    // For demo, just return success and user info
    res.json({ success: true, user: payload });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  return ticket.getPayload();
}

// Express middleware to check Google ID token in Authorization header
export async function requireGoogleAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const idToken = authHeader.split(" ")[1];
  try {
    const user = await verifyGoogleToken(idToken);
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Google ID token" });
  }
}

export default router;
