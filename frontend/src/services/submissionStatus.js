const STATUS_KEY =
  "citypulse_submission_status";

export function setSubmissionStatus(
  status,
  message = ""
) {

  const value = {
    status,
    message,
    updatedAt:
      new Date().toISOString()
  };

  localStorage.setItem(
    STATUS_KEY,
    JSON.stringify(value)
  );

  return value;
}

export function getSubmissionStatus() {

  try {

    const raw =
      localStorage.getItem(
        STATUS_KEY
      );

    return raw
      ? JSON.parse(raw)
      : {
          status: "idle",
          message: ""
        };

  } catch {

    return {
      status: "idle",
      message: ""
    };
  }
}

export function clearSubmissionStatus() {

  localStorage.removeItem(
    STATUS_KEY
  );
}
