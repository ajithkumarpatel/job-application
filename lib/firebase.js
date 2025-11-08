// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed to avoid scope collision
  signOut,
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// Using a known placeholder to detect if keys are configured.
const PLACEHOLDER_API_KEY = "AIzaSyBI1OltefGHDf4GNdaCHVJw8dWUPYmnELg";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || PLACEHOLDER_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "bubududu-chat-4811c.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://bubududu-chat-4811c-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "bubududu-chat-4811c",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "bubududu-chat-4811c.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "872539502517",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:872539502517:web:ed9179cece8c8572044bfc"
};

// FIX: Added a check to prevent app crash if Firebase is not configured.
export const isFirebaseConfigured = firebaseConfig.apiKey !== PLACEHOLDER_API_KEY;

// Conditionally initialize and export Firebase services.
let auth, db, signInWithGoogle, logout, onAuthStateChanged, saveResumeAnalysis, getResumeAnalysis, getJobHistory, addJobToHistoryInDb, deleteJobFromHistoryInDb;

if (isFirebaseConfigured) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    joinDate: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error);
        }
    };

    logout = () => signOut(auth);
    onAuthStateChanged = firebaseOnAuthStateChanged;

    saveResumeAnalysis = async (userId, analysis) => {
        const analysisDocRef = doc(db, `users/${userId}/resumeAnalysis/latest`);
        await setDoc(analysisDocRef, { ...analysis, updatedAt: serverTimestamp() });
    };

    getResumeAnalysis = async (userId) => {
        const analysisDocRef = doc(db, `users/${userId}/resumeAnalysis/latest`);
        const docSnap = await getDoc(analysisDocRef);
        return docSnap.exists() ? docSnap.data() : null;
    };

    getJobHistory = async (userId) => {
        const jobsCollectionRef = collection(db, `users/${userId}/jobHistory`);
        const q = query(jobsCollectionRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    addJobToHistoryInDb = async (userId, jobData) => {
        const jobsCollectionRef = collection(db, `users/${userId}/jobHistory`);
        const docRef = await addDoc(jobsCollectionRef, jobData);
        return { id: docRef.id, ...jobData };
    };

    deleteJobFromHistoryInDb = async (userId, jobId) => {
        const jobDocRef = doc(db, `users/${userId}/jobHistory`, jobId);
        await deleteDoc(jobDocRef);
    };

} else {
    console.warn("Firebase is not configured. Using dummy functions. Please check your environment variables.");
    const dummyPromise = (name) => () => {
      console.error(`Firebase not configured. Cannot call ${name}.`);
      return Promise.resolve();
    };
    
    auth = undefined;
    db = undefined;
    signInWithGoogle = dummyPromise('signInWithGoogle');
    logout = () => console.error('Firebase not configured. Cannot log out.');
    onAuthStateChanged = () => () => {}; // Return no-op unsubscribe
    saveResumeAnalysis = dummyPromise('saveResumeAnalysis');
    getResumeAnalysis = () => Promise.resolve(null);
    getJobHistory = () => Promise.resolve([]);
    addJobToHistoryInDb = (_, jobData) => Promise.resolve({ ...jobData, id: `dummy-${Date.now()}` });
    deleteJobFromHistoryInDb = dummyPromise('deleteJobFromHistoryInDb');
}

export { 
    auth, 
    db,
    signInWithGoogle, 
    logout,
    onAuthStateChanged,
    saveResumeAnalysis,
    getResumeAnalysis,
    getJobHistory,
    addJobToHistoryInDb,
    deleteJobFromHistoryInDb
};
