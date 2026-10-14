

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/adminforgotpassword.css";
import "../styles/admin-theme.css";


function AdminForgotPassword() {

  const navigate =
    useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";


  const [
    step,
    setStep,
  ] = useState(1);


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    otp,
    setOtp,
  ] = useState("");


  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    messageType,
    setMessageType,
  ] = useState("error");


  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =====================================
     API REQUEST
  ===================================== */

  const apiRequest =
    async (
      path,
      body
    ) => {

      const response =
        await fetch(
          `${API_URL}${path}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body
              ),
          }
        );


      let data = {};

      try {

        data =
          await response.json();

      } catch {

        data = {};

      }


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Request failed"
        );

      }


      return data;
    };


  /* =====================================
     SEND OTP
  ===================================== */

  const requestOtp =
    async (e) => {

      e.preventDefault();

      setMessage("");
      setMessageType("error");


      if (!email.trim()) {

        setMessage(
          "Please enter admin email"
        );

        return;
      }


      setLoading(true);


      try {

        const data =
          await apiRequest(
            "/api/admin/forgot-password",
            {
              email:
                email
                  .trim()
                  .toLowerCase(),
            }
          );


        setMessage(
          data.message ||
          "OTP sent successfully"
        );

        setMessageType(
          "success"
        );

        setStep(2);


      } catch (error) {

        setMessage(
          error.message
        );

        setMessageType(
          "error"
        );


      } finally {

        setLoading(false);

      }
    };


  /* =====================================
     VERIFY OTP
  ===================================== */

  const verifyOtp =
    async (e) => {

      e.preventDefault();

      setMessage("");
      setMessageType("error");


      if (
        !/^\d{6}$/.test(
          otp
        )
      ) {

        setMessage(
          "Please enter valid 6 digit OTP"
        );

        return;
      }


      setLoading(true);


      try {

        const data =
          await apiRequest(
            "/api/admin/verify-reset-otp",
            {
              email:
                email
                  .trim()
                  .toLowerCase(),

              otp:
                otp.trim(),
            }
          );


        setMessage(
          data.message ||
          "OTP verified successfully"
        );

        setMessageType(
          "success"
        );

        setStep(3);


      } catch (error) {

        setMessage(
          error.message
        );

        setMessageType(
          "error"
        );


      } finally {

        setLoading(false);

      }
    };


  /* =====================================
     RESET PASSWORD
  ===================================== */

  const resetPassword =
    async (e) => {

      e.preventDefault();

      setMessage("");
      setMessageType("error");


      if (
        newPassword.length < 6
      ) {

        setMessage(
          "Password must be at least 6 characters"
        );

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setMessage(
          "Passwords do not match"
        );

        return;
      }


      setLoading(true);


      try {

        const data =
          await apiRequest(
            "/api/admin/reset-password",
            {
              email:
                email
                  .trim()
                  .toLowerCase(),

              otp:
                otp.trim(),

              newPassword,
            }
          );


        setMessage(
          data.message ||
          "Password changed successfully"
        );

        setMessageType(
          "success"
        );


        setTimeout(
          () => {

            navigate(
              "/admin/login",
              {
                replace: true,
              }
            );

          },
          1500
        );


      } catch (error) {

        setMessage(
          error.message
        );

        setMessageType(
          "error"
        );


      } finally {

        setLoading(false);

      }
    };


  /* =====================================
     RESEND OTP
  ===================================== */

  const resendOtp =
    async () => {

      setMessage("");
      setMessageType("error");

      setLoading(true);


      try {

        const data =
          await apiRequest(
            "/api/admin/forgot-password",
            {
              email:
                email
                  .trim()
                  .toLowerCase(),
            }
          );


        setOtp("");

        setMessage(
          data.message ||
          "New OTP sent successfully"
        );

        setMessageType(
          "success"
        );


      } catch (error) {

        setMessage(
          error.message
        );

        setMessageType(
          "error"
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


        {/* BRAND */}

        <div className="login-main-brand">
          <img
            className="login-logo-img"
            src="/images/website-logo.png"
            alt="I Love Latinas"
          />
        </div>


        {/* TITLE */}

        <h1>
          {step === 1 &&
            "Forgot Password"}

          {step === 2 &&
            "Verify OTP"}

          {step === 3 &&
            "Reset Password"}
        </h1>


        {/* MESSAGE */}

        {message && (

          <div
            className={
              messageType ===
              "success"
                ? "auth-success"
                : "auth-error"
            }
          >

            {message}

          </div>

        )}


        {/* =====================================
            STEP 1 EMAIL
        ===================================== */}

        {step === 1 && (

          <form
            onSubmit={
              requestOtp
            }
          >

            <div className="auth-field">

              <label>
                Admin Email
              </label>


              <div className="auth-input-box">

                <span className="auth-input-icon">
                  ✉
                </span>


                <input
                  type="email"

                  placeholder="Enter registered admin email"

                  value={
                    email
                  }

                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }

                  required
                />

              </div>

            </div>


            <button
              className="auth-submit"

              type="submit"

              disabled={
                loading
              }
            >

              {loading
                ? "Sending OTP..."
                : "Send OTP"}

            </button>

          </form>

        )}


        {/* =====================================
            STEP 2 OTP
        ===================================== */}

        {step === 2 && (

          <form
            onSubmit={
              verifyOtp
            }
          >

            <p className="otp-email-text">

              OTP sent to{" "}

              <strong>
                {email}
              </strong>

            </p>


            <div className="auth-field">

              <label>
                6 Digit OTP
              </label>


              <div className="auth-input-box">

                <span className="auth-input-icon">
                  🔐
                </span>


                <input
                  type="text"

                  inputMode="numeric"

                  maxLength="6"

                  placeholder="Enter OTP"

                  value={
                    otp
                  }

                  onChange={(e) => {

                    const value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        );

                    setOtp(
                      value
                    );

                  }}

                  required
                />

              </div>

            </div>


            <button
              className="auth-submit"

              type="submit"

              disabled={
                loading
              }
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </button>


            <button
              type="button"

              className="resend-otp-btn"

              onClick={
                resendOtp
              }

              disabled={
                loading
              }
            >

              Resend OTP

            </button>

          </form>

        )}


        {/* =====================================
            STEP 3 PASSWORD
        ===================================== */}

        {step === 3 && (

          <form
            onSubmit={
              resetPassword
            }
          >

            {/* NEW PASSWORD */}

            <div className="auth-field">

              <label>
                New Password
              </label>


              <div className="auth-input-box">

                <span className="auth-input-icon">
                  🔒
                </span>


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  minLength="6"

                  placeholder="Enter new password"

                  value={
                    newPassword
                  }

                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }

                  required
                />


                <button
                  type="button"

                  className="password-toggle"

                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                >

                  {showPassword
                    ? "🙈"
                    : "👁"}

                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label>
                Confirm Password
              </label>


              <div className="auth-input-box">

                <span className="auth-input-icon">
                  🔒
                </span>


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  minLength="6"

                  placeholder="Confirm password"

                  value={
                    confirmPassword
                  }

                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }

                  required
                />

              </div>

            </div>


            <button
              className="auth-submit"

              type="submit"

              disabled={
                loading
              }
            >

              {loading
                ? "Updating..."
                : "Change Password"}

            </button>

          </form>

        )}


        {/* BACK LOGIN */}

        <div className="auth-switch">

          <Link
            to="/admin/login"
          >

            ← Back to Login

          </Link>

        </div>


      </div>

    </div>

  );
}


export default AdminForgotPassword;