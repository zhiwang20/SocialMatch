import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import Config from "./config";

const firebaseConfig = {
  apiKey: "AIzaSyBfehCpJOkmkr0MSutW0DVjC8fo9rpORMg",
  authDomain: "socialmatch-8050f.firebaseapp.com",
  projectId: "socialmatch-8050f",
  storageBucket: "socialmatch-8050f.appspot.com",
  messagingSenderId: "923049812993",
  appId: "1:923049812993:web:71c92b795736e2e4c08c00",
};
// apiKey: Config.apiKey,
// authDomain: Config.authDomain,
// projectId: Config.projectId,
// storageBucket: Config.storageBucket,
// messagingSenderId: Config.messagingSenderId,
// appId: Config.appId,

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db };
