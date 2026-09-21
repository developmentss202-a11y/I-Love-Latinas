






import { useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
  Mars,
  Venus,

  SlidersHorizontal,
  UserPlus,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

import "../styles/adminsidebar.css";

function AdminSidebar({
  activeMenu,
  setActiveMenu,
  logout,
}) {

  /* =====================================
     APPLICATIONS
  ===================================== */

  const [applicationsOpen, setApplicationsOpen] =
    useState(
      activeMenu === "Men Applications" ||
      activeMenu === "Women Applications"
    );

  const applicationsActive =
    activeMenu === "Men Applications" ||
    activeMenu === "Women Applications";


  /* =====================================
     SETTINGS
  ===================================== */

  const settingsActive =
    activeMenu === "Settings" ||
    activeMenu === "Settings General" ||
    activeMenu === "Settings Registration" ||
    activeMenu === "Settings Application" ||
    activeMenu === "Settings System";

  const [settingsOpen, setSettingsOpen] =
    useState(settingsActive);


  return (

    <aside className="admin-left-sidebar">


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
            APPLICATIONS
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            applicationsActive
              ? "active"
              : ""
          }`}
          onClick={() => {

            setApplicationsOpen(
              (prev) => !prev
            );

          }}
        >

          <ClipboardList size={21} />

          <span>
            Applications
          </span>

          <ChevronDown
            size={18}
            className={`sidebar-chevron ${
              applicationsOpen
                ? "open"
                : ""
            }`}
          />

        </button>


        {applicationsOpen && (

          <div className="applications-submenu">


            {/* MEN */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Men Applications"
                  ? "active"
                  : ""
              }`}
              onClick={() => {

                setActiveMenu(
                  "Men Applications"
                );

              }}
            >

              <Mars size={20} />

              <span>
                Men
              </span>

            </button>


            {/* WOMEN */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Women Applications"
                  ? "active"
                  : ""
              }`}
              onClick={() => {

                setActiveMenu(
                  "Women Applications"
                );

              }}
            >

              <Venus size={20} />

              <span>
                Women
              </span>

            </button>

          </div>

        )}


        {/* =====================================
            PROFILE
        ===================================== */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            activeMenu === "Profile"
              ? "active"
              : ""
          }`}
          onClick={() => {

            setActiveMenu(
              "Profile"
            );

          }}
        >

          <UserRound size={21} />

          <span>
            Profile
          </span>

        </button>


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

            if (!settingsActive) {
              setActiveMenu(
                "Settings General"
              );
            }

            setSettingsOpen(
              (prev) => !prev
            );

          }}
        >

          <Settings size={21} />

          <span>
            Settings
          </span>

          <ChevronDown
            size={18}
            className={`sidebar-chevron ${
              settingsOpen
                ? "open"
                : ""
            }`}
          />

        </button>


        {/* SETTINGS SUB MENU */}

        {settingsOpen && (

          <div className="applications-submenu">


            {/* GENERAL */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Settings General"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveMenu(
                  "Settings General"
                );
              }}
            >

              <SlidersHorizontal
                size={19}
              />

              <span>
                General
              </span>

            </button>


            {/* REGISTRATION */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Settings Registration"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveMenu(
                  "Settings Registration"
                );
              }}
            >

              <UserPlus size={19} />

              <span>
                Registration
              </span>

            </button>


            {/* APPLICATION */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Settings Application"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveMenu(
                  "Settings Application"
                );
              }}
            >

              <FileCheck2 size={19} />

              <span>
                Application
              </span>

            </button>


            {/* SYSTEM */}

            <button
              type="button"
              className={`sidebar-submenu-item ${
                activeMenu ===
                "Settings System"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveMenu(
                  "Settings System"
                );
              }}
            >

              <ShieldCheck size={19} />

              <span>
                System
              </span>

            </button>

          </div>

        )}


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

  );
}

export default AdminSidebar;