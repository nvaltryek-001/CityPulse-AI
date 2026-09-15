import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  IMAGE_LIMITS,
  filesToImages,
  getReportImages,
  saveReportImages,
  clearReportImages,
  mergeImages,
  formatImageSize
} from "../services/imageService";

import {
  getCurrentReport
} from "../services/reportService";

export default function PhotoEvidence({
  navigate
}) {
  const [
    images,
    setImages
  ] = useState([]);

  const [
    error,
    setError
  ] = useState("");

  const [
    processing,
    setProcessing
  ] = useState(false);

  const [
    dragActive,
    setDragActive
  ] = useState(false);

  const cameraInputRef =
    useRef(null);

  const galleryInputRef =
    useRef(null);

  useEffect(() => {
    const saved =
      getReportImages();

    if (
      Array.isArray(saved)
    ) {
      setImages(saved);
    }
  }, []);

  const addFiles =
    useCallback(
      async (fileList) => {
        const files =
          Array.from(
            fileList || []
          );

        if (!files.length) {
          return;
        }

        setError("");

        const available =
          IMAGE_LIMITS.maxFiles -
          images.length;

        if (
          available <= 0
        ) {
          setError(
            `Maximum ${IMAGE_LIMITS.maxFiles} photos allowed.`
          );
          return;
        }

        const selected =
          files.slice(
            0,
            available
          );

        setProcessing(true);

        try {
          const converted =
            await filesToImages(
              selected
            );

          const invalid =
            converted.filter(
              (item) =>
                item.error
            );

          const valid =
            converted.filter(
              (item) =>
                !item.error
            );

          if (
            invalid.length
          ) {
            setError(
              invalid
                .map(
                  (item) =>
                    `${item.fileName}: ${item.error}`
                )
                .join(" ")
            );
          }

          if (
            valid.length
          ) {
            const next =
              mergeImages(
                images,
                valid
              );

            setImages(next);

            saveReportImages(
              next
            );
          }
        } catch {
          setError(
            "Something went wrong while processing the selected images."
          );
        } finally {
          setProcessing(false);
        }
      },
      [images]
    );

  const handleCamera =
    () => {
      setError("");

      if (
        images.length >=
        IMAGE_LIMITS.maxFiles
      ) {
        setError(
          `Maximum ${IMAGE_LIMITS.maxFiles} photos allowed.`
        );
        return;
      }

      cameraInputRef.current?.click();
    };

  const handleGallery =
    () => {
      setError("");

      if (
        images.length >=
        IMAGE_LIMITS.maxFiles
      ) {
        setError(
          `Maximum ${IMAGE_LIMITS.maxFiles} photos allowed.`
        );
        return;
      }

      galleryInputRef.current?.click();
    };

  const removeImage =
    (id) => {
      const next =
        images.filter(
          (image) =>
            image.id !== id
        );

      setImages(next);

      saveReportImages(
        next
      );
    };

  const removeAll =
    () => {
      setImages([]);
      clearReportImages();
      setError("");
    };

  const handleDrop =
    async (event) => {
      event.preventDefault();

      setDragActive(false);

      await addFiles(
        event.dataTransfer.files
      );
    };

  const handleContinue =
    () => {
      const report =
        getCurrentReport();

      if (
        !report
      ) {
        setError(
          "Please complete the report details first."
        );
        return;
      }

      saveReportImages(
        images
      );

      navigate(
        "/analysis"
      );
    };

  const canContinue =
    images.length > 0 &&
    !processing;

  return (
    <div className="cp-page cp-photo-page">

      <div className="cp-workflow-header">

        <div>
          <span className="cp-eyebrow">
            STEP 02
          </span>

          <h1>
            Add Photo Evidence
          </h1>

          <p>
            Clear photos help CityPulse AI
            understand the issue and prepare
            a stronger civic report.
          </p>
        </div>

        <div className="cp-photo-counter">
          <strong>
            {images.length}
          </strong>
          <span>
            / {IMAGE_LIMITS.maxFiles}
            {" "}photos
          </span>
        </div>

      </div>

      <div className="cp-progress">

        <div className="cp-progress-step completed">
          <span>✓</span>
          <label>
            Issue
          </label>
        </div>

        <div className="cp-progress-line completed" />

        <div className="cp-progress-step completed">
          <span>✓</span>
          <label>
            Location
          </label>
        </div>

        <div className="cp-progress-line active" />

        <div className="cp-progress-step active">
          <span>3</span>
          <label>
            Photos
          </label>
        </div>

        <div className="cp-progress-line" />

        <div className="cp-progress-step">
          <span>4</span>
          <label>
            AI Review
          </label>
        </div>

        <div className="cp-progress-line" />

        <div className="cp-progress-step">
          <span>5</span>
          <label>
            Report
          </label>
        </div>

      </div>

      {error && (
        <div className="cp-alert cp-alert-error">
          <span>!</span>
          <div>
            <strong>
              Image issue
            </strong>
            <p>
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="cp-photo-layout">

        <main className="cp-photo-main">

          <section
            className={
              `cp-upload-zone ${
                dragActive
                  ? "drag-active"
                  : ""
              }`
            }
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() =>
              setDragActive(false)
            }
            onDrop={handleDrop}
          >

            <div className="cp-upload-icon">
              📷
            </div>

            <h2>
              Add evidence photos
            </h2>

            <p>
              Take a photo now or select
              existing images from your gallery.
            </p>

            <div className="cp-upload-actions">

              <button
                type="button"
                className="cp-primary-btn"
                onClick={handleCamera}
                disabled={
                  processing ||
                  images.length >=
                    IMAGE_LIMITS.maxFiles
                }
              >
                <span>📸</span>
                Take Photo
              </button>

              <button
                type="button"
                className="cp-secondary-btn"
                onClick={handleGallery}
                disabled={
                  processing ||
                  images.length >=
                    IMAGE_LIMITS.maxFiles
                }
              >
                <span>🖼️</span>
                Choose from Gallery
              </button>

            </div>

            <div className="cp-upload-hint">
              <span>
                JPG
              </span>
              <span>
                PNG
              </span>
              <span>
                WebP
              </span>
              <span>
                Max 10 MB each
              </span>
              <span>
                Up to 5 photos
              </span>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(event) => {
                addFiles(
                  event.target.files
                );

                event.target.value =
                  "";
              }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(event) => {
                addFiles(
                  event.target.files
                );

                event.target.value =
                  "";
              }}
            />

            <div className="cp-drop-label">
              Or drag & drop images here
            </div>

          </section>

          {processing && (
            <div className="cp-processing-card">

              <div className="cp-spinner" />

              <div>
                <strong>
                  Processing your photos...
                </strong>

                <span>
                  Optimizing image size while
                  preserving useful visual details.
                </span>
              </div>

            </div>
          )}

          <section className="cp-evidence-section">

            <div className="cp-section-heading">

              <div>
                <span className="cp-eyebrow">
                  EVIDENCE
                </span>

                <h2>
                  Selected Photos
                </h2>
              </div>

              {images.length > 0 && (
                <button
                  type="button"
                  className="cp-text-danger"
                  onClick={removeAll}
                  disabled={processing}
                >
                  Remove all
                </button>
              )}

            </div>

            {images.length === 0 ? (

              <div className="cp-empty-evidence">

                <div className="cp-empty-icon">
                  🖼️
                </div>

                <h3>
                  No photos added yet
                </h3>

                <p>
                  Add at least one clear photo
                  showing the civic issue.
                </p>

              </div>

            ) : (

              <div className="cp-photo-grid">

                {images.map(
                  (
                    image,
                    index
                  ) => (

                    <article
                      className="cp-photo-card"
                      key={
                        image.id ||
                        index
                      }
                    >

                      <div className="cp-photo-preview">

                        <img
                          src={
                            image.dataUrl
                          }
                          alt={
                            `Civic evidence ${index + 1}`
                          }
                        />

                        <button
                          type="button"
                          className="cp-photo-remove"
                          onClick={() =>
                            removeImage(
                              image.id
                            )
                          }
                          aria-label="Remove photo"
                        >
                          ×
                        </button>

                        <div className="cp-photo-number">
                          {index + 1}
                        </div>

                      </div>

                      <div className="cp-photo-meta">

                        <strong>
                          Evidence {index + 1}
                        </strong>

                        <span>
                          {image.width} ×{" "}
                          {image.height}
                        </span>

                        <span>
                          {formatImageSize(
                            image.compressedSize
                          )}
                        </span>

                      </div>

                    </article>

                  )
                )}

                {images.length <
                  IMAGE_LIMITS.maxFiles && (

                  <button
                    type="button"
                    className="cp-add-more"
                    onClick={
                      handleGallery
                    }
                    disabled={
                      processing
                    }
                  >
                    <span>
                      +
                    </span>

                    <strong>
                      Add Photo
                    </strong>

                    <small>
                      {IMAGE_LIMITS.maxFiles -
                        images.length}{" "}
                      slots left
                    </small>
                  </button>

                )}

              </div>

            )}

          </section>

          <div className="cp-photo-footer">

            <button
              type="button"
              className="cp-back-btn"
              onClick={() =>
                navigate("/report")
              }
            >
              ← Back
            </button>

            <button
              type="button"
              className="cp-primary-btn cp-next-btn"
              onClick={
                handleContinue
              }
              disabled={
                !canContinue
              }
            >
              Continue to AI Analysis
              <span>→</span>
            </button>

          </div>

        </main>

        <aside className="cp-photo-sidebar">

          <div className="cp-info-card">

            <div className="cp-info-icon">
              ✨
            </div>

            <h3>
              Better photos = better analysis
            </h3>

            <p>
              Help the AI identify the issue
              accurately by showing the problem
              clearly.
            </p>

            <ul>
              <li>
                Photograph the issue from a
                useful distance.
              </li>

              <li>
                Keep the image sharp and
                well-lit.
              </li>

              <li>
                Include surrounding context
                when possible.
              </li>

              <li>
                Avoid unrelated photos.
              </li>
            </ul>

          </div>

          <div className="cp-info-card cp-security-card">

            <div className="cp-info-icon">
              🔒
            </div>

            <h3>
              Evidence handling
            </h3>

            <p>
              Images are currently stored
              locally for this frontend build.
              Secure cloud storage will be
              connected during backend integration.
            </p>

          </div>

          <div className="cp-photo-flow-card">

            <span>
              YOUR REPORT
            </span>

            <div className="cp-mini-flow">
              <b>
                1
              </b>

              <div>
                Issue
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                2
              </b>

              <div>
                Location
              </div>
            </div>

            <div className="cp-mini-flow active">
              <b>
                3
              </b>

              <div>
                Photos
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                4
              </b>

              <div>
                AI Analysis
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                5
              </b>

              <div>
                Civic Report
              </div>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}
