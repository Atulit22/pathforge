import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "employee";

interface AuthContextType {
  role: UserRole | null;
  isAdmin: boolean;
  isLoggedIn: boolean;

  login: (
    username: string,
    password: string
  ) => boolean;

  logout: () => void;

  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [role, setRoleState] =
    useState<UserRole | null>(() => {
      const savedRole =
        localStorage.getItem("pathforge-role");

      if (
        savedRole === "admin" ||
        savedRole === "employee"
      ) {
        return savedRole;
      }

      return null;
    });

  function login(
    username: string,
    password: string
  ): boolean {
    // ADMIN LOGIN
    if (
      username === "admin" &&
      password === "admin123"
    ) {
      setRoleState("admin");

      localStorage.setItem(
        "pathforge-role",
        "admin"
      );

      return true;
    }

    // EMPLOYEE LOGIN
    if (
      username === "employee" &&
      password === "employee123"
    ) {
      setRoleState("employee");

      localStorage.setItem(
        "pathforge-role",
        "employee"
      );

      return true;
    }

    return false;
  }

  function logout() {
    setRoleState(null);

    localStorage.removeItem(
      "pathforge-role"
    );
  }

  function setRole(newRole: UserRole) {
    setRoleState(newRole);

    localStorage.setItem(
      "pathforge-role",
      newRole
    );
  }

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin,
        isLoggedIn: role !== null,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}