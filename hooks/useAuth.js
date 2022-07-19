import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
// import Config from "../config";

WebBrowser.maybeCompleteAuthSession(); //from the root URL of your app.

const AuthContext = createContext({});

//expoClientId is for web --- Google Cloud->APIs & Services->Credentials --- OAuth 2.0 Client IDs
//https://docs.expo.dev/guides/authentication/#google
//https://auth.expo.io/@zhiwang20/SocialMatch

const config = {
  expoClientId:
    "923049812993-6fo1l28n0p5encer11ao4ntjg2r585hc.apps.googleusercontent.com",
  webClientId:
    "923049812993-arnuf4llvfhfbgsv146dfaf1n3o932uh.apps.googleusercontent.com",
  androidClientId:
    "923049812993-3vd7rqclmcus2k4tt9co6kds370pfrde.apps.googleusercontent.com",
  iosClientId:
    "923049812993-nv7qg6c7d9ac94rn14bv1amdr5ebq50q.apps.googleusercontent.com",
  // expoClientId: Config.ExpoClientId,
  // webClientId: Config.WebClientId,
  // androidClientId: Config.AndroidClientId,
  // iosClientId: Config.IosClientId,
  scopes: ["profile", "email"],
  permissions: ["public_profile", "email", "gender", "location"],
};

//use expo-auth-session instead of expo-google-app-auth
export const AuthProvider = ({ children }) => {
  const [request, response, promptAsync] = Google.useAuthRequest(config);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);

      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      signInWithCredential(auth, credential);

      setLoading(false);
    }
  }, [response]);

  //when persisting the login status; constanly listen to user state
  //use direct return that triggers the unsubscribe(implicitly return the unsubscribe); similar to useeffect cleanup function
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null); //wjen log out
        }

        setLoadingInitial(false);
      }),
    []
  );

  const logout = () => {
    setLoading(true);
    signOut(auth)
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  //we use useMemo since if any of them changes the other rerender all together
  //this case --- we only change based on: user, logout, error
  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle: promptAsync,
      logout,
    }),
    [user, logout, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
