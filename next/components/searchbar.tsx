import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useRouter } from "next/router";

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

const Searchbar = (props: any) => {
  const [search, setSearch] = useState("");
  const [titles, setTitles] = useState([]);
  const [titleToID, setTitleToID] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    console.log(props);
    get(ref(database, "IDtoTitle")).then((dt) => {
      let IDtoTitle = dt.val();
      setTitles(Array.from(new Set(Object.values(IDtoTitle))));

      let _titleToID: any = {};
      Object.keys(IDtoTitle).forEach((key) => {
        _titleToID[IDtoTitle[key]] = key;
      });

      setTitleToID(_titleToID);
    });
  }, []);

  return (
    <div className="flex w-full items-center justify-center gap-2 bg-white/5 p-4 shadow-lg">
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={titles}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="TV Series" />}
        onInputChange={(event, newValue) => {
          setSearch(newValue);
        }}
        inputValue={search}
      />
      <Button
        onClick={() => {
          router.push("/tvseries/" + titleToID[search]);
        }}
      >
        Search
      </Button>
    </div>
  );
};

export default Searchbar;
