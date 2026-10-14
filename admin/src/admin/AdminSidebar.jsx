






import { useState } from "react";

import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Mars,
  Venus,
  Clock,
  Check,
  X,
  Copy,
} from "lucide-react";

import "../styles/adminsidebar.css";
import "../styles/admin-theme.css";

function AdminSidebar({
  activeMenu,
  setActiveMenu,
  logout,
  isOpen = false,
  onClose,
}) {

  /* =====================================
     APPLICATIONS
  ===================================== */

  const womenActive =
    activeMenu === "Women Pending" ||
    activeMenu === "Women Approved" ||
    activeMenu === "Women Rejected";

  const [womenOpen, setWomenOpen] =
    useState(womenActive);

  const menActive =
    activeMenu === "Men Pending" ||
    activeMenu === "Men Contacted" ||
    activeMenu === "Men Duplicates";

  const [menOpen, setMenOpen] =
    useState(menActive);


  /* =====================================
     SETTINGS
  ===================================== */

  const settingsActive =
    activeMenu === "Settings" ||
    activeMenu === "Settings General" ||
    activeMenu === "Settings Registration" ||
    activeMenu === "Settings Application" ||
    activeMenu === "Settings System" ||
    activeMenu === "Profile" ||
    activeMenu === "Settings Profile";


  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? " is-open" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`admin-left-sidebar sidebar-drawer${isOpen ? " is-open" : ""}`}
      >


      {/* ================= LOGO ================= */}

      <div className="sidebar-logo">
        <img
          className="sidebar-logo-img"
          src="/images/website-logo.png"
          alt="I Love Latinas"
        />
      </div>


      {/* ================= MENU ================= */}

      <div className="sidebar-menu">


        {/* =====================================
            DASHBOARD
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            activeMenu === "Dashboard"
              ? "active"
              : ""
          }`}
          onClick={() => {

            setActiveMenu(
              "Dashboard"
            );

          }}
        >

          <LayoutDashboard size={21} />

          <span>
            Dashboard
          </span>

        </button>


        {/* =====================================
            WOMEN APPLICATIONS
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            womenActive
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (!womenActive) {
              setActiveMenu("Women Pending");
            }

            setWomenOpen((prev) => !prev);
          }}
        >
          <Venus size={21} />
          <span>Women Applications</span>
          <ChevronDown
            size={18}
            className={`sidebar-chevron ${
              womenOpen ? "open" : ""
            }`}
          />
        </button>

        {womenOpen && (
          <div className="applications-submenu">
            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Women Pending" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Women Pending")}
            >
              <Clock size={19} />
              <span>Pending</span>
            </button>

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Women Approved" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Women Approved")}
            >
              <Check size={19} />
              <span>Approved</span>
            </button>

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Women Rejected" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Women Rejected")}
            >
              <X size={19} />
              <span>Rejected</span>
            </button>
          </div>
        )}


        {/* =====================================
            MEN APPLICATIONS
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            menActive
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (!menActive) {
              setActiveMenu("Men Pending");
            }

            setMenOpen((prev) => !prev);
          }}
        >
          <Mars size={21} />
          <span>Men Applications</span>
          <ChevronDown
            size={18}
            className={`sidebar-chevron ${
              menOpen ? "open" : ""
            }`}
          />
        </button>

        {menOpen && (
          <div className="applications-submenu">
            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Men Pending" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Men Pending")}
            >
              <Clock size={19} />
              <span>Pending</span>
            </button>

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Men Contacted" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Men Contacted")}
            >
              <Check size={19} />
              <span>Contacted</span>
            </button>

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu === "Men Duplicates" ? "active" : ""
              }`}
              onClick={() => setActiveMenu("Men Duplicates")}
            >
              <Copy size={19} />
              <span>Duplicates</span>
            </button>
          </div>
        )}


        {/* =====================================
            SETTINGS
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            settingsActive
              ? "active"
              : ""
          }`}
          onClick={() => {
            setActiveMenu(
              "Settings General"
            );
          }}
        >

          <Settings size={21} />

          <span>
            Settings
          </span>

        </button>


      </div>


      {/* =====================================
          LOGOUT
      ===================================== */}

      <div className="sidebar-logout">

        <button
          type="button"
          onClick={logout}
        >

          <LogOut size={22} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
    </>
  );
}

export default AdminSidebar;