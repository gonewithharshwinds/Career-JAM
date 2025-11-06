const DB_NAME = 'CareerJAM-DB';
const DB_VERSION = 1;
let db;

/**
 * Initializes the IndexedDB database.
 * Creates object stores (tables) and indices.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject("Database error");
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            // Create 'companies' store first (parent)
            if (!db.objectStoreNames.contains('companies')) {
                const companyStore = db.createObjectStore('companies', { keyPath: 'id', autoIncrement: true });
                companyStore.createIndex('name', 'name', { unique: true });
            }

            // Create 'profiles' store
            if (!db.objectStoreNames.contains('profiles')) {
                db.createObjectStore('profiles', { keyPath: 'id', autoIncrement: true });
            }

            // Create 'people' store
            if (!db.objectStoreNames.contains('people')) {
                db.createObjectStore('people', { keyPath: 'id', autoIncrement: true });
            }

            // Create 'jobs' store (child)
            if (!db.objectStoreNames.contains('jobs')) {
                const jobStore = db.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
                jobStore.createIndex('status', 'status', { unique: false });
                jobStore.createIndex('company_id', 'company_id', { unique: false });
                jobStore.createIndex('profile_id', 'profile_id', { unique: false });
                jobStore.createIndex('created_at', 'created_at', { unique: false });
                jobStore.createIndex('salary', 'salary', { unique: false });
                jobStore.createIndex('match_percentage', 'match_percentage', { unique: false });
                jobStore.createIndex('title', 'title', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
    });
}

/**
 * Helper function to get an item by its key.
 */
function getItem(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Helper function to add an item.
 */
function addItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        request.onsuccess = (event) => resolve(event.target.result); // Returns the new key
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Helper function to update an item.
 */
function updateItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Helper function to delete an item.
 */
function deleteItem(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- Companies ---

export async function addCompany(company) {
    return await addItem('companies', company);
}

export async function getCompany(id) {
    return await getItem('companies', id);
}

export async function getCompanyByName(name) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('companies', 'readonly');
        const store = transaction.objectStore('companies');
        const index = store.index('name');
        const request = index.get(name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function updateCompany(company) {
    return await updateItem('companies', company);
}

export async function getAllCompanies() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('companies', 'readonly');
        const store = transaction.objectStore('companies');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- Profiles ---

export async function addProfile(profile) {
    return await addItem('profiles', profile);
}

export async function getProfile(id) {
    return await getItem('profiles', id);
}

export async function deleteProfile(id) {
    return await deleteItem('profiles', id);
}

export async function getAllProfiles() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('profiles', 'readonly');
        const store = transaction.objectStore('profiles');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- People ---

export async function addPerson(person) {
    return await addItem('people', person);
}

export async function getAllPeople() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('people', 'readonly');
        const store = transaction.objectStore('people');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function updatePersonNotes(id, notes) {
    const person = await getItem('people', id);
    if (person) {
        person.notes = notes;
        return await updateItem('people', person);
    }
}


// --- Jobs ---

export async function addJob(job) {
    return await addItem('jobs', job);
}

export async function getJob(id) {
    return await getItem('jobs', id);
}

export async function updateJob(job) {
    return await updateItem('jobs', job);
}

export async function updateJobNotes(id, notes) {
    const job = await getItem('jobs', id);
    if (job) {
        job.notes = notes;
        return await updateItem('jobs', job);
    }
}

export async function getJobCount(status) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index('status');
        const request = index.count(status);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function getJobsByCompanyId(companyId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index('company_id');
        const request = index.getAll(companyId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Gets paginated and sorted jobs.
 */
export async function getPaginatedJobs(status, sortBy, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        const [sortKey, sortOrder] = sortBy.split(' ');
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index(sortKey === 'company_name' ? 'company_id' : sortKey);

        const results = [];
        let skipped = 0;
        const skipCount = (page - 1) * itemsPerPage;

        // Note: This implementation is complex because IndexedDB cursors
        // are the only way to do sorting + filtering + pagination.
        // We filter by status *manually* if not sorting by it.

        const range = sortKey === 'status' ? IDBKeyRange.only(status) : null;
        const direction = sortOrder === 'DESC' ? 'prev' : 'next';

        const request = index.openCursor(range, direction);

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (sortKey !== 'status' && cursor.value.status !== status) {
                    cursor.continue(); // Skip if status doesn't match
                    return;
                }

                if (skipped < skipCount) {
                    skipped++;
                    cursor.continue();
                    return;
                }

                if (results.length < itemsPerPage) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results); // Page is full
                }
            } else {
                resolve(results); // No more results
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- Backup & Restore ---

/**
 * Exports all database stores to a JSON string.
 */
export async function exportDB() {
    const stores = ['companies', 'profiles', 'people', 'jobs'];
    const exportData = {};

    const transaction = db.transaction(stores, 'readonly');

    for (const storeName of stores) {
        exportData[storeName] = await new Promise((resolve, reject) => {
            const request = transaction.objectStore(storeName).getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    return JSON.stringify(exportData, null, 2);
}

/**
 * Imports data from a JSON string, clearing existing data.
 */
export async function importDB(jsonString) {
    const data = JSON.parse(jsonString);
    const stores = ['companies', 'profiles', 'people', 'jobs'];

    const transaction = db.transaction(stores, 'readwrite');

    for (const storeName of stores) {
        await new Promise((resolve, reject) => {
            const request = transaction.objectStore(storeName).clear();
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });

        if (data[storeName]) {
            for (const item of data[storeName]) {
                await new Promise((resolve, reject) => {
                    const request = transaction.objectStore(storeName).add(item);
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject(event.target.error);
                });
            }
        }
    }
} 
