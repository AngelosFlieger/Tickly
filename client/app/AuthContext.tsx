import React, { createContext, useContext, useState } from "react";

interface User {
  _id: string;
  email: string;
  name: string;
  city: string;
  gender: string;
  age: number;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  serverIP: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const serverIP = "http://192.168.2.9:5001";

  return (
    <AuthContext.Provider value={{ user, setUser, serverIP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
