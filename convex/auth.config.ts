import type { AuthConfig } from "convex/server";

// Clerk issues the JWTs. Activate the Convex integration in the Clerk
// dashboard so tokens use the "convex" audience.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
