import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB2ewVDYsxK1Qm_eJKVSvfvNQ9UiTOK2AU",
  authDomain: "truffle-demos.firebaseapp.com",
  databaseURL: "https://truffle-demos-default-rtdb.firebaseio.com",
  projectId: "truffle-demos",
  storageBucket: "truffle-demos.appspot.com",
  messagingSenderId: "16794194577",
  appId: "1:16794194577:web:907457a4b4806a742ee530",
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
