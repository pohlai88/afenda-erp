import "./erp-neon-webhook-bridge.server";
import { handleNeonAuthWebhookPost } from "@afenda/auth/neon-auth/server";

export const POST = handleNeonAuthWebhookPost;