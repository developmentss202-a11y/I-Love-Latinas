
import "../styles/adminnavbar.css";

function AdminNavbar({
  admin,
}) {
  return (
    <header className="admin-top-navbar">

      {/* LEFT SIDE */}
   
   

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