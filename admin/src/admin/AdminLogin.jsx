



import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/adminlogin.css";
import "../styles/admin-theme.css";

function AdminLogin() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =====================================
     REMEMBER ADMIN EMAIL ONLY
  ===================================== */

  useEffect(() => {
    const savedEmail =
      localStorage.getItem(
        "rememberAdmin"
      );

    if (savedEmail) {
      setForm((prev) => ({
        ...prev,
        identifier: savedEmail,
      }));

      setRememberMe(true);
    }
  }, []);


  /* =====================================
     LOGIN
  ===================================== */

  const login = async (e) => {
    e.preventDefault();

    setMessage("");

    if (
      !form.identifier.trim() ||
      !form.password
    ) {
      setMessage(
        "Please enter email and password"
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            identifier:
              form.identifier.trim(),

            password:
              form.password,
          }),
        }
      );

      const data =
        await response.json();

      /* API ERROR */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed"
        );
      }

      /* TOKEN CHECK */

      if (!data.token) {
        throw new Error(
          "Login token not received"
        );
      }

      /* ONLY ADMIN */

      if (
        !data.admin ||
        data.admin.role !== "admin"
      ) {
        throw new Error(
          "Admin access only"
        );
      }

      /* SAVE TOKEN */

      localStorage.setItem(
        "adminToken",
        data.token
      );

      /* SAVE ADMIN DATA */

      localStorage.setItem(
        "adminData",
        JSON.stringify(
          data.admin
        )
      );

      /* REMEMBER EMAIL */

      if (rememberMe) {
        localStorage.setItem(
          "rememberAdmin",
          form.identifier.trim()
        );
      } else {
        localStorage.removeItem(
          "rememberAdmin"
        );
      }

      /* =====================================
         LOGIN SUCCESS -> DASHBOARD
      ===================================== */

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Admin Login Error:",
        error
      );

      setMessage(
        error.message ||
          "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================
     UI
  ===================================== */

  return (
    <div className="admin-auth-page">

      <div className="admin-auth-box">

        {/* =============================
            BRAND
        ============================== */}

        <div className="login-main-brand">
          <img
            className="login-logo-img"
            src="/images/website-logo.png"
            alt="I Love Latinas"
          />
        </div>


        {/* =============================
            TITLE
        ============================== */}

        <h1 className="login-title">Admin Login</h1>

        <p className="auth-subtitle">
          Sign in to manage the platform
        </p>


        {/* =============================
            ERROR MESSAGE
        ============================== */}

        {message && (
          <div className="auth-error">
            {message}
          </div>
        )}


        {/* =============================
            LOGIN FORM
        ============================== */}

        <form onSubmit={login}>

          {/* EMAIL */}

          <div className="auth-field">

            <label>
              Username / Email
            </label>

            <div className="auth-input-box">

              <span className="auth-input-icon" aria-hidden="true">
                👤
              </span>

              <input
                type="text"
                name="identifier"
                placeholder="Enter admin username or email"

                value={
                  form.identifier
                }

                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,

                      identifier:
                        e.target.value,
                    })
                  )
                }

                autoComplete="username"

                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label>
              Password
            </label>

            <div className="auth-input-box">

              <span className="auth-input-icon" aria-hidden="true">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                name="password"

                placeholder="Enter admin password"

                value={
                  form.password
                }

                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,

                      password:
                        e.target.value,
                    })
                  )
                }

                autoComplete="current-password"

                required
              />


              {/* SHOW / HIDE */}
              <button
  type="button"
  className="password-toggle"
  onClick={() =>
    setShowPassword(
      (prev) => !prev
    )
  }
  aria-label={
    showPassword
      ? "Hide password"
      : "Show password"
  }
  title={
    showPassword
      ? "Hide password"
      : "Show password"
  }
>
  {showPassword ? (
    /* EYE OFF ICON */
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
      <path d="M9.88 4.24A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8a11.5 11.5 0 0 1-2.1 4.2" />
      <path d="M6.61 6.61C4.62 7.82 3.18 9.77 2 12c1.7 4 5.5 8 10 8 1.5 0 2.9-.4 4.1-1" />
    </svg>
  ) : (
    /* EYE ICON */
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  )}
</button>

            </div>

          </div>


          {/* =============================
              OPTIONS
          ============================== */}

          <div className="login-options">

            <label className="remember-box">

              <input
                type="checkbox"

                checked={
                  rememberMe
                }

                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>

            </label>


            <Link
              to="/admin/forgot-password"

              className="forgot-link"
            >
              Forgot Password?
            </Link>

          </div>


          {/* =============================
              LOGIN BUTTON
          ============================== */}

          <button
            className="auth-submit"

            type="submit"

            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        <p className="auth-footer">
          I ❤️ Latinas Admin Panel
        </p>

      </div>

    </div>
  );
}

export default AdminLogin;