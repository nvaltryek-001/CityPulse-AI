export function isGpsSupported() {

  return Boolean(
    navigator &&
    navigator.geolocation
  );
}

export function getCurrentGps({
  highAccuracy = true,
  timeout = 15000,
  maximumAge = 0
} = {}) {

  return new Promise(
    (resolve, reject) => {

      if (!isGpsSupported()) {

        reject(
          new Error(
            "Browser GPS is not supported."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(

        position => {

          const latitude =
            Number(
              position.coords.latitude
            );

          const longitude =
            Number(
              position.coords.longitude
            );

          const accuracy =
            Number(
              position.coords.accuracy
            );

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {

            reject(
              new Error(
                "Invalid GPS coordinates received."
              )
            );

            return;
          }

          resolve({

            latitude,

            longitude,

            accuracy:
              Number.isFinite(accuracy)
                ? accuracy
                : null,

            capturedAt:
              new Date().toISOString()

          });

        },

        error => {

          let message =
            "Unable to get your location.";

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            message =
              "Location permission was denied.";
          }

          if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            message =
              "Your current location is unavailable.";
          }

          if (
            error.code ===
            error.TIMEOUT
          ) {
            message =
              "GPS request timed out.";
          }

          reject(
            new Error(message)
          );
        },

        {
          enableHighAccuracy:
            highAccuracy,

          timeout,

          maximumAge
        }
      );
    }
  );
}

export async function getRequiredGps() {

  const gps =
    await getCurrentGps({
      highAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    });

  if (
    gps.accuracy !== null &&
    gps.accuracy > 200
  ) {

    console.warn(
      "GPS accuracy is low:",
      gps.accuracy
    );
  }

  return gps;
}
