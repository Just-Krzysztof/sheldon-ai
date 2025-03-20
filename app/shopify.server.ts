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
    // Do zrobienia - używamy API Graphql
    const response = await shopify.authenticate.admin({
      session,
    });

    const client = response.admin.rest;

    // Dodajemy script tag
    const scriptTagResponse = await client.post({
      path: 'script_tags',
      data: {
        script_tag: {
          event: "onload",
          src: "https://www.agent.sheldonai.net/embed.js"
        }
      },
    });

    console.log("Script tag added successfully:", scriptTagResponse.body);
    return scriptTagResponse.body;
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
