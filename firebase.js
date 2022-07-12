import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Config from "./config";

const firebaseConfig = {
  // apiKey: "AIzaSyAXW0jSHSlfzb3vKI_8OaMnA-hPBtpO3TM",
  // authDomain: "socialmatch-193f0.firebaseapp.com",
  // projectId: "socialmatch-193f0",
  // storageBucket: "socialmatch-193f0.appspot.com",
  // messagingSenderId: "417952428997",
  // appId: "1:417952428997:web:2b8284859ccc04766b91ac",
  apiKey: Config.apiKey,
  authDomain: Config.authDomain,
  projectId: Config.projectId,
  storageBucket: Config.storageBucket,
  messagingSenderId: Config.messagingSenderId,
  appId: Config.appId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db };
