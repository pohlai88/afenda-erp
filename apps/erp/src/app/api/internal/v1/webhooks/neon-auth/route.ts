import "@/auth/neon-webhook-bridge.server";
import { handleNeonAuthWebhookPost } from "@afenda/neon-auth/server";

export const POST = handleNeonAuthWebhookPost;
