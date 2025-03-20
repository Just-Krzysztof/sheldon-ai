import type { ActionFunctionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { agentId, token } = await request.json();

    if (!agentId || !token) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Zapisz metafields dla sklepu
    await admin.graphql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `, {
      variables: {
        metafields: [
          {
            namespace: "sheldon_ai",
            key: "agent_id",
            ownerId: "gid://shopify/Shop/" + admin.shop.id,
            type: "single_line_text_field",
            value: agentId
          },
          {
            namespace: "sheldon_ai",
            key: "agent_token",
            ownerId: "gid://shopify/Shop/" + admin.shop.id,
            type: "single_line_text_field",
            value: token
          }
        ]
      }
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error saving metafields:", error);
    return json({ error: "Failed to save metafields" }, { status: 500 });
  }
};
