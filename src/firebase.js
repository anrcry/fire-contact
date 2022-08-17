import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getAuth, connectAuthEmulator, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, serverTimestamp, doc, setDoc, where, limit, getDocs, query } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js"
// import { getStorage, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-storage.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app-check.js";


const { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGE_SENDER_ID, PUBLIC_FIREBASE_APP_ID, PUBLIC_FIREBASE_FIRESTORE_COLLECTION, PUBLIC_RECAPTCHA_V3_SITE_KEY } = import.meta.env;


const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(`${PUBLIC_RECAPTCHA_V3_SITE_KEY}`),
    isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
if(!import.meta.env.PROD) connectAuthEmulator(auth, "http://127.0.0.1:8001");

const db = getFirestore(app);
if(!import.meta.env.PROD) connectFirestoreEmulator(db, '127.0.0.1', 8002);

// Create a database record...
// TODO: Database Transaction required (Rollback on failure with message).
const createRecord = async ( { uid, email, name, subject, message, token } ) => {

    const { replied, sentAt } = { replied: false, sentAt: serverTimestamp() };
   
    try{
        await setDoc(doc(db, PUBLIC_FIREBASE_FIRESTORE_COLLECTION, token), {
            uid,
            email,
            name,
            subject,
            message,
            token,
            replied,
            sentAt
        }, { merge: true });
        return { record: { id: token }, success: true }
    }catch (err) {
       return  { record: undefined, success: false, err }
    }
};

const hasRecord = async ( { uid, token } ) => {
    const q = query(collection(db, PUBLIC_FIREBASE_FIRESTORE_COLLECTION), where("uid", "==", uid ), where( 'token', '==' , token ), limit(1));
    
    const records = await getDocs(q);

    return records.empty;
}

export {
    auth,
    appCheck,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    createRecord
}