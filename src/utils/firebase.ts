
import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAXPWV532Pk05-CFuULphQRvVxeotEMLNY",
  authDomain: "holpla-geis.firebaseapp.com",
  databaseURL: "https://holpla-geis-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "holpla-geis",
  storageBucket: "holpla-geis.firebasestorage.app",
  messagingSenderId: "585405486765",
  appId: "1:585405486765:web:ac346ff74aa9561646d824"
};

console.log("Initializing Firebase...");
let app;
let database;
let cookingOptionsRef;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  database = getDatabase(app);
  cookingOptionsRef = ref(database, 'cookingOptions');
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { database, cookingOptionsRef };
