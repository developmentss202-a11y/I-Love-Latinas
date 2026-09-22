











import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import MenApplications from "./MenApplications";
import WomenApplications from "./WomenApplications";
import ApplicationsPage from "./ApplicationsPage";
import AllUsers from "./AllUsers";

import "../styles/admindashboard.css";


function AdminDashboard() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const [admin, setAdmin] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "adminData"
          ) || "{}"
        );
      } catch {
        return {};
      }
    });


  /* =========================================
     DASHBOARD STATS
  ========================================= */

  const [stats, setStats] =
    useState({
      total: 0,
      men: 0,
      women: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });


  const [
    statsLoading,
    setStatsLoading,
  ] = useState(true);


  const [
    dashboardError,
    setDashboardError,
  ] = useState("");


  const [
    actionMessage,
    setActionMessage,
  ] = useState("");


  const [
    actionMessageType,
    setActionMessageType,
  ] = useState("error");


  /* =========================================
     PROFILE
  ========================================= */

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    name: admin.name || "",
    email: admin.email || "",
  });


  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  /* =========================================
     LOGOUT
  ========================================= */

  const logout =
    useCallback(() => {
      localStorage.removeItem(
        "adminToken"
      );

      localStorage.removeItem(
        "adminData"
      );

      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );
    }, [navigate]);


  const [
    showLogoutConfirm,
    setShowLogoutConfirm,
  ] = useState(false);


  /* =========================================
     API
  ========================================= */

  const apiFetch =
    useCallback(
      async (
        path,
        options = {}
      ) => {
        const token =
          localStorage.getItem(
            "adminToken"
          );

        const response =
          await fetch(
            `${API_URL}${path}`,
            {
              ...options,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

                ...(
                  options.headers ||
                  {}
                ),
              },
            }
          );


        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }


        if (
          response.status === 401 ||
          response.status === 403
        ) {
          logout();

          throw new Error(
            data.message ||
            "Please login again"
          );
        }


        if (!response.ok) {
          throw new Error(
            data.message ||
            "Request failed"
          );
        }


        return data;
      },
      [
        API_URL,
        logout,
      ]
    );


  /* =========================================
     LOAD DASHBOARD
     MEN + WOMEN TOTAL COUNTS
  ========================================= */

  const loadDashboard =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setStatsLoading(true);
          }

          setDashboardError("");


          /* =====================================
             LOAD ADMIN + WOMEN + MEN
          ===================================== */

          const [
            dashboardData,
            womenData,
            menData,
          ] =
            await Promise.all([
              apiFetch(
                "/api/admin/dashboard"
              ),

              apiFetch(
                "/api/admin/applications"
              ),

              apiFetch(
                "/api/admin/men-applications"
              ),
            ]);


          /* =====================================
             WOMEN APPLICATIONS
          ===================================== */

          const womenApplications =
            Array.isArray(
              womenData
            )
              ? womenData
              : womenData
                  .applications ||
                womenData.data ||
                [];


          /* =====================================
             MEN APPLICATIONS
          ===================================== */

          const menApplications =
            Array.isArray(
              menData
            )
              ? menData
              : menData
                  .applications ||
                menData.data ||
                [];


          /* =====================================
             TOTAL COUNTS
          ===================================== */

          const men =
            menApplications.length;

          const women =
            womenApplications.length;

          const allApplications = [
            ...menApplications,
            ...womenApplications,
          ];

          const total =
            allApplications.length;

          let pending = 0;
          let approved = 0;
          let rejected = 0;


          allApplications.forEach(
            (application) => {
              const status =
                String(
                  application.status ||
                  "pending"
                )
                  .trim()
                  .toLowerCase();

              if (
                status === "pending"
              ) {
                pending++;
              }

              if (
                status === "approved"
              ) {
                approved++;
              }

              if (
                status === "rejected"
              ) {
                rejected++;
              }
            }
          );


          setStats({
            total,
            men,
            women,
            pending,
            approved,
            rejected,
          });


          /* =====================================
             ADMIN DATA
             Only first load par form data set hoga,
             taaki auto refresh profile typing ko reset na kare.
          ===================================== */

          if (
            showLoading &&
            dashboardData.admin
          ) {
            setAdmin(
              dashboardData.admin
            );

            setProfileForm({
              name:
                dashboardData.admin
                  .name ||
                "",

              email:
                dashboardData.admin
                  .email ||
                "",
            });

            localStorage.setItem(
              "adminData",
              JSON.stringify(
                dashboardData.admin
              )
            );
          }

        } catch (error) {
          console.error(
            "DASHBOARD ERROR:",
            error
          );

          setDashboardError(
            error.message ||
            "Unable to load dashboard"
          );

        } finally {
          if (showLoading) {
            setStatsLoading(false);
          }
        }
      },
      [apiFetch]
    );


  /* Load dashboard numbers only when that screen is open.
     No timer. Browser refresh or opening Dashboard loads once. */
  useEffect(() => {
    if (activeMenu !== "Dashboard") return;

    loadDashboard(true);
  }, [activeMenu, loadDashboard]);


  /* =========================================
     PROFILE UPDATE
  ========================================= */

  const updateProfile =
    async (e) => {
      e.preventDefault();

      setActionMessage("");

      setActionMessageType(
        "error"
      );


      try {
        const data =
          await apiFetch(
            "/api/admin/profile",
            {
              method: "PUT",

              body:
                JSON.stringify(
                  profileForm
                ),
            }
          );


        setAdmin(
          data.admin
        );


        localStorage.setItem(
          "adminData",

          JSON.stringify(
            data.admin
          )
        );


        setActionMessage(
          data.message ||
          "Profile updated successfully"
        );


        setActionMessageType(
          "success"
        );

      } catch (error) {
        setActionMessage(
          error.message
        );

        setActionMessageType(
          "error"
        );
      }
    };


  /* =========================================
     CHANGE PASSWORD
  ========================================= */

  const changePassword =
    async (e) => {
      e.preventDefault();

      setActionMessage("");

      setActionMessageType(
        "error"
      );


      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setActionMessage(
          "New passwords do not match"
        );

        return;
      }


      try {
        const data =
          await apiFetch(
            "/api/admin/change-password",
            {
              method: "PUT",

              body:
                JSON.stringify({
                  currentPassword:
                    passwordForm
                      .currentPassword,

                  newPassword:
                    passwordForm
                      .newPassword,
                }),
            }
          );


        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });


        setActionMessage(
          data.message ||
          "Password changed successfully"
        );


        setActionMessageType(
          "success"
        );

      } catch (error) {
        setActionMessage(
          error.message
        );

        setActionMessageType(
          "error"
        );
      }
    };


  /* =========================================
     COMMON STATUS COLUMNS
  ========================================= */

  const statusColumns = [
    "S.No.",
    "Image",
    "First Name",
    "Age",
    "Location",
    "Status",
    "Date",
    "Action",
  ];


  /* =========================================
     UI
  ========================================= */

  return (
    <div className="admin-dashboard-layout">

      <AdminSidebar
        activeMenu={activeMenu}

        setActiveMenu={(menu) => {
          setActiveMenu(menu);

          setActionMessage("");
          setSidebarOpen(false);
        }}

        logout={() => setShowLogoutConfirm(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />


      <main className="admin-main-content">

        <AdminNavbar
          admin={admin}

          setActiveMenu={
            setActiveMenu
          }
          onMenuClick={() =>
            setSidebarOpen((open) => !open)
          }
        />


        {/* =====================================
            DASHBOARD
        ===================================== */}

        {activeMenu ===
          "Dashboard" && (

          <section className="admin-page-content">

            <div className="dashboard-welcome">

              <h1>
                Welcome Back,{" "}
                {
                  admin.name ||
                  "Admin"
                }
              </h1>

            </div>


            {dashboardError && (
              <div className="dashboard-error">
                {dashboardError}
              </div>
            )}


            {/* =================================
                SIX DASHBOARD COUNT CARDS

                1. Total Applications
                2. Total Rejected
                3. Total Approved
                4. Men Applications
                5. Women Applications
                6. Total Pending
            ================================= */}

            <div className="dashboard-application-grid">


              {/* TOTAL APPLICATIONS */}

              <div
                className="dashboard-stat-button dashboard-stat-static"
              >
                <SummaryCard
                  icon="▦"
                  label="Total Applications"
                  value={
                    statsLoading
                      ? "..."
                      : stats.total
                  }
                  type="total"
                />
              </div>


              {/* TOTAL REJECTED */}

              <button
                type="button"
                className="dashboard-stat-button"
                onClick={() =>
                  setActiveMenu(
                    "Rejected Applications"
                  )
                }
              >
                <SummaryCard
                  icon="✕"
                  label="Total Rejected"
                  value={
                    statsLoading
                      ? "..."
                      : stats.rejected
                  }
                  type="rejected"
                />
              </button>


              {/* TOTAL APPROVED */}

              <button
                type="button"
                className="dashboard-stat-button"
                onClick={() =>
                  setActiveMenu(
                    "Approved Applications"
                  )
                }
              >
                <SummaryCard
                  icon="✓"
                  label="Total Approved"
                  value={
                    statsLoading
                      ? "..."
                      : stats.approved
                  }
                  type="approved"
                />
              </button>


              {/* MEN APPLICATIONS */}

              <button
                type="button"
                className="dashboard-stat-button"
                onClick={() =>
                  setActiveMenu(
                    "Men Applications"
                  )
                }
              >
                <SummaryCard
                  icon="♂"
                  label="Men Applications"
                  value={
                    statsLoading
                      ? "..."
                      : stats.men
                  }
                  type="men"
                />
              </button>


              {/* WOMEN APPLICATIONS */}

              <button
                type="button"
                className="dashboard-stat-button"
                onClick={() =>
                  setActiveMenu(
                    "Women Applications"
                  )
                }
              >
                <SummaryCard
                  icon="♀"
                  label="Women Applications"
                  value={
                    statsLoading
                      ? "..."
                      : stats.women
                  }
                  type="women"
                />
              </button>


              {/* TOTAL PENDING */}

              <button
                type="button"
                className="dashboard-stat-button"
                onClick={() =>
                  setActiveMenu(
                    "Pending Applications"
                  )
                }
              >
                <SummaryCard
                  icon="◷"
                  label="Total Pending"
                  value={
                    statsLoading
                      ? "..."
                      : stats.pending
                  }
                  type="pending"
                />
              </button>

            </div>

          </section>

        )}


        {/* =====================================
            MEN
        ===================================== */}

        {activeMenu ===
          "Men Applications" && (

          <MenApplications />

        )}


        {/* =====================================
            WOMEN
        ===================================== */}

        {activeMenu ===
          "Women Applications" && (

          <WomenApplications />

        )}


        {/* =====================================
            PENDING
        ===================================== */}

        {activeMenu ===
          "Pending Applications" && (

          <ApplicationsPage
            gender="all"

            title="Pending Applications"

            initialStatus="pending"

            columns={
              statusColumns
            }
          />

        )}


        {/* =====================================
            APPROVED
        ===================================== */}

        {activeMenu ===
          "Approved Applications" && (

          <ApplicationsPage
            gender="all"

            title="Approved Applications"

            initialStatus="approved"

            columns={
              statusColumns
            }
          />

        )}


        {/* =====================================
            REJECTED
        ===================================== */}

        {activeMenu ===
          "Rejected Applications" && (

          <ApplicationsPage
            gender="all"

            title="Rejected Applications"

            initialStatus="rejected"

            columns={
              statusColumns
            }
          />

        )}


        {/* =====================================
            ALL USERS
        ===================================== */}

        {activeMenu ===
          "All Users" && (

          <AllUsers />

        )}


        {/* =====================================
            PROFILE
        ===================================== */}

        {activeMenu ===
          "Profile" && (

          <section className="admin-page-content">

            <h1>
              Admin Profile
            </h1>


            {actionMessage && (

              <div
                className={
                  actionMessageType ===
                  "success"
                    ? "dashboard-success"
                    : "dashboard-error"
                }
              >

                {actionMessage}

              </div>

            )}


            <div className="profile-settings-grid">


              {/* EDIT PROFILE */}

              <form
                className="settings-card admin-settings-form"

                onSubmit={
                  updateProfile
                }
              >

                <h2>
                  Edit Profile
                </h2>


                <label>
                  Admin Name

                  <input
                    type="text"

                    value={
                      profileForm.name
                    }

                    onChange={(e) =>
                      setProfileForm(
                        (prev) => ({
                          ...prev,

                          name:
                            e.target.value,
                        })
                      )
                    }

                    required
                  />
                </label>


                <label>
                  Email

                  <input
                    type="email"

                    value={
                      profileForm.email
                    }

                    onChange={(e) =>
                      setProfileForm(
                        (prev) => ({
                          ...prev,

                          email:
                            e.target.value,
                        })
                      )
                    }

                    required
                  />
                </label>


                <button
                  className="admin-primary-btn"
                  type="submit"
                >
                  Save Profile
                </button>

              </form>


              {/* PASSWORD */}

              <form
                className="settings-card admin-settings-form"

                onSubmit={
                  changePassword
                }
              >

                <h2>
                  Change Password
                </h2>


                <label>
                  Current Password

                  <input
                    type="password"

                    placeholder="Enter current password"

                    value={
                      passwordForm
                        .currentPassword
                    }

                    onChange={(e) =>
                      setPasswordForm(
                        (prev) => ({
                          ...prev,

                          currentPassword:
                            e.target.value,
                        })
                      )
                    }

                    required
                  />
                </label>


                <label>
                  New Password

                  <input
                    type="password"

                    placeholder="Enter new password"

                    minLength="6"

                    value={
                      passwordForm
                        .newPassword
                    }

                    onChange={(e) =>
                      setPasswordForm(
                        (prev) => ({
                          ...prev,

                          newPassword:
                            e.target.value,
                        })
                      )
                    }

                    required
                  />
                </label>


                <label>
                  Confirm New Password

                  <input
                    type="password"

                    placeholder="Confirm new password"

                    minLength="6"

                    value={
                      passwordForm
                        .confirmPassword
                    }

                    onChange={(e) =>
                      setPasswordForm(
                        (prev) => ({
                          ...prev,

                          confirmPassword:
                            e.target.value,
                        })
                      )
                    }

                    required
                  />
                </label>


                <button
                  className="admin-primary-btn"
                  type="submit"
                >
                  Change Password
                </button>

              </form>

            </div>

          </section>

        )}


        {/* =====================================
            SETTINGS
        ===================================== */}

        {(
          activeMenu === "Settings" ||
          activeMenu === "Settings General" ||
          activeMenu === "Settings Registration" ||
          activeMenu === "Settings Application" ||
          activeMenu === "Settings System"
        ) && (

          <SettingsPanel
            section={
              activeMenu === "Settings Registration"
                ? "registration"
                : activeMenu === "Settings Application"
                ? "application"
                : activeMenu === "Settings System"
                ? "system"
                : "general"
            }
          />

        )}


      </main>

      {showLogoutConfirm ? (
        <div
          className="logout-confirm-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="logout-confirm-box"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Do you want to logout?</h2>
            <p>You will need to login again to use the admin panel.</p>

            <div className="logout-confirm-buttons">
              <button
                type="button"
                className="logout-confirm-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-yes"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}


/* =========================================
   SUMMARY CARD
========================================= */

function SummaryCard({
  icon,
  label,
  value,
  type = "",
}) {
  return (
    <div
      className={`summary-card dashboard-summary-${type}`}
    >

      <div className="summary-icon">
        {icon}
      </div>


      <div className="summary-card-content">

        <span>
          {label}
        </span>

        <h2>
          {value}
        </h2>

      </div>

    </div>
  );
}


export default AdminDashboard;

