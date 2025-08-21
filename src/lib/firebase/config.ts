// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdV_1H3UL4U5QkW7M0J2Uz2CbE_xr1Dfg",
  authDomain: "soilrentals.firebaseapp.com",
  projectId: "soilrentals",
  storageBucket: "soilrentals.appspot.com",
  messagingSenderId: "208946442744",
  appId: "1:208946442744:web:51dd7adf8a626627ade60d",
  measurementId: "G-E8Z4Z0Z3ZB"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
