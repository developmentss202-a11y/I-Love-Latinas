




import FormField from "./FormField";
import { useLanguage } from "../language";


// =====================================================
// COMMON OPTIONS
// =====================================================

const yesNo = [
  {
    value: "yes",
    label: "Yes",
  },
  {
    value: "no",
    label: "No",
  },
];


const frequency = [
  {
    value: "never",
    label: "Never",
  },
  {
    value: "rarely",
    label: "Rarely",
  },
  {
    value: "socially",
    label: "Socially",
  },
  {
    value: "regularly",
    label: "Regularly",
  },
  {
    value: "daily",
    label: "Daily",
  },
];


const countries = [
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Canada",
  "Australia",
  "India",
  "Japan",
  "Singapore",
  "UAE",
  "Brazil",
  "Mexico",
  "South Africa",
  "Nigeria",
  "Sweden",
  "Netherlands",
  "Switzerland",
  "Other",
].map((country) => ({
  value: country,
  label: country,
}));


// =====================================================
// STEPS
// =====================================================

export const formSteps = [
  {
    id: 1,
    title: "Identity",
    subtitle: "Who you are",
    description: "Ten fields about you.",
  },

  {
    id: 2,
    title: "Lifestyle",
    subtitle: "How you live",
    description: "Work, family, and travel.",
  },

  {
    id: 3,
    title: "Heart",
    subtitle: "What you seek",
    description: "Match and habits.",
  },
];


// =====================================================
// FORM FIELDS
// =====================================================

const formFields = [

  // ===================================================
  // STEP 1
  // ===================================================

  {
    step: 1,
    name: "firstName",
    label: "First name",
    type: "text",
    placeholder: "Enter first name",
  },

  {
    step: 1,
    name: "age",
    label: "Age",
    type: "number",

    /*
      IMPORTANT:
      min/max yahan hard-code nahi hain.
      Ye FormFields component me Admin Settings
      ke according dynamically lagengi.
    */

    placeholder: "Enter age",
  },

  {
    step: 1,
    name: "gender",
    label: "Gender",
    type: "select",
    placeholder: "Select Gender",

    options: [
      {
        value: "Woman",
        label: "Woman",
      },
    ],
  },

  {
    step: 1,
    name: "photos",
    label: "Photo",
    type: "file",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 3,
    hint:
      "1 photo only • Maximum 3 MB",
  },

  {
    step: 1,
    name: "athleticType",
    label: "Athletic type",
    type: "select",
    placeholder:
      "Select Athletic type",

    options: [
      "Not athletic",
      "Casual",
      "Active",
      "Competitive",
      "Professional athlete",
    ].map((value) => ({
      value,
      label: value,
    })),
  },

  {
    step: 1,
    name: "personalityType",
    label: "Personality type",
    type: "text",
    placeholder:
      "Enter personality type",
  },

  {
    step: 1,
    name: "voiceRecording",
    label: "Voice recording",
    type: "file",
    accept: "audio/*",
    maxSizeMB: 5,
    hint: "Maximum 5 MB",
  },

  {
    step: 1,
    name: "videoRecording",
    label: "Video recording",
    type: "file",
    accept: "video/*",
    maxSizeMB: 10,
    hint:
      "Personal / professional • Maximum 10 MB",
  },

  {
    step: 1,
    name: "countryOfBirth",
    label: "Country of birth",
    type: "select",
    placeholder:
      "Select Country of birth",
    options: countries,
  },

  {
    step: 1,
    name: "countryOfResidence",
    label:
      "Country of residence",
    type: "select",
    placeholder:
      "Select Country of residence",
    options: countries,
  },


  // ===================================================
  // STEP 2
  // ===================================================

  {
    step: 2,
    name: "businessOwner",
    label: "Business owner",
    type: "select",
    options: yesNo,
  },

  {
    step: 2,
    name: "employed",
    label: "Employed",
    type: "select",
    options: yesNo,
  },

  {
    step: 2,
    name: "profession",
    label: "Profession",
    type: "text",
  },

  {
    step: 2,
    name: "jobExperience",
    label: "Job experience",
    type: "select",

    options: [
      "0–2 years",
      "3–5 years",
      "6–10 years",
      "11–15 years",
      "16+ years",
    ].map((value) => ({
      value,
      label: value,
    })),
  },

  {
    step: 2,
    name: "specificSkills",
    label: "Specific skills",
    type: "text",
  },

  {
    step: 2,
    name: "languagesSpoken",
    label: "Languages spoken",
    type: "text",
  },

  {
    step: 2,
    name: "countriesVisited",
    label: "Countries visited",
    type: "text",
  },

  {
    step: 2,
    name: "desireToRelocate",
    label:
      "Desire to relocate / travel",
    type: "select",

    options: [
      {
        value: "open",
        label:
          "Open to relocating",
      },
      {
        value: "travel",
        label:
          "Love to travel, stay based here",
      },
      {
        value: "rooted",
        label:
          "Prefer to stay local",
      },
    ],
  },

  {
    step: 2,
    name: "willingToMeetAtClientHotels",
    label: "Are you willing to meet or work at the client's hotels?",
    type: "select",
    options: yesNo,
  },

  {
    step: 2,
    name: "children",
    label: "Children",
    type: "select",

    options: [
      {
        value: "none",
        label: "No children",
      },
      {
        value: "have",
        label: "Have children",
      },
    ],
  },

  {
    step: 2,
    name: "wantChildren",
    label: "Want children",
    type: "select",

    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "open",
        label: "Open to it",
      },
    ],
  },


  // ===================================================
  // STEP 3
  // ===================================================

  {
    step: 3,
    name: "relationshipStatus",
    label:
      "Relationship status",
    type: "select",

    options: [
      "Single",
      "Divorced",
      "Widowed",
      "Separated",
    ].map((value) => ({
      value,
      label: value,
    })),
  },

  {
    step: 3,
    name: "relationshipDesired",
    label:
      "Relationship desired",
    type: "select",

    options: [
      {
        value: "dating",
        label:
          "Serious dating",
      },
      {
        value: "long-term",
        label:
          "Long-term relationship",
      },
      {
        value: "marriage",
        label:
          "Marriage-minded",
      },
      {
        value: "life-partner",
        label:
          "Life partner",
      },
    ],
  },

  {
    step: 3,
    name: "visionStatement",
    label: "Vision statement",
    type: "textarea",
  },

  {
    step: 3,
    name: "hobbies",
    label: "Hobbies",
    type: "text",
  },

  {
    step: 3,
    name:
      "characteristicsDesired",
    label:
      "Characteristics desired",
    type: "text",
  },

  {
    step: 3,
    name: "legalProblems",
    label: "Legal problems",
    type: "select",

    options: [
      {
        value: "none",
        label: "None",
      },
      {
        value: "past",
        label:
          "Resolved in the past",
      },
      {
        value: "prefer-not",
        label:
          "Prefer not to say",
      },
    ],
  },

  {
    step: 3,
    name: "drink",
    label: "Drink",
    type: "select",
    options: frequency,
  },

  {
    step: 3,
    name:
      "cigaretteSmoker",
    label:
      "Cigarette smoker",
    type: "select",
    options: frequency,
  },

  {
    step: 3,
    name: "marijuana",
    label: "Marijuana",
    type: "select",
    options: frequency,
  },

  {
    step: 3,
    name: "drugsOther",
    label: "Drugs — other",
    type: "select",

    options: [
      {
        value: "never",
        label: "Never",
      },
      {
        value: "past",
        label:
          "In the past",
      },
      {
        value: "occasionally",
        label:
          "Occasionally",
      },
      {
        value: "prefer-not",
        label:
          "Prefer not to say",
      },
    ],
  },
];


export {
  formFields,
};


// =====================================================
// EMPTY FORM
// =====================================================

export function createEmptyForm() {
  return Object.fromEntries(
    formFields.map(
      (field) => [
        field.name,

        field.name ===
        "photos"
          ? []
          : "",
      ]
    )
  );
}


// =====================================================
// COMPONENT
// =====================================================

export default function FormFields({
  step,
  values,
  onChange,

  /*
    Admin Settings se ye values
    RegisterModal bhejega.
  */
  minimumAge = 21,
  maximumAge = 99,
}) {
  const { t } = useLanguage();

  const minAge =
    Number(
      minimumAge
    ) || 21;


  const maxAge =
    Number(
      maximumAge
    ) || 99;


  const fields =
    formFields.filter(
      (field) =>
        field.step ===
        step
    );


  return (
    <div className="register-grid">

      {fields.map(
        (field) => {

          /*
            AGE FIELD ko dynamic
            Admin Settings min/max denge.
          */

          const translated = {
            ...field,
            label: t(field.label),
            placeholder: field.placeholder ? t(field.placeholder) : field.placeholder,
            hint: field.hint ? t(field.hint) : field.hint,
            options: field.options
              ? field.options.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))
              : field.options,
          };

          const finalField =
            field.name ===
            "age"
              ? {
                  ...translated,

                  min:
                    minAge,

                  max:
                    maxAge,

                  required:
                    true,

                  hint:
                    t("Age must be between {min} and {max} years", {
                      min: minAge,
                      max: maxAge,
                    }),
                }
              : {
                  ...translated,

                  required:
                    true,
                };


          return (
            <FormField
              key={
                field.name
              }

              field={
                finalField
              }

              value={
                values[
                  field.name
                ] ??
                (
                  field.name ===
                  "photos"
                    ? []
                    : ""
                )
              }

              onChange={
                onChange
              }
            />
          );
        }
      )}

    </div>
  );
}