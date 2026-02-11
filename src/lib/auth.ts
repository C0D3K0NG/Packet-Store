import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "packet-store-dev-secret-change-in-prod"
);

const COOKIE_NAME = "packet-access";
const EXPIRATION_TIME = "30d";

export async function createAccessToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION_TIME)
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
