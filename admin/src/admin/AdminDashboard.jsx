











import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import MenApplications from "./MenApplications";
import WomenApplications from "./WomenApplications";
import AllUsers from "./AllUsers";

import "../styles/admindashboard.css";
import "../styles/admin-theme.css";


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


  const [chartDays, setChartDays] =
    useState([]);


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

          setChartDays(
            buildChartDays(
              menApplications,
              womenApplications
            )
          );


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
                    "Women Rejected"
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
                    "Women Approved"
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
                    "Men Pending"
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
                    "Women Pending"
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
                    "Women Pending"
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


            <DashboardChart
              days={chartDays}
            />

          </section>

        )}


        {/* =====================================
            WOMEN
        ===================================== */}

        {activeMenu === "Women Pending" && (
          <WomenApplications
            pageStatus="pending"
            title="Women Pending"
          />
        )}

        {activeMenu === "Women Approved" && (
          <WomenApplications
            pageStatus="approved"
            title="Women Approved"
          />
        )}

        {activeMenu === "Women Rejected" && (
          <WomenApplications
            pageStatus="rejected"
            title="Women Rejected"
          />
        )}


        {/* =====================================
            MEN
        ===================================== */}

        {activeMenu === "Men Pending" && (
          <MenApplications
            pageStatus="pending"
            title="Men Pending"
          />
        )}

        {activeMenu === "Men Contacted" && (
          <MenApplications
            pageStatus="contacted"
            title="Men Contacted"
          />
        )}

        {activeMenu === "Men Duplicates" && (
          <MenApplications
            pageStatus="duplicates"
            title="Men Duplicates"
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
            SETTINGS HUB
        ===================================== */}

        {(
          activeMenu === "Settings" ||
          activeMenu === "Settings General" ||
          activeMenu === "Settings Registration" ||
          activeMenu === "Settings Application" ||
          activeMenu === "Settings System" ||
          activeMenu === "Settings Profile" ||
          activeMenu === "Profile"
        ) && (

          <section className="admin-page-content">

            <div className="settings-hub-tabs">

              <button
                type="button"
                className={
                  activeMenu === "Settings" ||
                  activeMenu === "Settings General"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveMenu("Settings General")
                }
              >
                General
              </button>

              <button
                type="button"
                className={
                  activeMenu === "Settings Registration"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveMenu("Settings Registration")
                }
              >
                Registration
              </button>

              <button
                type="button"
                className={
                  activeMenu === "Settings Application"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveMenu("Settings Application")
                }
              >
                Application
              </button>

              <button
                type="button"
                className={
                  activeMenu === "Settings System"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveMenu("Settings System")
                }
              >
                System
              </button>

              <button
                type="button"
                className={
                  activeMenu === "Profile" ||
                  activeMenu === "Settings Profile"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveMenu("Profile")
                }
              >
                Profile
              </button>

            </div>

            {(
              activeMenu === "Profile" ||
              activeMenu === "Settings Profile"
            ) ? (

            <div className="new-settings-page">

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


            <div className="settings-section-card">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  ⚙
                </div>

                <div>

                  <h2>
                    Admin Profile
                  </h2>

                  <p>
                    Update your name, email, and password
                  </p>

                </div>

              </div>


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

            </div>

            </div>

            ) : (

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

          </section>

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
   DASHBOARD CHART
========================================= */

function localDayKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}


function buildChartDays(menApplications, womenApplications, days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const list = [];
  const map = {};

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);

    const key = localDayKey(day);
    const item = {
      key,
      label: day.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      men: 0,
      women: 0,
    };

    list.push(item);
    map[key] = item;
  }

  menApplications.forEach((application) => {
    const key = localDayKey(application.createdAt);
    if (map[key]) {
      map[key].men += 1;
    }
  });

  womenApplications.forEach((application) => {
    const key = localDayKey(application.createdAt);
    if (map[key]) {
      map[key].women += 1;
    }
  });

  return list;
}


function DashboardChart({ days }) {
  const rows = Array.isArray(days) ? days : [];
  const width = 1000;
  const height = 280;
  const padL = 44;
  const padR = 18;
  const padT = 24;
  const padB = 42;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxVal = Math.max(
    1,
    ...rows.map((day) => day.men + day.women)
  );
  const slot = innerW / Math.max(rows.length, 1);
  const barW = Math.max(10, slot * 0.48);

  const linePoints = rows
    .map((day, index) => {
      const total = day.men + day.women;
      const x = padL + slot * index + slot / 2;
      const y = padT + innerH - (total / maxVal) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <h2>Applications over time</h2>
          <p>Men and women applications from the last 14 days</p>
        </div>

        <div className="dashboard-chart-legend">
          <span className="legend-men">Men</span>
          <span className="legend-women">Women</span>
          <span className="legend-total">Total</span>
        </div>
      </div>

      <div className="dashboard-chart-svg-wrap">
        <svg
          className="dashboard-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Applications over the last 14 days"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padT + innerH * (1 - tick);
            const label = Math.round(maxVal * tick);

            return (
              <g key={tick}>
                <line
                  x1={padL}
                  x2={width - padR}
                  y1={y}
                  y2={y}
                  stroke="#f0e4de"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#8a7784"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {rows.map((day, index) => {
            const x = padL + slot * index + (slot - barW) / 2;
            const menH = (day.men / maxVal) * innerH;
            const womenH = (day.women / maxVal) * innerH;
            const womenY = padT + innerH - womenH;
            const menY = womenY - menH;

            return (
              <g key={day.key}>
                {day.women > 0 ? (
                  <rect
                    x={x}
                    y={womenY}
                    width={barW}
                    height={Math.max(3, womenH)}
                    fill="#e2536c"
                    rx={day.men > 0 ? 0 : 7}
                  />
                ) : null}

                {day.men > 0 ? (
                  <rect
                    x={x}
                    y={menY}
                    width={barW}
                    height={Math.max(3, menH)}
                    fill="#caa46a"
                    rx="7"
                  />
                ) : null}

                <text
                  x={x + barW / 2}
                  y={height - 14}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5c4753"
                >
                  {day.label}
                </text>
              </g>
            );
          })}

          {linePoints ? (
            <polyline
              fill="none"
              stroke="#2a0a19"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={linePoints}
            />
          ) : null}
        </svg>
      </div>
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

