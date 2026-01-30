import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: 請將此處替換為您從 Firebase Console 取得的配置資訊
// 重要設定檢查清單：
// 1. Authentication: 務必在 Firebase Console -> Authentication -> Sign-in method 啟用 [Google] 登入。
// 2. Authorized Domains: 務必在 Authentication -> Settings -> Authorized domains 新增目前的網址 (例如 webcontainer 的網域)。
// 3. Database: 務必在 Realtime Database -> Rules 設定為 read: true, write: true (測試用)。
const firebaseConfig = {
  apiKey: "AIzaSyDR2_eiIpZJwoejWnjJthB4lwoRIlnxh5E",
  authDomain: "baby-test-65bc8.firebaseapp.com",
  databaseURL: "https://baby-test-65bc8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baby-test-65bc8",
  storageBucket: "baby-test-65bc8.firebasestorage.app",
  messagingSenderId: "288742044086",
  appId: "1:288742044086:web:b9599f2fbefda8cba19117",
  measurementId: "G-NSHY1XZLV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();