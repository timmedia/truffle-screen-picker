import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Button, Switch } from "@mui/material";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";

interface StoredSetup {
  currentlyVoting: boolean;
}

function App() {
  const [currentlyVoting, setCurrentlyVoting] = useState(false);
  const document = doc(collection(firestore, "/admin"), "Ogc8Qi42SO1mgDO2PdJv");

  onSnapshot(document, (doc) => {
    const { currentlyVoting } = doc.data() as StoredSetup;
    setCurrentlyVoting(currentlyVoting);
  });

  const toggleCurrentlyVoting = (event: any) => {
    updateDoc(document, { currentlyVoting: !currentlyVoting });
  };

  return (
    <div className="App">
      <p>Currently pooling:</p>
      <Switch checked={currentlyVoting} onChange={toggleCurrentlyVoting} />
    </div>
  );
}

export default App;
