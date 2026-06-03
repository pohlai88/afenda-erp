import "@/auth/neon-webhook-bridge.server";
import { handleNeonAuthWebhookPost } from "@afenda/auth/server";

export const POST = handleNeonAuthWebhookPost;
