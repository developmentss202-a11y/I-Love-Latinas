
import { Menu } from "lucide-react";

import "../styles/adminnavbar.css";
import "../styles/admin-theme.css";

function AdminNavbar({
  admin,
  onMenuClick,
  setActiveMenu,
}) {
  return (
    <header className="admin-top-navbar admin-topbar">

      {/* LEFT SIDE */}
      <button
        type="button"
        className="admin-menu-btn"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>

      {/* RIGHT SIDE */}
      <div className="navbar-right">

        <button
          type="button"
          className="navbar-admin-profile"
          aria-label="Open settings"
          onClick={() =>
            setActiveMenu?.(
              "Settings General"
            )
          }
        >

          <div className="navbar-admin-avatar">
            {admin?.name
              ? admin.name
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div className="navbar-admin-details">
            <strong>
              {admin?.name || "Admin"}
            </strong>
            <span>
              {admin?.email || "admin@example.com"}
            </span>
          </div>

        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;