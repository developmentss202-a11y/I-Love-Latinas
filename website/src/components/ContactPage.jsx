



import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  fetchApprovedProfiles,
} from "./ProfileCard";

import { useLanguage } from "../language";
import {
  manProfilePath,
  storeManSlug,
} from "../profileLink";


const LIVE_API =
  "https://node.latina.myaibusiness.online";

const API_BASE = (() => {
  const fromEnv =
    String(
      import.meta.env.VITE_API_URL ||
      ""
    ).trim();

  if (
    !fromEnv ||
    /localhost/i.test(
      fromEnv
    )
  ) {
    return LIVE_API;
  }

  return fromEnv.replace(
    /\/$/,
    ""
  );
})();


const LOOKING_FOR_OPTIONS = [
  { value: "dating", label: "Serious dating" },
  { value: "long-term", label: "Long-term relationship" },
  { value: "marriage", label: "Marriage-minded" },
  { value: "life-partner", label: "Life partner" },
];

const LONG_TERM_MEMBER_COUNT = 3;

const PROCESS_STEPS = [
  "Submit your introduction request with who you want to meet.",
  "Our team reaches out based on your selections.",
  "Meetings are arranged at our hotel for people seeking a real relationship.",
];

function lookingForLabel(value) {
  return (
    LOOKING_FOR_OPTIONS.find((option) => option.value === value)?.label || ""
  );
}

function formatNameList(names) {
  const list = names.filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

function buildMenSubject(lookingFor, names, translate) {
  const nameList = formatNameList(names);
  if (!nameList) return "";

  const preference = lookingForLabel(lookingFor);
  if (preference) {
    return `${translate(preference)} with ${nameList}`;
  }

  return `${translate("Introduction")} with ${nameList}`;
}


/* =========================================
   REACT VALIDATION STYLES
   Native browser popup is disabled with
   noValidate on the form.
========================================= */

const INVALID_FIELD_STYLE = {
  borderColor: "#ff5d72",
  boxShadow: "0 0 0 2px rgba(255, 93, 114, 0.16)",
};

const FIELD_ERROR_STYLE = {
  display: "block",
  marginTop: "6px",
  color: "#ff8b9a",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.35,
};


/* =========================================
   MEMBER NAME
========================================= */

function memberLabel(item) {
  if (!item) {
    return "";
  }

  if (
    typeof item === "string"
  ) {
    return item.trim();
  }

  const combined = [
    item.firstName,
    item.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    combined ||
    String(
      item.name ||
      item.fullName ||
      ""
    ).trim()
  );
}


/* =========================================
   LOAD WOMEN / MEMBER NAMES
   Approved profiles from live API only.
========================================= */

function withLockedName(
  list,
  lockedName
) {
  if (
    lockedName &&
    !list.includes(
      lockedName
    )
  ) {
    return [
      lockedName,
      ...list,
    ];
  }

  return list;
}


async function fetchMemberNames() {
  const profiles =
    await fetchApprovedProfiles();

  return [
    ...new Set(
      profiles
        .map(memberLabel)
        .filter(Boolean)
    ),
  ];
}


/* =========================================
   CONTACT PAGE - MEN FORM
========================================= */

export default function ContactPage() {
  const { t } = useLanguage();

  const [
    params,
  ] =
    useSearchParams();

  const navigate =
    useNavigate();


  const lockedName =
    params
      .get("member")
      ?.trim() ||
    "";


  const [
    names,
    setNames,
  ] =
    useState(
      () =>
        withLockedName(
          [],
          lockedName
        )
    );


  const [
    selectedName,
    setSelectedName,
  ] =
    useState(
      lockedName
    );


  const [
    lookingFor,
    setLookingFor,
  ] =
    useState("");


  const [
    selectedNames,
    setSelectedNames,
  ] =
    useState(
      () =>
        lockedName
          ? [lockedName]
          : []
    );


  const isLongTerm =
    lookingFor === "long-term";


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  /*
    React field validation errors.
    Isse browser ka default
    "Please fill out this field" popup nahi aayega.
  */
  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState({});


  /*
    Current page par submit hui Men application ko
    state me track karte hain.

    Submit ke baad pending / approved / rejected
    status nahi dikhate. Sirf confirmation
    card dikhta hai. User dobara Contact page
    kholega to naya form milega.
  */
  const [
    applicationId,
    setApplicationId,
  ] =
    useState("");


  /* =========================================
     URL MEMBER CHANGE
  ========================================= */

  useEffect(() => {
    setSelectedName(
      lockedName
    );

    setSelectedNames(
      lockedName
        ? [lockedName]
        : []
    );

    setError("");
    setFieldErrors({});
  }, [lockedName]);


  function syncSelectedNames(
    nextNames
  ) {
    const unique = [
      ...new Set(
        nextNames.filter(Boolean)
      ),
    ];

    setSelectedNames(unique);
    setSelectedName(unique[0] || "");
  }


  function handleLookingForChange(
    value
  ) {
    setLookingFor(value);
    clearFieldError("lookingFor");

    if (value === "long-term") {
      syncSelectedNames(
        lockedName
          ? [lockedName]
          : selectedNames.slice(0, LONG_TERM_MEMBER_COUNT)
      );
      return;
    }

    const keep =
      lockedName ||
      selectedNames[0] ||
      selectedName ||
      "";

    syncSelectedNames(
      keep ? [keep] : []
    );
  }


  function toggleMemberName(
    name
  ) {
    if (
      lockedName &&
      name === lockedName
    ) {
      return;
    }

    const exists =
      selectedNames.includes(name);

    if (exists) {
      syncSelectedNames(
        selectedNames.filter(
          (item) => item !== name
        )
      );
      clearFieldError("member");
      return;
    }

    if (
      selectedNames.length >=
      LONG_TERM_MEMBER_COUNT
    ) {
      return;
    }

    syncSelectedNames([
      ...selectedNames,
      name,
    ]);
    clearFieldError("member");
  }


  /* =========================================
     LOAD PROFILE NAMES (approved only, live API)
  ========================================= */

  useEffect(() => {
    let active =
      true;

    fetchMemberNames()
      .then(
        (list) => {
          if (!active) {
            return;
          }

          setNames(
            withLockedName(
              list,
              lockedName
            )
          );
        }
      );

    return () => {
      active =
        false;
    };
  }, [lockedName]);


  /* =========================================
     REACT FORM VALIDATION
  ========================================= */

  function clearFieldError(
    fieldName
  ) {
    setFieldErrors(
      (previous) => {
        if (
          !previous[fieldName]
        ) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[fieldName];

        return next;
      }
    );

    /*
      Agar summary sirf validation ki thi,
      typing start karte hi usse hata do.
      Backend error next submit par phir aa sakta hai.
    */
    if (
      error ===
      "Please correct the highlighted fields."
    ) {
      setError("");
    }
  }


  function handleFormChange(
    event
  ) {
    const fieldName =
      event.target.name;

    if (!fieldName) {
      return;
    }

    const errorKey =
      fieldName === "member"
        ? "member"
        : fieldName;

    clearFieldError(
      errorKey
    );
  }


  function validateMenForm(
    form
  ) {
    const name =
      form.elements
        .name.value
        .trim();

    const email =
      form.elements
        .email.value
        .trim();

    const mobile =
      form.elements
        .mobile.value
        .trim();

    const meetingDate =
      form.elements
        .datetime.value;

    const nightType =
      form.elements
        .travel.value;

    const subject =
      form.elements
        .subject.value
        .trim();

    const message =
      form.elements
        .message.value
        .trim();


    const nextErrors = {};


    /* LOOKING FOR */

    if (!lookingFor) {
      nextErrors.lookingFor =
        "Please select what you are looking for.";
    }


    /* SHE IS */

    if (isLongTerm) {
      if (
        selectedNames.length !==
        LONG_TERM_MEMBER_COUNT
      ) {
        nextErrors.member =
          `Please select exactly ${LONG_TERM_MEMBER_COUNT} profiles for long-term relationship.`;
      }
    } else if (!selectedName) {
      nextErrors.member =
        "Please select a profile.";
    }


    /* NAME */

    if (!name) {
      nextErrors.name =
        "Please enter your name.";
    } else if (
      name.length < 2
    ) {
      nextErrors.name =
        "Name must contain at least 2 characters.";
    }


    /* EMAIL */

    if (!email) {
      nextErrors.email =
        "Please enter your email address.";
    } else {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          email
        )
      ) {
        nextErrors.email =
          "Please enter a valid email address.";
      }
    }


    /* MOBILE */

    if (!mobile) {
      nextErrors.mobile =
        "Please enter your mobile number.";
    } else {
      const digits =
        mobile.replace(
          /\D/g,
          ""
        );

      if (
        digits.length < 7 ||
        digits.length > 15
      ) {
        nextErrors.mobile =
          "Please enter a valid mobile number.";
      }
    }


    /* DATE / TIME */

    if (!meetingDate) {
      nextErrors.datetime =
        "Please select a date and time.";
    }


    /* NIGHT TYPE */

    if (!nightType) {
      nextErrors.travel =
        "Please select the night type.";
    }


    /* MESSAGE */

    if (!message) {
      nextErrors.message =
        "Please tell us what you want.";
    } else if (
      message.length < 5
    ) {
      nextErrors.message =
        "Please enter at least 5 characters.";
    }


    setFieldErrors(
      nextErrors
    );


    if (
      Object.keys(
        nextErrors
      ).length > 0
    ) {
      setError(
        "Please correct the highlighted fields."
      );

      /*
        First invalid field ko focus karo.
        Browser validation popup use nahi hota.
      */
      const order = [
        "lookingFor",
        "member",
        "name",
        "email",
        "mobile",
        "datetime",
        "travel",
        "message",
      ];

      const firstError =
        order.find(
          (key) =>
            nextErrors[key]
        );

      if (firstError) {
        const targetName =
          firstError;

        const target =
          form.elements[
            targetName
          ];

        if (
          target &&
          typeof target.focus ===
            "function"
        ) {
          target.focus();
        }
      }

      return null;
    }


    return {
      memberName:
        isLongTerm
          ? selectedNames.join(", ")
          : selectedName,

      memberNames:
        isLongTerm
          ? selectedNames
          : selectedName
            ? [selectedName]
            : [],

      name,

      email,

      mobile,

      meetingDate,

      nightType,

      lookingFor,

      subject,

      message,
    };
  }


  /* =========================================
     SUBMIT MEN APPLICATION
  ========================================= */

  async function submit(
    event
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    /*
      Pehle React validation chalegi.
      Invalid hone par API call nahi hogi.
    */
    const payload =
      validateMenForm(
        form
      );

    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");


      const response =
        await fetch(
          `${API_BASE}/api/men-applications`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (!response.ok) {
        throw new Error(
          data.message ||
          "Application could not be submitted"
        );
      }


      if (!data.applicationId) {
        throw new Error(
          "Application was saved but confirmation was not returned"
        );
      }


      const nextSlug =
        data.slug ||
        data.application?.slug ||
        "";

      if (nextSlug) {
        storeManSlug(nextSlug);
        navigate(
          `${manProfilePath(nextSlug)}?submitted=1`
        );
        return;
      }

      setApplicationId(
        String(
          data.applicationId
        )
      );

      setFieldErrors({});
      setError("");

    } catch (submitError) {
      console.error(
        "MEN APPLICATION ERROR:",
        submitError
      );

      setError(
        submitError.message ||
        "Something went wrong"
      );

    } finally {
      setSubmitting(false);
    }
  }



  /* =========================================
     NEW REQUEST
  ========================================= */

  function startNewRequest() {
    /*
      Sirf browser/page tracking reset hogi.
      Backend/MongoDB ki purani application delete
      ya change nahi hogi.
    */
    setApplicationId("");
    setError("");
    setFieldErrors({});
    setLookingFor("");

    setSelectedName(
      lockedName
    );

    setSelectedNames(
      lockedName
        ? [lockedName]
        : []
    );
  }


  const hasSubmittedApplication =
    Boolean(
      applicationId
    );


  /* =========================================
     UI
  ========================================= */

  return (
    <section className="page page--adult">

      <div className="contact-hero contact-hero--adult">

        <img
          className="contact-hero__image"
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b5?auto=format&fit=crop&w=1600&q=80"
          alt=""
        />


        <div className="contact-hero__overlay" />


        <div className="contact-hero__inner">


          {/* LEFT CONTENT */}

          <div className="contact-hero__copy">

            <div className="contact-hero__top">
              <p className="gender-kicker">
                Private introduction
              </p>

              <button
                type="button"
                className="page-back"
                onClick={() => navigate("/profiles")}
              >
                ← {t("Back")}
              </button>
            </div>


            <h1>
              {t("Make a meaningful introduction")}
            </h1>


            <p className="page__lead">
              {t("Choose someone who interests you, and we’ll help create a comfortable, private introduction.")}
            </p>

            <div className="men-process">
              <h2>{t("How it works")}</h2>
              <ol className="men-process__steps">
                {PROCESS_STEPS.map((step) => (
                  <li key={step}>
                    <span>{t(step)}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>


          {/* =====================================
              APPLICATION SUBMITTED
          ===================================== */}

          {
            hasSubmittedApplication
              ? (

              <div className="men-request-status-card submitted">

                <div className="men-status-icon submitted">
                  ✓
                </div>

                <h2>
                  Application Submitted
                </h2>

                <p className="men-status-text">
                  Your application has been submitted successfully.
                  You can now Submit New Request or Explore More Options
                </p>

                <div className="men-status-actions">
                  <button
                    type="button"
                    className="btn btn--primary men-new-request-btn"
                    onClick={
                      startNewRequest
                    }
                  >
                    Submit New Request
                  </button>

                  <button
                    type="button"
                    className="btn men-explore-btn"
                    onClick={
                      () =>
                        navigate(
                          "/profiles"
                        )
                    }
                  >
                    Explore More Options
                  </button>
                </div>

              </div>

            ) : (

              /* =====================================
                 MEN FORM
              ===================================== */

              <form
                className="contact-form contact-form--adult"

                /*
                  IMPORTANT:
                  noValidate browser ki native HTML validation
                  ("Please fill out this field") ko band karta hai.
                  Validation React state se hoti hai.
                */
                noValidate

                onSubmit={
                  submit
                }

                onChange={
                  handleFormChange
                }
              >


                {
                  error && (

                    <div className="men-form-error">
                      {error}
                    </div>

                  )
                }


                {/* WHAT YOU ARE LOOKING FOR */}

                <label>
                  {t("What you are looking for")}

                  <select
                    name="lookingFor"
                    value={lookingFor}
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.lookingFor)}
                    style={
                      fieldErrors.lookingFor
                        ? INVALID_FIELD_STYLE
                        : undefined
                    }
                    onChange={(event) => {
                      handleLookingForChange(event.target.value);
                    }}
                  >
                    <option value="" disabled>
                      {t("Select")}
                    </option>
                    {LOOKING_FOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.lookingFor ? (
                    <span style={FIELD_ERROR_STYLE}>
                      {fieldErrors.lookingFor}
                    </span>
                  ) : null}
                </label>


                {/* SHE IS */}

                <label className={isLongTerm ? "men-member-field" : undefined}>
                  {t("She is")}
                  {isLongTerm ? (
                    <span className="men-member-hint">
                      {t("Select exactly 3 profiles for long-term relationship.")}
                      {" "}
                      ({selectedNames.length}/{LONG_TERM_MEMBER_COUNT})
                    </span>
                  ) : null}

                  {isLongTerm ? (
                    <div
                      className="men-member-multi"
                      role="group"
                      aria-label={t("She is")}
                      style={
                        fieldErrors.member
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                    >
                      {names.map((name) => {
                        const checked = selectedNames.includes(name);
                        const locked = Boolean(lockedName) && name === lockedName;
                        const disableExtra =
                          !checked &&
                          selectedNames.length >= LONG_TERM_MEMBER_COUNT;

                        return (
                          <label key={name} className="men-member-option">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={locked || disableExtra}
                              onChange={() => toggleMemberName(name)}
                            />
                            <span>{name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <select
                      name="member"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.member)}
                      style={
                        fieldErrors.member
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                      disabled={Boolean(lockedName)}
                      value={selectedName}
                      onChange={(event) => {
                        syncSelectedNames(
                          event.target.value
                            ? [event.target.value]
                            : []
                        );
                        clearFieldError("member");
                      }}
                    >
                      <option value="" disabled>
                        {t("Select a profile")}
                      </option>
                      {names.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}

                  {fieldErrors.member ? (
                    <span style={FIELD_ERROR_STYLE}>
                      {fieldErrors.member}
                    </span>
                  ) : null}

                  {!isLongTerm && lockedName ? (
                    <input
                      type="hidden"
                      name="member"
                      value={lockedName}
                    />
                  ) : null}
                </label>


                {/* YOUR NAME */}

                <label>
                  Your name

                  <input
                    type="text"
                    name="name"
                    placeholder="First and last name"

                    aria-required="true"

                    aria-invalid={
                      Boolean(
                        fieldErrors.name
                      )
                    }

                    style={
                      fieldErrors.name
                        ? INVALID_FIELD_STYLE
                        : undefined
                    }
                  />

                  {
                    fieldErrors.name && (

                      <span
                        style={
                          FIELD_ERROR_STYLE
                        }
                      >
                        {
                          fieldErrors.name
                        }
                      </span>

                    )
                  }

                </label>


                {/* EMAIL + MOBILE */}

                <div className="field-row">

                  <label>
                    Your email

                    <input
                      type="email"
                      name="email"
                      placeholder="you@email.com"

                      aria-required="true"

                      aria-invalid={
                        Boolean(
                          fieldErrors.email
                        )
                      }

                      style={
                        fieldErrors.email
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                    />

                    {
                      fieldErrors.email && (

                        <span
                          style={
                            FIELD_ERROR_STYLE
                          }
                        >
                          {
                            fieldErrors.email
                          }
                        </span>

                      )
                    }

                  </label>


                  <label>
                    Mobile number

                    <input
                      type="tel"
                      name="mobile"
                      placeholder="+1 9999999999"

                      aria-required="true"

                      aria-invalid={
                        Boolean(
                          fieldErrors.mobile
                        )
                      }

                      style={
                        fieldErrors.mobile
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                    />

                    {
                      fieldErrors.mobile && (

                        <span
                          style={
                            FIELD_ERROR_STYLE
                          }
                        >
                          {
                            fieldErrors.mobile
                          }
                        </span>

                      )
                    }

                  </label>

                </div>


                {/* DATE + NIGHT */}

                <div className="field-row">

                  <label>
                    When

                    <input
                      type="datetime-local"
                      name="datetime"

                      aria-required="true"

                      aria-invalid={
                        Boolean(
                          fieldErrors.datetime
                        )
                      }

                      style={
                        fieldErrors.datetime
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                    />

                    {
                      fieldErrors.datetime && (

                        <span
                          style={
                            FIELD_ERROR_STYLE
                          }
                        >
                          {
                            fieldErrors.datetime
                          }
                        </span>

                      )
                    }

                  </label>


                  <label>
                    Meeting Preference

                    <select
                      name="travel"
                      defaultValue=""

                      aria-required="true"

                      aria-invalid={
                        Boolean(
                          fieldErrors.travel
                        )
                      }

                      style={
                        fieldErrors.travel
                          ? INVALID_FIELD_STYLE
                          : undefined
                      }
                    >

                      <option
                        value=""
                        disabled
                      >
                        Select
                      </option>

                      <option value="dinner">
                        Late dinner
                      </option>

                      <option value="hotel">
                        Hotel / private suite
                      </option>

                      <option value="weekend">
                        Weekend away
                      </option>

                      <option value="open">
                        Open to her suggestion
                      </option>

                    </select>

                    {
                      fieldErrors.travel && (

                        <span
                          style={
                            FIELD_ERROR_STYLE
                          }
                        >
                          {
                            fieldErrors.travel
                          }
                        </span>

                      )
                    }

                  </label>

                </div>


                {/* SUBJECT */}

                <label>
                  Subject

                  <input
                    type="text"
                    name="subject"
                    readOnly

                    value={
                      buildMenSubject(
                        lookingFor,
                        selectedNames,
                        t
                      )
                    }

                    placeholder={t("What are you hoping for?")}
                  />
                </label>


                {/* MESSAGE */}

                <label>
                  What you want

                  <textarea
                    name="message"
                    rows={4}

                    placeholder={t("Tell us what kind of connection you want...")}

                    aria-required="true"

                    aria-invalid={
                      Boolean(
                        fieldErrors.message
                      )
                    }

                    style={
                      fieldErrors.message
                        ? INVALID_FIELD_STYLE
                        : undefined
                    }

                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  />

                  {
                    fieldErrors.message && (

                      <span
                        style={
                          FIELD_ERROR_STYLE
                        }
                      >
                        {
                          fieldErrors.message
                        }
                      </span>

                    )
                  }

                </label>


                <button
                  type="submit"

                  className="btn btn--primary"

                  disabled={
                    submitting
                  }

                  style={{
                    width:
                      "100%",
                  }}
                >

                  {
                    submitting
                      ? "Submitting..."
                      : "Contact Me"
                  }

                </button>

              </form>

            )
          }

        </div>

      </div>

    </section>
  );
}
