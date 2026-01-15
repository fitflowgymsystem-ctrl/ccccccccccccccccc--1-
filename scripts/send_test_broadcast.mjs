import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6H0duUeL35MY11qAwNtdMumPtANjjENA",
  authDomain: "fitflow-gym-89774.firebaseapp.com",
  projectId: "fitflow-gym-89774",
  storageBucket: "fitflow-gym-89774.firebasestorage.app",
  messagingSenderId: "131955100574",
  appId: "1:131955100574:web:90cb4bf0fcbffa9ab1a48f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  try {
    const id = `test_broadcast_${Date.now()}`;
    const payload = {
      id,
      title: 'Automated Test Broadcast',
      message: 'This is a test broadcast sent programmatically by the dev agent.',
      type: 'info',
      timestamp: new Date().toISOString(),
      targetGymId: null,
      created_at: Timestamp.now()
    };

    await setDoc(doc(db, 'broadcasts', id), payload, { merge: true });
    console.log('✅ Test broadcast written to Firestore:', id);
  } catch (err) {
    console.error('❌ Failed to write test broadcast:', err);
    process.exitCode = 1;
  }
})();
