import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

export const action: ActionFunction = async ({ request }) => {
  const { topic, shop } = await authenticate.webhook(request);

  if (topic === "APP_UNINSTALLED") {
    await prisma.session.deleteMany({ where: { shop } });
  }

  return new Response("Webhook received");
};