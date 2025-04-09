import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVaQmk2wiD-tFjp_gvjgBim5Dq2KCrAVw",
  authDomain: "flux-1ff34.firebaseapp.com",
  projectId: "flux-1ff34",
  storageBucket: "flux-1ff34.firebasestorage.app",
  messagingSenderId: "587303039653",
  appId: "1:587303039653:web:52d7ffc7a730529f2d534c",
  measurementId: "G-DZJ0Z9YT18"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);