import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../store/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");

    const success = login(username, password);

    if (!success) {
      setError(
        "Invalid username or password. Please try again."
      );
    }
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
          <span>Clinical Pathology Workspace</span>
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

          <div className="login-heading">
            <h2>Welcome back</h2>

            <p>
              Sign in to access your pathology workspace.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* Username */}
            <div className="login-field">
              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">
                <User size={18} />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  autoComplete="username"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
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

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
            >
              <span>Sign in</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="login-footer">
            <span className="secure-dot" />
            Secure clinical workspace
          </div>
        </section>
      </main>

      {/* Bottom */}
      <div className="login-bottom">
        <span>PathForge Clinical Systems</span>
        <span>•</span>
        <span>Secure Workspace</span>
      </div>
    </div>
  );
}