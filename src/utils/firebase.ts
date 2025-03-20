
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXPWV532Pk05-CFuULphQRvVxeotEMLNY",
  authDomain: "holpla-geis.firebaseapp.com",
  databaseURL: "https://holpla-geis-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "holpla-geis",
  storageBucket: "holpla-geis.firebasestorage.app",
  messagingSenderId: "585405486765",
  appId: "1:585405486765:web:ac346ff74aa9561646d824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database references
export const ordersRef = ref(database, 'orders');
export const pendingOrdersRef = ref(database, 'pendingOrders');
export const completedOrdersRef = ref(database, 'completedOrders');
export const menuItemsRef = ref(database, 'menuItems');
export const cookingOptionsRef = ref(database, 'cookingOptions');

export { database };
