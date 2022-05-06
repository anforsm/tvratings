import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import Searchbar from "../components/searchbar";
import Footer from "../components/footer";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex h-screen w-screen flex-col bg-zinc-800" id="root">
        <Searchbar />
        <div className="w-full grow overflow-hidden">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
