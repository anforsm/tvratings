import Gradient from "javascript-color-gradient";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

const range = (start: number, end: number) => {
  let res = [];
  for (let i = start; i <= end; i++) {
    res.push(i);
  }
  return res;
};

const gradientArray = new Gradient()
  .setColorGradient("#B91C1C", "#FBBF24", "#16A34A")
  .setMidpoint(100)
  .getColors();

const TVSeries: NextPage = (props: any) => {
  const [maxSeasons, setMaxSeasons] = useState(0);
  const [maxEpisodes, setMaxEpisodes] = useState(0);
  const [ratings, setRatings] = useState<any[][]>([[]]);

  useEffect(() => {
    let ratings: any[] = [];
    props.ratings.forEach((season: any) => {
      season.forEach((episode: any) => {
        if (episode && episode?.rating !== -1) ratings.push(episode);
      });
    });
    // @ts-ignore
    let maxSeasons = ratings.reduce(
      (prev, curr) => Math.max(curr.season, prev),
      0
    );
    setMaxSeasons(maxSeasons);
    // @ts-ignore
    let maxEpisodes = ratings.reduce(
      (prev, curr) => Math.max(curr.episode, prev),
      0
    );
    setMaxEpisodes(maxEpisodes);

    let ratingMatrix = Array.from(Array(maxSeasons), () =>
      Array(maxEpisodes).fill(undefined)
    );
    for (let season = 0; season < maxSeasons; season++) {
      for (let episode = 0; episode < maxEpisodes; episode++) {
        let correctEpisode = ratings.find(
          (rating: any) =>
            rating.season === season + 1 && rating.episode === episode + 1
        );
        ratingMatrix[season][episode] = correctEpisode;
      }
    }
    setRatings(ratingMatrix);
  }, [props.ratings]);

  const [maxRowStyle, setMaxRowStyle] = useState<any>({});
  const [fontSize, setFontSize] = useState<any>({});
  useEffect(() => {
    const maxDimensionFinder = () => {
      if (!document.getElementById("table")) return;
      let parent = document.getElementById("table")!.getBoundingClientRect();
      let maxWidth = parent.width / (maxSeasons + 2);
      let maxHeight = parent.height / (maxEpisodes + 2);
      let maxDimensionPerCell = Math.min(Math.min(maxWidth, maxHeight), 40);

      setMaxRowStyle({
        width: `${maxDimensionPerCell * (maxSeasons + 3)}px`,
        height: `${maxDimensionPerCell}px`,
        aspectRatio: `${maxSeasons + 3} / 1`,
      });

      setFontSize({
        fontSize: `${maxDimensionPerCell * 0.6}px`,
      });
    };
    maxDimensionFinder();
    window.addEventListener("resize", maxDimensionFinder);
    return () => window.removeEventListener("resize", maxDimensionFinder);
  }, [ratings, maxEpisodes, maxSeasons]);

  return (
    <>
      <Head>
        <title>TV Ratings | {props.metadata.title}</title>
      </Head>

      <div className="flex h-full flex-col">
        <div className="flex w-full justify-center pb-10 pt-4 text-zinc-100">
          <div className="w-fit">
            <h3>Ratings for</h3>
            <h1>
              <b>{props.metadata !== {} && props.metadata.title}</b>
            </h1>
          </div>
        </div>
        <div className="mx-8 mb-8 flex grow flex-col items-center overflow-hidden">
          <div className="flex h-full w-full flex-col items-center" id="table">
            <div className="flex" style={maxRowStyle}>
              <div className="cell" />
              <div className="cell" />
              {range(1, maxSeasons).map((season: number) => (
                <div key={season} className="cell relative">
                  {season === Math.round(maxSeasons / 2) ? (
                    <h3
                      className="absolute flex h-full w-full items-center justify-center text-zinc-100"
                      style={fontSize}
                    >
                      Season
                    </h3>
                  ) : (
                    ""
                  )}
                </div>
              ))}
              <div className="cell" />
            </div>

            <div className="flex" style={maxRowStyle}>
              <div className="cell" />
              <div className="cell" />
              {range(1, maxSeasons).map((season: number) => (
                <div key={season} className="cell header-cell" style={fontSize}>
                  {season}
                </div>
              ))}
              <div className="cell" />
            </div>

            {range(1, maxEpisodes).map((episode: number) => (
              <div key={episode} className="flex" style={maxRowStyle}>
                <div className="cell relative">
                  {episode === Math.round(maxEpisodes / 2) ? (
                    <h3
                      className="absolute flex h-full w-full items-center justify-center text-center text-zinc-100"
                      style={{ ...fontSize, writingMode: "sideways-lr" }}
                    >
                      Episode
                    </h3>
                  ) : (
                    ""
                  )}
                </div>
                <div className="cell header-cell" style={fontSize}>
                  {episode}
                </div>
                {range(1, maxSeasons).map((season: number) => {
                  let episodeData = ratings[season - 1][episode - 1];
                  if (episodeData) {
                    return (
                      <div
                        key={season}
                        className="cell"
                        style={{
                          ...fontSize,
                          backgroundColor:
                            episodeData.rating !== 10
                              ? gradientArray[
                                  Math.floor(episodeData.rating * 10)
                                ]
                              : "#357de9",
                        }}
                      >
                        {episodeData.rating}
                      </div>
                    );
                  } else {
                    return <div key={season} className="cell" />;
                  }
                })}
                <div className="cell" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps({ query, req }: any) {
  const { imdbID } = query;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = req ? `${protocol}://${req.headers.host}` : "";

  let res = await fetch(baseUrl + "/api/ratings?imdbID=" + imdbID);
  let js = await res.json();
  let ratings = js["ratings"];
  let metadata = js["metadata"];
  return {
    props: {
      ratings: ratings,
      metadata: metadata,
    },
  };
}

export default TVSeries;
