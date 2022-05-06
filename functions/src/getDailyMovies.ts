import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fetch from "node-fetch";
import credential from "./serviceAccountCredential";

const fs = require("fs");
const gunzip = require("gunzip-file");
const csv = require("csv-parser");

const app = initializeApp({
  credential: cert(credential as ServiceAccount),
  databaseURL:
    "https://tvratings-471ce-default-rtdb.europe-west1.firebasedatabase.app",
});

const database = getDatabase(app);
const ref = (database: any, path: string) => {
  return database.ref(path);
};
const set = async (ref: any, data: any) => {
  return ref.set(data);
};

const saveToCloud = async (updatedShowInfo: any) => {
  let [showInfo, IDtoTitle, _] = await updatedShowInfo;
  console.log("saving to cloud");
  console.log(showInfo["tt10857164"][0][5].rating);
  await Promise.all(
    Object.keys(showInfo).map(async (key: string) => {
      let show = showInfo[key];
      await set(ref(database, "shows/" + key), show);
    })
  );
  await Promise.all(
    Object.keys(IDtoTitle).map(async (key: string) => {
      await set(ref(database, "IDtoTitle/" + key), IDtoTitle[key]);
    })
  );
  console.log("saved to cloud");
};

const fileExists = async (path: string) => {
  console.log("checking " + path);
  return fs.existsSync(path);
};

const downloadAndParseFileIfNotExists = async (
  file: string,
  ids: any = null
) => {
  const filepath = "/tmp/" + file;

  const zippedFilepath = filepath + ".tsv.gz";
  if (!(await fileExists(zippedFilepath))) {
    const dest = fs.createWriteStream(zippedFilepath);
    console.log("downloading file");
    const result = await fetch(
      "https://datasets.imdbws.com/" + file + ".tsv.gz"
    );
    await new Promise((resolve, reject) => {
      // @ts-ignore
      result.body?.pipe(dest);
      // @ts-ignore
      result.body?.on("error", reject);
      dest.on("finish", resolve);
    });
  }

  const unzippedFilepath = filepath + ".tsv";
  if (!(await fileExists(unzippedFilepath))) {
    console.log("unzipping file");
    await new Promise((resolve, reject) => {
      gunzip(zippedFilepath, unzippedFilepath, () => {
        resolve("unzipped");
      });
    });
  }

  let results: any = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(unzippedFilepath)
      // have to use | as quote character due to csv parser bug?
      .pipe(csv({ separator: "\t", quote: `|` }))
      .on("data", (data: any) => {
        if (!ids || data["tconst"] in ids) {
          results.push(data);
        }
      })
      .on("end", () => {
        resolve("finish");
      });
  });
  return results;
};

const getUpdatedShowInfo = async () => {
  let ratedTitles: any = {};
  let allRatings: any = {};
  let ratings = await downloadAndParseFileIfNotExists("title.ratings");
  console.log("all rated titles");
  console.log(ratings.length);
  ratings.forEach((rating: any) => {
    if (parseInt(rating.numVotes) > 10000) {
      ratedTitles[rating.tconst] = rating.averageRating;
    }
    allRatings[rating.tconst] = rating.averageRating;
  });
  console.log("deleted bad shows");
  console.log(Object.keys(ratedTitles).length);

  // "garbage collection"
  ratings = null;

  let showInfo: any = {};
  let episodes = await downloadAndParseFileIfNotExists("title.episode");
  let numOfEpisodes = 0;

  const ifNaN = (x: any) => (isNaN(x) ? -1 : x);

  episodes.forEach((episode: any) => {
    if (episode.parentTconst in ratedTitles) {
      if (!showInfo[episode.parentTconst]) showInfo[episode.parentTconst] = [];

      numOfEpisodes++;

      let s = ifNaN(parseInt(episode.seasonNumber));
      let e = ifNaN(parseInt(episode.episodeNumber));
      let r = ifNaN(parseFloat(allRatings[episode.tconst]));
      if (s !== -1 && e !== -1 && r !== -1)
        showInfo[episode.parentTconst].push({
          id: episode.tconst,
          season: s,
          episode: e,
          rating: r,
        });
    }
  });
  console.log("number of shows");
  console.log(Object.keys(showInfo).length);
  console.log("number of episodes");
  console.log(numOfEpisodes);

  // "garbage collection"
  allRatings = null;
  ratedTitles = null;

  episodes = null;

  let titles = await downloadAndParseFileIfNotExists("title.basics");
  let titleToID: any = {};
  let IDtoTitle: any = {};
  titles.forEach((title: any) => {
    if (title.tconst in showInfo) {
      titleToID[title.primaryTitle] = title.tconst;
      IDtoTitle[title.tconst] = title.primaryTitle;
    }
  });

  // "garbage collection"
  titles = null;

  // sort show episodes
  const episodeCompare = (ep1: any, ep2: any) =>
    ep1.season === ep2.season
      ? ep1.episode - ep2.episode
      : ep1.season - ep2.season;

  Object.keys(showInfo).forEach((showID) => {
    let sortedEpisodes = showInfo[showID]
      .filter((ep: any) => ep && ep.season)
      .sort(episodeCompare);
    if (sortedEpisodes.length > 0) {
      showInfo[showID] = [];
      let currSeason =
        (sortedEpisodes[0].season ? sortedEpisodes[0].season : 0) - 1;
      let currSeasonI = -1;
      sortedEpisodes.forEach((episode: any) => {
        if (episode && episode.season) {
          if ((episode.season ? episode.season : 0) > currSeason) {
            showInfo[showID].push([]);
            currSeasonI += 1;
            currSeason = episode.season;
          }
          showInfo[showID][currSeasonI].push(episode);
        }
      });
    }
  });
  console.log(showInfo["tt10857164"][0][5].rating);
  return [showInfo, IDtoTitle, titleToID];
};

export { saveToCloud, getUpdatedShowInfo };
