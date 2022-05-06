import type { NextPage } from "next";
import Head from "next/head";
import Searchbar from "../components/searchbar";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>TV Ratings</title>
        <meta
          name="description"
          content="Ratings for TV series in a table format"
        />
        <meta name="viewport" content="viewport-fit=cover" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,600;1,300&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex w-screen items-center justify-center">
        <h3 className="text-zinc-100">Search for your favorite TV Series</h3>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  return {
    props: {
      data: true,
    },
  };
}

export default Home;
