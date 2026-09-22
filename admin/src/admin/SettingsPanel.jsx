





import {
  useEffect,
  useState,
} from "react";

import "../styles/settingspanel.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const defaultSettings = {
  websiteName: "I Love Latinas",
  supportEmail: "",

  menRegistrationOpen: true,
  womenRegistrationOpen: true,

  minimumAge: 21,
  maximumAge: 99,

  applicationManagement: true,
  approvalMode: "manual",
  mediaUploads: true,

  maintenanceMode: false,
};


const SECTION_INFO = {
  general: {
    title: "General Settings",
    description: "Manage basic website settings.",
  },

  registration: {
    title: "Registration Settings",
    description: "Control new member registrations.",
  },

  application: {
    title: "Application Settings",
    description: "Control application management and approvals.",
  },

  system: {
    title: "System Settings",
    description: "Manage website availability and maintenance.",
  },
};


function SettingsPanel({
  section = "general",
}) {

  const currentSection =
    SECTION_INFO[section]
      ? section
      : "general";


  const [
    settings,
    setSettings,
  ] = useState(
    defaultSettings
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    messageType,
    setMessageType,
  ] = useState("success");


  /* =========================================
     LOAD SETTINGS
  ========================================= */

  useEffect(() => {

    const loadSettings =
      async () => {

        try {

          setLoading(true);
          setMessage("");


          const token =
            localStorage.getItem(
              "adminToken"
            );


          const response =
            await fetch(
              `${API_URL}/api/admin/settings`,
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
              "Unable to load settings"
            );
          }


          setSettings({
            ...defaultSettings,
            ...data.settings,
          });

        } catch (error) {

          setMessageType(
            "error"
          );

          setMessage(
            error.message
          );

        } finally {

          setLoading(false);
        }
      };


    loadSettings();

  }, []);


  /* =========================================
     CLEAR OLD MESSAGE WHEN PAGE CHANGES
  ========================================= */

  useEffect(() => {

    setMessage("");

  }, [currentSection]);


  /* =========================================
     UPDATE VALUE
  ========================================= */

  const updateSetting =
    (
      key,
      value
    ) => {

      setSettings(
        (previous) => ({
          ...previous,

          [key]:
            value,
        })
      );
    };


  /* =========================================
     SAVE SETTINGS
  ========================================= */

  const saveSettings =
    async (
      event
    ) => {

      event.preventDefault();


      try {

        setSaving(true);
        setMessage("");


        if (
          Number(
            settings.minimumAge
          ) >
          Number(
            settings.maximumAge
          )
        ) {

          throw new Error(
            "Minimum age cannot be greater than maximum age"
          );
        }


        const token =
          localStorage.getItem(
            "adminToken"
          );


        const response =
          await fetch(
            `${API_URL}/api/admin/settings`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  ...settings,

                  minimumAge:
                    Number(
                      settings.minimumAge
                    ),

                  maximumAge:
                    Number(
                      settings.maximumAge
                    ),
                }),
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
            "Unable to save settings"
          );
        }


        setSettings({
          ...defaultSettings,
          ...data.settings,
        });


        setMessageType(
          "success"
        );

        setMessage(
          "Settings saved successfully"
        );

      } catch (error) {

        setMessageType(
          "error"
        );

        setMessage(
          error.message
        );

      } finally {

        setSaving(false);
      }
    };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (
      <section className="admin-page-content">

        <div className="settings-loading">
          Loading settings...
        </div>

      </section>
    );
  }


  /* =========================================
     UI
  ========================================= */

  return (

    <section className="admin-page-content">

      <div className="new-settings-page">


        {/* PAGE HEADING */}

        <div className="settings-page-heading">

          <div>

            <h1>
              {
                SECTION_INFO[
                  currentSection
                ].title
              }
            </h1>

            <p>
              {
                SECTION_INFO[
                  currentSection
                ].description
              }
            </p>

          </div>

        </div>


        {/* MESSAGE */}

        {message && (

          <div
            className={
              messageType ===
              "success"
                ? "settings-message success"
                : "settings-message error"
            }
          >

            {message}

          </div>

        )}


        <form
          onSubmit={
            saveSettings
          }
        >


          {/* =====================================
              GENERAL SETTINGS PAGE
          ===================================== */}

          {currentSection ===
            "general" && (

            <div className="settings-section-card">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  ⚙
                </div>

                <div>

                  <h2>
                    General Settings
                  </h2>

                  <p>
                    Basic website settings
                  </p>

                </div>

              </div>


              <div className="settings-fields-grid">


                <label className="settings-field">

                  <span>
                    Website Name
                  </span>

                  <input
                    type="text"

                    value={
                      settings
                        .websiteName
                    }

                    onChange={(e) =>
                      updateSetting(
                        "websiteName",
                        e.target.value
                      )
                    }

                    required
                  />

                </label>


                <label className="settings-field">

                  <span>
                    Support Email
                  </span>

                  <input
                    type="email"

                    placeholder="support@example.com"

                    value={
                      settings
                        .supportEmail
                    }

                    onChange={(e) =>
                      updateSetting(
                        "supportEmail",
                        e.target.value
                      )
                    }
                  />

                </label>


              </div>

            </div>

          )}


          {/* =====================================
              REGISTRATION SETTINGS PAGE
          ===================================== */}

          {currentSection ===
            "registration" && (

            <div className="settings-section-card">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  ♡
                </div>

                <div>

                  <h2>
                    Registration Settings
                  </h2>

                  <p>
                    Control new registrations
                  </p>

                </div>

              </div>


              <SettingToggle
                title="Men Registration"
                description="Allow men to submit registration"

                checked={
                  settings
                    .menRegistrationOpen
                }

                onChange={(value) =>
                  updateSetting(
                    "menRegistrationOpen",
                    value
                  )
                }
              />


              <SettingToggle
                title="Women Registration"
                description="Allow women to submit registration"

                checked={
                  settings
                    .womenRegistrationOpen
                }

                onChange={(value) =>
                  updateSetting(
                    "womenRegistrationOpen",
                    value
                  )
                }
              />


              <div className="settings-fields-grid settings-age-grid">


                <label className="settings-field">

                  <span>
                    Minimum Age
                  </span>

                  <input
                    type="number"

                    min="18"
                    max="99"

                    value={
                      settings
                        .minimumAge
                    }

                    onChange={(e) =>
                      updateSetting(
                        "minimumAge",
                        e.target.value
                      )
                    }
                  />

                </label>


                <label className="settings-field">

                  <span>
                    Maximum Age
                  </span>

                  <input
                    type="number"

                    min="18"
                    max="120"

                    value={
                      settings
                        .maximumAge
                    }

                    onChange={(e) =>
                      updateSetting(
                        "maximumAge",
                        e.target.value
                      )
                    }
                  />

                </label>


              </div>

            </div>

          )}


          {/* =====================================
              APPLICATION SETTINGS PAGE
          ===================================== */}

          {currentSection ===
            "application" && (

            <div className="settings-section-card">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  ▣
                </div>

                <div>

                  <h2>
                    Application Settings
                  </h2>

                  <p>
                    Control application management
                  </p>

                </div>

              </div>


              <SettingToggle
                title="Application Management"
                description="Enable application submission and management"

                checked={
                  settings
                    .applicationManagement
                }

                onChange={(value) =>
                  updateSetting(
                    "applicationManagement",
                    value
                  )
                }
              />


              <div className="settings-select-row">

                <div>

                  <strong>
                    Approval Mode
                  </strong>

                  <p>
                    Select how applications are approved
                  </p>

                </div>


                <select
                  value={
                    settings
                      .approvalMode
                  }

                  onChange={(e) =>
                    updateSetting(
                      "approvalMode",
                      e.target.value
                    )
                  }
                >

                  <option value="manual">
                    Manual Review
                  </option>

                  <option value="auto">
                    Auto Approval
                  </option>

                </select>

              </div>



            </div>

          )}


          {/* =====================================
              SYSTEM SETTINGS PAGE
          ===================================== */}

          {currentSection ===
            "system" && (

            <div className="settings-section-card">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  ⚠
                </div>

                <div>

                  <h2>
                    System Settings
                  </h2>

                  <p>
                    Website availability
                  </p>

                </div>

              </div>


              <SettingToggle
                title="Maintenance Mode"
                description="Temporarily disable the public website"

                checked={
                  settings
                    .maintenanceMode
                }

                onChange={(value) =>
                  updateSetting(
                    "maintenanceMode",
                    value
                  )
                }
              />

            </div>

          )}


          {/* SAVE BUTTON */}

          <div className="settings-save-area">

            <button
              type="submit"
              className="settings-save-button"

              disabled={
                saving
              }
            >

              {
                saving
                  ? "Saving..."
                  : "Save Settings"
              }

            </button>

          </div>


        </form>

      </div>

    </section>

  );
}


/* =========================================
   TOGGLE COMPONENT
========================================= */

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}) {

  return (

    <div className="settings-toggle-row">

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>


      <label className="settings-switch">

        <input
          type="checkbox"

          checked={
            Boolean(
              checked
            )
          }

          onChange={(e) =>
            onChange(
              e.target.checked
            )
          }
        />

        <span className="settings-slider">
        </span>

      </label>

    </div>

  );
}


export default SettingsPanel;
