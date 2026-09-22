







import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RefreshCw } from "lucide-react";

import "../styles/admindashboard.css";
import "../styles/womenapplications.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const WEBSITE_API_URL =
  import.meta.env.VITE_WEBSITE_API_URL ||
  "http://localhost:5000";


function WomenApplications() {
  const gender = "Women";
  const title = "Women Applications";

  const columns = [
    "S.No.",
    "Image",
    "First Name",
    "Age",
    "Location",
    "Status",
    "Date",
    "Action",
  ];

  const initialStatus = "all";
  const [applications, setApplications] =
    useState([]);

  const [applicationsLoading, setApplicationsLoading] =
    useState(true);

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionMessageType, setActionMessageType] =
    useState("error");

  const [viewApplication, setViewApplication] =
    useState(null);


  /* ========================================
     FILTERS
  ======================================== */

  const [applicationSearch, setApplicationSearch] =
    useState("");

  const [
    applicationStatusFilter,
    setApplicationStatusFilter,
  ] = useState(initialStatus);

  const [
    applicationDateFrom,
    setApplicationDateFrom,
  ] = useState("");

  const [
    applicationDateTo,
    setApplicationDateTo,
  ] = useState("");

  const [
    applicationAgeMin,
    setApplicationAgeMin,
  ] = useState("");

  const [
    applicationAgeMax,
    setApplicationAgeMax,
  ] = useState("");


  /* ========================================
     PAGINATION
  ======================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [
    applicationsPerPage,
    setApplicationsPerPage,
  ] = useState(10);


  /* ========================================
     CONFIRM MODAL
  ======================================== */

  const [confirmModal, setConfirmModal] =
    useState({
      open: false,
      type: "",
      application: null,
      loading: false,
    });

  const [rejectReason, setRejectReason] =
    useState("");


  /* ========================================
     API FETCH
  ======================================== */

  const apiFetch = useCallback(
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

              ...(options.headers || {}),
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
    []
  );


  /* ========================================
     LOAD APPLICATIONS
  ======================================== */

  const loadApplications =
    useCallback(
      async () => {
        try {
          setApplicationsLoading(
            true
          );

          setActionMessage("");

          const data =
            await apiFetch(
              "/api/admin/applications"
            );

          const list =
            Array.isArray(data)
              ? data
              : data.applications ||
                data.data ||
                [];

          setApplications(list);
        } catch (error) {
          console.error(error);

          setActionMessage(
            error.message
          );

          setActionMessageType(
            "error"
          );
        } finally {
          setApplicationsLoading(
            false
          );
        }
      },
      [apiFetch]
    );


  useEffect(() => {
    loadApplications();
  }, [loadApplications]);


  /* ========================================
     INITIAL STATUS FILTER
  ======================================== */

  useEffect(() => {
    setApplicationStatusFilter(
      initialStatus
    );

    setCurrentPage(1);
  }, [initialStatus]);


  /* ========================================
     GENDER FILTER
  ======================================== */

  const genderApplications =
    useMemo(() => {
      const selectedGender =
        String(gender || "")
          .trim()
          .toLowerCase();

      if (
        selectedGender === "all"
      ) {
        return applications;
      }

      return applications.filter(
        (application) => {
          const value =
            String(
              application.gender ||
                ""
            )
              .trim()
              .toLowerCase();

          /* WOMEN */

          if (
            [
              "women",
              "woman",
              "female",
            ].includes(
              selectedGender
            )
          ) {
            return [
              "women",
              "woman",
              "female",
            ].includes(value);
          }

          /* MEN */

          if (
            [
              "men",
              "man",
              "male",
            ].includes(
              selectedGender
            )
          ) {
            return [
              "men",
              "man",
              "male",
            ].includes(value);
          }

          return false;
        }
      );
    }, [
      applications,
      gender,
    ]);


  /* ========================================
     SEARCH + FILTERS
  ======================================== */

  const filteredApplications =
    useMemo(() => {
      return genderApplications.filter(
        (application) => {

          /* SEARCH */

          const name =
            String(
              application.firstName ||
                application.name ||
                ""
            ).toLowerCase();

          const location =
            String(
              application.countryOfResidence ||
                application.location ||
                application.countryOfBirth ||
                ""
            ).toLowerCase();

          const searchValue =
            applicationSearch
              .trim()
              .toLowerCase();

          if (
            searchValue &&
            !name.includes(
              searchValue
            ) &&
            !location.includes(
              searchValue
            )
          ) {
            return false;
          }


          /* STATUS */

          const status =
            String(
              application.status ||
                "pending"
            )
              .trim()
              .toLowerCase();

          if (
            applicationStatusFilter !==
              "all" &&
            status !==
              applicationStatusFilter
          ) {
            return false;
          }


          /* AGE */

          const age =
            Number(
              application.age
            );

          if (
            applicationAgeMin !==
              "" &&
            (
              Number.isNaN(age) ||
              age <
                Number(
                  applicationAgeMin
                )
            )
          ) {
            return false;
          }

          if (
            applicationAgeMax !==
              "" &&
            (
              Number.isNaN(age) ||
              age >
                Number(
                  applicationAgeMax
                )
            )
          ) {
            return false;
          }


          /* DATE */

          if (
            applicationDateFrom ||
            applicationDateTo
          ) {
            if (
              !application.createdAt
            ) {
              return false;
            }

            const applicationDate =
              new Date(
                application.createdAt
              );

            if (
              Number.isNaN(
                applicationDate.getTime()
              )
            ) {
              return false;
            }

            if (
              applicationDateFrom
            ) {
              const fromDate =
                new Date(
                  `${applicationDateFrom}T00:00:00`
                );

              if (
                applicationDate <
                fromDate
              ) {
                return false;
              }
            }

            if (
              applicationDateTo
            ) {
              const toDate =
                new Date(
                  `${applicationDateTo}T23:59:59`
                );

              if (
                applicationDate >
                toDate
              ) {
                return false;
              }
            }
          }

          return true;
        }
      );
    }, [
      genderApplications,
      applicationSearch,
      applicationStatusFilter,
      applicationDateFrom,
      applicationDateTo,
      applicationAgeMin,
      applicationAgeMax,
    ]);


  /* ========================================
     RESET PAGE
  ======================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    gender,
    applicationSearch,
    applicationStatusFilter,
    applicationDateFrom,
    applicationDateTo,
    applicationAgeMin,
    applicationAgeMax,
    applicationsPerPage,
  ]);


  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredApplications.length /
          applicationsPerPage
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (safeCurrentPage - 1) *
    applicationsPerPage;


  const paginatedApplications =
    filteredApplications.slice(
      startIndex,
      startIndex +
        applicationsPerPage
    );


  /* ========================================
     CLEAR FILTERS
  ======================================== */

  const clearApplicationFilters =
    () => {
      setApplicationSearch("");

      setApplicationStatusFilter(
        initialStatus
      );

      setApplicationDateFrom("");

      setApplicationDateTo("");

      setApplicationAgeMin("");

      setApplicationAgeMax("");
    };


  /* ========================================
     CONFIRM MODAL
  ======================================== */

  const openConfirmModal =
    (
      type,
      application
    ) => {
      setRejectReason("");

      setConfirmModal({
        open: true,
        type,
        application,
        loading: false,
      });
    };


  const closeConfirmModal =
    () => {
      if (
        confirmModal.loading
      ) {
        return;
      }

      setRejectReason("");

      setConfirmModal({
        open: false,
        type: "",
        application: null,
        loading: false,
      });
    };


  /* ========================================
     APPROVE
  ======================================== */

  const approveApplication =
    async (
      application
    ) => {
      await apiFetch(
        `/api/admin/applications/${application._id}/approve`,
        {
          method: "PATCH",
        }
      );

      setViewApplication(null);

      await loadApplications();

      setActionMessage(
        "Application approved successfully"
      );

      setActionMessageType(
        "success"
      );
    };


  /* ========================================
     REJECT
  ======================================== */

  const rejectApplication =
    async (
      application,
      reason
    ) => {
      await apiFetch(
        `/api/admin/applications/${application._id}/reject`,
        {
          method: "PATCH",

          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      setViewApplication(null);

      await loadApplications();

      setActionMessage(
        "Application rejected successfully"
      );

      setActionMessageType(
        "success"
      );
    };


  /* ========================================
     CONFIRM ACTION
  ======================================== */

  const confirmApplicationAction =
    async () => {
      const application =
        confirmModal.application;

      if (!application) {
        return;
      }

      if (
        confirmModal.type === "reject" &&
        !rejectReason.trim()
      ) {
        setActionMessage(
          "Please enter a rejection reason"
        );

        setActionMessageType(
          "error"
        );

        return;
      }

      setConfirmModal(
        (prev) => ({
          ...prev,
          loading: true,
        })
      );

      try {
        if (
          confirmModal.type ===
          "approve"
        ) {
          await approveApplication(
            application
          );
        }

        if (
          confirmModal.type ===
          "reject"
        ) {
          await rejectApplication(
            application,
            rejectReason
          );
        }

        setRejectReason("");

        setConfirmModal({
          open: false,
          type: "",
          application: null,
          loading: false,
        });
      } catch (error) {
        setActionMessage(
          error.message
        );

        setActionMessageType(
          "error"
        );

        setConfirmModal(
          (prev) => ({
            ...prev,
            loading: false,
          })
        );
      }
    };


  /* ========================================
     TABLE CELL
  ======================================== */

  const renderApplicationCell =
    (
      column,
      application,
      serialNumber
    ) => {

      const appStatus =
        String(
          application.status ||
            "pending"
        )
          .trim()
          .toLowerCase();


      switch (column) {

        /* S.NO */

        case "S.No.":
          return (
            <strong>
              {serialNumber}
            </strong>
          );


        /* IMAGE */

        case "Image": {
          const photo =
            getFirstPhoto(
              application.photos
            );

          if (!photo) {
            return (
              <div className="application-no-photo">
                No Image
              </div>
            );
          }

          return (
            <img
              src={
                buildMediaUrl(
                  photo
                )
              }
              alt={
                application.firstName ||
                "Applicant"
              }
              className="application-table-photo"
            />
          );
        }


        /* FIRST NAME */

        case "First Name":
          return (
            application.firstName ||
            application.name ||
            "-"
          );


        /* AGE */

        case "Age":
          return (
            application.age ??
            "-"
          );


        /* WOMEN LOCATION */

        case "Location":
          return (
            application.countryOfResidence ||
            application.location ||
            "-"
          );


        /* MEN COUNTRY */

        case "Country":
          return (
            application.countryOfResidence ||
            application.countryOfBirth ||
            "-"
          );


        /* MEN ATHLETIC TYPE */

        case "Athletic Type":
          return (
            application.athleticType ||
            "-"
          );


        /* STATUS */

        case "Status":
          return (
            <span
              className={`application-status-pill application-status-${appStatus}`}
            >
              {formatApplicationStatus(
                appStatus
              )}
            </span>
          );


        /* DATE */

        case "Date":
          return (
            formatApplicationDate(
              application.createdAt
            )
          );


        /* ACTION */

        case "Action":
          return (
            <div className="application-row-actions application-icon-actions">

              {/* VIEW */}

              <button
                type="button"
                className="application-icon-btn application-view-icon-btn"
                onClick={() =>
                  setViewApplication(
                    application
                  )
                }
              >
                <span>
                  ◉
                </span>

                <span>
                  View
                </span>
              </button>


              {/* APPROVE */}

              <button
                type="button"
                className="application-icon-btn application-approve-icon-btn"
                disabled={
                  appStatus !==
                  "pending"
                }
                onClick={() =>
                  openConfirmModal(
                    "approve",
                    application
                  )
                }
              >
                <span>
                  ✓
                </span>

                <span>
                  Approve
                </span>
              </button>


              {/* REJECT */}

              <button
                type="button"
                className="application-icon-btn application-reject-icon-btn"
                disabled={
                  appStatus !==
                  "pending"
                }
                onClick={() =>
                  openConfirmModal(
                    "reject",
                    application
                  )
                }
              >
                <span>
                  ✕
                </span>

                <span>
                  Reject
                </span>
              </button>

            </div>
          );


        default:
          return "-";
      }
    };


  /* ========================================
     UI
  ======================================== */

  return (
    <section className="admin-page-content applications-page women-applications-page">

      {/* =================================
          TITLE
      ================================= */}

      <div className="page-title-row applications-title-row">

        <h1>
          {title}
        </h1>

        <button
          type="button"
          className="refresh-btn"
          onClick={loadApplications}
          disabled={applicationsLoading}
        >
          <RefreshCw size={15} />
          <span>Refresh to see the new entries</span>
        </button>

        <div className="application-result-count">

          {
            filteredApplications.length
          }

          {" of "}

          {
            genderApplications.length
          }

        </div>

      </div>


      {/* =================================
          FILTER CARD
      ================================= */}

      <div className="application-filter-card">

        <div className="application-filter-grid">


          {/* SEARCH */}

          <label className="application-filter-field application-filter-search">

            <span>
              Name / Location Search
            </span>

            <div className="application-search-input-wrap">

              <span className="application-search-icon">
                ⌕
              </span>

              <input
                type="text"

                placeholder="Search by name or location..."

                value={
                  applicationSearch
                }

                onChange={(e) =>
                  setApplicationSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </label>


          {/* STATUS */}

          <label className="application-filter-field">

            <span>
              Status
            </span>

            <select
              value={
                applicationStatusFilter
              }

              onChange={(e) =>
                setApplicationStatusFilter(
                  e.target.value
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

          </label>


          {/* FROM DATE */}

          <label className="application-filter-field">

            <span>
              From Date
            </span>

            <input
              type="date"

              value={
                applicationDateFrom
              }

              onChange={(e) =>
                setApplicationDateFrom(
                  e.target.value
                )
              }
            />

          </label>


          {/* TO DATE */}

          <label className="application-filter-field">

            <span>
              To Date
            </span>

            <input
              type="date"

              value={
                applicationDateTo
              }

              onChange={(e) =>
                setApplicationDateTo(
                  e.target.value
                )
              }
            />

          </label>


          {/* MIN AGE */}

          <label className="application-filter-field">

            <span>
              Min Age
            </span>

            <input
              type="number"

              min="1"

              max="99"

              placeholder="23"

              value={
                applicationAgeMin
              }

              onChange={(e) =>
                setApplicationAgeMin(
                  e.target.value
                )
              }
            />

          </label>


          {/* MAX AGE */}

          <label className="application-filter-field">

            <span>
              Max Age
            </span>

            <input
              type="number"

              min="1"

              max="99"

              placeholder="50"

              value={
                applicationAgeMax
              }

              onChange={(e) =>
                setApplicationAgeMax(
                  e.target.value
                )
              }
            />

          </label>


          {/* CLEAR FILTER */}

          <button
            type="button"

            className="application-clear-filter-btn"

            onClick={
              clearApplicationFilters
            }
          >
            Clear Filters
          </button>

        </div>

      </div>


      {/* =================================
          MESSAGE
      ================================= */}

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


      {/* =================================
          TABLE
      ================================= */}

      <div className="admin-data-card applications-data-card">

        <div className="applications-table-scroll">

          <table className="applications-table">

            <thead>

              <tr>

                {columns.map(
                  (column) => (

                    <th
                      key={column}

                      className={
                        column ===
                        "Action"
                          ? "application-action-heading"
                          : ""
                      }
                    >
                      {column}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {applicationsLoading ? (

                <tr>

                  <td
                    colSpan={
                      columns.length
                    }

                    className="applications-empty-result"
                  >
                    Loading applications...
                  </td>

                </tr>

              ) : filteredApplications.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={
                      columns.length
                    }

                    className="applications-empty-result"
                  >
                    No {gender} applications found
                  </td>

                </tr>

              ) : (

                paginatedApplications.map(
                  (
                    application,
                    index
                  ) => {

                    const serialNumber =
                      startIndex +
                      index +
                      1;

                    return (

                      <tr
                        key={
                          application._id
                        }
                      >

                        {columns.map(
                          (column) => (

                            <td
                              key={column}

                              className={
                                column ===
                                "Action"
                                  ? "application-action-cell"
                                  : ""
                              }
                            >

                              {renderApplicationCell(
                                column,
                                application,
                                serialNumber
                              )}

                            </td>

                          )
                        )}

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =================================
            PAGINATION
        ================================= */}

        {!applicationsLoading &&
          filteredApplications.length >
            0 && (

          <div className="application-pagination">

            <div className="pagination-info">

              <span>

                Showing{" "}

                {
                  startIndex + 1
                }

                {" - "}

                {
                  Math.min(
                    startIndex +
                      applicationsPerPage,

                    filteredApplications.length
                  )
                }

                {" of "}

                {
                  filteredApplications.length
                }

              </span>


              <select
                value={
                  applicationsPerPage
                }

                onChange={(e) =>
                  setApplicationsPerPage(
                    Number(
                      e.target.value
                    )
                  )
                }
              >

                <option value={10}>
                  10 per page
                </option>

                <option value={20}>
                  20 per page
                </option>

                <option value={50}>
                  50 per page
                </option>

                <option value={100}>
                  100 per page
                </option>

              </select>

            </div>


            <div className="pagination-buttons">

              <button
                type="button"

                className="pagination-nav-btn"

                disabled={
                  safeCurrentPage ===
                  1
                }

                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
              >
                ‹ Previous
              </button>


              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) =>
                  index + 1
              ).map(
                (page) => (

                  <button
                    key={page}

                    type="button"

                    className={`pagination-page-btn ${
                      safeCurrentPage ===
                      page
                        ? "active"
                        : ""
                    }`}

                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                  >
                    {page}
                  </button>

                )
              )}


              <button
                type="button"

                className="pagination-nav-btn"

                disabled={
                  safeCurrentPage ===
                  totalPages
                }

                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
                      )
                  )
                }
              >
                Next ›
              </button>

            </div>

          </div>

        )}

      </div>


      {/* =================================
          VIEW APPLICATION MODAL
      ================================= */}

      {viewApplication && (

        <div
          className="admin-modal-overlay application-view-overlay"

          onClick={() =>
            setViewApplication(
              null
            )
          }
        >

          <div
            className="application-view-modal"

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="application-view-header">

              <div>
                <h2>
                  Application Details
                </h2>

                <p>
                  {
                    viewApplication.firstName ||
                    viewApplication.name ||
                    "Applicant"
                  }
                </p>
              </div>


              <button
                type="button"

                className="application-modal-close"

                onClick={() =>
                  setViewApplication(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="application-view-body">


              {/* PROFILE */}

              <div className="application-view-profile">

                {getFirstPhoto(
                  viewApplication.photos
                ) ? (

                  <img
                    src={
                      buildMediaUrl(
                        getFirstPhoto(
                          viewApplication.photos
                        )
                      )
                    }

                    alt="Applicant"

                    className="application-view-profile-photo"
                  />

                ) : (

                  <div className="application-view-avatar">

                    {
                      (
                        viewApplication.firstName ||
                        viewApplication.name ||
                        "A"
                      )
                        .charAt(0)
                        .toUpperCase()
                    }

                  </div>

                )}


                <div>

                  <h3>

                    {
                      viewApplication.firstName ||
                      viewApplication.name ||
                      "-"
                    }

                  </h3>

                  <p>

                    {
                      viewApplication.countryOfResidence ||
                      viewApplication.location ||
                      "-"
                    }

                  </p>

                  <span
                    className={`application-status-pill application-status-${String(
                      viewApplication.status ||
                      "pending"
                    ).toLowerCase()}`}
                  >

                    {formatApplicationStatus(
                      String(
                        viewApplication.status ||
                        "pending"
                      ).toLowerCase()
                    )}

                  </span>

                </div>

              </div>


              {/* BASIC INFORMATION */}

              <div className="application-details-section">

                <h3>
                  Basic Information
                </h3>


                <div className="application-details-grid">

                  <ApplicationDetail
                    label="First Name"

                    value={
                      viewApplication.firstName ||
                      viewApplication.name
                    }
                  />


                  <ApplicationDetail
                    label="Age"

                    value={
                      viewApplication.age
                    }
                  />


                  <ApplicationDetail
                    label="Gender"

                    value={
                      viewApplication.gender
                    }
                  />


                  <ApplicationDetail
                    label="Country of Birth"

                    value={
                      viewApplication.countryOfBirth
                    }
                  />


                  <ApplicationDetail
                    label="Country of Residence"

                    value={
                      viewApplication.countryOfResidence ||
                      viewApplication.location
                    }
                  />


                  <ApplicationDetail
                    label="Athletic Type"

                    value={
                      viewApplication.athleticType
                    }
                  />


                  <ApplicationDetail
                    label="Personality Type"

                    value={
                      viewApplication.personalityType
                    }
                  />


                  <ApplicationDetail
                    label="Status"

                    value={
                      formatApplicationStatus(
                        String(
                          viewApplication.status ||
                          "pending"
                        ).toLowerCase()
                      )
                    }
                  />


                  <ApplicationDetail
                    label="Applied Date"

                    value={
                      formatApplicationDate(
                        viewApplication.createdAt
                      )
                    }
                  />

                </div>

              </div>


              {/* REJECTION DETAILS - ADMIN VIEW ONLY */}

              {String(
                viewApplication.status || ""
              ).toLowerCase() === "rejected" && (

                <div className="application-details-section">

                  <h3>
                    Rejection Details
                  </h3>

                  <div className="application-details-grid">

                    <ApplicationDetail
                      label="Rejection Reason"
                      value={
                        viewApplication.rejectionReason ||
                        viewApplication.rejectReason ||
                        viewApplication.reason ||
                        "No rejection reason available"
                      }
                      wide
                    />

                  </div>

                </div>

              )}


              {/* WORK */}

              <div className="application-details-section">

                <h3>
                  Work & Lifestyle
                </h3>


                <div className="application-details-grid">

                  <ApplicationDetail
                    label="Business Owner"
                    value={
                      viewApplication.businessOwner
                    }
                  />

                  <ApplicationDetail
                    label="Employed"
                    value={
                      viewApplication.employed
                    }
                  />

                  <ApplicationDetail
                    label="Profession"
                    value={
                      viewApplication.profession
                    }
                  />

                  <ApplicationDetail
                    label="Job Experience"
                    value={
                      viewApplication.jobExperience
                    }
                  />

                  <ApplicationDetail
                    label="Specific Skills"
                    value={
                      viewApplication.specificSkills
                    }
                  />

                  <ApplicationDetail
                    label="Languages Spoken"
                    value={
                      viewApplication.languagesSpoken
                    }
                  />

                  <ApplicationDetail
                    label="Countries Visited"
                    value={
                      viewApplication.countriesVisited
                    }
                  />

                  <ApplicationDetail
                    label="Desire to Relocate"
                    value={
                      viewApplication.desireToRelocate
                    }
                  />

                  <ApplicationDetail
                    label="Willing to meet or work at client hotels"
                    value={
                      viewApplication.willingToMeetAtClientHotels
                    }
                  />

                  <ApplicationDetail
                    label="Children"
                    value={
                      viewApplication.children
                    }
                  />

                  <ApplicationDetail
                    label="Want Children"
                    value={
                      viewApplication.wantChildren
                    }
                  />

                </div>

              </div>


              {/* RELATIONSHIP */}

              <div className="application-details-section">

                <h3>
                  Relationship & Personal Details
                </h3>


                <div className="application-details-grid">

                  <ApplicationDetail
                    label="Relationship Status"
                    value={
                      viewApplication.relationshipStatus
                    }
                  />

                  <ApplicationDetail
                    label="Relationship Desired"
                    value={
                      viewApplication.relationshipDesired
                    }
                  />

                  <ApplicationDetail
                    label="Hobbies"
                    value={
                      viewApplication.hobbies
                    }
                  />

                  <ApplicationDetail
                    label="Legal Problems"
                    value={
                      viewApplication.legalProblems
                    }
                  />

                  <ApplicationDetail
                    label="Drink"
                    value={
                      viewApplication.drink
                    }
                  />

                  <ApplicationDetail
                    label="Cigarette Smoker"
                    value={
                      viewApplication.cigaretteSmoker
                    }
                  />

                  <ApplicationDetail
                    label="Marijuana"
                    value={
                      viewApplication.marijuana
                    }
                  />

                  <ApplicationDetail
                    label="Other Drugs"
                    value={
                      viewApplication.drugsOther
                    }
                  />

                  <ApplicationDetail
                    label="Vision Statement"
                    value={
                      viewApplication.visionStatement
                    }
                    wide
                  />

                  <ApplicationDetail
                    label="Characteristics Desired"
                    value={
                      viewApplication.characteristicsDesired
                    }
                    wide
                  />

                </div>

              </div>


              {/* MEDIA */}

              <div className="application-details-section">

                <h3>
                  Media
                </h3>


                <div className="application-media-grid">


                  {/* PHOTOS */}

                  <div className="application-media-card">

                    <h4>
                      Photos
                    </h4>


                    {Array.isArray(
                      viewApplication.photos
                    ) &&
                    viewApplication.photos.length >
                      0 ? (

                      <div className="application-photo-grid">

                        {viewApplication.photos.map(
                          (
                            photo,
                            index
                          ) => (

                            <a
                              key={index}

                              href={
                                buildMediaUrl(
                                  getPhotoPath(
                                    photo
                                  )
                                )
                              }

                              target="_blank"

                              rel="noreferrer"
                            >

                              <img
                                src={
                                  buildMediaUrl(
                                    getPhotoPath(
                                      photo
                                    )
                                  )
                                }

                                alt={`Applicant ${index + 1}`}
                              />

                            </a>

                          )
                        )}

                      </div>

                    ) : (

                      <p className="application-media-empty">
                        No photo uploaded
                      </p>

                    )}

                  </div>


                  {/* VOICE */}

                  <div className="application-media-card">

                    <h4>
                      Voice Recording
                    </h4>


                    {viewApplication.voiceRecording ? (

                      <audio
                        controls

                        src={
                          buildMediaUrl(
                            getPhotoPath(
                              viewApplication.voiceRecording
                            )
                          )
                        }
                      />

                    ) : (

                      <p className="application-media-empty">
                        No voice recording uploaded
                      </p>

                    )}

                  </div>


                  {/* VIDEO */}

                  <div className="application-media-card">

                    <h4>
                      Video Recording
                    </h4>


                    {viewApplication.videoRecording ? (

                      <video
                        controls

                        className="application-video-preview"

                        src={
                          buildMediaUrl(
                            getPhotoPath(
                              viewApplication.videoRecording
                            )
                          )
                        }
                      />

                    ) : (

                      <p className="application-media-empty">
                        No video uploaded
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* CLOSE */}

              <div className="application-modal-footer">

                <button
                  type="button"

                  onClick={() =>
                    setViewApplication(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =================================
          CONFIRM MODAL
      ================================= */}

      {confirmModal.open && (

        <div
          className="confirm-action-overlay"

          onClick={
            closeConfirmModal
          }
        >

          <div
            className={`confirm-action-modal ${
              confirmModal.type ===
              "approve"
                ? "approve-modal"
                : "reject-modal"
            }`}

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"

              className="confirm-action-close"

              onClick={
                closeConfirmModal
              }

              disabled={
                confirmModal.loading
              }
            >
              ×
            </button>


            <div
              className={`confirm-action-icon ${
                confirmModal.type ===
                "approve"
                  ? "approve"
                  : "reject"
              }`}
            >

              {confirmModal.type ===
              "approve"
                ? "✓"
                : "✕"}

            </div>


            <h2>

              {confirmModal.type ===
              "approve"
                ? "Approve Application?"
                : "Reject Application?"}

            </h2>


            <p>

              Are you sure you want to{" "}

              <strong>

                {confirmModal.type ===
                "approve"
                  ? "approve"
                  : "reject"}

              </strong>{" "}

              <strong>

                {
                  confirmModal.application
                    ?.firstName ||
                  confirmModal.application
                    ?.name ||
                  "this application"
                }

              </strong>

              ?

            </p>


            {confirmModal.type === "reject" && (
              <div className="reject-reason-box">
                <label>
                  Rejection Reason
                </label>

                <textarea
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(
                      e.target.value
                    )
                  }
                  placeholder="Enter reason for rejecting this application..."
                  rows="4"
                  disabled={
                    confirmModal.loading
                  }
                />
              </div>
            )}


            <div className="confirm-action-buttons">

              <button
                type="button"

                className="confirm-cancel-btn"

                onClick={
                  closeConfirmModal
                }

                disabled={
                  confirmModal.loading
                }
              >
                Cancel
              </button>


              <button
                type="button"

                className={
                  confirmModal.type ===
                  "approve"
                    ? "confirm-approve-btn"
                    : "confirm-reject-btn"
                }

                onClick={
                  confirmApplicationAction
                }

                disabled={
                  confirmModal.loading ||
                  (
                    confirmModal.type ===
                      "reject" &&
                    !rejectReason.trim()
                  )
                }
              >

                {confirmModal.loading
                  ? "Please wait..."
                  : confirmModal.type ===
                    "approve"
                  ? "✓ Approve"
                  : "✕ Reject"}

              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}


/* ========================================
   DETAIL COMPONENT
======================================== */

function ApplicationDetail({
  label,
  value,
  wide = false,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div
      className={`application-detail-card ${
        wide
          ? "application-detail-wide"
          : ""
      }`}
    >

      <span>
        {label}
      </span>

      <strong>
        {
          hasValue
            ? String(value)
            : "-"
        }
      </strong>

    </div>
  );
}


/* ========================================
   STATUS FORMAT
======================================== */

function formatApplicationStatus(
  status = "pending"
) {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    labels[status] ||
    status
  );
}


/* ========================================
   DATE FORMAT
======================================== */

function formatApplicationDate(
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

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  const month =
    date.toLocaleDateString(
      "en-GB",
      {
        month: "long",
      }
    );

  const year =
    date.getFullYear();

  return `${day} ${month} ${year}`;
}


/* ========================================
   GET PHOTO PATH
======================================== */

function getPhotoPath(
  value
) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
    "object"
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


/* ========================================
   FIRST PHOTO
======================================== */

function getFirstPhoto(
  photos
) {
  if (!photos) {
    return "";
  }

  if (
    Array.isArray(photos)
  ) {
    if (
      photos.length === 0
    ) {
      return "";
    }

    return getPhotoPath(
      photos[0]
    );
  }

  return getPhotoPath(
    photos
  );
}


/* ========================================
   MEDIA URL
======================================== */

function buildMediaUrl(
  path = ""
) {
  if (!path) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      path
    )
  ) {
    return path;
  }

  const normalized =
    String(path)
      .replace(/\\/g, "/");

  const cleanPath =
    normalized.startsWith("/")
      ? normalized
      : `/${normalized}`;

  return (
    WEBSITE_API_URL +
    cleanPath
  );
}


export default WomenApplications;