import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Public web config for the Burkan Firebase project. These values are meant
// to be visible in the browser; access is controlled by Firestore security
// rules (firestore.rules at the repo root), not by hiding this object.
const firebaseConfig = {
  apiKey: "AIzaSyAk36BsqJDzgv8sGsl6xgejZk02L_i_Huw",
  authDomain: "burkan-taekwondo-protal.firebaseapp.com",
  projectId: "burkan-taekwondo-protal",
  storageBucket: "burkan-taekwondo-protal.firebasestorage.app",
  messagingSenderId: "836447472940",
  appId: "1:836447472940:web:9ef75f8b9e0dfb88b6f089",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
