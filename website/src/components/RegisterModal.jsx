


import {
  useEffect,
  useRef,
  useState,
} from "react";

import Logo from "./Logo";
import { LanguageButtons, useLanguage } from "../language";

import FormFields, {
  createEmptyForm,
  formFields,
  formSteps,
} from "./FormFields";


const API_BASE =
  (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");


function slugifyName(name) {
  const base = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "member";
}

function createFormSlug(firstName) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugifyName(firstName)}-${suffix}`;
}


export default function RegisterModal({
  open,
  onClose,
  onGoHome,
  onSubmitted,
}) {
  const { t } = useLanguage();

  const [step, setStep] =
    useState(1);

  const [values, setValues] =
    useState(
      createEmptyForm
    );

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formAlert,
    setFormAlert,
  ] = useState("");


  // React field validation
  const [
    fieldErrors,
    setFieldErrors,
  ] = useState({});


  // Public settings from Admin
  const [
    siteSettings,
    setSiteSettings,
  ] = useState({
    minimumAge: 21,
    maximumAge: 99,
    womenRegistrationOpen: true,
    applicationManagement: true,
    maintenanceMode: false,
  });


  const formRef =
    useRef(null);


  const progress =
    (step /
      formSteps.length) *
    100;


  // =====================================================
  // LOAD PUBLIC SETTINGS
  // =====================================================

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let active = true;

    async function loadPublicSettings() {
      try {
        const response =
          await fetch(
            `${API_BASE}/api/settings`
          );

        const data =
          await response.json();

        if (
          active &&
          response.ok &&
          data?.settings
        ) {
          setSiteSettings(
            (previous) => ({
              ...previous,
              ...data.settings,
            })
          );
        }
      } catch (error) {
        console.error(
          "PUBLIC SETTINGS ERROR:",
          error
        );
      }
    }

    loadPublicSettings();

    return () => {
      active = false;
    };
  }, [open]);


  // =====================================================
  // BODY SCROLL + ESC
  // =====================================================

  useEffect(() => {

    if (
      !open &&
      !submitted
    ) {

      return undefined;
    }


    const previous =
      document.body.style
        .overflow;


    document.body.style
      .overflow =
      "hidden";


    function onKey(event) {

      if (
        event.key !==
        "Escape"
      ) {

        return;
      }


      if (confirmOpen) {

        setConfirmOpen(false);

        return;
      }


      if (submitted) {

        goHome();

        return;
      }


      closeForm();
    }


    window.addEventListener(
      "keydown",
      onKey
    );


    return () => {

      document.body.style
        .overflow =
        previous;


      window.removeEventListener(
        "keydown",
        onKey
      );
    };

  }, [
    open,
    confirmOpen,
    submitted,
  ]);


  // =====================================================
  // AUTO REQUIRED + PLACEHOLDER
  // =====================================================

  useEffect(() => {

    if (
      !open ||
      submitted
    ) {

      return;
    }


    const timer =
      requestAnimationFrame(
        () => {

          const form =
            formRef.current;


          if (!form) {

            return;
          }


          const fields =
            form.querySelectorAll(
              'input:not([type="button"]):not([type="submit"]), textarea, select'
            );


          fields.forEach(
            (field) => {

              // Required validation React state se handle hogi.


              if (
                field.tagName ===
                "SELECT"
              ) {

                return;
              }


              if (
                field.type ===
                "file"
              ) {

                return;
              }


              if (
                field.type ===
                  "radio" ||
                field.type ===
                  "checkbox"
              ) {

                return;
              }


              if (
                field.placeholder
              ) {

                return;
              }


              const fieldName =
                field.name ||
                field.id ||
                "value";


              const readableName =
                fieldName

                  .replace(
                    /([a-z])([A-Z])/g,
                    "$1 $2"
                  )

                  .replace(
                    /[_-]/g,
                    " "
                  );


              field.placeholder =
                `Enter ${readableName.toLowerCase()}`;
            }
          );
        }
      );


    return () =>
      cancelAnimationFrame(
        timer
      );

  }, [
    open,
    step,
    submitted,
  ]);


  // =====================================================
  // REACT VALIDATION
  // =====================================================

  function isReactFieldEmpty(
    field,
    value
  ) {
    if (
      field.name ===
      "photos"
    ) {
      return (
        !Array.isArray(value) ||
        value.length === 0
      );
    }

    if (
      field.type ===
      "file"
    ) {
      return !(
        value instanceof File
      );
    }

    return (
      String(
        value ?? ""
      ).trim() === ""
    );
  }


  function validateReactField(
    field,
    value
  ) {
    if (
      isReactFieldEmpty(
        field,
        value
      )
    ) {
      return t("{label} is required.", { label: t(field.label) });
    }


    // Admin Settings based age validation
    if (
      field.name ===
      "age"
    ) {
      const age =
        Number(value);

      const minimumAge =
        Number(
          siteSettings.minimumAge ||
          21
        );

      const maximumAge =
        Number(
          siteSettings.maximumAge ||
          99
        );


      if (
        !Number.isFinite(age)
      ) {
        return t("Please enter a valid age.");
      }


      if (
        age < minimumAge
      ) {
        return t("Minimum age is {min} years. Please enter age {min} or above.", {
          min: minimumAge,
        });
      }


      if (
        age > maximumAge
      ) {
        return t("Maximum age is {max} years. Please enter age {max} or below.", {
          max: maximumAge,
        });
      }
    }


    if (
      field.name ===
        "firstName" &&
      String(value)
        .trim()
        .length < 2
    ) {
      return t("First name must contain at least 2 characters.");
    }


    return "";
  }


  function validateCurrentStep() {

    if (
      siteSettings
        .maintenanceMode ===
      true
    ) {
      setFormAlert(
        t("Website is currently under maintenance. Please try again later.")
      );

      return false;
    }


    if (
      siteSettings
        .applicationManagement ===
      false
    ) {
      setFormAlert(
        t("Application submission is currently disabled.")
      );

      return false;
    }


    if (
      siteSettings
        .womenRegistrationOpen ===
      false
    ) {
      setFormAlert(
        t("Women registration is currently closed.")
      );

      return false;
    }


    const currentFields =
      formFields.filter(
        (field) =>
          field.step ===
          step
      );


    const nextErrors = {};


    currentFields.forEach(
      (field) => {
        const message =
          validateReactField(
            field,
            values[
              field.name
            ]
          );

        if (message) {
          nextErrors[
            field.name
          ] =
            message;
        }
      }
    );


    setFieldErrors(
      (previous) => {
        const next = {
          ...previous,
        };

        currentFields.forEach(
          (field) => {
            delete next[
              field.name
            ];
          }
        );

        return {
          ...next,
          ...nextErrors,
        };
      }
    );


    const errorNames =
      Object.keys(
        nextErrors
      );


    if (
      errorNames.length > 0
    ) {
      const firstErrorName =
        errorNames[0];

      setFormAlert(
        nextErrors[
          firstErrorName
        ]
      );


      requestAnimationFrame(
        () => {
          const field =
            formRef.current
              ?.querySelector(
                `[name="${firstErrorName}"]`
              );

          const box =
            field?.closest(
              ".form-field"
            );

          box?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center",
          });

          field?.focus?.();
        }
      );


      return false;
    }


    setFormAlert("");

    return true;
  }


  // =====================================================
  // UPDATE VALUE
  // =====================================================

  function update(
    name,
    value
  ) {

    setValues(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );


    // Field change hote hi us field ka old React error hatao
    setFieldErrors(
      (previous) => {
        if (
          !previous[name]
        ) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[name];

        return next;
      }
    );


    setFormAlert("");
  }


  // =====================================================
  // NEXT
  // =====================================================

  function next(event) {

    event?.preventDefault();

    event?.stopPropagation();


    if (
      !validateCurrentStep()
    ) {

      return;
    }


    setFormAlert("");


    setStep(
      (current) =>
        Math.min(
          formSteps.length,
          current + 1
        )
    );
  }


  // =====================================================
  // BACK
  // =====================================================

  function back() {

    setFormAlert("");
    setFieldErrors({});


    setStep(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }


  // =====================================================
  // STEP SIDEBAR
  // =====================================================

  function handleStepClick(
    targetStep
  ) {

    // Back allowed
    if (
      targetStep < step
    ) {

      setFormAlert("");
      setFieldErrors({});

      setStep(
        targetStep
      );

      return;
    }


    if (
      targetStep ===
      step
    ) {

      return;
    }


    // Direct Step 1 -> 3 nahi
    if (
      targetStep >
      step + 1
    ) {

      setFormAlert(
        t("Please complete the current step before continuing.")
      );

      return;
    }


    if (
      !validateCurrentStep()
    ) {

      return;
    }


    setFormAlert("");

    setStep(
      targetStep
    );
  }


  // =====================================================
  // ASK SUBMIT
  // =====================================================

  function askToSubmit(
    event
  ) {

    event?.preventDefault();

    event?.stopPropagation();


    if (
      !validateCurrentStep()
    ) {

      return;
    }


    setFormAlert("");

    setConfirmOpen(true);
  }


  // =====================================================
  // FINAL SUBMIT TO BACKEND
  // =====================================================

  async function confirmSubmit() {

    if (
      isSubmitting
    ) {

      return;
    }


    setIsSubmitting(true);


    try {

      const formData =
        new FormData();


      Object.entries(
        values
      ).forEach(
        ([key, value]) => {

          // =============================================
          // PHOTOS
          // =============================================

          if (
            key ===
            "photos"
          ) {

            if (
              Array.isArray(
                value
              )
            ) {

              value.forEach(
                (file) => {

                  if (
                    file instanceof
                    File
                  ) {

                    formData.append(
                      "photos",
                      file
                    );
                  }
                }
              );
            }


            return;
          }


          // =============================================
          // VOICE
          // =============================================

          if (
            key ===
            "voiceRecording"
          ) {

            if (
              value instanceof
              File
            ) {

              formData.append(
                "voiceRecording",
                value
              );
            }


            return;
          }


          // =============================================
          // VIDEO
          // =============================================

          if (
            key ===
            "videoRecording"
          ) {

            if (
              value instanceof
              File
            ) {

              formData.append(
                "videoRecording",
                value
              );
            }


            return;
          }


          if (key === "slug") {
            return;
          }


          // =============================================
          // NORMAL TEXT
          // =============================================

          formData.append(
            key,
            value ?? ""
          );
        }
      );

      formData.append(
        "slug",
        createFormSlug(values.firstName)
      );


      const response =
        await fetch(
          `${API_BASE}/api/applications`,

          {
            method:
              "POST",

            // Content-Type manually MAT lagana

            body:
              formData,
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.error ||
          data.message ||
          "Failed to submit application"
        );
      }


      console.log(
        "Application saved:",
        data
      );

      const id = data?.application?._id;
      const slug = data?.application?.slug;

      try {
        if (id) sessionStorage.setItem("ill-application-id", String(id));
        if (slug) sessionStorage.setItem("ill-application-slug", String(slug));
      } catch {
        /* ignore */
      }

      setConfirmOpen(false);

      if (onSubmitted) {

        onSubmitted(slug);

        setSubmitted(false);

        setFormAlert("");
        setFieldErrors({});

        setStep(1);

        setValues(
          createEmptyForm()
        );

        return;
      }

      setSubmitted(true);

    } catch (error) {

      console.error(
        "Application submission error:",
        error
      );


      setConfirmOpen(false);

      setFormAlert(
        error.message ||
        t("Something went wrong while submitting your application.")
      );

    } finally {

      setIsSubmitting(false);
    }
  }


  // =====================================================
  // GO HOME
  // =====================================================

  function goHome() {

    setSubmitted(false);

    setConfirmOpen(false);

    setFormAlert("");
    setFieldErrors({});

    setStep(1);

    setValues(
      createEmptyForm()
    );


    onGoHome?.();
  }


  // =====================================================
  // CLOSE
  // =====================================================

  function closeForm() {

    setStep(1);

    setValues(
      createEmptyForm()
    );

    setConfirmOpen(false);

    setSubmitted(false);

    setFormAlert("");
    setFieldErrors({});


    onClose?.();
  }


  // =====================================================
  // HIDE
  // =====================================================

  if (
    !open &&
    !submitted
  ) {

    return null;
  }


  // =====================================================
  // SUCCESS
  // =====================================================

  if (submitted) {

    return (

      <div
        className="popup-overlay"

        role="dialog"

        aria-modal="true"

        aria-labelledby="submit-popup-title"
      >

        <div className="popup popup--success">

          <div className="success-check">
            ✓
          </div>


          <h2 id="submit-popup-title">
            {t("Application submitted successfully!")}
          </h2>


          <p>
            {t("Thank you")}
            {values.firstName
              ? `, ${values.firstName}`
              : ""}
            . {t("Your profile has been received successfully.")}
          </p>


          <button
            type="button"

            className="btn btn--primary"

            onClick={
              goHome
            }
          >
            {t("Back to home")}
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // MAIN FORM
  // =====================================================

  return (

    <div
      className="register-overlay"

      role="dialog"

      aria-modal="true"

      aria-labelledby="register-title"
    >

      <div className="register-dash">


        {/* =================================================
            LEFT
        ================================================= */}

        <aside className="register-dash__side">

          <Logo />


          <p className="register-dash__kicker">
            {t("Membership application")}
          </p>


          <ol className="step-rail">

            {formSteps.map(
              (item) => (

                <li
                  key={
                    item.id
                  }

                  className={
                    step ===
                    item.id

                      ? "is-current"

                      : step >
                        item.id

                        ? "is-done"

                        : ""
                  }
                >

                  <button
                    type="button"

                    onClick={() =>
                      handleStepClick(
                        item.id
                      )
                    }
                  >

                    <span className="step-rail__num">
                      {item.id}
                    </span>


                    <span>

                      <strong>
                        {t(item.title)}
                      </strong>


                      <em>
                        {t(item.subtitle)}
                      </em>

                    </span>

                  </button>

                </li>
              )
            )}

          </ol>

        </aside>


        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="register-dash__main">

          <header className="register-dash__top">

            <div>

              <p className="eyebrow">
                {t("Step")} {step} {t("of")}{" "}
                {formSteps.length}
              </p>


              <h2 id="register-title">
                {t(formSteps[step - 1].title)}
              </h2>

            </div>

            <div className="register-dash__top-actions">
              <LanguageButtons />

            <button
              type="button"

              className="icon-close"

              onClick={
                closeForm
              }

              aria-label={t("Close registration")}
            >
              ×
            </button>
            </div>

          </header>


          {/* PROGRESS */}

          <div
            className="progress"

            aria-hidden="true"
          >

            <span
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>


          {/* FORM */}

          <form
            ref={formRef}

            className="register-form"

            noValidate

            onSubmit={
              (event) => {

                event.preventDefault();


                if (
                  step ===
                  formSteps.length
                ) {

                  askToSubmit(
                    event
                  );

                } else {

                  next(
                    event
                  );
                }
              }
            }
          >

            <div className="register-form__scroll">


              {/* ALERT */}

              {formAlert ? (

                <div
                  className="register-form__alert"

                  role="alert"
                >

                  <span className="register-form__alert-icon">
                    !
                  </span>


                  <span>
                    {formAlert}
                  </span>

                </div>

              ) : null}


              <p className="register-form__lead">

                {t(formSteps[step - 1].description)}

              </p>


              <FormFields
                step={
                  step
                }

                values={
                  values
                }

                onChange={
                  update
                }

                errors={
                  fieldErrors
                }

                minimumAge={
                  siteSettings.minimumAge
                }

                maximumAge={
                  siteSettings.maximumAge
                }
              />

            </div>


            {/* ACTIONS */}

            <div className="register-actions">

              <button
                type="button"

                className="btn btn--ghost"

                onClick={
                  back
                }

                disabled={
                  step === 1
                }
              >
                {t("Back")}
              </button>


              {step <
              formSteps.length ? (

                <button
                  type="button"

                  className="btn btn--primary"

                  onClick={
                    next
                  }
                >
                  {t("Continue")}
                </button>

              ) : (

                <button
                  type="button"

                  className="btn btn--gold"

                  onClick={
                    askToSubmit
                  }
                >
                  {t("Submit")}
                </button>

              )}

            </div>

          </form>

        </div>

      </div>


      {/* =================================================
          CONFIRM POPUP
      ================================================= */}

      {confirmOpen ? (

        <div
          className="popup-overlay"

          role="dialog"

          aria-modal="true"

          aria-labelledby="confirm-popup-title"
        >

          <div className="popup">

            <h2 id="confirm-popup-title">
              {t("Submit application?")}
            </h2>


            <p>
              {t("All required information has been filled. Please confirm that you want to submit your application.")}
            </p>


            <div className="popup-actions">

              <button
                type="button"

                className="btn btn--ghost"

                disabled={
                  isSubmitting
                }

                onClick={() =>
                  setConfirmOpen(
                    false
                  )
                }
              >
                {t("Cancel")}
              </button>


              <button
                type="button"

                className="btn btn--gold"

                disabled={
                  isSubmitting
                }

                onClick={
                  confirmSubmit
                }
              >

                {isSubmitting
                  ? t("Submitting...")
                  : t("Yes, Submit")}

              </button>

            </div>

          </div>

        </div>

      ) : null}

    </div>
  );
}