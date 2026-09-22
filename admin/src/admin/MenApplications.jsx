

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Check,
  X,
} from "lucide-react";

import "../styles/menapplications.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


function MenApplications() {
  const [
    applications,
    setApplications,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    actionMessage,
    setActionMessage,
  ] =
    useState("");


  const [
    actionMessageType,
    setActionMessageType,
  ] =
    useState("");


  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState(null);


  /* =========================================
     FILTERS
  ========================================= */

  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");


  const [
    fromDate,
    setFromDate,
  ] =
    useState("");


  const [
    toDate,
    setToDate,
  ] =
    useState("");


  /* =========================================
     PAGINATION
  ========================================= */

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);


  const itemsPerPage =
    10;


  /* =========================================
     LOAD MEN APPLICATIONS
  ========================================= */

  async function loadApplications(
    showLoader = false
  ) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const response =
        await fetch(
          `${API_URL}/api/admin/men-applications`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
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
          "Unable to load Men applications"
        );
      }


      setApplications(
        Array.isArray(
          data.applications
        )
          ? data.applications
          : []
      );
    } catch (
      loadError
    ) {
      setError(
        loadError.message ||
        "Unable to load applications"
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }


  /* Load once when the page opens.
     New entries come from the Refresh button or a browser refresh. */
  useEffect(() => {
    loadApplications(
      true
    );
  }, []);


  /* =========================================
     FILTER
  ========================================= */

  const filteredApplications =
    useMemo(
      () => {
        return applications.filter(
          (application) => {
            const text =
              search
                .trim()
                .toLowerCase();

            const searchable =
              [
                application.memberName,
                application.name,
                application.email,
                application.mobile,
              ]
                .map(
                  (value) =>
                    String(
                      value ||
                      ""
                    )
                      .toLowerCase()
                )
                .join(" ");

            const matchesSearch =
              !text ||
              searchable.includes(
                text
              );

            const currentStatus =
              String(
                application.status ||
                "pending"
              )
                .trim()
                .toLowerCase();

            const matchesStatus =
              statusFilter ===
                "all" ||
              currentStatus ===
                statusFilter;


            let matchesFrom =
              true;

            if (
              fromDate &&
              application.createdAt
            ) {
              const created =
                new Date(
                  application.createdAt
                );

              const from =
                new Date(
                  `${fromDate}T00:00:00`
                );

              matchesFrom =
                created >= from;
            }


            let matchesTo =
              true;

            if (
              toDate &&
              application.createdAt
            ) {
              const created =
                new Date(
                  application.createdAt
                );

              const to =
                new Date(
                  `${toDate}T23:59:59`
                );

              matchesTo =
                created <= to;
            }


            return (
              matchesSearch &&
              matchesStatus &&
              matchesFrom &&
              matchesTo
            );
          }
        );
      },
      [
        applications,
        search,
        statusFilter,
        fromDate,
        toDate,
      ]
    );


  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    fromDate,
    toDate,
  ]);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredApplications.length /
        itemsPerPage
      )
    );


  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);


  const startIndex =
    (currentPage - 1) *
    itemsPerPage;


  const paginatedApplications =
    filteredApplications.slice(
      startIndex,
      startIndex +
      itemsPerPage
    );


  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  }


  /* =========================================
     APPROVE / REJECT
  ========================================= */

  async function updateStatus(
    id,
    status
  ) {
    try {
      setError("");
      setActionMessage("");
      setActionMessageType("");

      let reason =
        "";

      if (
        status === "rejected"
      ) {
        const enteredReason =
          window.prompt(
            "Enter rejection reason"
          );

        if (
          enteredReason === null
        ) {
          return;
        }

        reason =
          enteredReason.trim();

        if (!reason) {
          setError(
            "Please enter rejection reason"
          );
          return;
        }
      }


      const token =
        localStorage.getItem(
          "adminToken"
        );


      const response =
        await fetch(
          `${API_URL}/api/admin/men-applications/${id}/status`,
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
                status,
                reason,
              }),
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
          "Unable to update application"
        );
      }


      if (
        status === "approved"
      ) {
        setActionMessage(
          "Application approved successfully"
        );

        setActionMessageType(
          "approved"
        );
      }


      if (
        status === "rejected"
      ) {
        setActionMessage(
          "Application rejected successfully"
        );

        setActionMessageType(
          "rejected"
        );
      }


      setSelectedApplication(
        null
      );


      /*
        UI turant update ho.
      */
      setApplications(
        (current) =>
          current.map(
            (application) =>
              application._id ===
              id
                ? {
                    ...application,
                    ...(data.application ||
                      {}),
                  }
                : application
          )
      );


      await loadApplications(
        false
      );
    } catch (
      statusError
    ) {
      setError(
        statusError.message ||
        "Unable to update application"
      );
    }
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

    return date
      .toLocaleString();
  }

  function formatShortDate(
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
        month: "short",
        year: "numeric",
      }
    );
  }



  if (loading) {
    return (
      <section
        className="admin-page-content men-applications-page"
      >
        <div className="men-page-heading">
          <h1>
            Men Applications
          </h1>

          <div className="men-heading-actions">
            <button
              type="button"
              className="men-refresh-btn"
              onClick={() => loadApplications(true)}
              disabled={loading}
            >
              Refresh to see the new entries
            </button>
          </div>
        </div>

        <div className="men-loading">
          Loading Men Applications...
        </div>
      </section>
    );
  }


  return (
    <section
      className="admin-page-content men-applications-page"
    >


      {/* HEADING */}

      <div className="men-page-heading">

        <h1>
          Men Applications
        </h1>

        <div className="men-heading-actions">
          <button
            type="button"
            className="men-refresh-btn"
            onClick={() => loadApplications(true)}
            disabled={loading}
          >
            Refresh to see the new entries
          </button>

          <div className="men-count-pill">
            {
              filteredApplications.length
            }
            {" "}of{" "}
            {
              applications.length
            }
          </div>
        </div>

      </div>


      {/* FILTERS */}

      <div className="men-filter-card">

        <div className="men-filter-field men-search-field">
          <label>
            Name / Contact Search
          </label>

          <input
            type="text"
            placeholder="Search name, profile, mobile or email..."
            value={
              search
            }
            onChange={
              (event) =>
                setSearch(
                  event.target.value
                )
            }
          />
        </div>


        <div className="men-filter-field">
          <label>
            Status
          </label>

          <select
            value={
              statusFilter
            }
            onChange={
              (event) =>
                setStatusFilter(
                  event.target.value
                )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>


        <div className="men-filter-field">
          <label>
            From Date
          </label>

          <input
            type="date"
            value={
              fromDate
            }
            onChange={
              (event) =>
                setFromDate(
                  event.target.value
                )
            }
          />
        </div>


        <div className="men-filter-field">
          <label>
            To Date
          </label>

          <input
            type="date"
            value={
              toDate
            }
            onChange={
              (event) =>
                setToDate(
                  event.target.value
                )
            }
          />
        </div>


        <div className="men-clear-filter-wrap">
          <button
            type="button"
            className="men-clear-filter-btn"
            onClick={
              clearFilters
            }
          >
            Clear Filters
          </button>
        </div>

      </div>


      {/* ERROR */}

      {
        error && (
          <div className="dashboard-error">
            {error}
          </div>
        )
      }


      {/* APPROVE / REJECT MESSAGE */}

      {
        actionMessage && (
          <div
            className={
              `men-action-message ${actionMessageType}`
            }
          >
            {
              actionMessage
            }
          </div>
        )
      }


      {/* TABLE */}

      <div className="admin-data-card">

        <div className="men-table-scroll">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  S.No.
                </th>

                <th>
                  She Is
                </th>

                <th>
                  Name
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Email
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>


            <tbody>

              {
                paginatedApplications.length ===
                0
                  ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="men-empty-row"
                    >
                      No Men applications found
                    </td>
                  </tr>

                ) : (

                  paginatedApplications.map(
                    (
                      application,
                      index
                    ) => {
                      const status =
                        String(
                          application.status ||
                          "pending"
                        )
                          .trim()
                          .toLowerCase();

                      return (
                        <tr
                          key={
                            application._id
                          }
                        >

                          <td>
                            {
                              startIndex +
                              index +
                              1
                            }
                          </td>


                          <td
                            title={
                              application.memberName ||
                              ""
                            }
                          >
                            {
                              application.memberName ||
                              "-"
                            }
                          </td>


                          <td
                            title={
                              application.name ||
                              ""
                            }
                          >
                            {
                              application.name ||
                              "-"
                            }
                          </td>


                          <td
                            title={
                              application.mobile ||
                              ""
                            }
                          >
                            {
                              application.mobile ||
                              "-"
                            }
                          </td>


                          <td
                            title={
                              application.email ||
                              ""
                            }
                          >
                            {
                              application.email ||
                              "-"
                            }
                          </td>


                          <td
                            className="men-date-cell"
                            title={
                              formatDate(
                                application.createdAt
                              )
                            }
                          >
                            {
                              formatShortDate(
                                application.createdAt
                              )
                            }
                          </td>


                          <td>
                            <span
                              className={
                                `status-badge ${status}`
                              }
                            >
                              {
                                status
                              }
                            </span>
                          </td>


                          <td>
                            <div className="men-action-buttons">

                              <button
                                type="button"
                                className="men-view-btn"
                                title="View full information"
                                aria-label="View full information"
                                onClick={
                                  () =>
                                    setSelectedApplication(
                                      application
                                    )
                                }
                              >
                                <Eye
                                  size={14}
                                />
                                <span>View</span>
                              </button>


                              <button
                                type="button"
                                className="men-approve-btn"
                                title="Approve"
                                aria-label="Approve"
                                disabled={
                                  status !==
                                  "pending"
                                }
                                onClick={
                                  () =>
                                    updateStatus(
                                      application._id,
                                      "approved"
                                    )
                                }
                              >
                                <Check
                                  size={14}
                                />
                                <span>Approve</span>
                              </button>


                              <button
                                type="button"
                                className="men-reject-btn"
                                title="Reject"
                                aria-label="Reject"
                                disabled={
                                  status !==
                                  "pending"
                                }
                                onClick={
                                  () =>
                                    updateStatus(
                                      application._id,
                                      "rejected"
                                    )
                                }
                              >
                                <X
                                  size={14}
                                />
                                <span>Reject</span>
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )
                )
              }

            </tbody>

          </table>

        </div>


        {/* PAGINATION */}

        {
          filteredApplications.length >
            itemsPerPage && (

            <div className="men-pagination">

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={
                  () =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                }
              >
                ‹ Previous
              </button>


              <div className="men-page-numbers">

                {
                  Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (
                      _,
                      index
                    ) =>
                      index + 1
                  ).map(
                    (page) => (

                      <button
                        type="button"
                        key={
                          page
                        }
                        className={
                          currentPage ===
                          page
                            ? "active"
                            : ""
                        }
                        onClick={
                          () =>
                            setCurrentPage(
                              page
                            )
                        }
                      >
                        {
                          page
                        }
                      </button>

                    )
                  )
                }

              </div>


              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={
                  () =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                }
              >
                Next ›
              </button>

            </div>

          )
        }

      </div>


      {/* VIEW MODAL */}

      {
        selectedApplication && (

          <div
            className="men-view-overlay"
            onClick={
              () =>
                setSelectedApplication(
                  null
                )
            }
          >

            <div
              className="men-view-modal"
              onClick={
                (event) =>
                  event.stopPropagation()
              }
            >

              <div className="men-view-header">

                <div>
                  <span className="men-view-kicker">
                    Full Information
                  </span>

                  <h2>
                    Men Application Details
                  </h2>
                </div>


                <button
                  type="button"
                  title="Close"
                  aria-label="Close"
                  onClick={
                    () =>
                      setSelectedApplication(
                        null
                      )
                  }
                >
                  <X
                    size={18}
                  />
                </button>

              </div>


              <div className="men-view-grid">

                <Detail
                  label="She Is"
                  value={
                    selectedApplication
                      .memberName
                  }
                />

                <Detail
                  label="Name"
                  value={
                    selectedApplication
                      .name
                  }
                />

                <Detail
                  label="Mobile"
                  value={
                    selectedApplication
                      .mobile
                  }
                />

                <Detail
                  label="Email"
                  value={
                    selectedApplication
                      .email
                  }
                />

                <Detail
                  label="When"
                  value={
                    formatDate(
                      selectedApplication
                        .meetingDate
                    )
                  }
                />

                <Detail
                  label="The Night"
                  value={
                    selectedApplication
                      .nightType
                  }
                />

                <Detail
                  label="Subject"
                  value={
                    selectedApplication
                      .subject
                  }
                />

                <Detail
                  label="What You Want"
                  value={
                    selectedApplication
                      .message
                  }
                  full
                />

                <Detail
                  label="Status"
                  value={
                    selectedApplication
                      .status ||
                    "pending"
                  }
                />

                <Detail
                  label="Submitted Date"
                  value={
                    formatDate(
                      selectedApplication
                        .createdAt
                    )
                  }
                />

                {
                  selectedApplication
                    .rejectReason && (

                    <Detail
                      label="Reject Reason"
                      value={
                        selectedApplication
                          .rejectReason
                      }
                      full
                    />

                  )
                }

              </div>


              {
                String(
                  selectedApplication.status ||
                  "pending"
                )
                  .toLowerCase() ===
                  "pending" && (

                  <div className="men-modal-actions">

                    <button
                      type="button"
                      className="men-modal-approve"
                      onClick={
                        () =>
                          updateStatus(
                            selectedApplication._id,
                            "approved"
                          )
                      }
                    >
                      <Check
                        size={15}
                      />

                      Approve
                    </button>


                    <button
                      type="button"
                      className="men-modal-reject"
                      onClick={
                        () =>
                          updateStatus(
                            selectedApplication._id,
                            "rejected"
                          )
                      }
                    >
                      <X
                        size={15}
                      />

                      Reject
                    </button>

                  </div>

                )
              }

            </div>

          </div>

        )
      }

    </section>
  );
}


function Detail({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={
        `men-detail-item ${
          full
            ? "men-detail-item--full"
            : ""
        }`
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {
          value ||
          "-"
        }
      </strong>
    </div>
  );
}


export default MenApplications;
