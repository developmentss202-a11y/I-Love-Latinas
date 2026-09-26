export const PROFILES = [
  { name: "Elena Moreau", age: 29, city: "Paris, France", role: "Art Curator", bio: "Gallery nights, slow mornings, and conversations that last until sunrise.", tag: "Long-term relationship" },
  { name: "Camila Rios", age: 31, city: "Madrid, Spain", role: "Architect", bio: "Building spaces by day, chasing sunsets on weekends. Looking for a steady, curious partner.", tag: "Marriage" },
  { name: "Sofia Delgado", age: 27, city: "Bogotá, Colombia", role: "Yoga Instructor", bio: "Believer in slow mornings, honest conversation, and dancing badly in the kitchen.", tag: "Companionship" },
  { name: "Isabela Cruz", age: 33, city: "Lisbon, Portugal", role: "Novelist", bio: "Currently writing my second book and looking for someone to read the first draft.", tag: "Long-term relationship" },
  { name: "Valentina Ortiz", age: 28, city: "Miami, USA", role: "Physician", bio: "Long shifts, longer walks after. Looking for someone grounded and a little funny.", tag: "Marriage" },
  { name: "Renata Silva", age: 30, city: "São Paulo, Brazil", role: "Photographer", bio: "I see the world in frames. Hoping to find someone who notices the little things too.", tag: "Long-term relationship" },
  { name: "Daniela Vargas", age: 26, city: "Buenos Aires, Argentina", role: "Chef", bio: "I cook the way I love — generously. Looking for someone who shows up hungry.", tag: "Companionship" },
  { name: "Mariana Torres", age: 32, city: "Mexico City, Mexico", role: "Interior Designer", bio: "I make rooms feel like home. Hoping to build one with someone who feels like it too.", tag: "Marriage" },
  { name: "Ximena Castillo", age: 29, city: "Barcelona, Spain", role: "Marketing Director", bio: "Spreadsheets by day, tapas and long walks by night. Looking for someone easy to talk to.", tag: "Long-term relationship" },
  { name: "Lucía Fernández", age: 25, city: "Lima, Peru", role: "Pediatrician", bio: "I spend my days caring for others — hoping to find someone who cares the same way back.", tag: "Marriage" },
  { name: "Adriana Reyes", age: 34, city: "Santiago, Chile", role: "Ballet Instructor", bio: "Discipline on stage, softness off it. Looking for a partner who values both.", tag: "Companionship" },
  { name: "Paula Navarro", age: 30, city: "Cartagena, Colombia", role: "Documentary Filmmaker", bio: "I chase real stories for a living. Hoping to find a real one of my own.", tag: "Long-term relationship" },
  { name: "Gabriela Santos", age: 28, city: "Quito, Ecuador", role: "Landscape Architect", bio: "I design gardens that outlive trends. Looking for something built to last too.", tag: "Marriage" },
  { name: "Carolina Méndez", age: 31, city: "Montevideo, Uruguay", role: "Jazz Vocalist", bio: "I sing about love for a living — ready to actually live it for a change.", tag: "Long-term relationship" },
  { name: "Antonella Rossi", age: 27, city: "San Juan, Puerto Rico", role: "Veterinarian", bio: "Soft-hearted with animals, honest with people. Looking for someone kind and direct.", tag: "Companionship" },
  { name: "Fernanda López", age: 33, city: "Guadalajara, Mexico", role: "Fashion Designer", bio: "I build collections around feeling. Looking for someone who makes me feel something too.", tag: "Marriage" },
  { name: "Alejandra Duarte", age: 29, city: "Seville, Spain", role: "Sommelier", bio: "I know a good pairing when I see one. Hoping that includes people, too.", tag: "Long-term relationship" },
  { name: "Natalia Cabrera", age: 26, city: "Panama City, Panama", role: "Museum Educator", bio: "I spend my days surrounded by history. Ready to start writing some of my own.", tag: "Companionship" },
  { name: "Rocío Aguilar", age: 32, city: "Medellín, Colombia", role: "Software Engineer", bio: "I solve problems for a living, but I'd rather just enjoy someone's company for once.", tag: "Marriage" },
  { name: "Julieta Marín", age: 28, city: "Valencia, Spain", role: "Florist", bio: "I arrange beautiful things for other people's milestones. Hoping to build one of my own.", tag: "Long-term relationship" },
  { name: "Catalina Vega", age: 30, city: "Cali, Colombia", role: "Journalist", bio: "I ask questions for a living. Looking for someone who gives honest answers.", tag: "Companionship" },
  { name: "Inés Paredes", age: 27, city: "Rio de Janeiro, Brazil", role: "Pastry Chef", bio: "Sweetness is my specialty. Looking for someone who appreciates the little details.", tag: "Marriage" },
  { name: "Marisol Herrera", age: 31, city: "Caracas, Venezuela", role: "Diplomat", bio: "I've lived in five countries and still haven't found home. Maybe it's a person, not a place.", tag: "Long-term relationship" },
  { name: "Bianca Ferreira", age: 29, city: "San José, Costa Rica", role: "Ceramicist", bio: "I shape things slowly and with care. Looking for a connection built the same way.", tag: "Companionship" },
];

export const PROFILE_PHOTOS = [
  "/images/wa-1.jpg",
  "/images/wa-2.jpg",
  "/images/wa-3.jpg",
  "/images/wa-4.jpg",
  "/images/wa-5.jpg",
  "/images/profile-neon.jpg",
  "/images/profile-boudoir.jpg",
  "/images/woman-hero.jpg",
];

export function profilePhoto(index) {
  return PROFILE_PHOTOS[index % PROFILE_PHOTOS.length];
}

const LIVE_API = "https://node.latina.myaibusiness.online";

function getApiBase() {
  const fromEnv = String(import.meta.env.VITE_API_URL || "").trim();
  if (!fromEnv || /localhost/i.test(fromEnv)) {
    return LIVE_API;
  }
  return fromEnv.replace(/\/$/, "");
}

function photoUrl(path, index = 0) {
  if (!path) return profilePhoto(index);
  if (/^https?:\/\//i.test(path)) return path;
  return `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

function relationshipTag(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "marriage") return "Marriage";
  if (key === "long-term") return "Long-term";
  if (key === "life-partner") return "Life-partner";
  if (key === "dating") return "Dating";
  if (key) return key.replace(/-/g, " ");
  return "Companionship";
}

export function mapApplicationToProfile(app) {
  const photo = Array.isArray(app?.photos) ? app.photos[0] : "";

  return {
    name: String(app?.firstName || "").trim(),
    age: app?.age || "",
    city: String(app?.countryOfResidence || app?.countryOfBirth || "").trim(),
    role: String(app?.profession || "").trim(),
    bio: String(app?.visionStatement || app?.personalityType || "").trim(),
    tag: relationshipTag(app?.relationshipDesired),
    relationshipDesired: String(app?.relationshipDesired || "")
      .trim()
      .toLowerCase(),
    photo,
    slug: String(app?.slug || "").trim(),
  };
}

/* Live API only — approved profiles */
export async function fetchApprovedProfiles() {
  try {
    const response = await fetch(`${getApiBase()}/api/applications/approved`);
    if (!response.ok) return [];

    const data = await response.json();
    const list = Array.isArray(data?.applications) ? data.applications : [];

    return list
      .map(mapApplicationToProfile)
      .filter((profile) => profile.name);
  } catch {
    return [];
  }
}

export function ProfileDetail({ profile, index, onClose, onRegister, onConnect }) {
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-detail-title">
      <div className="popup popup--profile">
        <button type="button" className="icon-close" onClick={onClose} aria-label="Close profile">
          ×
        </button>
        <div className="pmodal-layout">
          <div className="pmodal-photo">
            <img src={photoUrl(profile.photo, index)} alt={profile.name} />
          </div>
          <div className="pmodal-body">
            <p className="profile-card__tag pmodal-tag">{profile.tag}</p>
            <h2 id="profile-detail-title">{profile.name}</h2>
            <p className="profile-card__meta">
              {profile.age} · {profile.city}
            </p>
            <p className="profile-card__role">{profile.role}</p>
            <p className="pmodal-bio">{profile.bio}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onClose();
                if (onConnect) onConnect(profile);
                else onRegister?.();
              }}
            >
              Apply to Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileCard({ profile, index, onReadMore }) {
  const tagLabel = String(profile.tag || "").split(" ")[0] || profile.tag;

  return (
    <article
      className="profile-card"
      onClick={onReadMore}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onReadMore?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Read more about ${profile.name}`}
    >
      <div className="profile-card__photo">
        <img src={photoUrl(profile.photo, index)} alt={profile.name} />
        <span className="profile-card__tag">{tagLabel}</span>
      </div>
      <div className="profile-card__body">
        <h3>{profile.name}</h3>
        <p className="profile-card__meta">
          {profile.age} · {profile.city}
        </p>
        <p className="profile-card__role">{profile.role}</p>
        <span className="read-more">Read more →</span>
      </div>
    </article>
  );
}
