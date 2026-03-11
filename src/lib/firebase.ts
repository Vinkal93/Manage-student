import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7SpBpuAWE1MZkuDLxMqCbGFJaOx-0Wzo",
  authDomain: "insuite-manage.firebaseapp.com",
  projectId: "insuite-manage",
  storageBucket: "insuite-manage.firebasestorage.app",
  messagingSenderId: "527541067460",
  appId: "1:527541067460:web:c8cbc7775836fece23b391",
  measurementId: "G-97ZCPJDZCQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
