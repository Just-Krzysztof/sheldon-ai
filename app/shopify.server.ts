import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import type { Session } from "@shopify/shopify-api";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app-uninstalled",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      try {
        await addScriptTagWithSession(session);
        console.log("Script tag added after authentication");
      } catch (error) {
        console.error("Error in afterAuth hook:", error);
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export async function addScriptTagWithSession(session: Session) {
  try {
    // Używamy authenticate.admin zamiast bezpośredniego dostępu do admin
    const { admin } = await shopify.authenticate.admin({
      session
    });

    // Teraz używamy admin.graphql
    const response = await admin.graphql(`
      mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            id
            src
            displayScope
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: {
          src: "https://www.agent.sheldonai.net/embed.js",
          displayScope: "ALL"
        }
      }
    });

    const responseJson = await response.json();

    if (responseJson.data?.scriptTagCreate?.userErrors?.length > 0) {
      console.error("GraphQL errors:", responseJson.data.scriptTagCreate.userErrors);
      throw new Error("Failed to create script tag");
    }

    console.log("Script tag added successfully:", responseJson.data?.scriptTagCreate?.scriptTag);
    return responseJson.data?.scriptTagCreate?.scriptTag;
  } catch (error) {
    console.error("Error adding script tag:", error);
    throw error;
  }
}

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const sessionStorage = shopify.sessionStorage;
