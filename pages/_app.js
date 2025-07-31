import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

function AIToolPouch({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default AIToolPouch;
