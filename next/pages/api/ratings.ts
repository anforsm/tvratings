import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";
import type { NextApiRequest, NextApiResponse } from "next";

const firebaseConfig = {
  apiKey: "AIzaSyAc9qhqiYfxXQbuSpHSt9gyLWbGaWgbrO8",
  authDomain: "tvratings-471ce.firebaseapp.com",
  projectId: "tvratings-471ce",
  storageBucket: "tvratings-471ce.appspot.com",
  messagingSenderId: "596686525124",
  appId: "1:596686525124:web:baec16c818f46ded5a6f91",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(
  app,
  "https://tvratings-471ce-default-rtdb.europe-west1.firebasedatabase.app"
);

type Data = {
  ratings: any;
  metadata: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { imdbID } = req.query;

  let showInfo = (await get(ref(database, "shows/" + imdbID))).val();
  let title = (await get(ref(database, "IDtoTitle/" + imdbID))).val();

  res.status(200).json({
    ratings: showInfo,
    metadata: {
      id: imdbID,
      title: title,
    },
  });
}
