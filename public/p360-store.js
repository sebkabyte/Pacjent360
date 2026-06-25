/**
 * @file p360-store.js
 * @description Pacjent360 — Moja Historia: local-first IndexedDB storage layer.
 *
 * All patient data stays on the device. No backend, no external APIs.
 * Uses raw IndexedDB API with crypto.randomUUID() for IDs.
 *
 * PROTOTYP — To nie jest porada medyczna.
 *
 * @version 1.0.0
 * @license MPL-2.0
 */

/* global self */
;(function (root) {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────
  const DB_NAME = 'pacjent360-moja-historia';
  const DB_VERSION = 2;

  /** @type {string[]} Object store names for collections */
  const STORES = ['dokumenty', 'leki', 'pytania', 'objawy', 'wyniki', 'wizyty', 'profil'];

  /** @type {string[]} Collections with UUID-keyed records */
  const COLLECTIONS = ['dokumenty', 'leki', 'pytania', 'objawy', 'wyniki', 'wizyty'];

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Generate a new UUID v4 identifier.
   * @returns {string}
   */
  function newId() {
    return crypto.randomUUID();
  }

  /**
   * Get current ISO 8601 timestamp.
   * @returns {string}
   */
  function now() {
    return new Date().toISOString();
  }

  /**
   * Wrap an IndexedDB request in a Promise.
   * @param {IDBRequest} request
   * @returns {Promise<*>}
   */
  function promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Wrap an IndexedDB transaction completion in a Promise.
   * @param {IDBTransaction} tx
   * @returns {Promise<void>}
   */
  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new DOMException('Transaction aborted', 'AbortError'));
    });
  }

  // ── Database lifecycle ─────────────────────────────────────────────────

  /** @type {IDBDatabase|null} */
  let _db = null;

  /**
   * Open (or create) the IndexedDB database.
   * Creates all required object stores on first run or version upgrade.
   * @returns {Promise<IDBDatabase>}
   */
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = /** @type {IDBDatabase} */ (event.target).result;

        // Collections: keyPath = 'id'
        for (const name of COLLECTIONS) {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: 'id' });

            // Indexes per collection
            switch (name) {
              case 'dokumenty':
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                break;
              case 'leki':
                store.createIndex('active', 'active', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('name', 'name', { unique: false });
                break;
              case 'pytania':
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('answered', 'answered', { unique: false });
                store.createIndex('visitId', 'visitId', { unique: false });
                break;
              case 'objawy':
                store.createIndex('bodyArea', 'bodyArea', { unique: false });
                store.createIndex('severity', 'severity', { unique: false });
                store.createIndex('startDate', 'startDate', { unique: false });
                break;
              case 'wyniki':
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('unit', 'unit', { unique: false });
                break;
              case 'wizyty':
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('doctor', 'doctor', { unique: false });
                break;
            }
          }
        }

        // Profile: singleton store with fixed key
        if (!db.objectStoreNames.contains('profil')) {
          db.createObjectStore('profil', { keyPath: '_key' });
        }
      };

      request.onsuccess = () => {
        _db = request.result;
        resolve(_db);
      };

      request.onerror = () => {
        reject(new Error(`Nie udało się otworzyć bazy danych: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get the active database connection (initialise if needed).
   * @returns {Promise<IDBDatabase>}
   */
  async function getDb() {
    if (_db) return _db;
    return openDatabase();
  }

  // ── Collection CRUD factory ────────────────────────────────────────────

  /**
   * @typedef {Object} CollectionAPI
   * @property {function(Object): Promise<Object>} add     — Add a new record
   * @property {function(): Promise<Object[]>}      getAll  — Get all records
   * @property {function(string): Promise<Object|undefined>} get — Get by ID
   * @property {function(string, Object): Promise<Object>} update — Partial update
   * @property {function(string): Promise<void>}    remove  — Delete by ID
   * @property {function(): Promise<number>}         count   — Count records
   * @property {function(string, *): Promise<Object[]>} getByIndex — Query by index
   */

  /**
   * Create a CRUD API for a named IndexedDB object store.
   * @param {string} storeName
   * @returns {CollectionAPI}
   */
  function createCollectionAPI(storeName) {
    return {
      /**
       * Add a new record. Assigns `id`, `createdAt`, `updatedAt` automatically.
       * @param {Object} data — Record data (without `id`)
       * @returns {Promise<Object>} The saved record with generated ID
       */
      async add(data) {
        const db = await getDb();
        const record = {
          ...data,
          id: data.id || newId(),
          createdAt: data.createdAt || now(),
          updatedAt: now(),
        };
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(record);
        await txDone(tx);
        return record;
      },

      /**
       * Get all records from the store.
       * @returns {Promise<Object[]>}
       */
      async getAll() {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readonly');
        const result = await promisify(tx.objectStore(storeName).getAll());
        return result || [];
      },

      /**
       * Get a single record by its ID.
       * @param {string} id
       * @returns {Promise<Object|undefined>}
       */
      async get(id) {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readonly');
        return promisify(tx.objectStore(storeName).get(id));
      },

      /**
       * Update a record by merging `changes` into the existing record.
       * @param {string} id
       * @param {Object} changes — Partial fields to update
       * @returns {Promise<Object>} The updated record
       * @throws {Error} If the record does not exist
       */
      async update(id, changes) {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const existing = await promisify(store.get(id));

        if (!existing) {
          throw new Error(`Rekord o id "${id}" nie istnieje w "${storeName}".`);
        }

        const updated = {
          ...existing,
          ...changes,
          id,                   // Prevent overwriting the key
          updatedAt: now(),
        };
        store.put(updated);
        await txDone(tx);
        return updated;
      },

      /**
       * Remove a record by ID.
       * @param {string} id
       * @returns {Promise<void>}
       */
      async remove(id) {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(id);
        await txDone(tx);
      },

      /**
       * Count all records in the store.
       * @returns {Promise<number>}
       */
      async count() {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readonly');
        return promisify(tx.objectStore(storeName).count());
      },

      /**
       * Query records by an indexed field.
       * @param {string} indexName — Name of the index
       * @param {*} value — Value to match
       * @returns {Promise<Object[]>}
       */
      async getByIndex(indexName, value) {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readonly');
        const index = tx.objectStore(storeName).index(indexName);
        const result = await promisify(index.getAll(value));
        return result || [];
      },
    };
  }

  // ── Profile API (singleton) ────────────────────────────────────────────

  const PROFILE_KEY = 'main';

  /**
   * @typedef {Object} ProfileAPI
   * @property {function(): Promise<Object|null>} get — Get the patient profile
   * @property {function(Object): Promise<Object>} set — Create or update profile
   */

  /** @type {ProfileAPI} */
  const profileAPI = {
    /**
     * Get the patient profile.
     * @returns {Promise<Object|null>} The profile data, or null if not set
     */
    async get() {
      const db = await getDb();
      const tx = db.transaction('profil', 'readonly');
      const record = await promisify(tx.objectStore('profil').get(PROFILE_KEY));
      if (!record) return null;

      // Strip internal key before returning
      const { _key, ...data } = record;
      return data;
    },

    /**
     * Create or fully replace the patient profile.
     * @param {Object} data — Profile fields
     * @returns {Promise<Object>} The saved profile
     */
    async set(data) {
      const db = await getDb();
      const record = {
        ...data,
        _key: PROFILE_KEY,
        lastUpdated: now(),
      };
      const tx = db.transaction('profil', 'readwrite');
      tx.objectStore('profil').put(record);
      await txDone(tx);

      const { _key, ...result } = record;
      return result;
    },
  };

  // ── Utility methods ────────────────────────────────────────────────────

  /**
   * Export all data as a serialisable object.
   * Suitable for JSON.stringify and file download.
   * @returns {Promise<Object>} All collections + profile
   */
  async function exportAll() {
    const db = await getDb();
    const result = {
      _meta: {
        app: 'Pacjent360 — Moja Historia',
        version: DB_VERSION,
        exportedAt: now(),
        disclaimer: 'PROTOTYP — To nie jest porada medyczna.',
      },
    };

    for (const storeName of COLLECTIONS) {
      const tx = db.transaction(storeName, 'readonly');
      result[storeName] = await promisify(tx.objectStore(storeName).getAll());
    }

    result.profil = await profileAPI.get();

    return result;
  }

  /**
   * Import data from a previously exported JSON object.
   * Merges into existing data (put = upsert).
   * @param {Object} data — The exported object
   * @returns {Promise<{imported: Object<string, number>}>} Count of imported records per store
   */
  async function importAll(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Nieprawidłowy format danych importu.');
    }

    const db = await getDb();
    const counts = {};

    for (const storeName of COLLECTIONS) {
      const records = data[storeName];
      if (!Array.isArray(records)) continue;

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const record of records) {
        if (record && record.id) {
          store.put(record);
        }
      }
      await txDone(tx);
      counts[storeName] = records.length;
    }

    // Import profile
    if (data.profil && typeof data.profil === 'object') {
      await profileAPI.set(data.profil);
      counts.profil = 1;
    }

    return { imported: counts };
  }

  /**
   * Clear all data from every object store.
   * ⚠️  Irreversible operation.
   * @returns {Promise<void>}
   */
  async function clearAll() {
    const db = await getDb();

    for (const storeName of STORES) {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      await txDone(tx);
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * @namespace P360Store
   * @description Local-first storage for Pacjent360 — Moja Historia.
   *
   * Usage:
   * ```js
   * await P360Store.init();
   * await P360Store.documents.add({ title: 'Wypis', type: 'wypis', date: '2025-01-15' });
   * const allDocs = await P360Store.documents.getAll();
   * ```
   */
  const P360Store = {
    /** Database name constant */
    DB_NAME,

    /** Database version constant */
    DB_VERSION,

    /**
     * Initialise the database connection.
     * Must be called before any other operations.
     * @returns {Promise<void>}
     */
    async init() {
      await openDatabase();
    },

    // ── Collections (CRUD) ────────────────────────────────────────────

    /**
     * Dokumenty medyczne (medical documents).
     * Schema: { id, title, type, date, description, category, tags[], imageDataUrl, createdAt, updatedAt }
     * type: 'wypis' | 'wynik' | 'skierowanie' | 'recepta' | 'inny'
     * @type {CollectionAPI}
     */
    documents: createCollectionAPI('dokumenty'),

    /**
     * Leki (medications).
     * Schema: { id, name, dose, frequency, type, prescribedBy, startDate, endDate, active, notes, createdAt, updatedAt }
     * type: 'przepisany' | 'przyjmowany' | 'OTC' | 'suplement'
     * @type {CollectionAPI}
     */
    medications: createCollectionAPI('leki'),

    /**
     * Pytania (questions — never "diagnoza" or clinical language).
     * Schema: { id, text, category, priority, answered, answer, visitId, createdAt }
     * category: 'do_lekarza' | 'do_farmaceuty' | 'do_wyjaśnienia'
     * @type {CollectionAPI}
     */
    questions: createCollectionAPI('pytania'),

    /**
     * Objawy (symptoms).
     * Schema: { id, description, bodyArea, severity (1-5), startDate, frequency, notes, createdAt }
     * @type {CollectionAPI}
     */
    symptoms: createCollectionAPI('objawy'),

    /**
     * Wyniki w czasie (result observations).
     * Schema: { id, name, type, unit, normalMin, normalMax, rangeLabel, values[], createdAt, updatedAt }
     * values[]: { date, value, sourceRefs[] }
     * @type {CollectionAPI}
     */
    results: createCollectionAPI('wyniki'),

    /**
     * Wizyty (visits).
     * Schema: { id, date, doctor, specialty, facility, purpose, status, notes, questionIds[], documentIds[], createdAt }
     * status: 'planowana' | 'odbyta' | 'odwołana'
     * @type {CollectionAPI}
     */
    visits: createCollectionAPI('wizyty'),

    // ── Profile (singleton) ───────────────────────────────────────────

    /**
     * Profil pacjenta (patient profile — singleton).
     * Schema: { name, birthYear, bloodType, allergies[], chronicConditions[], emergencyContact, lastUpdated }
     * @type {ProfileAPI}
     */
    profile: profileAPI,

    // ── Utilities ─────────────────────────────────────────────────────

    /**
     * Export all data as a JSON-serialisable object.
     * @returns {Promise<Object>}
     */
    exportAll,

    /**
     * Import data from a previously exported object.
     * @param {Object} data
     * @returns {Promise<{imported: Object<string, number>}>}
     */
    importAll,

    /**
     * Clear all data from all stores. ⚠️  Irreversible.
     * @returns {Promise<void>}
     */
    clearAll,

    /**
     * Close the database connection. Useful for cleanup / testing.
     */
    close() {
      if (_db) {
        _db.close();
        _db = null;
      }
    },

    /**
     * Destroy the entire database. ⚠️ Nuclear option.
     * @returns {Promise<void>}
     */
    async destroy() {
      this.close();
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Baza danych jest zablokowana — zamknij inne karty.'));
      });
    },
  };

  // ── UMD export ─────────────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = P360Store;
  } else {
    root.P360Store = P360Store;
  }

})(typeof self !== 'undefined' ? self : this);
