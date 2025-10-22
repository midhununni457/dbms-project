"use client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { getErrMsg } from "@/hooks/errorParser";

export const ApiContext = createContext({
  accessToken: "",
  setAccessToken: () => {},
  logout: () => {},
  axiosApiPrivate: {},
  axiosApiPublic: {},
  userData: {},
  setUserData: () => {},
});

export const ApiProvider = ({ children }) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE;

  if (!apiBaseUrl) {
    throw new Error("Required environment variables are not defined");
  }

  const [accessToken, setAccessToken] = useLocalStorage("accessToken", "");
  const [userError, setUserError] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    id: "",
    email: "",
  });

  const axiosApiPublic = useMemo(() => {
    return axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
  }, [apiBaseUrl]);

  const axiosApiPrivate = useMemo(() => {
    const instance = axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setAccessToken("");
          setUserData({ name: "", role: "", id: "", email: "" });
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [apiBaseUrl, accessToken, setAccessToken]);

  const logout = useCallback(() => {
    setAccessToken("");
    setUserData({ name: "", role: "", id: "", email: "" });
  }, [setAccessToken]);

  const login = useCallback(
    async (email, password) => {
      setUserError(null);
      try {
        const response = await axiosApiPublic.post("/auth/login", {
          email,
          password,
        });
        if (response.data.token) {
          setAccessToken(response.data.token);
          const decoded = jwtDecode(response.data.token);
          setUserData({
            name: decoded.name || "",
            role: decoded.role || "",
            id: decoded.id || "",
            email: decoded.email || "",
          });
          return decoded.role;
        } else {
          setUserError(response.data.error);
          return null;
        }
      } catch (error) {
        setUserError(getErrMsg(error));
      }
    },
    [axiosApiPublic]
  );

  const signup = useCallback(
    async (email, password, name, role, securityQuestion, securityAnswer) => {
      setUserError(null);
      try {
        const response = await axiosApiPublic.post("/auth/signup", {
          email,
          password,
          name,
          role,
          securityQuestion,
          securityAnswer,
        });
        return response.data;
      } catch (error) {
        setUserError(getErrMsg(error));
        return { error: getErrMsg(error) };
      }
    },
    [axiosApiPublic]
  );

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setUserData({
          name: decoded.name || "",
          role: decoded.role || "",
          id: decoded.id || "",
          email: decoded.email || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    } else {
      setUserData({ name: "", role: "", id: "", email: "" });
    }
  }, [accessToken, logout]);

  const contextValue = useMemo(
    () => ({
      accessToken,
      userError,
      setAccessToken,
      logout,
      login,
      signup,
      axiosApiPrivate,
      axiosApiPublic,
      userData,
      setUserData,
    }),
    [
      accessToken,
      userError,
      setAccessToken,
      logout,
      login,
      signup,
      axiosApiPrivate,
      axiosApiPublic,
      userData,
    ]
  );

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
