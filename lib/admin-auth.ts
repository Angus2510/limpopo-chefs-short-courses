import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "lca_admin_session";
const ADMIN_ID = "admin";

function getAdminPanelSecret() {
  return process.env.ADMIN_PANEL_SECRET ?? "change-me-in-production";
}

function createSessionToken() {
  return createHmac("sha256", getAdminPanelSecret())
    .update(ADMIN_ID)
    .digest("hex");
}

export function verifyAdminCredentials(username: string, password: string) {
  return username === "admin" && password === "chef1";
}

export function getAdminSessionToken() {
  return createSessionToken();
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) return false;

  const expected = createSessionToken();
  if (token.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
