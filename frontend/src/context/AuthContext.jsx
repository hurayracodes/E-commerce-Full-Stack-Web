import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth`;
const TOKEN_KEY = "msee_token";


export const AuthContext = createContext({
  user: null,
  authLoading: false,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// token ko axios ke har request ke saath laga do (CreateProduct wagera ko kuch badalna nahi)
const applyToken = (token) => {
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete axios.defaults.headers.common.Authorization;
};

const saveToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  applyToken(token);
};

// backend ka error message nikalo
const errMsg = (err, fallback) => err?.response?.data?.error || fallback;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // page refresh par token se user wapas lo
  useEffect(() => {
    const token = readToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    applyToken(token);
    axios
      .get(`${API}/me`)
      .then((res) => setUser(res.data.user))
      .catch(() => saveToken(null)) // token kharab/expire
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/login`, { email, password });
      saveToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(errMsg(err, "Login nahi ho saka. Backend chal raha hai?"));
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API}/register`, { name, email, password });
      saveToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(errMsg(err, "Register nahi ho saka. Backend chal raha hai?"));
    }
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, isAdmin: user?.role === "admin", login, register, logout }),
    [user, authLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;