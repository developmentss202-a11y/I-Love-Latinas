

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Check,
  Plus,
  X,
  ChevronDown,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { createPortal } from "react-dom";

import "../styles/menapplications.css";
import "../styles/admin-theme.css";
import "../styles/application-detail-modal.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


function cleanMenValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


function duplicateGroupKey(application) {
  const email = cleanMenValue(application.email);
  const mobile = cleanMenValue(application.mobile);

  if (!email || !mobile) {
    return "";
  }

  return `${email}|${mobile}`;
}


function sortByNewest(items) {
  return [...items].sort((a, b) => {
    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  });
}


function buildModelRows(items) {
  const buckets = new Map();

  items.forEach((application) => {
    const modelKey =
      cleanMenValue(application.memberName) || "-";
    const applicantName =
      String(application.name || "").trim() || "-";
    const bucketKey = `${applicantName}|${modelKey}`;

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }

    buckets.get(bucketKey).push(application);
  });

  const models = [];

  buckets.forEach((modelItems, bucketKey) => {
    const sorted = sortByNewest(modelItems);

    models.push({
      key: bucketKey,
      applicantName:
        String(sorted[0].name || "").trim() || "-",
      name: sorted[0].memberName || "-",
      count: modelItems.length,
      latestDate: sorted[0].createdAt,
      latest: sorted[0],
    });
  });

  models.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return (
      new Date(b.latestDate || 0) -
      new Date(a.latestDate || 0)
    );
  });

  return models;
}


function timesLabel(count) {
  if (count === 1) {
    return "1 time";
  }

  return `${count} times`;
}


function buildDuplicateGroups(list) {
  const buckets = new Map();

  list.forEach((application) => {
    const key = duplicateGroupKey(application);

    if (!key) {
      return;
    }

    if (!buckets.has(key)) {
      buckets.set(key, []);
    }

    buckets.get(key).push(application);
  });

  const groups = [];

  buckets.forEach((items, key) => {
    if (items.length < 2) {
      return;
    }

    const sorted = sortByNewest(items);

    groups.push({
      key,
      count: items.length,
      latest: sorted[0],
      items: sorted,
      models: buildModelRows(sorted),
    });
  });

  return groups;
}


function isOnMenPage(status, pageStatus) {
  const current = String(status || "pending")
    .trim()
    .toLowerCase();

  if (pageStatus === "contacted") {
    return current === "contacted" || current === "approved";
  }

  if (pageStatus === "duplicates") {
    return false;
  }

  return current === "pending";
}


function MenApplications({
  pageStatus = "pending",
  title = "Men Pending",
}) {
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


  const [
    moveConfirm,
    setMoveConfirm,
  ] =
    useState({
      open: false,
      id: null,
      status: null,
      loading: false,
    });


  /* =========================================
     FILTERS
  ========================================= */

  const [
    search,
    setSearch,
  ] =
    useState("");


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


  const [
    openDuplicateKeys,
    setOpenDuplicateKeys,
  ] =
    useState({});


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

  const duplicateGroups =
    useMemo(
      () => buildDuplicateGroups(applications),
      [applications]
    );


  const filteredApplications =
    useMemo(
      () => {
        if (pageStatus === "duplicates") {
          return [];
        }

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
              isOnMenPage(
                currentStatus,
                pageStatus
              );


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
        pageStatus,
        fromDate,
        toDate,
      ]
    );


  const filteredDuplicateGroups =
    useMemo(
      () => {
        if (pageStatus !== "duplicates") {
          return [];
        }

        return duplicateGroups.filter(
          (group) => {
            const application =
              group.latest;

            const text =
              search
                .trim()
                .toLowerCase();

            const searchable =
              [
                application.name,
                application.email,
                application.mobile,
                ...group.models.map(
                  (model) => model.name
                ),
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


            let matchesFrom =
              true;

            if (fromDate) {
              const from =
                new Date(
                  `${fromDate}T00:00:00`
                );

              matchesFrom =
                group.items.some(
                  (item) =>
                    item.createdAt &&
                    new Date(
                      item.createdAt
                    ) >= from
                );
            }


            let matchesTo =
              true;

            if (toDate) {
              const to =
                new Date(
                  `${toDate}T23:59:59`
                );

              matchesTo =
                group.items.some(
                  (item) =>
                    item.createdAt &&
                    new Date(
                      item.createdAt
                    ) <= to
                );
            }


            return (
              matchesSearch &&
              matchesFrom &&
              matchesTo
            );
          }
        );
      },
      [
        duplicateGroups,
        pageStatus,
        search,
        fromDate,
        toDate,
      ]
    );


  useEffect(() => {
    setCurrentPage(1);
    setOpenDuplicateKeys({});
  }, [
    search,
    pageStatus,
    fromDate,
    toDate,
  ]);


  const listLength =
    pageStatus === "duplicates"
      ? filteredDuplicateGroups.length
      : filteredApplications.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        listLength /
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


  const paginatedDuplicateGroups =
    filteredDuplicateGroups.slice(
      startIndex,
      startIndex +
      itemsPerPage
    );


  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  }


  /* =========================================
     APPROVE / REJECT
  ========================================= */

  function openMoveConfirm(id, status) {
    setMoveConfirm({
      open: true,
      id,
      status,
      loading: false,
    });
  }


  function closeMoveConfirm() {
    if (moveConfirm.loading) {
      return;
    }

    setMoveConfirm({
      open: false,
      id: null,
      status: null,
      loading: false,
    });
  }


  async function confirmMoveStatus() {
    if (!moveConfirm.id || !moveConfirm.status) {
      return;
    }

    setMoveConfirm((prev) => ({
      ...prev,
      loading: true,
    }));

    const ok = await updateStatus(
      moveConfirm.id,
      moveConfirm.status
    );

    if (ok) {
      setMoveConfirm({
        open: false,
        id: null,
        status: null,
        loading: false,
      });
      return;
    }

    setMoveConfirm((prev) => ({
      ...prev,
      loading: false,
    }));
  }


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
          return false;
        }

        reason =
          enteredReason.trim();

        if (!reason) {
          setError(
            "Please enter rejection reason"
          );
          return false;
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

        return false;
      }


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to update application"
        );
      }


      if (
        status === "contacted"
      ) {
        setActionMessage(
          "Application moved to Contacted"
        );

        setActionMessageType(
          "approved"
        );
      }


      if (
        status === "pending"
      ) {
        setActionMessage(
          "Application moved to Pending"
        );

        setActionMessageType(
          "approved"
        );
      }


      if (
        status === "duplicate"
      ) {
        setActionMessage(
          "Application moved to Duplicates"
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

      return true;
    } catch (
      statusError
    ) {
      setError(
        statusError.message ||
        "Unable to update application"
      );
      return false;
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



  function toggleDuplicate(key) {
    setOpenDuplicateKeys((current) => {
      const next = {
        ...current,
      };

      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }

      return next;
    });
  }


  function renderDuplicateList() {
    if (paginatedDuplicateGroups.length === 0) {
      return (
        <div className="men-empty-row men-duplicate-empty">
          No duplicate applications found
        </div>
      );
    }

    return paginatedDuplicateGroups.map(
      (group, index) => {
        const application = group.latest;
        const isOpen = Boolean(openDuplicateKeys[group.key]);

        return (
          <div
            key={group.key}
            className={
              isOpen
                ? "men-duplicate-item open"
                : "men-duplicate-item"
            }
          >
            <button
              type="button"
              className="men-duplicate-header"
              aria-expanded={isOpen}
              onClick={() => toggleDuplicate(group.key)}
            >
              <span className="men-duplicate-sno">
                {startIndex + index + 1}
              </span>

              <span
                className="men-duplicate-mobile"
                title={application.mobile || ""}
              >
                {application.mobile || "-"}
              </span>

              <span
                className="men-duplicate-email"
                title={application.email || ""}
              >
                {application.email || "-"}
              </span>

              <span className="men-duplicate-summary">
                {group.models.length} models
              </span>

              <ChevronDown
                size={16}
                className="men-duplicate-chevron"
              />
            </button>

            {isOpen ? (
              <div className="men-duplicate-panel">
                <div className="men-duplicate-models-head">
                  <span>Name</span>
                  <span>Model Name</span>
                  <span>Count</span>
                  <span>Date Added</span>
                  <span>Action</span>
                </div>

                {group.models.map((model) => (
                  <div
                    key={model.key}
                    className="men-duplicate-model-row"
                  >
                    <span
                      className="men-duplicate-applicant-name"
                      title={model.applicantName}
                    >
                      {model.applicantName}
                    </span>

                    <span
                      className="men-duplicate-model-name"
                      title={model.name}
                    >
                      {model.name}
                    </span>

                    <span className="men-duplicate-model-count">
                      {timesLabel(model.count)}
                    </span>

                    <span
                      className="men-duplicate-model-date"
                      title={formatDate(model.latestDate)}
                    >
                      {formatShortDate(model.latestDate)}
                    </span>

                    <span className="men-duplicate-model-action">
                      <button
                        type="button"
                        className="men-view-btn"
                        title="View full information"
                        aria-label="View full information"
                        onClick={() =>
                          setSelectedApplication(model.latest)
                        }
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      }
    );
  }


  function renderTableRows() {
    if (paginatedApplications.length === 0) {
      return (
        <tr>
          <td
            colSpan="7"
            className="men-empty-row"
          >
            No Men applications found
          </td>
        </tr>
      );
    }

    return paginatedApplications.map(
      (application, index) => {
        return (
          <tr key={application._id}>
            <td>
              {startIndex + index + 1}
            </td>

            <td title={application.memberName || ""}>
              {application.memberName || "-"}
            </td>

            <td title={application.name || ""}>
              {application.name || "-"}
            </td>

            <td title={application.mobile || ""}>
              {application.mobile || "-"}
            </td>

            <td title={application.email || ""}>
              {application.email || "-"}
            </td>

            <td
              className="men-date-cell"
              title={formatDate(application.createdAt)}
            >
              {formatShortDate(application.createdAt)}
            </td>

            <td>
              <div className="men-action-buttons">
                <button
                  type="button"
                  className="men-view-btn"
                  title="View full information"
                  aria-label="View full information"
                  onClick={() =>
                    setSelectedApplication(application)
                  }
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>

                <MenMoveButton
                  pageStatus={pageStatus}
                  applicationId={application._id}
                  onMove={openMoveConfirm}
                  variant="table"
                />
              </div>
            </td>
          </tr>
        );
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
            {title}
          </h1>

          <div className="men-heading-actions">
            <button
              type="button"
              className="men-refresh-btn"
              onClick={() => loadApplications(true)}
              disabled={loading}
            >
              <RefreshCw size={14} />
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
          {title}
        </h1>

        <div className="men-heading-actions">
          <button
            type="button"
            className="men-refresh-btn"
            onClick={() => loadApplications(true)}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Refresh to see the new entries
          </button>

          <div className="men-count-pill">
            {
              listLength
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

        {pageStatus === "duplicates" ? (
          <div className="men-duplicate-list">
            <div className="men-duplicate-list-head">
              <span>#</span>
              <span>Mobile</span>
              <span>Email</span>
              <span>Models</span>
              <span></span>
            </div>

            {renderDuplicateList()}
          </div>
        ) : (
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
                    Action
                  </th>
                </tr>
              </thead>


              <tbody>
                {renderTableRows()}
              </tbody>

            </table>

          </div>
        )}


        {/* PAGINATION */}

        {
          listLength >
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

      {moveConfirm.open &&
        createPortal(
          <div
            className="confirm-action-overlay men-confirm-overlay"
            onClick={closeMoveConfirm}
          >
            <div
              className="confirm-action-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="confirm-action-close"
                onClick={closeMoveConfirm}
                disabled={moveConfirm.loading}
              >
                ×
              </button>

              <div className="confirm-action-icon approve">
                {moveConfirm.status === "contacted" ? "+" : "✓"}
              </div>

              <h2>
                {moveConfirm.status === "contacted"
                  ? "Add to Contacted?"
                  : "Add to Pending?"}
              </h2>

              <p>
                Are you sure you want to{" "}
                <strong>
                  {moveConfirm.status === "contacted"
                    ? "add this application to Contacted"
                    : "move this application back to Pending"}
                </strong>
                ?
              </p>

              <div className="confirm-action-buttons">
                <button
                  type="button"
                  className="confirm-cancel-btn"
                  onClick={closeMoveConfirm}
                  disabled={moveConfirm.loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-approve-btn"
                  onClick={confirmMoveStatus}
                  disabled={moveConfirm.loading}
                >
                  {moveConfirm.loading
                    ? "Please wait..."
                    : moveConfirm.status === "contacted"
                      ? "+ Add to Contacted"
                      : "✓ Add to Pending"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}


      {
        selectedApplication && createPortal(
          <div
            className="modal-overlay men-view-overlay"
            onClick={() => setSelectedApplication(null)}
          >
            <div
              className="modal men-view-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-head men-view-header">
                <div>
                  <h2>Full Information</h2>
                  <p>
                    {selectedApplication.name ||
                      selectedApplication.subject ||
                      "Men Application Details"}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  title="Close"
                  aria-label="Close"
                  onClick={() => setSelectedApplication(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body application-view-body">
                <div className="modal-section">
                  <div className="detail-card">
                    <div className="detail-card-head">
                      <div className="sec-icon">
                        <ClipboardList size={16} />
                      </div>
                      <h4>Contact & Booking Details</h4>
                    </div>
                    <div className="detail-list">
                      <Detail
                        label="She Is"
                        value={selectedApplication.memberName}
                      />
                      <Detail
                        label="Name"
                        value={selectedApplication.name}
                      />
                      <Detail
                        label="Mobile"
                        value={selectedApplication.mobile}
                      />
                      <Detail
                        label="Email"
                        value={selectedApplication.email}
                      />
                      <Detail
                        label="When"
                        value={formatDate(selectedApplication.meetingDate)}
                      />
                      <Detail
                        label="The Night"
                        value={selectedApplication.nightType}
                      />
                      <Detail
                        label="Subject"
                        value={selectedApplication.subject}
                      />
                      <Detail
                        label="What You Want"
                        value={selectedApplication.message}
                        full
                      />
                      <Detail
                        label="Submitted Date"
                        value={formatDate(selectedApplication.createdAt)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-foot men-modal-actions">
                {pageStatus === "duplicates" ? null : (
                  <MenMoveButton
                    pageStatus={pageStatus}
                    applicationId={selectedApplication._id}
                    onMove={openMoveConfirm}
                    variant="modal"
                  />
                )}
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

    </section>
  );
}


function MenMoveButton({
  pageStatus,
  applicationId,
  onMove,
  variant,
}) {
  const className =
    variant === "modal"
      ? "men-modal-approve"
      : "men-contact-btn";

  const iconSize =
    variant === "modal" ? 17 : 16;

  if (pageStatus === "pending") {
    return (
      <button
        type="button"
        className={className}
        title="Add to Contacted"
        aria-label="Add to Contacted"
        onClick={() => onMove(applicationId, "contacted")}
      >
        <Plus size={iconSize} />
        <span>Add to Contacted</span>
      </button>
    );
  }

  if (pageStatus === "contacted") {
    return (
      <button
        type="button"
        className={className}
        title="Add to Pending"
        aria-label="Add to Pending"
        onClick={() => onMove(applicationId, "pending")}
      >
        <Check size={iconSize} />
        <span>Add to Pending</span>
      </button>
    );
  }

  return null;
}


function Detail({
  label,
  value,
  full = false,
}) {
  const display = value || "-";

  if (full) {
    return (
      <div className="text-row men-detail-item men-detail-item--full">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{display}</span>
      </div>
    );
  }

  return (
    <div className="detail-row men-detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{display}</span>
    </div>
  );
}


export default MenApplications;
