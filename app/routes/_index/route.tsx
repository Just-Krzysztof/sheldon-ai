import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Sheldon AI Assistant</h1>
        <p className={styles.text}>
          Inteligentny asystent AI dla Twojego sklepu Shopify, który pomaga klientom znaleźć odpowiednie produkty.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <h2 className={styles.heading}>Jak dodać widget do swojej strony?</h2>
        <div className={styles.codeExample}>
          <code>
            {`<script
  src="https://www.agent.sheldonai.net/embed.js"
  data-agent-id="your-agent-id"
  data-shop-url="your-shop-url"
  data-position="bottom-right">
</script>`}
          </code>
        </div>
        <ul className={styles.list}>
          <li>
            <strong>Inteligentny asystent</strong>. Pomaga klientom znaleźć odpowiednie produkty w Twoim sklepie.
          </li>
          <li>
            <strong>Łatwy w integracji</strong>. Wystarczy dodać jeden skrypt do Twojej strony.
          </li>
          <li>
            <strong>Pełna personalizacja</strong>. Dostosuj wygląd i zachowanie asystenta do swojego sklepu.
          </li>
        </ul>
      </div>
    </div>
  );
}
