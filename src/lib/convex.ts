import { ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";

let client: ConvexReactClient | undefined;

/**
 * Islands render a placeholder on the server and on the first client render,
 * then connect to Convex. This keeps the build from opening a connection and
 * keeps hydration consistent.
 */
export function useConvexClient() {
  const [ready, setReady] = useState<ConvexReactClient>();
  useEffect(() => {
    client ??= new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);
    setReady(client);
  }, []);
  return ready;
}
