



import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../language";


// =====================================================
// FILE SIZE LIMITS
// =====================================================

const PHOTO_MAX_MB = 3;
const VOICE_MAX_MB = 5;
const VIDEO_MAX_MB = 10;


// =====================================================
// BRANDED NOTICE (replaces browser alert)
// =====================================================

const noticeListeners = new Set();

function showFormNotice(message) {
  const text = String(message || "").trim();
  if (!text) return;

  if (noticeListeners.size === 0) {
    window.alert(text);
    return;
  }

  noticeListeners.forEach((listener) => listener(text));
}

export function FormNoticeHost() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");

  useEffect(() => {
    noticeListeners.add(setMessage);
    return () => noticeListeners.delete(setMessage);
  }, []);

  if (!message) {
    return null;
  }

  return createPortal(
    <div
      className="popup-overlay form-notice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-notice-title"
      onClick={() => setMessage("")}
    >
      <div
        className="popup form-notice-popup"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="form-notice-popup__icon" aria-hidden="true">
          !
        </div>
        <h2 id="form-notice-title">{t("Notice")}</h2>
        <p>{message}</p>
        <div className="popup-actions">
          <button
            type="button"
            className="btn btn--gold"
            onClick={() => setMessage("")}
          >
            {t("Got it")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


// =====================================================
// SET FILES TO HIDDEN INPUT
// =====================================================

function setFilesToInput(
  input,
  files
) {
  if (!input) {
    return;
  }

  try {
    const dataTransfer =
      new DataTransfer();

    files.forEach((file) => {
      if (file instanceof File) {
        dataTransfer.items.add(file);
      }
    });

    input.files =
      dataTransfer.files;

  } catch (error) {
    console.log(
      "Unable to set files:",
      error
    );
  }
}


// =====================================================
// FILE SIZE MB
// =====================================================

function getFileSizeMB(file) {
  if (!file) {
    return 0;
  }

  return (
    file.size /
    (1024 * 1024)
  );
}


// =====================================================
// VALIDATE FILE SIZE
// =====================================================

function validateFileSize(
  file,
  maxSizeMB,
  label,
  t
) {
  if (!file) {
    return false;
  }

  const maxBytes =
    maxSizeMB *
    1024 *
    1024;

  if (file.size > maxBytes) {
    showFormNotice(
      t
        ? t("{label} must be maximum {max} MB.", { label: t(label), max: maxSizeMB })
        : `${label} must be maximum ${maxSizeMB} MB.`
    );

    return false;
  }

  return true;
}


// =====================================================
// COMMON FILE BOX
// =====================================================

function GovernmentFileRow({
  file,
  buttonText,
  changeText,
  emptyText,
  onButtonClick,
}) {
  return (
    <button
      type="button"
      className={`gov-file-upload${file ? " is-selected" : ""}`}
      onClick={onButtonClick}
    >
      {file ? (
        <>
          <span className="gov-file-name" title={file.name}>
            {file.name}
          </span>
          <span className="gov-file-size">
            {getFileSizeMB(file).toFixed(2)} MB
          </span>
          <span className="gov-file-action">{changeText}</span>
        </>
      ) : (
        <>
          <span className="gov-no-file">{emptyText}</span>
          <span className="gov-file-action">{buttonText}</span>
        </>
      )}
    </button>
  );
}


// =====================================================
// PHOTO CONTROL
// =====================================================

function PhotoControl({
  field,
  value,
  onChange,
}) {
  const { t } = useLanguage();

  const inputRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);


  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const [
    cameraOpen,
    setCameraOpen,
  ] = useState(false);


  const [
    photos,
    setPhotos,
  ] = useState(
    Array.isArray(value)
      ? value.slice(0, 1)
      : []
  );


  const photoFile =
    photos[0] || null;


  // ===================================================
  // RESTORE PHOTO
  // ===================================================

  useEffect(() => {

    const newPhotos =
      Array.isArray(value)
        ? value.slice(0, 1)
        : [];

    setPhotos(newPhotos);

    setFilesToInput(
      inputRef.current,
      newPhotos
    );

  }, [value]);


  // ===================================================
  // CLEAN CAMERA
  // ===================================================

  useEffect(() => {

    return () => {

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

    };

  }, []);


  // ===================================================
  // SAVE PHOTO
  // ===================================================

  function savePhoto(file) {

    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          PHOTO_MAX_MB,
        "Photo",
        t
      );


    if (!valid) {
      return;
    }


    const newPhotos =
      [file];


    setPhotos(
      newPhotos
    );


    setFilesToInput(
      inputRef.current,
      newPhotos
    );


    onChange(
      field.name,
      newPhotos
    );


    setMenuOpen(false);
  }


  // ===================================================
  // SELECT PHOTO
  // ===================================================

  function browsePhoto(event) {

    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          PHOTO_MAX_MB,
        "Photo",
        t
      );


    if (!valid) {

      event.target.value =
        "";

      return;
    }


    savePhoto(file);
  }


  // ===================================================
  // OPEN CAMERA
  // ===================================================

  async function openCamera() {

    try {

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          });


      streamRef.current =
        stream;


      setMenuOpen(false);

      setCameraOpen(true);


      setTimeout(() => {

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;
        }

      }, 100);

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );


      showFormNotice(
        t("Please allow camera permission.")
      );
    }
  }


  // ===================================================
  // STOP CAMERA
  // ===================================================

  function stopCamera() {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );


      streamRef.current =
        null;
    }


    if (
      videoRef.current
    ) {
      videoRef.current.srcObject =
        null;
    }


    setCameraOpen(false);
  }


  // ===================================================
  // CAPTURE PHOTO
  // ===================================================

  function capturePhoto() {

    const video =
      videoRef.current;


    if (!video) {
      return;
    }


    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      video.videoWidth ||
      640;

    canvas.height =
      video.videoHeight ||
      480;


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    canvas.toBlob(
      (blob) => {

        if (!blob) {
          return;
        }


        const file =
          new File(
            [blob],
            `photo-${Date.now()}.jpg`,
            {
              type:
                "image/jpeg",
            }
          );


        const valid =
          validateFileSize(
            file,
            field.maxSizeMB ||
              PHOTO_MAX_MB,
            "Photo",
            t
          );


        if (!valid) {
          return;
        }


        savePhoto(file);

        stopCamera();
      },

      "image/jpeg",
      0.9
    );
  }


  // ===================================================
  // PHOTO UI
  // ===================================================

  return (
    <div className="media-control">

      <input
        ref={inputRef}

        id={`field-${field.name}`}

        name={field.name}

        type="file"

        accept={
          field.accept ||
          "image/*"
        }

        multiple={false}

        required={
          field.required
        }

        onChange={
          browsePhoto
        }

        style={{
          display: "none",
        }}
      />


      {!cameraOpen && (

        <GovernmentFileRow
          file={photoFile}

          buttonText={t("Add Photo")}

          changeText={t("Change Photo")}

          emptyText={t("Select Photo")}

          onButtonClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
        />

      )}


      {menuOpen &&
        !cameraOpen && (

          <div className="media-choice-menu">

            <button
              type="button"

              className="media-choice-btn"

              onClick={() => {

                if (
                  inputRef.current
                ) {

                  inputRef.current.value =
                    "";

                  inputRef.current.click();
                }
              }}
            >
              {t("Choose Photo From File")}
            </button>


            <button
              type="button"

              className="media-choice-btn"

              onClick={
                openCamera
              }
            >
              {t("Take Photo")}
            </button>


            <button
              type="button"

              className="media-choice-cancel"

              onClick={() =>
                setMenuOpen(false)
              }
            >
              {t("Cancel")}
            </button>

          </div>
        )}


      {cameraOpen && (

        <div className="live-camera-box">

          <video
            ref={videoRef}

            autoPlay

            muted

            playsInline

            className="live-camera-preview"
          />


          <div className="media-option-box">

            <button
              type="button"

              className="media-option-btn media-option-btn--live"

              onClick={
                capturePhoto
              }
            >
              {t("Capture Photo")}
            </button>


            <button
              type="button"

              className="media-cancel-btn"

              onClick={
                stopCamera
              }
            >
              {t("Cancel")}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}


// =====================================================
// VOICE CONTROL
// =====================================================

function VoiceControl({
  field,
  value,
  onChange,
}) {
  const { t } = useLanguage();

  const inputRef =
    useRef(null);

  const recorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);


  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const [
    recording,
    setRecording,
  ] = useState(false);


  const [
    audioFile,
    setAudioFile,
  ] = useState(
    value instanceof File
      ? value
      : null
  );


  // ===================================================
  // RESTORE AUDIO
  // ===================================================

  useEffect(() => {

    if (
      value instanceof File
    ) {

      setAudioFile(value);

      setFilesToInput(
        inputRef.current,
        [value]
      );

    } else {

      setAudioFile(null);

      setFilesToInput(
        inputRef.current,
        []
      );
    }

  }, [value]);


  // ===================================================
  // CLEAN MICROPHONE
  // ===================================================

  useEffect(() => {

    return () => {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

    };

  }, []);


  // ===================================================
  // SAVE AUDIO
  // ===================================================

  function saveAudio(file) {

    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          VOICE_MAX_MB,
        "Voice recording",
        t
      );


    if (!valid) {
      return;
    }


    setAudioFile(file);


    setFilesToInput(
      inputRef.current,
      [file]
    );


    onChange(
      field.name,
      file
    );


    setMenuOpen(false);
  }


  // ===================================================
  // SELECT AUDIO
  // ===================================================

  function browseAudio(event) {

    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          VOICE_MAX_MB,
        "Voice recording",
        t
      );


    if (!valid) {

      event.target.value =
        "";

      return;
    }


    saveAudio(file);
  }


  // ===================================================
  // START VOICE RECORDING
  // ===================================================

  async function startRecording() {

    try {

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: true,
          });


      streamRef.current =
        stream;


      chunksRef.current =
        [];


      const recorder =
        new MediaRecorder(
          stream
        );


      recorderRef.current =
        recorder;


      recorder.ondataavailable =
        (event) => {

          if (
            event.data &&
            event.data.size >
              0
          ) {

            chunksRef.current.push(
              event.data
            );
          }
        };


      recorder.onstop =
        () => {

          const mimeType =
            recorder.mimeType ||
            "audio/webm";


          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  mimeType,
              }
            );


          const file =
            new File(
              [blob],
              `voice-${Date.now()}.webm`,
              {
                type:
                  mimeType,
              }
            );


          const valid =
            validateFileSize(
              file,
              field.maxSizeMB ||
                VOICE_MAX_MB,
              "Voice recording",
              t
            );


          if (valid) {
            saveAudio(file);
          }


          stopMicrophone();
        };


      setMenuOpen(false);

      recorder.start();

      setRecording(true);

    } catch (error) {

      console.error(
        "Microphone error:",
        error
      );


      showFormNotice(
        t("Please allow microphone permission.")
      );
    }
  }


  // ===================================================
  // STOP RECORDING
  // ===================================================

  function stopRecording() {

    if (
      recorderRef.current &&
      recorderRef.current
        .state !==
        "inactive"
    ) {

      recorderRef.current.stop();
    }


    setRecording(false);
  }


  // ===================================================
  // STOP MICROPHONE
  // ===================================================

  function stopMicrophone() {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );


      streamRef.current =
        null;
    }


    setRecording(false);
  }


  // ===================================================
  // VOICE UI
  // ===================================================

  return (
    <div className="media-control">

      <input
        ref={inputRef}

        id={`field-${field.name}`}

        name={field.name}

        type="file"

        accept={
          field.accept ||
          "audio/*"
        }

        required={
          field.required
        }

        onChange={
          browseAudio
        }

        style={{
          display: "none",
        }}
      />


      {!recording && (

        <GovernmentFileRow
          file={audioFile}

          buttonText={t("Add Voice")}

          changeText={t("Change Voice")}

          emptyText={t("Select Voice")}

          onButtonClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
        />

      )}


      {menuOpen &&
        !recording && (

          <div className="media-choice-menu">

            <button
              type="button"

              className="media-choice-btn"

              onClick={() => {

                if (
                  inputRef.current
                ) {

                  inputRef.current.value =
                    "";

                  inputRef.current.click();
                }
              }}
            >
              {t("Choose Voice From File")}
            </button>


            <button
              type="button"

              className="media-choice-btn"

              onClick={
                startRecording
              }
            >
              {t("Record Voice")}
            </button>


            <button
              type="button"

              className="media-choice-cancel"

              onClick={() =>
                setMenuOpen(false)
              }
            >
              {t("Cancel")}
            </button>

          </div>
        )}


      {recording && (

        <div className="recording-box">

          <div className="recording-status">
            <span className="recording-dot">
              ●
            </span>

            {t("Recording voice...")}
          </div>


          <button
            type="button"

            className="gov-recording-btn"

            onClick={
              stopRecording
            }
          >
            {t("Stop Recording")}
          </button>

        </div>
      )}

    </div>
  );
}


// =====================================================
// VIDEO CONTROL
// =====================================================

function VideoControl({
  field,
  value,
  onChange,
}) {
  const { t } = useLanguage();

  const inputRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const recorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);


  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const [
    cameraOpen,
    setCameraOpen,
  ] = useState(false);


  const [
    recording,
    setRecording,
  ] = useState(false);


  const [
    videoFile,
    setVideoFile,
  ] = useState(
    value instanceof File
      ? value
      : null
  );


  // ===================================================
  // RESTORE VIDEO
  // ===================================================

  useEffect(() => {

    if (
      value instanceof File
    ) {

      setVideoFile(value);

      setFilesToInput(
        inputRef.current,
        [value]
      );

    } else {

      setVideoFile(null);

      setFilesToInput(
        inputRef.current,
        []
      );
    }

  }, [value]);


  // ===================================================
  // CLEAN CAMERA
  // ===================================================

  useEffect(() => {

    return () => {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

    };

  }, []);


  // ===================================================
  // SAVE VIDEO
  // ===================================================

  function saveVideo(file) {

    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          VIDEO_MAX_MB,
        "Video",
        t
      );


    if (!valid) {
      return;
    }


    setVideoFile(file);


    setFilesToInput(
      inputRef.current,
      [file]
    );


    onChange(
      field.name,
      file
    );


    setMenuOpen(false);
  }


  // ===================================================
  // SELECT VIDEO
  // ===================================================

  function browseVideo(event) {

    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    const valid =
      validateFileSize(
        file,
        field.maxSizeMB ||
          VIDEO_MAX_MB,
        "Video",
        t
      );


    if (!valid) {

      event.target.value =
        "";

      return;
    }


    saveVideo(file);
  }


  // ===================================================
  // OPEN CAMERA
  // ===================================================

  async function openCamera() {

    try {

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          });


      streamRef.current =
        stream;


      setMenuOpen(false);

      setCameraOpen(true);


      setTimeout(() => {

        if (
          videoRef.current
        ) {

          videoRef.current.srcObject =
            stream;
        }

      }, 100);

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );


      showFormNotice(
        t("Please allow camera and microphone permission.")
      );
    }
  }


  // ===================================================
  // START VIDEO RECORDING
  // ===================================================

  function startVideoRecording() {

    if (
      !streamRef.current
    ) {
      return;
    }


    chunksRef.current =
      [];


    const recorder =
      new MediaRecorder(
        streamRef.current
      );


    recorderRef.current =
      recorder;


    recorder.ondataavailable =
      (event) => {

        if (
          event.data &&
          event.data.size >
            0
        ) {

          chunksRef.current.push(
            event.data
          );
        }
      };


    recorder.onstop =
      () => {

        const mimeType =
          recorder.mimeType ||
          "video/webm";


        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                mimeType,
            }
          );


        const file =
          new File(
            [blob],
            `video-${Date.now()}.webm`,
            {
              type:
                mimeType,
            }
          );


        const valid =
          validateFileSize(
            file,
            field.maxSizeMB ||
              VIDEO_MAX_MB,
            "Video",
            t
          );


        if (valid) {
          saveVideo(file);
        }


        closeCamera();
      };


    recorder.start();

    setRecording(true);
  }


  // ===================================================
  // STOP VIDEO
  // ===================================================

  function stopVideoRecording() {

    if (
      recorderRef.current &&
      recorderRef.current
        .state !==
        "inactive"
    ) {

      recorderRef.current.stop();
    }


    setRecording(false);
  }


  // ===================================================
  // CLOSE CAMERA
  // ===================================================

  function closeCamera() {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );


      streamRef.current =
        null;
    }


    if (
      videoRef.current
    ) {

      videoRef.current.srcObject =
        null;
    }


    setCameraOpen(false);

    setRecording(false);
  }


  // ===================================================
  // VIDEO UI
  // ===================================================

  return (
    <div className="media-control">

      <input
        ref={inputRef}

        id={`field-${field.name}`}

        name={field.name}

        type="file"

        accept={
          field.accept ||
          "video/*"
        }

        required={
          field.required
        }

        onChange={
          browseVideo
        }

        style={{
          display: "none",
        }}
      />


      {!cameraOpen && (

        <GovernmentFileRow
          file={videoFile}

          buttonText={t("Add Video")}

          changeText={t("Change Video")}

          emptyText={t("Select Video")}

          onButtonClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
        />

      )}


      {menuOpen &&
        !cameraOpen && (

          <div className="media-choice-menu">

            <button
              type="button"

              className="media-choice-btn"

              onClick={() => {

                if (
                  inputRef.current
                ) {

                  inputRef.current.value =
                    "";

                  inputRef.current.click();
                }
              }}
            >
              {t("Choose Video From File")}
            </button>


            <button
              type="button"

              className="media-choice-btn"

              onClick={
                openCamera
              }
            >
              {t("Record Video")}
            </button>


            <button
              type="button"

              className="media-choice-cancel"

              onClick={() =>
                setMenuOpen(false)
              }
            >
              {t("Cancel")}
            </button>

          </div>
        )}


      {cameraOpen && (

        <div className="live-camera-box">

          <video
            ref={videoRef}

            autoPlay

            muted

            playsInline

            className="live-camera-preview"
          />


          {!recording ? (

            <div className="media-option-box">

              <button
                type="button"

                className="media-option-btn media-option-btn--live"

                onClick={
                  startVideoRecording
                }
              >
                {t("Start Recording")}
              </button>


              <button
                type="button"

                className="media-cancel-btn"

                onClick={
                  closeCamera
                }
              >
                {t("Cancel")}
              </button>

            </div>

          ) : (

            <div className="recording-box">

              <div className="recording-status">
                <span className="recording-dot">
                  ●
                </span>

                {t("Recording video...")}
              </div>


              <button
                type="button"

                className="gov-recording-btn"

                onClick={
                  stopVideoRecording
                }
              >
                {t("Stop Recording")}
              </button>

            </div>

          )}

        </div>
      )}

    </div>
  );
}


// =====================================================
// MAIN FORM FIELD
// =====================================================

export default function FormField({
  field,
  value,
  onChange,
  error,
}) {
  const { t } = useLanguage();

  const id =
    `field-${field.name}`;


  const common = {

    id,

    name:
      field.name,

    required:
      field.required,

    "aria-invalid":
      error
        ? "true"
        : undefined,
  };


  function handleChange(event) {

    onChange(
      field.name,
      event.target.value
    );
  }


  let control;


  // ===================================================
  // PHOTO
  // ===================================================

  if (
    field.name ===
    "photos"
  ) {

    control = (

      <PhotoControl
        field={field}

        value={value}

        onChange={onChange}
      />
    );
  }


  // ===================================================
  // VOICE
  // ===================================================

  else if (
    field.name ===
    "voiceRecording"
  ) {

    control = (

      <VoiceControl
        field={field}

        value={value}

        onChange={onChange}
      />
    );
  }


  // ===================================================
  // VIDEO
  // ===================================================

  else if (
    field.name ===
    "videoRecording"
  ) {

    control = (

      <VideoControl
        field={field}

        value={value}

        onChange={onChange}
      />
    );
  }


  // ===================================================
  // SELECT
  // ===================================================

  else if (
    field.type ===
    "select"
  ) {

    control = (

      <select
        {...common}

        value={
          value || ""
        }

        onChange={
          handleChange
        }
      >

        <option value="">

          {field.placeholder ||
            `${t("Select")} ${field.label}`}

        </option>


        {(field.options || [])
          .map((option) => (

            <option
              key={
                option.value
              }

              value={
                option.value
              }
            >
              {option.label}
            </option>

          ))}

      </select>
    );
  }


  // ===================================================
  // TEXTAREA
  // ===================================================

  else if (
    field.type ===
    "textarea"
  ) {

    control = (

      <textarea
        {...common}

        rows={4}

        value={
          value || ""
        }

        placeholder={
          field.placeholder ||
          `Enter ${field.label.toLowerCase()}`
        }

        onChange={
          handleChange
        }
      />
    );
  }


  // ===================================================
  // NORMAL INPUT
  // ===================================================

  else {

    control = (

      <input
        {...common}

        type={
          field.type ||
          "text"
        }

        value={
          value || ""
        }

        placeholder={
          field.placeholder ||
          `Enter ${field.label.toLowerCase()}`
        }

        min={
          field.min
        }

        max={
          field.max
        }

        onChange={
          handleChange
        }
      />
    );
  }


  // ===================================================
  // RETURN
  // ===================================================

  return (

    <div
      className={`form-field ${
        field.type ===
        "textarea"
          ? "form-field--wide"
          : ""
      } ${
        error
          ? "has-error"
          : ""
      }`}
    >

      <label
        className="form-field__label"

        htmlFor={id}
      >

        <span className="form-field__title">

          {field.label}


          {field.required ? (

            <span className="req">
              {" "}*
            </span>

          ) : null}

        </span>


      </label>


      {control}

      {field.hint ? (
        <span className="form-field__hint-inline">
          {field.hint}
        </span>
      ) : null}


      {error ? (

        <p className="form-field__error">
          {error}
        </p>

      ) : null}

    </div>
  );
}