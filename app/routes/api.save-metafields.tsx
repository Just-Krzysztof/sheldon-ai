import type { ActionFunctionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
    console.log("Authentication successful");

    if (request.method !== "POST") {
      console.log("Method not allowed:", request.method);
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const requestData = await request.json();
      console.log("Request data received:", JSON.stringify(requestData));

      const { agentId, token } = requestData;

      if (!agentId || !token) {
        console.log("Missing required fields, agentId or token");
        return json({ error: "Missing required fields" }, { status: 400 });
      }

      // Zapisz metafields dla sklepu
      console.log("Attempting to save metafields for shop:", admin.shop.id);

      const response = await admin.graphql(`
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

      const responseJson = await response.json();
      console.log("Metafields save response:", JSON.stringify(responseJson));

      if (responseJson.data?.metafieldsSet?.userErrors?.length > 0) {
        console.error("GraphQL errors:", responseJson.data.metafieldsSet.userErrors);
        return json({
          error: "Failed to save metafields",
          details: responseJson.data.metafieldsSet.userErrors
        }, { status: 500 });
      }

      console.log("Metafields saved successfully");
      return json({ success: true });
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return json({ error: "Invalid request body" }, { status: 400 });
    }
  } catch (authError) {
    console.error("Authentication error:", authError);
    return json({ error: "Authentication failed" }, { status: 401 });
  } catch (error) {
    console.error("Unexpected error saving metafields:", error);
    return json({ error: "Failed to save metafields", details: String(error) }, { status: 500 });
  }
};
