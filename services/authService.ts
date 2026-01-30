import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Login failed:", error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/configuration-not-found') {
      alert("登入設定錯誤：Google 登入功能尚未啟用。\n\n請前往 Firebase Console -> Authentication -> Sign-in method，將「Google」供應商設為「啟用」，並填寫支援電子郵件。");
    } else if (error.code === 'auth/unauthorized-domain') {
      alert(`網域未授權 (auth/unauthorized-domain)\n\n請前往 Firebase Console -> Authentication -> Settings -> Authorized domains\n將目前網域 "${window.location.hostname}" 加入授權清單。`);
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log("User closed login popup");
    } else if (error.code === 'auth/popup-blocked') {
      alert("登入視窗被封鎖，請允許彈出式視窗後重試。");
    } else {
      alert(`登入失敗 (${error.code})：請稍後再試。`);
    }
    
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};