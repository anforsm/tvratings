import * as functions from "firebase-functions";
import { saveToCloud, getUpdatedShowInfo } from "./getDailyMovies";

export const UpdateShows = functions.pubsub
  .schedule("every 96 hours")
  .onRun(async (context) => {
    console.log("starting function");
    functions.logger.info("starting function");
    await saveToCloud(getUpdatedShowInfo());
    console.log("ending function");
    functions.logger.info("ending function");
  });
