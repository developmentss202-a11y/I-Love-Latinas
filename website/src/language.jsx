import { createContext, useContext, useState } from "react";

/*
  How language works (simple):

  1. Write English in the website, then wrap it with t("...")
  2. If the user clicks ES, t() returns the Spanish line from this list
  3. If a line is missing here, English is shown

  You do NOT copy every page into two big objects.
  You only add Spanish here when you need it.
*/

const spanish = {
  // Women's landing
  "Be Valued by a Man": "Sé valorada por un hombre",
  "Who Means It.": "Que lo dice en serio.",
  "Looking for meaningful companionship?": "¿Buscas una compañía con sentido?",
  "Honesty. Respect. Commitment.": "Honestidad. Respeto. Compromiso.",
  "Maybe your life is missing a man who means it.": "Tal vez a tu vida le falta un hombre que lo dice en serio.",
  "Register yourself →": "Regístrate →",
  "Explore our Places": "Explora nuestros lugares",
  "Owner hotels": "Hoteles del propietario",
  "Private places to meet, stay, and take your time.":
    "Lugares privados para encontrarse, quedarse y tomarse el tiempo.",
  "Photos": "Fotos",
  "Videos": "Videos",
  "Play video": "Ver video",
  "Close": "Cerrar",
  "For women": "Para mujeres",

  // Men's landing
  "For men": "Para hombres",
  "Find the Latina Who’s": "Encuentra a la latina que es",
  "Truly": "Realmente",
  "Unforgettable.": "Inolvidable.",
  "Are you living the life? Is something missing?": "¿Estás viviendo la vida? ¿Falta algo?",
  "Warmth. Companionship. Shared moments.": "Calidez. Compañía. Momentos compartidos.",
  "Maybe your life is missing a Latina.": "Tal vez a tu vida le falta una latina.",
  "Explore Options →": "Explorar opciones →",

  // Register form chrome
  "Membership application": "Solicitud de membresía",
  "Step": "Paso",
  "of": "de",
  "Close registration": "Cerrar registro",
  "Back": "Atrás",
  "Continue": "Continuar",
  "Submit": "Enviar",
  "Submit application?": "¿Enviar solicitud?",
  "All required information has been filled. Please confirm that you want to submit your application.":
    "Toda la información requerida ha sido completada. Confirma que quieres enviar tu solicitud.",
  "Cancel": "Cancelar",
  "Yes, Submit": "Sí, enviar",
  "Submitting...": "Enviando...",
  "Application submitted successfully!": "¡Solicitud enviada con éxito!",
  "Thank you": "Gracias",
  "Your profile has been received successfully.": "Tu perfil se ha recibido correctamente.",
  "Back to home": "Volver al inicio",

  "Identity": "Identidad",
  "Who you are": "Quién eres",
  "Ten fields about you.": "Doce datos sobre ti.",
  "Your identity details.": "Tus datos de identidad.",
  "Lifestyle": "Estilo de vida",
  "How you live": "Cómo vives",
  "Work, family, and travel.": "Trabajo, familia y viajes.",
  "Heart": "Corazón",
  "What you seek": "Lo que buscas",
  "Match and habits.": "Relación y hábitos.",

  // Field labels
  "First name": "Nombre",
  "Phone number": "Número de teléfono",
  "Email": "Correo electrónico",
  "Age": "Edad",
  "Gender": "Género",
  "Photo": "Foto",
  "Athletic type": "Tipo atlético",
  "Personality type": "Tipo de personalidad",
  "Voice recording": "Grabación de voz",
  "Video recording": "Grabación de video",
  "Country of birth": "País de nacimiento",
  "Country of residence": "País de residencia",
  "Business owner": "Dueña de negocio",
  "Employed": "Empleada",
  "Profession": "Profesión",
  "Job experience": "Experiencia laboral",
  "Specific skills": "Habilidades específicas",
  "Languages spoken": "Idiomas que hablas",
  "Countries visited": "Países visitados",
  "Desire to relocate / travel": "Deseo de mudarte / viajar",
  "Are you willing to meet or work at the client's hotels?":
    "¿Estás dispuesta a reunirte o trabajar en los hoteles del cliente?",
  "Children": "Hijos",
  "Want children": "¿Quieres hijos?",
  "Relationship status": "Estado civil",
  "Relationship desired": "Relación que buscas",
  "Vision statement": "Declaración de visión",
  "Hobbies": "Pasatiempos",
  "Characteristics desired": "Características que deseas",
  "Legal problems": "Problemas legales",
  "Drink": "Bebidas alcohólicas",
  "Cigarette smoker": "Fumas cigarrillos",
  "Marijuana": "Marihuana",
  "Drugs — other": "Otras drogas",

  // Placeholders
  "Enter first name": "Ingresa tu nombre",
  "Enter phone number": "Ingresa tu número de teléfono",
  "Enter email address": "Ingresa tu correo electrónico",
  "Enter age": "Ingresa tu edad",
  "Select Gender": "Selecciona el género",
  "Select Athletic type": "Selecciona el tipo atlético",
  "Enter personality type": "Ingresa tu tipo de personalidad",
  "Select Country of birth": "Selecciona el país de nacimiento",
  "Select Country of residence": "Selecciona el país de residencia",
  "Select": "Selecciona",
  "1 photo only • Maximum 3 MB": "1 foto solamente • Máximo 3 MB",
  "Maximum 5 MB": "Máximo 5 MB",
  "Personal / professional • Maximum 10 MB": "Personal / profesional • Máximo 10 MB",
  "Age must be between {min} and {max} years": "La edad debe estar entre {min} y {max} años",
  "Notice": "Aviso",
  "Got it": "Entendido",

  // Options
  "Yes": "Sí",
  "No": "No",
  "Woman": "Mujer",
  "Not athletic": "No atlético",
  "Casual": "Casual",
  "Active": "Activo",
  "Competitive": "Competitivo",
  "Professional athlete": "Atleta profesional",
  "0–2 years": "0–2 años",
  "3–5 years": "3–5 años",
  "6–10 years": "6–10 años",
  "11–15 years": "11–15 años",
  "16+ years": "16+ años",
  "Open to relocating": "Abierta a mudarme",
  "Love to travel, stay based here": "Me encanta viajar, pero vivir aquí",
  "Prefer to stay local": "Prefiero quedarme en mi ciudad",
  "No children": "Sin hijos",
  "Have children": "Tengo hijos",
  "Open to it": "Estoy abierta",
  "Single": "Soltera",
  "Divorced": "Divorciada",
  "Widowed": "Viuda",
  "Separated": "Separada",
  "Serious dating": "Citas serias",
  "Long-term relationship": "Relación a largo plazo",
  "Marriage-minded": "Con intención de matrimonio",
  "Life partner": "Compañero de vida",
  "None": "Ninguno",
  "Resolved in the past": "Resueltos en el pasado",
  "Prefer not to say": "Prefiero no decirlo",
  "Never": "Nunca",
  "Rarely": "Rara vez",
  "Socially": "En social",
  "Regularly": "Regularmente",
  "Daily": "Diario",
  "In the past": "En el pasado",
  "Occasionally": "Ocasionalmente",

  // Validations
  "{label} is required.": "{label} es obligatorio.",
  "Please enter a valid age.": "Ingresa una edad válida.",
  "Minimum age is {min} years. Please enter age {min} or above.":
    "La edad mínima es {min} años. Ingresa {min} o más.",
  "Maximum age is {max} years. Please enter age {max} or below.":
    "La edad máxima es {max} años. Ingresa {max} o menos.",
  "First name must contain at least 2 characters.": "El nombre debe tener al menos 2 caracteres.",
  "Please enter a valid phone number.": "Ingresa un número de teléfono válido.",
  "Please enter a valid email address.": "Ingresa un correo electrónico válido.",
  "Your phone number and email address are kept private and will not be visible to other users. This information is accessible only to authorized administrators.":
    "Tu número de teléfono y correo electrónico se mantienen privados y no serán visibles para otros usuarios. Esta información solo es accesible para administradores autorizados.",
  "Please complete the current step before continuing.": "Completa el paso actual antes de continuar.",
  "Website is currently under maintenance. Please try again later.":
    "El sitio está en mantenimiento. Inténtalo más tarde.",
  "Application submission is currently disabled.": "El envío de solicitudes está desactivado.",
  "Women registration is currently closed.": "El registro de mujeres está cerrado.",
  "Something went wrong while submitting your application.": "Ocurrió un error al enviar tu solicitud.",
  "{label} must be maximum {max} MB.": "{label} debe ser de máximo {max} MB.",
  "Loading…": "Cargando…",
  "No approved profiles yet.": "Aún no hay perfiles aprobados.",
  "No profiles match this relationship type.": "No hay perfiles con este tipo de relación.",
  "All": "Todas",
  "Scroll filters left": "Deslizar filtros a la izquierda",
  "Scroll filters right": "Deslizar filtros a la derecha",
  "Ready for something real?": "¿Listo para algo real?",
  "Meet someone who's looking for a serious relationship":
    "Conoce a alguien que busca una relación seria",
  "Choose someone who interests you, and take the first step toward getting to know each other.":
    "Elige a alguien que te interese y da el primer paso para conocerse.",
  "How it works": "Cómo funciona",
  "Submit your introduction request with who you want to meet.":
    "Envía tu solicitud de presentación con quién quieres conocer.",
  "Our team reaches out based on your selections.":
    "Nuestro equipo se pondrá en contacto según tus selecciones.",
  "Meetings are arranged at our hotel for people seeking a real relationship.":
    "Las reuniones se organizan en nuestro hotel para quienes buscan una relación real.",
  "Introduction": "Presentación",
  "Tell us what kind of connection you want...":
    "Cuéntanos qué tipo de conexión deseas...",
  "What are you hoping for?": "¿Qué esperas?",
  "After you submit, our team will reach out based on your selections. Meetings are arranged at our hotel for people seeking a real relationship.":
    "Después de enviar, nuestro equipo se pondrá en contacto según tus selecciones. Las reuniones se organizan en nuestro hotel para quienes buscan una relación real.",
  "What you are looking for": "Qué estás buscando",
  "Select exactly 3 profiles for long-term relationship.":
    "Selecciona exactamente 3 perfiles para una relación a largo plazo.",
  "Your bookings": "Tus reservas",
  "Your introductions": "Tus presentaciones",
  "{name}'s introductions": "Presentaciones de {name}",
  "Review every request you submitted. Keep your link saved so you can return anytime.":
    "Revisa cada solicitud que enviaste. Guarda tu enlace para volver cuando quieras.",
  "Your calendar timings": "Tus horarios del calendario",
  "These are the meeting times from your submissions.":
    "Estos son los horarios de reunión de tus envíos.",
  "Your entries": "Tus entradas",
  "Tap an entry to expand and see full booking details.":
    "Toca una entrada para expandirla y ver todos los detalles de la reserva.",
  "Show details": "Ver detalles",
  "Hide details": "Ocultar detalles",
  "Entry": "Entrada",
  "Explore More Options": "Explorar más opciones",
  "Submit New Request": "Enviar nueva solicitud",
  "Show entries": "Ver entradas",
  "Go to profile": "Ir al perfil",
  "Your application was submitted successfully. Copy your profile link below, then open your profile.":
    "Tu solicitud se envió correctamente. Copia el enlace de tu perfil abajo y luego abre tu perfil.",
  "Your application was submitted successfully. Copy your profile link below, then open your entries.":
    "Tu solicitud se envió correctamente. Copia el enlace de tu perfil abajo y luego abre tus entradas.",
  "Meeting Preference": "Preferencia de reunión",
  "Late dinner": "Cena tarde",
  "Hotel / private suite": "Hotel / suite privada",
  "Weekend away": "Fin de semana fuera",
  "Open to her suggestion": "Abierta a su sugerencia",
  "Status": "Estado",
  "pending": "pendiente",
  "approved": "aprobada",
  "rejected": "rechazada",
  "contacted": "contactado",
  "Select a profile": "Selecciona un perfil",

  // Media buttons
  "Add Photo": "Agregar foto",
  "Change Photo": "Cambiar foto",
  "Select Photo": "Seleccionar foto",
  "Choose Photo From File": "Elegir foto del archivo",
  "Take Photo": "Tomar foto",
  "Capture Photo": "Capturar foto",
  "Add Voice": "Agregar voz",
  "Change Voice": "Cambiar voz",
  "Select Voice": "Seleccionar voz",
  "Choose Voice From File": "Elegir voz del archivo",
  "Record Voice": "Grabar voz",
  "Recording voice...": "Grabando voz...",
  "Add Video": "Agregar video",
  "Change Video": "Cambiar video",
  "Select Video": "Seleccionar video",
  "Choose Video From File": "Elegir video del archivo",
  "Record Video": "Grabar video",
  "Start Recording": "Empezar grabación",
  "Recording video...": "Grabando video...",
  "Stop Recording": "Detener grabación",
  "Please allow camera permission.": "Por favor permite el acceso a la cámara.",
  "Please allow microphone permission.": "Por favor permite el acceso al micrófono.",
  "Please allow camera and microphone permission.": "Por favor permite el acceso a la cámara y al micrófono.",
  "Video": "Video",

  // Pending + profile
  "Application Submitted": "Solicitud enviada",
  "Your profile has been successfully submitted.": "Tu perfil se ha enviado correctamente.",
  "Thank you for registering with us. We'll keep you updated as new opportunities become available.":
    "Gracias por registrarte. Te mantendremos al tanto cuando haya nuevas oportunidades.",
  "View Your Profile": "Ver tu perfil",
  "Your profile": "Tu perfil",
  "Your submitted application": "Tu solicitud enviada",
  "This is your unique profile page. Keep the copied link so you can return here later.":
    "Esta es tu página de perfil. Guarda el enlace copiado para volver más tarde.",
  "Loading your profile…": "Cargando tu perfil…",
  "Your listing": "Tu ficha",
  "Pending": "Pendiente",
  "Approved": "Aprobada",
  "Rejected": "Rechazada",
  "All of the details you submitted are shown below.": "A continuación están todos los datos que enviaste.",
  "Copy link": "Copiar enlace",
  "Save this link. You will need it to return to your profile later.":
    "Guarda este enlace. Lo necesitarás para volver a tu perfil más tarde.",
  "Copied": "Copiado",
  "Copy this profile link": "Copia este enlace de perfil",
  "Profile link": "Enlace del perfil",

  // Header / footer / about / support
  "Profiles": "Perfiles",
  "Contact": "Contacto",
  "Toggle menu": "Abrir menú",
  "Home": "Inicio",
  "About Us": "Sobre nosotras",
  "Support": "Soporte",
  "Site": "Sitio",
  "Legal": "Legal",
  "Membership": "Membresía",
  "Privacy Policy": "Política de privacidad",
  "Terms of Use": "Términos de uso",
  "Community Guidelines": "Normas de la comunidad",
  "Apply to Join": "Solicitar unirse",
  "FAQ": "Preguntas frecuentes",
  "All rights reserved.": "Todos los derechos reservados.",
  "Discreet matchmaking for people who know what they want. Reviewed by hand, kept private, built for real conversation.":
    "Matchmaking discreto para quienes saben lo que quieren. Revisado a mano, privado y pensado para conversaciones reales.",
  "A quieter way to meet.": "Una forma más discreta de conocerse.",
  "I Love Latinas is a private matchmaking site for people who would rather be known than swiped. We favor depth, intention, and profiles that actually say something.":
    "I Love Latinas es un sitio privado de matchmaking para quienes prefieren ser conocidas de verdad, no deslizadas. Priorizamos la profundidad, la intención y perfiles que realmente dicen algo.",
  "Principle One": "Principio uno",
  "Curated, not crowded": "Curado, no masivo",
  "Every member completes a thorough application. We're looking for adults who know what they want and are willing to say it plainly.":
    "Cada miembro completa una solicitud rigurosa. Buscamos adultas que saben lo que quieren y están dispuestas a decirlo con claridad.",
  "Principle Two": "Principio dos",
  "Privacy first": "Privacidad primero",
  "Photos, recordings, and personal details stay inside the site. We do not sell data, and we do not run ads against your profile.":
    "Las fotos, grabaciones y datos personales se quedan en el sitio. No vendemos datos ni mostramos anuncios con tu perfil.",
  "Principle Three": "Principio tres",
  "Human review": "Revisión humana",
  "Applications are read by people, not only filters. If we accept you, you join a circle that takes courtship seriously.":
    "Las solicitudes las leen personas, no solo filtros. Si te aceptamos, entras a un círculo que se toma el cortejo en serio.",
  "Help, quietly delivered.": "Ayuda, con discreción.",
  "Common questions below. If you need a person, use Contact and we'll take it from there.":
    "Preguntas frecuentes abajo. Si necesitas a una persona, usa Contacto y nosotras nos encargamos.",
  "Who can join?": "¿Quién puede unirse?",
  "Adults 21 and over who complete the three-step application. We look for sincerity more than status.":
    "Adultas de 21 años o más que completen la solicitud de tres pasos. Valoramos la sinceridad más que el estatus.",
  "How long does review take?": "¿Cuánto tarda la revisión?",
  "Most applications are reviewed within two business days. You will hear from us either way.":
    "La mayoría de las solicitudes se revisan en dos días hábiles. Te avisaremos en cualquier caso.",
  "Is my information private?": "¿Mi información es privada?",
  "Yes. Photos, voice notes, and videos are only visible to accepted members. We never sell your data.":
    "Sí. Las fotos, notas de voz y videos solo son visibles para miembros aceptados. Nunca vendemos tus datos.",
  "Can I edit my profile later?": "¿Puedo editar mi perfil después?",
  "Once accepted, you may update details from your membership desk. Sensitive fields may be re-reviewed.":
    "Una vez aceptada, puedes actualizar datos desde tu espacio de membresía. Algunos campos sensibles pueden volver a revisarse.",

  "Private circle": "Círculo privado",
  "Where Meaningful Relationships Begin": "Donde comienzan las relaciones significativas",
  "Take your time to find the right connection, and let us bring you together.":
    "Tómate tu tiempo para encontrar la conexión adecuada y déjanos juntarlos.",
  "Short Term Relationship": "Relación a corto plazo",
  "Long Term Relationship": "Relación a largo plazo",
  "Hotel at Beach": "Hotel en la playa",
  "Hotel at Mountains": "Hotel en las montañas",
  "Place Name": "Nombre del lugar",
  "Desired meeting date & time": "Fecha y hora deseada de la reunión",
  "Previous month": "Mes anterior",
  "Next month": "Mes siguiente",
  "Time": "Hora",
  "Hour": "Hora",
  "Minute": "Minuto",
  "AM or PM": "AM o PM",
  "AM": "AM",
  "PM": "PM",
  "Clear": "Borrar",
  "Done": "Listo",
  "Women who want to be wanted": "Mujeres que quieren ser deseadas",
  "Take your time to find a meaningful connection, and let us bring you together":
    "Tómate tu tiempo para encontrar una conexión significativa y déjanos juntarlos",

  "United States": "Estados Unidos",
  "United Kingdom": "Reino Unido",
  "France": "Francia",
  "Germany": "Alemania",
  "Italy": "Italia",
  "Spain": "España",
  "Canada": "Canadá",
  "Japan": "Japón",
  "Singapore": "Singapur",
  "Brazil": "Brasil",
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "Sweden": "Suecia",
  "Netherlands": "Países Bajos",
  "Switzerland": "Suiza",
  "Other": "Otro",
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("ill-lang") === "es" ? "es" : "en";
    } catch {
      return "en";
    }
  });

  function changeLang(next) {
    setLang(next);
    try {
      localStorage.setItem("ill-lang", next);
    } catch {
      /* ignore */
    }
  }

  // t("Hello") -> "Hello" in English, or Spanish if the user clicked ES
  function t(text, vars) {
    let out = lang === "es" ? spanish[text] || text : text;

    if (vars) {
      Object.keys(vars).forEach((key) => {
        out = String(out).replaceAll(`{${key}}`, vars[key]);
      });
    }

    return out;
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageButtons() {
  const { lang, changeLang } = useLanguage();

  return (
    <div className="lang-switch">
      <button
        type="button"
        className={lang === "en" ? "is-active" : ""}
        onClick={() => changeLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "es" ? "is-active" : ""}
        onClick={() => changeLang("es")}
      >
        ES
      </button>
    </div>
  );
}
