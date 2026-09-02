import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCME146Op6-PjPOJw0IvBEDjCshLFEfCYY",
  authDomain: "dronaid-jira-app.firebaseapp.com",
  projectId: "dronaid-jira-app",
  storageBucket: "dronaid-jira-app.firebasestorage.app",
  messagingSenderId: "960177124191",
  appId: "1:960177124191:web:41f8f0b114878268bbbcea"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);