import {
  useState,
  type FormEvent,
} from "react";

import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowRight,
  UserPlus,
  Globe,
} from "lucide-react";

import { useAuth } from "../store/AuthContext";

export default function LoginPage() {
  const {
    login,
    signup,
    loginWithGoogle,
  } = useAuth();

  const [isSignUp, setIsSignUp] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signup(
          email.trim(),
          password
        );
      } else {
        await login(
          email.trim(),
          password
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : isSignUp
            ? "Could not create your account."
            : "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign in failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignUp(!isSignUp);
    setError("");
    setPassword("");
  }

  return (
    <div className="login-page">

      {/* Background effects */}

      <div className="login-background">
        <div className="login-glow glow-one" />

        <div className="login-glow glow-two" />

        <div className="login-grid" />
      </div>


      {/* Brand */}

      <div className="login-brand">

        <div className="login-brand-icon">
          <Stethoscope size={21} />
        </div>

        <div className="login-brand-text">
          <h1>PathForge</h1>

          <span>
            Clinical Pathology Workspace
          </span>
        </div>

      </div>


      {/* Login panel */}

      <main className="login-container">

        <section className="login-card">

          <div className="login-logo">

            <div className="login-logo-circle">
              <Stethoscope size={42} />
            </div>

          </div>


          {/* Heading */}

          <div className="login-heading">

            <h2>
  {isSignUp
    ? "Create your account"
    : "Welcome back"}
</h2>

            <p>
              {isSignUp
                ? "Create an account to access your pathology workspace."
                : "Sign in to access your pathology workspace."}
            </p>

          </div>


          {/* Form */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder={
                    isSignUp
                      ? "Create a password"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* Error */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* Submit */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              <span>

                {loading
                  ? "Please wait..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}

              </span>

              {isSignUp ? (
                <UserPlus size={18} />
              ) : (
                <ArrowRight size={18} />
              )}

            </button>

          </form>


          {/* Divider */}

          <div className="login-divider">

            <span />

            <p>OR</p>

            <span />

          </div>


          {/* Google Login */}

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >

            <Globe size={19} />

            <span>
              Continue with Google
            </span>

          </button>


          {/* Toggle Sign In / Sign Up */}

          <div className="login-switch">

            {isSignUp ? (
              <>

                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                >
                  Sign in
                </button>

              </>
            ) : (
              <>

                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                >
                  Create account
                </button>

              </>
            )}

          </div>


          {/* Footer */}

          <div className="login-footer">

            <span className="secure-dot" />

            Secure pathology workspace

          </div>

        </section>

      </main>


      {/* Bottom */}

      <div className="login-bottom">

        <span>
          PathForge Clinical Systems
        </span>

        <span>•</span>

        <span>
          Secure Workspace
        </span>

      </div>

    </div>
  );
}