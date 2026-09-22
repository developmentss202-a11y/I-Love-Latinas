
import { Menu } from "lucide-react";

import "../styles/adminnavbar.css";

function AdminNavbar({
  admin,
  onMenuClick,
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

        <div className="navbar-admin-profile">

          <div className="navbar-admin-avatar">
            {admin?.name
              ? admin.name
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div className="navbar-admin-details">

         
         

            <span>
              {admin?.email ||
                "admin@example.com"}
            </span>



          </div>

        </div>

      </div>

    </header>
  );
}

export default AdminNavbar;