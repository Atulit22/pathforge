import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";


/* =========================================
   AUTH CONTEXT TYPE
========================================= */

interface AuthContextType {
  user: User | null;

  session: Session | null;

  isLoggedIn: boolean;

  isAdmin: boolean;

  actor: string;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    email: string,
    password: string
  ) => Promise<void>;

  loginWithGoogle: () => Promise<void>;

  logout: () => Promise<void>;
}


/* =========================================
   ADMIN ROLE RESOLUTION
========================================= */

/**
 * True when the Supabase user carries an "admin" claim. Checks the common
 * places people put it, in both `app_metadata` (server-set) and `user_metadata`
 * (dashboard-editable), case-insensitively.
 */
function resolveIsAdmin(user: User | null): boolean {
  if (!user) return false;

  const sources: Record<string, unknown>[] = [
    (user.app_metadata ?? {}) as Record<string, unknown>,
    (user.user_metadata ?? {}) as Record<string, unknown>,
  ];

  const isAdminWord = (value: unknown): boolean =>
    typeof value === "string" && value.trim().toLowerCase() === "admin";

  for (const meta of sources) {
    if (isAdminWord(meta.role)) return true;
    if (isAdminWord(meta.user_role)) return true;
    if (meta.is_admin === true || meta.isAdmin === true || meta.admin === true) {
      return true;
    }

    const roles = meta.roles ?? meta.role;
    if (Array.isArray(roles) && roles.some(isAdminWord)) return true;
  }

  return false;
}


/* =========================================
   CONTEXT
========================================= */

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);


  /* =========================================
     APP URL

     IMPORTANT:

     Set VITE_SITE_URL in your .env file.

     Example for production:

     VITE_SITE_URL=https://your-app.vercel.app

     During development, it falls back
     to the current localhost URL.
  ========================================= */

  const appUrl =
    import.meta.env.VITE_SITE_URL ||
    window.location.origin;


  /* =========================================
     LOAD EXISTING SESSION
  ========================================= */

  useEffect(() => {

    let mounted = true;


    async function getInitialSession() {

      try {

        const {
          data,
          error,
        } = await supabase.auth.getSession();


        if (error) {

          console.error(
            "Error getting session:",
            error.message
          );

        }


        if (mounted) {

          setSession(
            data.session
          );

          setUser(
            data.session?.user ?? null
          );

          setLoading(false);

        }

      } catch (error) {

        console.error(
          "Failed to initialize authentication:",
          error
        );

        if (mounted) {

          setLoading(false);

        }

      }

    }


    getInitialSession();


    /* =========================================
       LISTEN FOR AUTH CHANGES

       Automatically updates when:

       - User signs in
       - User signs out
       - User signs up
       - Email gets verified
       - Google OAuth completes
    ========================================= */

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {

        if (!mounted) {
          return;
        }


        setSession(
          newSession
        );

        setUser(
          newSession?.user ?? null
        );

        setLoading(false);

      }
    );


    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);


  /* =========================================
     EMAIL / PASSWORD LOGIN
  ========================================= */

  async function login(
    email: string,
    password: string
  ): Promise<void> {

    if (!email.trim()) {

      throw new Error(
        "Please enter your email address."
      );

    }


    if (!password) {

      throw new Error(
        "Please enter your password."
      );

    }


    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({

      email: email.trim(),

      password,

    });


    if (error) {

      throw new Error(
        error.message
      );

    }


    setSession(
      data.session
    );

    setUser(
      data.user
    );

  }


  /* =========================================
     CREATE ACCOUNT / SIGN UP
  ========================================= */

  async function signup(
    email: string,
    password: string
  ): Promise<void> {

    if (!email.trim()) {

      throw new Error(
        "Please enter your email address."
      );

    }


    if (!password) {

      throw new Error(
        "Please enter a password."
      );

    }


    if (password.length < 6) {

      throw new Error(
        "Password must be at least 6 characters."
      );

    }


    const {
      data,
      error,
    } = await supabase.auth.signUp({

      email: email.trim(),

      password,

      options: {

        /*
          IMPORTANT

          This controls where Supabase sends
          the user AFTER clicking the email
          verification link.
        */

        emailRedirectTo: appUrl,

      },

    });


    if (error) {

      throw new Error(
        error.message
      );

    }


    /*
      If email confirmation is disabled,
      Supabase immediately creates a session.
    */

    if (data.session) {

      setSession(
        data.session
      );

      setUser(
        data.user
      );

      return;

    }


    /*
      Email confirmation is enabled.

      The account was successfully created.

      DO NOT THROW AN ERROR HERE.

      Throwing an error makes the LoginPage
      incorrectly display a red error message
      even though signup actually worked.
    */

    console.log(
      "Account created successfully. Verification email sent."
    );

  }


  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  async function loginWithGoogle(): Promise<void> {

    const {
      data,
      error,
    } = await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {

        /*
          After successful Google login,
          return to the configured app URL.
        */

        redirectTo: appUrl,

      },

    });


    if (error) {

      throw new Error(
        error.message
      );

    }


    if (!data?.url) {

      throw new Error(
        "Could not start Google sign in."
      );

    }

  }


  /* =========================================
     LOGOUT
  ========================================= */

  async function logout(): Promise<void> {

    const {
      error,
    } = await supabase.auth.signOut();


    if (error) {

      throw new Error(
        error.message
      );

    }


    setSession(null);

    setUser(null);

  }


  /* =========================================
     AUTH STATUS
  ========================================= */

  const isLoggedIn =
    user !== null;


  /* =========================================
     ADMIN STATUS

     Admin access is driven by a Supabase role claim, not a hardcoded email
     list. A user is an admin when any of these is set to "admin":

       - app_metadata.role          (recommended — only settable server-side)
       - app_metadata.roles[]       (contains "admin")
       - user_metadata.role         (client-editable; convenient but weaker)

     Set it once per user, e.g. from the Supabase SQL editor:
       update auth.users
       set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
       where email = 'you@example.com';
  ========================================= */

  const isAdmin = resolveIsAdmin(user);

  // Dev-only: shows exactly what claims the signed-in user carries, so it is
  // obvious where an "admin" role needs to go. Stripped from production builds.
  useEffect(() => {
    if (!import.meta.env.DEV || !user) return;
    (window as unknown as { __authUser?: unknown }).__authUser = user;
    console.warn(
      `[auth] ${user.email} — isAdmin=${isAdmin}\n` +
        `  app_metadata: ${JSON.stringify(user.app_metadata)}\n` +
        `  user_metadata: ${JSON.stringify(user.user_metadata)}\n` +
        `  (also available as window.__authUser)`
    );
  }, [user, isAdmin]);


  /* =========================================
     ACTOR

     Used for audit logs.
  ========================================= */

  const actor =
    user?.email ?? "workspace";


  /* =========================================
     LOADING SCREEN
  ========================================= */

  if (loading) {

    return null;

  }


  /* =========================================
     PROVIDER VALUE
  ========================================= */

  const value: AuthContextType = {

    user,

    session,

    isLoggedIn,

    isAdmin,

    actor,

    login,

    signup,

    loginWithGoogle,

    logout,

  };


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


/* =========================================
   USE AUTH HOOK
========================================= */

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}