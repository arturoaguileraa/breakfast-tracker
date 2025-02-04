import Head from "next/head";
import BreakfastTracker from "../components/BreakfastTracker";

export default function Home() {
  return (
    <>
      <Head>
        <title>Gestor de Desayunos ☕</title>
        <meta name="description" content="App para gestionar desayunos y pagos" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <BreakfastTracker />
    </>
  );
}
