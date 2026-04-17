// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2FewuiNaHXVxdqcAwu4hZvvLuG1fOkZ0",
  authDomain: "dhoond-dcdc6.firebaseapp.com",
  projectId: "dhoond-dcdc6",
  storageBucket: "dhoond-dcdc6.firebasestorage.app",
  messagingSenderId: "558069250720",
  appId: "1:558069250720:web:87a9efce5f6631fe2827c5",
  measurementId: "G-FXDGQFRZJH"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

import { getAuth } from "firebase/auth";
export const auth = getAuth(app);

export default app;