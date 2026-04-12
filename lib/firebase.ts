import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCr_rWHnm0w79J63dm69DEMkjawulE5Ovk",
  authDomain: "bitlance-761eb.firebaseapp.com",
  projectId: "bitlance-761eb",
  storageBucket: "bitlance-761eb.firebasestorage.app",
  messagingSenderId: "482009206673",
  appId: "1:482009206673:web:dc57ce72ee5ed5b050d430",
  measurementId: "G-KRV3J7G8GK",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);

// Analytics only runs in the browser and when supported.
if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) getAnalytics(firebaseApp);
    })
    .catch(() => {
      // Ignore analytics init errors.
    });
}
