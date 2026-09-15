const DB_NAME = "citypulse-offline";
const DB_VERSION = 1;

const REPORT_STORE = "pendingReports";
const META_STORE = "metadata";

function openDatabase() {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames.contains(
              REPORT_STORE
            )
          ) {
            const store =
              db.createObjectStore(
                REPORT_STORE,
                {
                  keyPath: "localId"
                }
              );

            store.createIndex(
              "createdAt",
              "createdAt",
              {
                unique: false
              }
            );

            store.createIndex(
              "status",
              "status",
              {
                unique: false
              }
            );
          }

          if (
            !db.objectStoreNames.contains(
              META_STORE
            )
          ) {
            db.createObjectStore(
              META_STORE,
              {
                keyPath: "key"
              }
            );
          }
        };

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ||
              new Error(
                "Unable to open offline database."
              )
          );
        };
    }
  );
}

function transaction(
  storeName,
  mode
) {
  return openDatabase().then(
    (db) => ({
      db,
      tx:
        db.transaction(
          storeName,
          mode
        )
    })
  );
}

export async function queueOfflineReport(
  report
) {
  const localId =
    `offline-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

  const record = {
    localId,
    report,
    status: "pending",
    attempts: 0,
    lastError: "",
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  };

  const { db, tx } =
    await transaction(
      REPORT_STORE,
      "readwrite"
    );

  await new Promise(
    (resolve, reject) => {
      const request =
        tx.objectStore(
          REPORT_STORE
        ).put(record);

      request.onsuccess =
        () => resolve();

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );

  db.close();

  return record;
}

export async function getPendingReports() {
  const { db, tx } =
    await transaction(
      REPORT_STORE,
      "readonly"
    );

  const records =
    await new Promise(
      (resolve, reject) => {
        const request =
          tx.objectStore(
            REPORT_STORE
          ).getAll();

        request.onsuccess =
          () =>
            resolve(
              request.result || []
            );

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );

  db.close();

  return records.sort(
    (a, b) =>
      new Date(
        a.createdAt
      ) -
      new Date(
        b.createdAt
      )
  );
}

export async function getPendingCount() {
  const records =
    await getPendingReports();

  return records.filter(
    (record) =>
      record.status ===
      "pending"
  ).length;
}

export async function updateOfflineReport(
  localId,
  updates
) {
  const { db, tx } =
    await transaction(
      REPORT_STORE,
      "readwrite"
    );

  const store =
    tx.objectStore(
      REPORT_STORE
    );

  const existing =
    await new Promise(
      (resolve, reject) => {
        const request =
          store.get(localId);

        request.onsuccess =
          () =>
            resolve(
              request.result
            );

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );

  if (!existing) {
    db.close();

    throw new Error(
      "Offline report not found."
    );
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt:
      new Date().toISOString()
  };

  await new Promise(
    (resolve, reject) => {
      const request =
        store.put(updated);

      request.onsuccess =
        () => resolve();

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );

  db.close();

  return updated;
}

export async function removeOfflineReport(
  localId
) {
  const { db, tx } =
    await transaction(
      REPORT_STORE,
      "readwrite"
    );

  await new Promise(
    (resolve, reject) => {
      const request =
        tx.objectStore(
          REPORT_STORE
        ).delete(localId);

      request.onsuccess =
        () => resolve();

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );

  db.close();
}

export async function clearOfflineReports() {
  const { db, tx } =
    await transaction(
      REPORT_STORE,
      "readwrite"
    );

  await new Promise(
    (resolve, reject) => {
      const request =
        tx.objectStore(
          REPORT_STORE
        ).clear();

      request.onsuccess =
        () => resolve();

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );

  db.close();
}

export async function setOfflineMeta(
  key,
  value
) {
  const { db, tx } =
    await transaction(
      META_STORE,
      "readwrite"
    );

  await new Promise(
    (resolve, reject) => {
      const request =
        tx.objectStore(
          META_STORE
        ).put({
          key,
          value
        });

      request.onsuccess =
        () => resolve();

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );

  db.close();
}

export async function getOfflineMeta(
  key
) {
  const { db, tx } =
    await transaction(
      META_STORE,
      "readonly"
    );

  const result =
    await new Promise(
      (resolve, reject) => {
        const request =
          tx.objectStore(
            META_STORE
          ).get(key);

        request.onsuccess =
          () =>
            resolve(
              request.result
                ?.value ?? null
            );

        request.onerror =
          () =>
            reject(
              request.error
            );
      }
    );

  db.close();

  return result;
}
