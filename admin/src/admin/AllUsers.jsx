
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "../styles/allusers.css";
import "../styles/admin-theme.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const WEBSITE_API_URL =
  import.meta.env.VITE_WEBSITE_API_URL ||
  "http://localhost:5000";

function AllUsers() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [viewUser, setViewUser] =
    useState(null);


  const [actionLoading, setActionLoading] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionMessageType, setActionMessageType] =
    useState("success");


  const loadUsers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const response =
          await fetch(
            `${API_URL}/api/admin/users`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminData"
          );

          window.location.href =
            "/#/admin/login";

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to load users"
          );
        }

        setUsers(
          Array.isArray(data)
            ? data
            : data.users || []
        );
      } catch (err) {
        setError(
          err.message ||
          "Unable to load users"
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  const changeUserStatus =
    async (user) => {
      const currentStatus =
        String(
          user?.status ||
          "active"
        )
          .trim()
          .toLowerCase();

      const nextStatus =
        currentStatus ===
        "blocked"
          ? "active"
          : "blocked";

      const confirmText =
        nextStatus ===
        "blocked"
          ? `Block ${user.name || "this user"}?`
          : `Unblock ${user.name || "this user"}?`;

      if (
        !window.confirm(
          confirmText
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          user._id
        );

        setActionMessage("");

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const response =
          await fetch(
            `${API_URL}/api/admin/users/${user._id}/status`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status:
                    nextStatus,
                }),
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "adminData"
          );

          window.location.href =
            "/#/admin/login";

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to update user"
          );
        }

        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (item) =>
                item._id ===
                user._id
                  ? {
                      ...item,
                      status:
                        nextStatus,
                    }
                  : item
            )
        );

        setViewUser(
          (currentUser) =>
            currentUser?._id ===
            user._id
              ? {
                  ...currentUser,
                  status:
                    nextStatus,
                }
              : currentUser
        );

        setActionMessageType(
          "success"
        );

        setActionMessage(
          data.message ||
            (
              nextStatus ===
              "blocked"
                ? "User blocked successfully"
                : "User activated successfully"
            )
        );

      } catch (err) {
        setActionMessageType(
          "error"
        );

        setActionMessage(
          err.message ||
          "Unable to update user"
        );

      } finally {
        setActionLoading("");
      }
    };


  const filteredUsers =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const status =
            String(
              user.status ||
              "active"
            )
              .trim()
              .toLowerCase();

          if (
            statusFilter !== "all" &&
            status !== statusFilter
          ) {
            return false;
          }

          if (!searchValue) {
            return true;
          }

          const haystack = [
            user.name,
            user.email,
            user.location,
            user.gender,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            searchValue
          );
        }
      );
    }, [
      users,
      search,
      statusFilter,
    ]);


  return (
    <section className="admin-page-content users-page">

      <div className="users-title-row">
        <div>
          <h1>
            All Users
          </h1>

          <p>
            Manage registered members
          </p>
        </div>

        <div className="users-count">
          {filteredUsers.length}
          {" of "}
          {users.length}
        </div>
      </div>


      <div className="users-filter-card">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search by name, email or location..."
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="blocked">
            Blocked
          </option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          Clear Filters
        </button>

      </div>


      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


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


      <div className="users-table-card">

        <div className="users-table-scroll">

          <table className="users-table">

            <thead>
              <tr>
                <th>S.No.</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Location</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="users-empty"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="users-empty"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(
                  (user, index) => (
                    <tr key={user._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <UserPhoto
                          user={user}
                        />
                      </td>

                      <td>
                        <strong>
                          {user.name || "-"}
                        </strong>
                      </td>

                      <td>
                        {user.email || "-"}
                      </td>

                      <td>
                        {user.age || "-"}
                      </td>

                      <td>
                        {formatValue(
                          user.gender
                        )}
                      </td>

                      <td>
                        {user.location || "-"}
                      </td>

                      <td>
                        <span
                          className={`user-status user-status-${String(
                            user.status ||
                            "active"
                          ).toLowerCase()}`}
                        >
                          {formatValue(
                            user.status ||
                            "active"
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          user.createdAt
                        )}
                      </td>

                      <td>
                        <div className="user-action-buttons">

                          <button
                            type="button"
                            className="user-view-btn"
                            onClick={() =>
                              setViewUser(
                                user
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className={
                              String(
                                user.status ||
                                "active"
                              ).toLowerCase() ===
                              "blocked"
                                ? "user-status-action-btn user-unblock-btn"
                                : "user-status-action-btn user-block-btn"
                            }
                            disabled={
                              actionLoading ===
                              user._id
                            }
                            onClick={() =>
                              changeUserStatus(
                                user
                              )
                            }
                          >
                            {actionLoading ===
                            user._id
                              ? "..."
                              : String(
                                  user.status ||
                                  "active"
                                ).toLowerCase() ===
                                "blocked"
                              ? "Unblock"
                              : "Block"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {viewUser && (
        <div
          className="user-modal-overlay"
          onClick={() =>
            setViewUser(null)
          }
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="user-modal-header">
              <div>
                <h2>
                  User Details
                </h2>

                <p>
                  {viewUser.name || "User"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewUser(null)
                }
              >
                ×
              </button>
            </div>


            <div className="user-modal-profile">

              <UserPhoto
                user={viewUser}
                large
              />

              <div>
                <h3>
                  {viewUser.name || "-"}
                </h3>

                <p>
                  {viewUser.email || "-"}
                </p>
              </div>

            </div>


            <div className="user-detail-grid">

              <UserDetail
                label="Age"
                value={viewUser.age}
              />

              <UserDetail
                label="Gender"
                value={formatValue(
                  viewUser.gender
                )}
              />

              <UserDetail
                label="Location"
                value={viewUser.location}
              />

              <UserDetail
                label="Status"
                value={formatValue(
                  viewUser.status
                )}
              />

              <UserDetail
                label="Approved At"
                value={formatDate(
                  viewUser.approvedAt
                )}
              />

              <UserDetail
                label="Joined"
                value={formatDate(
                  viewUser.createdAt
                )}
              />

            </div>


            <div className="user-modal-footer">

              <button
                type="button"
                className={
                  String(
                    viewUser.status ||
                    "active"
                  ).toLowerCase() ===
                  "blocked"
                    ? "user-modal-status-btn user-unblock-btn"
                    : "user-modal-status-btn user-block-btn"
                }
                disabled={
                  actionLoading ===
                  viewUser._id
                }
                onClick={() =>
                  changeUserStatus(
                    viewUser
                  )
                }
              >
                {actionLoading ===
                viewUser._id
                  ? "Please wait..."
                  : String(
                      viewUser.status ||
                      "active"
                    ).toLowerCase() ===
                    "blocked"
                  ? "Unblock User"
                  : "Block User"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewUser(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}


function UserPhoto({
  user,
  large = false,
}) {
  const photo =
    getFirstPhoto(
      user?.photos
    );

  if (!photo) {
    return (
      <div
        className={
          large
            ? "user-photo user-photo-large user-photo-placeholder"
            : "user-photo user-photo-placeholder"
        }
      >
        {String(
          user?.name ||
          "U"
        )
          .charAt(0)
          .toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={buildMediaUrl(photo)}
      alt={user?.name || "User"}
      className={
        large
          ? "user-photo user-photo-large"
          : "user-photo"
      }
    />
  );
}


function UserDetail({
  label,
  value,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div className="user-detail-card">
      <span>
        {label}
      </span>

      <strong>
        {hasValue
          ? String(value)
          : "-"}
      </strong>
    </div>
  );
}


function getFirstPhoto(
  photos
) {
  if (!photos) {
    return "";
  }

  const value =
    Array.isArray(photos)
      ? photos[0]
      : photos;

  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    typeof value === "object"
  ) {
    return (
      value.url ||
      value.path ||
      value.filename ||
      ""
    );
  }

  return "";
}


function buildMediaUrl(
  value = ""
) {
  if (!value) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    return value;
  }

  const normalized =
    String(value)
      .replace(/\\/g, "/");

  const path =
    normalized.startsWith("/")
      ? normalized
      : `/${normalized}`;

  return (
    WEBSITE_API_URL +
    path
  );
}


function formatDate(
  value
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function formatValue(
  value
) {
  if (!value) {
    return "-";
  }

  const text =
    String(value);

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}


export default AllUsers;
