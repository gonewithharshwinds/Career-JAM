// --- IndexedDB Database Functions ---
// (Your provided code is prepended here, with 'export' keywords removed
// and new helper functions added)

const DB_NAME = 'CareerJAM-DB';
const DB_VERSION = 1;
let db;

/**
 * Initializes the IndexedDB database.
 * Creates object stores (tables) and indices.
 */
function initDB() {
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

async function addCompany(company) {
    return await addItem('companies', company);
}

async function getCompany(id) {
    return await getItem('companies', id);
}

async function getCompanyByName(name) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('companies', 'readonly');
        const store = transaction.objectStore('companies');
        const index = store.index('name');
        const request = index.get(name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function updateCompany(company) {
    return await updateItem('companies', company);
}

async function getAllCompanies() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('companies', 'readonly');
        const store = transaction.objectStore('companies');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// --- Profiles ---

async function addProfile(profile) {
    return await addItem('profiles', profile);
}

async function getProfile(id) {
    return await getItem('profiles', id);
}

async function deleteProfile(id) {
    return await deleteItem('profiles', id);
}

async function getAllProfiles() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('profiles', 'readonly');
        const store = transaction.objectStore('profiles');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// NEW: Helper function to update profile notes
async function updateProfile(profile) {
    return await updateItem('profiles', profile);
}

// --- People ---

async function addPerson(person) {
    return await addItem('people', person);
}

async function getAllPeople() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('people', 'readonly');
        const store = transaction.objectStore('people');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function updatePersonNotes(id, notes) {
    const person = await getItem('people', id);
    if (person) {
        person.notes = notes;
        return await updateItem('people', person);
    }
}


// --- Jobs ---

async function addJob(job) {
    return await addItem('jobs', job);
}

async function getJob(id) {
    return await getItem('jobs', id);
}

async function updateJob(job) {
    return await updateItem('jobs', job);
}

async function updateJobNotes(id, notes) {
    const job = await getItem('jobs', id);
    if (job) {
        job.notes = notes;
        return await updateItem('jobs', job);
    }
}

async function getJobCount(status) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index('status');
        const request = index.count(status);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getJobsByCompanyId(companyId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index('company_id');
        const request = index.getAll(companyId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// NEW: Helper function to find jobs linked to a profile
async function getJobsByProfileId(profileId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index('profile_id');
        const request = index.getAll(profileId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}


/**
 * Gets paginated and sorted jobs.
 */
async function getPaginatedJobs(status, sortBy, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        const [sortKey, sortOrder] = sortBy.split(' ');

        // Handle the company name sort by mapping it to company_id
        // This will sort by ID, not name, but matches the schema.
        const effectiveSortKey = sortKey === 'company_name' ? 'company_id' : sortKey;

        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const index = store.index(effectiveSortKey);

        const results = [];
        let skipped = 0;
        const skipCount = (page - 1) * itemsPerPage;

        // Note: This implementation is complex because IndexedDB cursors
        // are the only way to do sorting + filtering + pagination.
        // We filter by status *manually* if not sorting by it.

        const range = effectiveSortKey === 'status' ? IDBKeyRange.only(status) : null;
        const direction = sortOrder === 'DESC' ? 'prev' : 'next';

        const request = index.openCursor(range, direction);

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (effectiveSortKey !== 'status' && cursor.value.status !== status) {
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
async function exportDB() {
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
async function importDB(jsonString) {
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
                    // Remove 'id' if it's null/undefined to allow autoIncrement
                    if (item.id === null || typeof item.id === 'undefined') {
                        delete item.id;
                    }
                    const request = transaction.objectStore(storeName).add(item);
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => {
                        // Log error but don't stop import
                        console.warn(`Failed to import item into ${storeName}:`, event.target.error, item);
                        resolve();
                    };
                });
            }
        }
    }
}


// --- End of IndexedDB Functions ---


document.addEventListener('DOMContentLoaded', async () => {
    const JOB_STATUSES = ['Bookmarked', 'Applying', 'Applied', 'Interviewing', 'Negotiating', 'Accepted', 'Spam', 'Rejected'];
    // 'db' is already declared in the prepended DB code
    let currentJobViewStatus = 'Bookmarked';
    let currentSortOrder = 'created_at DESC';
    let currentOpenJobId = null;
    let logs = [];
    let unsavedAnalysisData = null;
    let currentJobsView = 'table'; // 'table' or 'kanban'
    let companyMap = new Map(); // NEW: To cache company names by ID

    // NEW: App state variables
    let appState = {
        autoCreateCompany: true,
        currentPage: 1,
        itemsPerPage: 10,
        theme: 'Humanist Dark', // NEW: Theme state
        // REPLACED: columnVisibility (object) with columnConfig (array) to store order
        columnConfig: [
            { key: 'title', label: 'Job Position', visible: true },
            { key: 'company_name', label: 'Company', visible: true },
            { key: 'location', label: 'Location', visible: true },
            { key: 'salary', label: 'Salary (LPA)', visible: true },
            { key: 'url', label: 'URL', visible: true },
            { key: 'description', label: 'Description', visible: false },
            { key: 'profile_id', label: 'Applied Profile', visible: true },
            { key: 'match_percentage', label: 'Match %', visible: true },
            { key: 'status', label: 'Status', visible: true },
            { key: 'notes', label: 'Notes', visible: true },
            { key: 'created_at', label: 'Date Saved', visible: true }
        ]
    };

    // Column definitions
    const COLUMN_DEFINITIONS = {
        title: "Job Position",
        company_name: "Company", // This key is used for label, but sorting will use company_id
        location: "Location",
        salary: "Salary (LPA)",
        url: "URL",
        description: "Description",
        profile_id: "Applied Profile",
        match_percentage: "Match %",
        status: "Status",
        notes: "Notes",
        created_at: "Date Saved"
    };

    // --- DOM Elements ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const jobsListView = document.getElementById('jobs-list-container');
    const jobDetailView = document.getElementById('job-detail-container');
    const views = document.querySelectorAll('.view-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const statusFooter = document.getElementById('status-footer');
    const jobsTableBody = document.getElementById('jobs-table-body');
    const jobsTableContainer = document.getElementById('jobs-table-container');
    const jobsKanbanContainer = document.getElementById('jobs-kanban-container');
    const showTableViewBtn = document.getElementById('show-table-view');
    const showKanbanViewBtn = document.getElementById('show-kanban-view');
    const statusTabs = document.getElementById('status-tabs');
    const sortControls = document.getElementById('sort-controls');
    // NEW: Pagination elements
    const paginationControls = document.getElementById('pagination-controls');
    const itemsPerPageSelect = document.getElementById('items-per-page-select');
    const pageInfo = document.getElementById('page-info');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    // NEW: Column toggle elements
    const manageColumnsBtn = document.getElementById('manage-columns-btn');
    const manageColumnsPopover = document.getElementById('manage-columns-popover');
    // NEW: Company view elements
    const companyGridContainer = document.getElementById('company-grid-container');
    const companyDetailContainer = document.getElementById('company-detail-container');
    const companyGrid = document.getElementById('company-grid');
    const companySearchInput = document.getElementById('company-search-input');
    const backToCompanyGridBtn = document.getElementById('back-to-company-grid');
    const editCompanyForm = document.getElementById('edit-company-form');
    const relatedJobsList = document.getElementById('related-jobs-list');
    // NEW: Settings elements
    const autoCreateCompanyToggle = document.getElementById('auto-create-company-toggle');
    const themeSelect = document.getElementById('theme-select');

    // REMOVED: Merge Modal Elements (no longer needed)
    // const mergeCompanyModal = document.getElementById('merge-company-modal');
    // const mergeCompanyText = document.getElementById('merge-company-text');
    // const confirmMergeBtn = document.getElementById('confirm-merge-btn');
    // const cancelMergeBtn = document.getElementById('cancel-merge-btn');


    // --- Utility Functions ---
    function showLoading(text) {
        loadingText.textContent = text;
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    }
    // ... (unchanged helper functions: showLoading, hideLoading, openModal) ...

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.querySelector('.modal-content').classList.add('scale-95');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('flex');
            // REMOVED: merge-company-modal check
            modal.querySelector('form')?.reset();
        }, 300);
    }

    function logEvent(type, message) {
        const timestamp = new Date().toISOString();
        logs.unshift({ timestamp, type, message });
        if (logs.length > 200) logs.pop(); // Keep logs from getting too big
        if (document.getElementById('logs-view').offsetParent !== null) {
            renderLogs();
        }
    }

    // UPDATED: Persistent Footer
    function showStatus(message, type = 'info') {
        const colors = { info: 'text-muted-foreground', success: 'text-green-400', error: 'text-destructive' };
        statusFooter.textContent = message;
        statusFooter.className = `bg-card text-center py-1 px-4 text-sm ${colors[type] || 'text-muted-foreground'} border-t border-border z-10 transition-all duration-300`;
    }

    function switchView(viewId) {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            }
        });
        if (viewId === 'jobs-view') {
            refreshJobsView(); // Refresh jobs view when switching to it
        }
        if (viewId === 'logs-view') renderLogs();
        if (viewId === 'profiles-view') renderProfiles();
        if (viewId === 'companies-view') {
            companyGridContainer.classList.remove('hidden');
            companyDetailContainer.classList.add('hidden');
            renderCompaniesGrid(); // Render company grid
        }
        logEvent('INFO', `Switched to view: ${viewId}`);
    }

    // --- App Initialization ---
    async function init() {
        showLoading('Initializing Database...');
        logEvent('INFO', 'Application initialization started.');
        try {
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
            const savedDb = localStorage.getItem('auto-backup-db');
            if (savedDb) {
                const Uints = new Uint8Array(savedDb.split(',').map(Number));
                db = new SQL.Database(Uints);
                logEvent('SUCCESS', 'Database loaded from auto-backup.');
            } else {
                db = new SQL.Database();
                logEvent('INFO', 'New database created.');
            }

            await createTables();
            loadSettings(); // Load settings early to apply theme
            renderStatusTabs();
            renderColumnToggles();
            await Promise.all([
                refreshJobsView(),
                renderCompaniesGrid(),
                renderPeople(),
                renderProfiles()
            ]);
            setupEventListeners();
            logEvent('SUCCESS', 'Application initialized successfully.');
            showStatus('Ready', 'info'); // Set initial status
        } catch (err) {
            console.error("Initialization failed:", err);
            logEvent('ERROR', `Initialization failed: ${err.message}`);
            showStatus('Initialization failed. Check logs.', 'error');
        } finally {
            hideLoading();
        }
    }

    // --- Database Logic ---
    async function createTables() {
        db.exec(`
            CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, title TEXT, company_name TEXT, location TEXT, salary REAL, url TEXT, description TEXT, status TEXT DEFAULT 'Bookmarked', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY, name TEXT UNIQUE, industry TEXT, location TEXT, website TEXT, linkedin TEXT);
            CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, job_title TEXT, company_name TEXT, email TEXT, linkedin TEXT);
            CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY, name TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        `);

        // Safely add new columns for existing users
        const tables = ['jobs', 'companies', 'people', 'profiles'];
        tables.forEach(table => {
            const colsRes = db.exec(`PRAGMA table_info(${table})`);
            const cols = colsRes.length > 0 ? colsRes[0].values.map(col => col[1]) : [];

            if (!cols.includes('notes')) {
                db.exec(`ALTER TABLE ${table} ADD COLUMN notes TEXT`);
                logEvent('INFO', `Upgraded database: Added notes column to ${table} table.`);
            }

            // Specific columns for 'jobs' table
            if (table === 'jobs') {
                if (!cols.includes('profile_id')) {
                    db.exec("ALTER TABLE jobs ADD COLUMN profile_id INTEGER REFERENCES profiles(id)");
                    logEvent('INFO', 'Upgraded database: Added profile_id column.');
                }
                if (!cols.includes('match_percentage')) {
                    db.exec("ALTER TABLE jobs ADD COLUMN match_percentage INTEGER");
                    logEvent('INFO', 'Upgraded database: Added match_percentage column.');
                }
                if (!cols.includes('ai_keywords')) {
                    db.exec("ALTER TABLE jobs ADD COLUMN ai_keywords TEXT");
                    logEvent('INFO', 'Upgraded database: Added ai_keywords column.');
                }
                if (!cols.includes('match_justification')) {
                    db.exec("ALTER TABLE jobs ADD COLUMN match_justification TEXT");
                    logEvent('INFO', 'Upgraded database: Added match_justification column.');
                }
            }
        });
    }

    function executeQuery(sql, params = []) {
        try {
            const result = db.exec(sql, params);
            if (!sql.trim().toUpperCase().startsWith("SELECT")) {
                autoBackupDatabase();
            }
            return result;
        } catch (e) {
            console.error("DB Error:", e, "Query:", sql, "Params:", params);
            logEvent('ERROR', `DB Error: ${e.message}`);
            showStatus('Database error occurred.', 'error');
            return null;
        }
    }

    // --- Rendering Logic ---

    // NEW: Function to toggle between Table and Kanban views
    function toggleJobsView(view) {
        currentJobsView = view;
        if (view === 'table') {
            showTableViewBtn.classList.add('active');
            showKanbanViewBtn.classList.remove('active');
            jobsTableContainer.classList.remove('hidden');
            jobsKanbanContainer.classList.add('hidden');
            statusTabs.classList.remove('hidden');
            sortControls.classList.remove('hidden');
            paginationControls.classList.remove('hidden'); // Show pagination
            renderJobs(currentJobViewStatus);
        } else {
            showTableViewBtn.classList.remove('active');
            showKanbanViewBtn.classList.add('active');
            jobsTableContainer.classList.add('hidden');
            jobsKanbanContainer.classList.remove('hidden');
            statusTabs.classList.add('hidden');
            sortControls.classList.add('hidden');
            paginationControls.classList.add('hidden'); // Hide pagination
            renderJobsKanban();
        }
        logEvent('INFO', `Switched to ${view} view.`);
    }

    // NEW: Main function to call the correct render function
    function refreshJobsView() {
        if (currentJobsView === 'table') {
            renderJobs(currentJobViewStatus);
        } else {
            renderJobsKanban();
        }
    }

    function renderLogs() {
        const tableBody = document.getElementById('logs-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = logs.map(log => {
            const typeClass = { 'INFO': 'text-blue-400', 'SUCCESS': 'text-green-400', 'ERROR': 'text-destructive' }[log.type] || 'text-muted-foreground';
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">${new Date(log.timestamp).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-semibold ${typeClass}">${log.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${log.message}</td>
                </tr>`;
        }).join('');
    }

    function renderStatusTabs() {
        const tabsContainer = document.getElementById('status-tabs');
        tabsContainer.innerHTML = JOB_STATUSES.map(status => `<button class="status-tab border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition whitespace-nowrap" data-status="${status}">${status}</button>`).join('');
        updateActiveTab();
    }

    function updateActiveTab() {
        document.querySelectorAll('.status-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.status === currentJobViewStatus);
        });
    }

    // UPDATED: renderJobs (Table View) - Now with Pagination and Column Visibility
    async function renderJobs(status) {
        // 1. Get total count for pagination
        const countRes = executeQuery(`SELECT COUNT(*) FROM jobs WHERE status = ?`, [status]);
        const totalItems = countRes[0].values[0][0];
        const totalPages = Math.ceil(totalItems / appState.itemsPerPage);
        appState.currentPage = Math.min(appState.currentPage, totalPages) || 1;

        renderPaginationControls(totalItems, totalPages);

        // 2. Get profiles for dropdown
        const profilesRes = executeQuery("SELECT id, name FROM profiles ORDER BY name");
        const profiles = profilesRes.length > 0 ? profilesRes[0].values : [];

        // 3. Get paginated job data
        const offset = (appState.currentPage - 1) * appState.itemsPerPage;
        const res = executeQuery(`SELECT j.id, j.title, j.company_name, j.location, j.status, j.created_at, j.profile_id, j.match_percentage, j.notes, j.salary, j.url, j.description FROM jobs j WHERE j.status = ? ORDER BY ${currentSortOrder} LIMIT ? OFFSET ?`, [status, appState.itemsPerPage, offset]);
        const jobs = res.length > 0 ? res[0].values : [];

        // 4. Render Table Head
        const tableHead = jobsTableContainer.querySelector('thead');
        tableHead.innerHTML = `
            <tr>
                ${appState.columnConfig.map(col => `
                    <th class="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider ${col.visible ? '' : 'hidden'}" data-col-key="${col.key}">
                        ${col.label}
                    </th>
                `).join('')}
            </tr>
        `;

        // 5. Render Table Body
        if (jobs.length === 0) {
            const colSpan = appState.columnConfig.filter(c => c.visible).length;
            jobsTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 text-muted-foreground">No jobs in this category.</td></tr>`;
            return;
        }

        jobsTableBody.innerHTML = jobs.map(row => {
            const [id, title, company_name, location, currentStatus, created_at, profile_id, match_percentage, notes, salary, url, description] = row;
            const profileOptionsHtml = `<option value="">- Select Profile -</option>` + profiles.map(p => `<option value="${p[0]}" ${p[0] === profile_id ? 'selected' : ''}>${p[1]}</option>`).join('');

            // Create an object from the row data for easy access by key
            const rowData = { id, title, company_name, location, currentStatus, created_at, profile_id, match_percentage, notes, salary, url, description };

            return `
                <tr class="job-row" data-id="${id}">
                    ${appState.columnConfig.map(col => {
                // Handle each cell based on its column key
                let content = '';
                switch (col.key) {
                    case 'title':
                    case 'company_name':
                    case 'location':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="details">${rowData[col.key] || 'N/A'}</td>`;
                        break;
                    case 'salary':
                        content = `<td class="px-6 py-4 whitespace-nowrap">${rowData.salary ? `₹${rowData.salary} LPA` : 'N/A'}</td>`;
                        break;
                    case 'url':
                        content = `<td class="px-6 py-4 whitespace-nowrap">
                                    ${rowData.url ? `<a href="${rowData.url}" target="_blank" class="text-primary hover:underline flex items-center"><span class="material-symbols-outlined text-sm mr-1">open_in_new</span>Link</a>` : 'N/A'}
                                </td>`;
                        break;
                    case 'description':
                        content = `<td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" title="${rowData.description || ''}">${(rowData.description || '').substring(0, 30)}${rowData.description && rowData.description.length > 30 ? '...' : ''}</td>`;
                        break;
                    case 'profile_id':
                        content = `<td class="px-6 py-4 whitespace-nowrap">
                                    <select data-job-id="${id}" class="profile-select editable-select text-sm">
                                        ${profileOptionsHtml}
                                    </select>
                                </td>`;
                        break;
                    case 'match_percentage':
                        content = `<td class="px-6 py-4 whitespace-nowrap text-center">
                                    <div class="flex items-center justify-center space-x-2">
                                        <span>${rowData.match_percentage === null || rowData.match_percentage === undefined ? 'N/A' : `${rowData.match_percentage}%`}</span>
                                        <button title="Run AI Match Analysis" class="analyze-match-btn text-primary hover:text-accent" data-job-id="${id}" ${!rowData.profile_id ? 'disabled' : ''}>
                                            <span class="material-symbols-outlined text-lg">biotech</span>
                                        </button>
                                    </div>
                                </td>`;
                        break;
                    case 'status':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="status" data-current-status="${rowData.currentStatus}">${rowData.currentStatus}</td>`;
                        break;
                    case 'notes':
                        content = `<td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="jobs" title="${rowData.notes || 'Click to add notes'}">${rowData.notes || ''}</td>`;
                        break;
                    case 'created_at':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="details">${new Date(rowData.created_at).toLocaleDateString()}</td>`;
                        break;
                }
                return col.visible ? content : content.replace('<td ', '<td class="hidden" ');
            }).join('')}
                </tr>`;
        }).join('');
    }

    // NEW: Render Pagination Controls
    function renderPaginationControls(totalItems, totalPages) {
        pageInfo.textContent = `Page ${appState.currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = appState.currentPage <= 1;
        nextPageBtn.disabled = appState.currentPage >= totalPages;
    }

    // NEW: Render Column Toggles - Now with drag and drop
    function renderColumnToggles() {
        manageColumnsPopover.innerHTML = appState.columnConfig.map((col, index) => `
            <div class="column-item" draggable="true" data-col-key="${col.key}">
                <span class="col-priority">${index + 1}</span>
                <span class="material-symbols-outlined drag-handle">drag_indicator</span>
                <label>
                    <input type="checkbox" data-col-key="${col.key}" class="h-4 w-4 rounded border-border text-primary focus:ring-primary" ${col.visible ? 'checked' : ''}>
                    <span class="text-sm">${col.label}</span>
                </label>
            </div>
        `).join('');

        // Add checkbox event listeners
        manageColumnsPopover.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const key = e.target.dataset.colKey;
                const colConfig = appState.columnConfig.find(c => c.key === key);
                if (colConfig) {
                    colConfig.visible = e.target.checked;
                }
                saveSettings(); // Save on toggle
                refreshJobsView(); // Re-render the table
            });
        });

        // Add drag/drop listeners
        setupColumnDragAndDrop();
    }

    // NEW: Drag and Drop for Columns
    function setupColumnDragAndDrop() {
        let draggedItem = null;

        manageColumnsPopover.querySelectorAll('.column-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                draggedItem?.classList.remove('dragging');
                draggedItem = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                if (target !== draggedItem && draggedItem) {
                    // Get bounding box of target
                    const rect = target.getBoundingClientRect();
                    // Get vertical center
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        target.parentNode.insertBefore(draggedItem, target);
                    } else {
                        target.parentNode.insertBefore(draggedItem, target.nextSibling);
                    }
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');

                    // Update the appState.columnConfig array based on the new DOM order
                    const newConfig = [];
                    manageColumnsPopover.querySelectorAll('.column-item').forEach(el => {
                        const key = el.dataset.colKey;
                        const config = appState.columnConfig.find(c => c.key === key);
                        if (config) {
                            newConfig.push(config);
                        }
                    });
                    appState.columnConfig = newConfig;

                    // Re-render popover to update numbers and re-render table
                    renderColumnToggles();
                    refreshJobsView();
                    saveSettings();
                }
            });
        });
    }


    // NEW: renderJobsKanban (Kanban View) - Now with Drag-and-Drop
    async function renderJobsKanban() {
        const res = executeQuery(`SELECT id, title, company_name, match_percentage, salary, status FROM jobs ORDER BY created_at DESC`);

        if (!res) {
            jobsKanbanContainer.innerHTML = `<p class="text-destructive p-4">Error loading Kanban data.</p>`;
            return;
        }

        const jobs = res.length > 0 ? res[0].values : [];

        const jobsByStatus = JOB_STATUSES.reduce((acc, status) => {
            acc[status] = [];
            return acc;
        }, {});

        jobs.forEach(row => {
            const [id, title, company_name, match_percentage, salary, status] = row;
            if (jobsByStatus[status]) {
                jobsByStatus[status].push({ id, title, company_name, match_percentage, salary, status });
            }
        });

        jobsKanbanContainer.innerHTML = `
            <div class="flex space-x-4 overflow-x-auto pb-4">
                ${JOB_STATUSES.map(status => `
                    <div class="kanban-column w-72 md:w-80 flex-shrink-0">
                        <h3 class="font-semibold p-3 bg-muted rounded-t-lg flex justify-between items-center text-sm uppercase tracking-wide">
                            <span>${status}</span>
                            <span class="text-xs font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">${jobsByStatus[status].length}</span>
                        </h3>
                        <div id="kanban-col-${status}" data-status="${status}" class="kanban-dropzone space-y-3 p-3 bg-card rounded-b-lg h-full overflow-y-auto" style="min-height: 50vh;">
                            ${jobsByStatus[status].length === 0 ? `<p class="text-sm text-muted-foreground p-2">No jobs here.</p>` : ''}
                            ${jobsByStatus[status].map(job => `
                                <div class="kanban-card p-3 bg-background rounded-lg shadow-sm cursor-pointer" data-id="${job.id}" draggable="true">
                                    <h4 class="font-semibold text-sm">${job.title}</h4>
                                    <p class="text-sm text-muted-foreground">${job.company_name}</p>
                                    <div class="flex justify-between items-center mt-2 text-xs">
                                        <span class="text-muted-foreground">${job.salary ? `₹${job.salary} LPA` : ''}</span>
                                        ${job.match_percentage !== null ? `<span class="font-medium ${job.match_percentage > 70 ? 'text-green-400' : 'text-muted-foreground'}">${job.match_percentage}% Match</span>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add drag-and-drop listeners
        setupDragAndDrop();
    }

    // NEW: Drag and Drop Logic
    function setupDragAndDrop() {
        let draggedItemId = null;

        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', e => {
                draggedItemId = e.target.dataset.id;
                setTimeout(() => e.target.classList.add('opacity-50'), 0);
            });

            card.addEventListener('dragend', e => {
                draggedItemId = null;
                e.target.classList.remove('opacity-50');
            });
        });

        document.querySelectorAll('.kanban-dropzone').forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault(); // Allow drop
                zone.classList.add('bg-muted');
            });

            zone.addEventListener('dragleave', e => {
                zone.classList.remove('bg-muted');
            });

            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('bg-muted');
                const newStatus = zone.dataset.status;

                if (draggedItemId && newStatus) {
                    // Update DB
                    executeQuery("UPDATE jobs SET status = ? WHERE id = ?", [newStatus, draggedItemId]);
                    logEvent('INFO', `Dragged job ID ${draggedItemId} to ${newStatus}`);

                    // Optimistically update UI
                    const draggedCard = document.querySelector(`.kanban-card[data-id="${draggedItemId}"]`);
                    if (draggedCard) {
                        zone.appendChild(draggedCard);
                    } else {
                        renderJobsKanban(); // Fallback to full re-render
                    }
                }
            });
        });
    }


    async function renderProfiles() {
        const tableBody = document.getElementById('profiles-table-body');
        const res = executeQuery("SELECT id, name, created_at, notes FROM profiles ORDER BY created_at DESC");
        const profiles = res.length > 0 ? res[0].values : [];
        if (profiles.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-muted-foreground">No profiles created yet.</td></tr>`;
            return;
        }
        tableBody.innerHTML = profiles.map(row => {
            const [id, name, created_at, notes] = row;
            return `
                <tr class="hover:bg-muted">
                    <td class="px-6 py-4 whitespace-nowrap">${name}</td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="profiles" title="${notes || 'Click to add notes'}">${notes || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(created_at).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="delete-profile-btn text-destructive hover:opacity-70" data-id="${id}"><span class="material-symbols-outlined">delete</span></button>
                    </td>
                </tr>`}).join('');
    }

    // UPDATED: renderCompanies to renderCompaniesGrid
    async function renderCompaniesGrid() {
        const searchTerm = companySearchInput.value.toLowerCase();
        const res = executeQuery("SELECT id, name, industry, location FROM companies ORDER BY name");
        const companies = res.length > 0 ? res[0].values : [];

        const filteredCompanies = companies.filter(([id, name, industry, location]) =>
            name.toLowerCase().includes(searchTerm) ||
            (industry || '').toLowerCase().includes(searchTerm) ||
            (location || '').toLowerCase().includes(searchTerm)
        );

        if (filteredCompanies.length === 0) {
            companyGrid.innerHTML = `<p class="text-muted-foreground">No companies found.</p>`;
            return;
        }

        companyGrid.innerHTML = filteredCompanies.map(([id, name, industry, location]) => `
            <div class="company-card" data-id="${id}">
                <h3 class="font-semibold text-lg">${name}</h3>
                <p class="text-sm text-muted-foreground">${industry || 'No industry'}</p>
                <p class="text-sm text-muted-foreground mt-1 flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">location_on</span>
                    ${location || 'No location'}
                </p>
            </div>
        `).join('');

        // Add click listeners
        companyGrid.querySelectorAll('.company-card').forEach(card => {
            card.addEventListener('click', () => {
                showCompanyDetail(card.dataset.id);
            });
        });
    }

    // NEW: Show Company Detail Page
    async function showCompanyDetail(companyId) {
        companyGridContainer.classList.add('hidden');
        companyDetailContainer.classList.remove('hidden');

        // 1. Fetch and populate company details
        const res = executeQuery("SELECT id, name, industry, location, website, linkedin, notes FROM companies WHERE id = ?", [companyId]);
        if (!res || res.length === 0) return;

        const [id, name, industry, location, website, linkedin, notes] = res[0].values[0];
        editCompanyForm.elements.id.value = id;
        editCompanyForm.elements.name.value = name;
        editCompanyForm.elements.industry.value = industry || '';
        editCompanyForm.elements.location.value = location || '';
        editCompanyForm.elements.website.value = website || '';
        editCompanyForm.elements.linkedin.value = linkedin || '';
        editCompanyForm.elements.notes.value = notes || '';

        // 2. Fetch and render related jobs
        const profilesRes = executeQuery("SELECT id, name FROM profiles");
        const profilesMap = profilesRes.length > 0 ? profilesRes[0].values.reduce((acc, [id, name]) => {
            acc[id] = name;
            return acc;
        }, {}) : {};

        const jobsRes = executeQuery("SELECT id, title, status, location, salary, created_at, match_percentage, profile_id FROM jobs WHERE company_name = ? ORDER BY created_at DESC", [name]);
        const jobs = jobsRes.length > 0 ? jobsRes[0].values : [];

        if (jobs.length === 0) {
            relatedJobsList.innerHTML = `<p class="text-muted-foreground">No jobs found for this company.</p>`;
        } else {
            // UPDATED: To render grid of cards with requested fields
            relatedJobsList.innerHTML = jobs.map(([jobId, title, status, location, salary, created_at, match_percentage, profile_id]) => `
                <div class="related-job-card">
                    <div class="flex justify-between items-start">
                        <h4 class="text-sm" data-job-id="${jobId}">${title}</h4>
                        <span class="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">${status}</span>
                    </div>
                    <p><span class="material-symbols-outlined !text-sm">location_on</span> ${location || 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">paid</span> ${salary ? `₹${salary} LPA` : 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">badge</span> ${profilesMap[profile_id] || 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">percent</span> ${match_percentage !== null ? `${match_percentage}% Match` : 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">calendar_today</span> ${new Date(created_at).toLocaleDateString()}</p>
                </div>
            `).join('');

            // Add click listeners to job titles
            relatedJobsList.querySelectorAll('h4[data-job-id]').forEach(titleEl => {
                titleEl.addEventListener('click', () => {
                    switchView('jobs-view'); // Switch to main jobs view
                    showJobDetail(titleEl.dataset.jobId); // Open the detail modal
                });
            });
        }

        // Clear AI output
        document.getElementById('company-ai-output').innerHTML = '';
    }

    // UPDATED: Handle Company Form Submit with Merge Logic
    async function handleEditCompany(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        // 1. Get the old name *before* updating
        const oldNameRes = executeQuery("SELECT name FROM companies WHERE id = ?", [data.id]);
        if (!oldNameRes || oldNameRes.length === 0) {
            logEvent('ERROR', `Could not find company with ID ${data.id} to update.`);
            showStatus('Error updating company.', 'error');
            return;
        }
        const oldName = oldNameRes[0].values[0][0];

        // 2. Update the company
        executeQuery("UPDATE companies SET name = ?, industry = ?, location = ?, website = ?, linkedin = ?, notes = ? WHERE id = ?",
            [data.name, data.industry, data.location, data.website, data.linkedin, data.notes, data.id]);

        logEvent('SUCCESS', `Updated company: ${data.name}`);
        showStatus('Company updated successfully!', 'success');

        // 3. If name changed, check for jobs with old name and ask to merge
        if (oldName !== data.name) {
            const jobsRes = executeQuery("SELECT id FROM jobs WHERE company_name = ?", [oldName]);
            const jobsToMerge = jobsRes.length > 0 ? jobsRes[0].values : [];
            if (jobsToMerge.length > 0) {
                openMergeModal(oldName, data.name, jobsToMerge.length);
            }
        }

        await renderCompaniesGrid(); // Refresh grid
    }

    // NEW: Open Merge Modal
    function openMergeModal(oldName, newName, count) {
        mergeCompanyText.innerHTML = `You renamed "<strong>${oldName}</strong>" to "<strong>${newName}</strong>".<br>We found <strong>${count}</strong> job(s) linked to the old name. Do you want to update them?`;

        // Use .onclick to ensure we only have one listener
        confirmMergeBtn.onclick = () => {
            confirmMergeCompany(oldName, newName);
        };
        cancelMergeBtn.onclick = () => {
            closeModal('merge-company-modal');
        };

        openModal('merge-company-modal');
    }

    // NEW: Confirm Merge Function
    function confirmMergeCompany(oldName, newName) {
        executeQuery("UPDATE jobs SET company_name = ? WHERE company_name = ?", [newName, oldName]);
        logEvent('INFO', `Merged ${oldName} into ${newName}.`);
        showStatus(`Successfully merged jobs into ${newName}.`, 'success');
        closeModal('merge-company-modal');
        // Refresh related jobs if user is still on the detail page
        if (!companyDetailContainer.classList.contains('hidden')) {
            showCompanyDetail(editCompanyForm.elements.id.value);
        }
    }


    async function renderPeople() {
        const tableBody = document.getElementById('people-table-body');
        const res = executeQuery("SELECT id, first_name, last_name, job_title, company_name, email, linkedin, notes FROM people ORDER BY last_name");
        const people = res.length > 0 ? res[0].values : [];
        tableBody.innerHTML = people.map(row => {
            const [id, first_name, last_name, job_title, company_name, email, linkedin, notes] = row;
            return `
                <tr class="hover:bg-muted">
                    <td class="px-6 py-4 whitespace-nowrap">${first_name} ${last_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${job_title || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${company_name || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${email || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><a href="${linkedin}" target="_blank" class="text-primary hover:underline">${linkedin || ''}</a></td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="people" title="${notes || 'Click to add notes'}">${notes || ''}</td>
                </tr>`}).join('');
    }

    async function showJobDetail(jobId) {
        currentOpenJobId = jobId;
        const res = executeQuery("SELECT title, company_name, description, notes, profile_id, match_percentage, ai_keywords, match_justification FROM jobs WHERE id = ?", [jobId]);
        if (!res || res.length === 0) {
            logEvent('ERROR', `Could not find job with ID ${jobId}`);
            return;
        }

        const [title, company, description, notes, profile_id, match_percentage, ai_keywords, match_justification] = res[0].values[0];

        document.getElementById('detail-job-title').textContent = title;
        document.getElementById('detail-job-company').textContent = company;
        document.getElementById('detail-job-description').innerHTML = description ? description.replace(/\n/g, '<br>') : 'No description provided.';
        document.getElementById('detail-job-notes').textContent = notes || 'No notes for this job.';

        document.getElementById('save-ai-btn').classList.add('hidden');
        unsavedAnalysisData = null;

        if (ai_keywords) {
            try { renderKeywords(JSON.parse(ai_keywords)); }
            catch (e) {
                logEvent('ERROR', `Failed to parse saved keywords for JobID ${jobId}`);
                document.getElementById('ai-detail-panel').innerHTML = `<p class="text-destructive text-sm">Could not load saved analysis.</p>`;
            }
        } else {
            document.getElementById('ai-detail-panel').innerHTML = `<p class="text-muted-foreground text-sm">Click the ✨ button to generate keyword analysis.</p>`;
        }

        if (match_percentage !== null && match_justification) {
            renderMatchAnalysis({ match_percentage, justification: match_justification });
        } else if (profile_id) {
            document.getElementById('ai-match-panel').innerHTML = `<p class="text-muted-foreground text-sm">Click the ✨ button to generate a profile match analysis.</p>`;
        } else {
            document.getElementById('ai-match-panel').innerHTML = `<p class="text-muted-foreground text-sm">Select a profile from the main list to enable match analysis.</p>`;
        }

        jobsListView.classList.add('hidden');
        jobDetailView.classList.remove('hidden');
    }

    // --- Event Handlers ---
    function setupEventListeners() {
        navLinks.forEach(link => link.addEventListener('click', (e) => switchView(e.currentTarget.dataset.view)));
        ['add-job-btn', 'add-profile-btn', 'add-company-btn', 'add-person-btn'].forEach(id => {
            document.getElementById(id).addEventListener('click', () => openModal(id.replace('-btn', '-modal')));
        });
        document.querySelectorAll('.cancel-modal-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal').id)));

        statusTabs.addEventListener('click', e => {
            if (e.target.classList.contains('status-tab')) {
                currentJobViewStatus = e.target.dataset.status;
                updateActiveTab();
                renderJobs(currentJobViewStatus);
            }
        });

        document.getElementById('sort-jobs-select').addEventListener('change', e => {
            currentSortOrder = e.target.value;
            logEvent('INFO', `Changed job sort order to: ${e.target.options[e.target.selectedIndex].text}`);
            renderJobs(currentJobViewStatus);
        });

        // Event listener for Table view
        jobsTableBody.addEventListener('click', e => {
            const cell = e.target.closest('td');
            if (cell && cell.dataset.field === 'details') {
                const row = cell.closest('.job-row');
                if (row) showJobDetail(row.dataset.id);
            }

            const analyzeBtn = e.target.closest('.analyze-match-btn');
            if (analyzeBtn) {
                const jobId = analyzeBtn.dataset.jobId;
                const profileSelect = analyzeBtn.closest('tr').querySelector('.profile-select');
                if (profileSelect.value) {
                    handleAnalyzeMatchFromList(jobId, profileSelect.value);
                } else {
                    showStatus("Please select a profile first.", "error");
                }
            }
        });

        jobsTableBody.addEventListener('change', async e => {
            if (e.target.classList.contains('profile-select')) {
                const jobId = e.target.dataset.jobId;
                const profileId = e.target.value;
                executeQuery("UPDATE jobs SET profile_id = ?, match_percentage = NULL, match_justification = NULL WHERE id = ?", [profileId || null, jobId]);
                logEvent('INFO', `Set profile to ID ${profileId || 'None'} for job ID ${jobId}.`);
                const analyzeBtn = e.target.closest('tr').querySelector('.analyze-match-btn');
                analyzeBtn.disabled = !profileId;
                await renderJobs(currentJobViewStatus);
            }
        });

        jobsTableBody.addEventListener('dblclick', e => {
            const cell = e.target.closest('td');
            if (cell && cell.dataset.field === 'status') makeStatusEditable(cell);
        });

        // NEW: Event listener for Kanban view
        jobsKanbanContainer.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                showJobDetail(card.dataset.id);
            }
        });

        // NEW: View Toggle Buttons
        showTableViewBtn.addEventListener('click', () => toggleJobsView('table'));
        showKanbanViewBtn.addEventListener('click', () => toggleJobsView('kanban'));

        // NEW: Pagination listeners
        prevPageBtn.addEventListener('click', () => {
            if (appState.currentPage > 1) {
                appState.currentPage--;
                renderJobs(currentJobViewStatus);
            }
        });
        nextPageBtn.addEventListener('click', () => {
            appState.currentPage++; // renderJobs will cap this if it's too high
            renderJobs(currentJobViewStatus);
        });
        itemsPerPageSelect.addEventListener('change', (e) => {
            appState.itemsPerPage = parseInt(e.target.value, 10);
            appState.currentPage = 1; // Reset to first page
            renderJobs(currentJobViewStatus);
        });

        // NEW: Column toggle popover listener
        manageColumnsBtn.addEventListener('click', () => {
            manageColumnsPopover.classList.toggle('show');
        });
        // Close popover if clicking outside
        document.addEventListener('click', (e) => {
            if (!manageColumnsBtn.contains(e.target) && !manageColumnsPopover.contains(e.target)) {
                manageColumnsPopover.classList.remove('show');
            }
        });


        document.getElementById('profiles-table-body').addEventListener('click', e => {
            const deleteBtn = e.target.closest('.delete-profile-btn');
            // Replaced confirm() with a simple true
            if (deleteBtn && true) { // Bypassed confirm()
                const profileId = deleteBtn.dataset.id;
                executeQuery("DELETE FROM profiles WHERE id = ?", [profileId]);
                logEvent('SUCCESS', `Deleted profile ID ${profileId}`);
                showStatus('Profile deleted.', 'success');
                renderProfiles();
                refreshJobsView(); // Refresh jobs view in case profile was used
            }
        });

        document.getElementById('back-to-jobs-list').addEventListener('click', () => {
            jobDetailView.classList.add('hidden');
            jobsListView.classList.remove('hidden');
            refreshJobsView(); // Use new refresh function
        });

        document.getElementById('generate-ai-btn').addEventListener('click', generateAndDisplayFullAnalysis);
        document.getElementById('save-ai-btn').addEventListener('click', handleSaveAnalysis);

        document.getElementById('add-job-form').addEventListener('submit', handleAddJob);
        document.getElementById('add-profile-form').addEventListener('submit', handleAddProfile);
        document.getElementById('add-company-form').addEventListener('submit', handleAddCompany);
        document.getElementById('add-person-form').addEventListener('submit', handleAddPerson);
        document.getElementById('edit-notes-form').addEventListener('submit', handleEditNotes);
        // NEW: Company view listeners
        companySearchInput.addEventListener('input', renderCompaniesGrid);
        backToCompanyGridBtn.addEventListener('click', () => {
            companyDetailContainer.classList.add('hidden');
            companyGridContainer.classList.remove('hidden');
            renderCompaniesGrid(); // Refresh grid in case names changed
        });
        editCompanyForm.addEventListener('submit', handleEditCompany);


        document.querySelector('main').addEventListener('click', e => {
            const notesCell = e.target.closest('td[data-field="notes"]');
            if (notesCell) {
                openNotesEditor(notesCell);
            }
        });

        // UPDATED: Settings Listeners
        document.getElementById('llm-api-url').addEventListener('change', saveSettings);
        autoCreateCompanyToggle.addEventListener('change', saveSettings);
        themeSelect.addEventListener('change', () => {
            applyTheme(themeSelect.value);
            saveSettings();
        });
        document.getElementById('test-connection-btn').addEventListener('click', testLLMConnection);
        document.getElementById('backup-db-btn').addEventListener('click', downloadBackup);
        document.getElementById('restore-db-input').addEventListener('change', restoreDatabase);
    }

    function openNotesEditor(cell) {
        const id = cell.dataset.id;
        const type = cell.dataset.type;
        const currentNotes = cell.title.replace('Click to add notes', ''); // Use title to get full notes

        const form = document.getElementById('edit-notes-form');
        form.elements.itemId.value = id;
        form.elements.itemType.value = type;
        form.elements.notes.value = currentNotes;

        openModal('edit-notes-modal');
    }

    async function handleEditNotes(e) {
        e.preventDefault();
        const form = e.target;
        const id = form.elements.itemId.value;
        const type = form.elements.itemType.value;
        const notes = form.elements.notes.value;

        if (!id || !type) {
            showStatus("Error saving notes: missing data.", "error");
            return;
        }

        executeQuery(`UPDATE ${type} SET notes = ? WHERE id = ?`, [notes, id]);
        logEvent('SUCCESS', `Updated notes for ${type} ID ${id}.`);
        showStatus('Notes updated successfully!', 'success');

        closeModal('edit-notes-modal');

        switch (type) {
            case 'jobs':
                await refreshJobsView();
                break;
            case 'profiles':
                await renderProfiles();
                break;
            case 'companies':
                await renderCompanies(); // This function might need to be renderCompaniesGrid()
                break;
            case 'people':
                await renderPeople();
                break;
        }
    }

    async function handleAddJob(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        // NEW: Auto-create company logic
        if (appState.autoCreateCompany && data.company_name) {
            try {
                const res = executeQuery("SELECT id FROM companies WHERE name = ?", [data.company_name]);
                if (res.length === 0 || res[0].values.length === 0) {
                    executeQuery("INSERT INTO companies (name) VALUES (?)", [data.company_name]);
                    logEvent('INFO', `Auto-created new company: ${data.company_name}`);
                }
            } catch (err) {
                logEvent('ERROR', `Failed to auto-create company: ${err.message}`);
            }
        }

        executeQuery("INSERT INTO jobs (title, company_name, location, salary, url, description, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [data.title, data.company_name, data.location, data.salary || null, data.url, data.description, 'Bookmarked', data.notes]);
        logEvent('SUCCESS', `Added new job: ${data.title}`);
        showStatus('Job saved successfully!', 'success');
        await refreshJobsView();
        closeModal('add-job-modal');
    }

    async function handleAddProfile(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        if (!data.name || !data.content) {
            showStatus("Profile Name and Content are required.", "error"); return;
        }
        executeQuery("INSERT INTO profiles (name, content, notes) VALUES (?, ?, ?)", [data.name, data.content, data.notes]);
        logEvent('SUCCESS', `Added new profile: ${data.name}`);
        showStatus('Profile saved!', 'success');
        await renderProfiles();
        closeModal('add-profile-modal');
    }

    async function handleAddCompany(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        executeQuery("INSERT OR IGNORE INTO companies (name, industry, location, website, linkedin, notes) VALUES (?, ?, ?, ?, ?, ?)", [data.name, data.industry, data.location, data.website, data.linkedin, data.notes]);
        logEvent('SUCCESS', `Added company: ${data.name}`);
        showStatus('Company saved!', 'success');
        await renderCompaniesGrid(); // Refresh grid
        closeModal('add-company-modal');
    }

    async function handleAddPerson(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        executeQuery("INSERT INTO people (first_name, last_name, job_title, company_name, email, linkedin, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.first_name, data.last_name, data.job_title, data.company_name, data.email, data.linkedin, data.notes]);
        logEvent('SUCCESS', `Added contact: ${data.first_name} ${data.last_name}`);
        showStatus('Contact saved!', 'success');
        await renderPeople();
        closeModal('add-person-modal');
    }

    function makeStatusEditable(cell) {
        const currentStatus = cell.dataset.currentStatus;
        cell.innerHTML = `<select class="editable-select text-sm">${JOB_STATUSES.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
        const select = cell.querySelector('select');
        select.focus();
        const saveChange = () => {
            const newStatus = select.value;
            const jobId = cell.closest('.job-row').dataset.id;
            executeQuery("UPDATE jobs SET status = ? WHERE id = ?", [newStatus, jobId]);
            logEvent('INFO', `Updated status for job ID ${jobId} to ${newStatus}`);
            showStatus('Status updated.', 'success');
            renderJobs(currentJobViewStatus); // Re-render the jobs list
        };
        select.addEventListener('blur', saveChange);
        select.addEventListener('change', saveChange);
    }

    // --- Auto Backup & Persistence ---
    function autoBackupDatabase() {
        try {
            const data = db.export();
            localStorage.setItem('auto-backup-db', data.join(','));
        } catch (e) {
            logEvent('ERROR', `Auto-backup failed: ${e.message}`);
        }
    }

    function downloadBackup() {
        const blob = new Blob([db.export()], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job_tracker_backup_${Date.now()}.sqlite`;
        a.click();
        URL.revokeObjectURL(url);
        logEvent('SUCCESS', 'Manual database backup created.');
        showStatus('Backup file downloaded.', 'success');
    }

    // NEW: Apply Theme Function
    function applyTheme(themeName) {
        if (themeName === 'Humanist Dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        appState.theme = themeName;
    }

    function saveSettings() {
        const apiUrl = document.getElementById('llm-api-url').value;
        appState.autoCreateCompany = autoCreateCompanyToggle.checked;
        appState.theme = themeSelect.value; // Save theme

        const settings = {
            llmApiUrl: apiUrl,
            autoCreateCompany: appState.autoCreateCompany,
            itemsPerPage: appState.itemsPerPage, // Save pagination setting
            columnConfig: appState.columnConfig, // Save NEW column config
            theme: appState.theme // Save theme
        };
        localStorage.setItem('jobTrackerSettings', JSON.stringify(settings));
        logEvent('SUCCESS', 'Settings saved.');
        showStatus('Settings saved!', 'success');
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('jobTrackerSettings'));
        if (settings) {
            if (settings.llmApiUrl) {
                document.getElementById('llm-api-url').value = settings.llmApiUrl;
            }
            appState.autoCreateCompany = settings.autoCreateCompany !== false; // default to true
            autoCreateCompanyToggle.checked = appState.autoCreateCompany;

            // Load theme
            appState.theme = settings.theme || 'Humanist Dark';
            themeSelect.value = appState.theme;
            applyTheme(appState.theme);

            // Load pagination and column settings
            appState.itemsPerPage = settings.itemsPerPage || 10;
            itemsPerPageSelect.value = appState.itemsPerPage;

            // NEW: Load columnConfig
            if (settings.columnConfig) {
                appState.columnConfig = settings.columnConfig;
                // Ensure all keys from COLUMN_DEFINITIONS exist in the loaded config
                const loadedKeys = appState.columnConfig.map(c => c.key);
                Object.keys(COLUMN_DEFINITIONS).forEach(key => {
                    if (!loadedKeys.includes(key)) {
                        appState.columnConfig.push({
                            key: key,
                            label: COLUMN_DEFINITIONS[key],
                            visible: false // Default new columns to hidden
                        });
                    }
                });
                // Ensure all labels are up-to-date
                appState.columnConfig.forEach(col => {
                    col.label = COLUMN_DEFINITIONS[col.key];
                });
            }
        }

        // Load legacy visibility settings if they exist and convert them
        const legacyColumnVisibility = JSON.parse(localStorage.getItem('jobTrackerColumnVisibility'));
        if (legacyColumnVisibility) {
            // This is the old format (object of booleans)
            // We just update the 'visible' property in our new array structure
            appState.columnConfig.forEach(col => {
                if (legacyColumnVisibility[col.key] !== undefined) {
                    col.visible = legacyColumnVisibility[col.key];
                }
            });
            localStorage.removeItem('jobTrackerColumnVisibility'); // Remove old key
            saveSettings(); // Re-save under new structure
        }
    }

    async function restoreDatabase(event) {
        const file = event.target.files[0];
        if (!file) return;
        // Bypassed confirm for iframe compatibility
        showLoading('Restoring Database...');
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` });
                db = new SQL.Database(new Uint8Array(e.target.result));
                autoBackupDatabase();
                await init();
                logEvent('SUCCESS', `Database restored from file: ${file.name}`);
                showStatus('Database restored successfully!', 'success');
                switchView('jobs-view');
            } catch (err) {
                console.error("Restore failed:", err);
                logEvent('ERROR', `Database restore failed: ${err.message}`);
                showStatus('Database restore failed.', 'error');
            } finally {
                hideLoading();
                event.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // --- AI Integration ---
    async function testLLMConnection() {
        const apiUrl = document.getElementById('llm-api-url')?.value;
        if (!apiUrl) { showStatus('Please enter an API Endpoint URL first.', 'error'); return; }
        const btn = document.getElementById('test-connection-btn');
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined spin">progress_activity</span>`;
        showStatus('Testing connection...', 'info');
        logEvent('INFO', `Testing LLM connection to ${apiUrl}`);
        try {
            const response = await fetch(apiUrl, {
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "local-model", messages: [{ role: "user", content: "Say 'Hello'" }] })
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const result = await response.json();
            if (result.choices && result.choices[0]) {
                showStatus('Connection successful!', 'success');
                logEvent('SUCCESS', 'LLM connection test was successful.');
            } else { throw new Error('Invalid response format from server.'); }
        } catch (error) {
            console.error("LLM Connection Test Error:", error);
            showStatus(`Connection failed. Check logs.`, 'error');
            logEvent('ERROR', `LLM connection test failed: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Test';
        }
    }

    async function callLLM(prompt, content) {
        const apiUrl = document.getElementById('llm-api-url')?.value;
        if (!apiUrl) throw new Error("LLM API Endpoint not set in Settings.");
        const response = await fetch(apiUrl, {
            method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "local-model", messages: [{ role: "user", content: `${prompt}\n\n---\n\n${content}` }], stream: false })
        });
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const result = await response.json();
        let llmContent = result.choices[0]?.message?.content;

        if (llmContent) {
            llmContent = llmContent.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        return llmContent;
    }

    async function runKeywordsAnalysis(description) {
        const prompt = `Based on the following job description, extract key skills and technologies. Categorize them under 'Requirements', 'Responsibilities', and 'Preferred'. Provide the output as a single, minified JSON object with no extra text or markdown. Example: {"Requirements":["Skill A","Skill B"],"Responsibilities":["Task C","Task D"],"Preferred":["Tool E"]}`;
        const content = await callLLM(prompt, description);
        return JSON.parse(content);
    }

    async function runMatchAnalysis(jobDescription, profileContent) {
        const prompt = `Analyze the following resume against the job description. Provide a percentage match score (0-100) and a brief, one-sentence justification. Return a single, minified JSON object with keys "match_percentage" and "justification". Example: {"match_percentage":85,"justification":"Strong match in key skills, but lacks preferred experience."}`;
        const combinedContent = `[RESUME]\n${profileContent}\n\n[JOB DESCRIPTION]\n${jobDescription}`;
        const content = await callLLM(prompt, combinedContent);
        return JSON.parse(content);
    }

    async function handleAnalyzeMatchFromList(jobId, profileId) {
        showStatus(`Analyzing match for job...`, 'info');
        logEvent('INFO', `Starting AI profile match for JobID: ${jobId} & ProfileID: ${profileId}`);
        try {
            const jobRes = executeQuery("SELECT description FROM jobs WHERE id = ?", [jobId]);
            const profileRes = executeQuery("SELECT content FROM profiles WHERE id = ?", [profileId]);
            const jobDescription = jobRes[0].values[0][0];
            const profileContent = profileRes[0].values[0][0];
            if (!jobDescription || !profileContent) { showStatus("Job/profile content is empty.", "error"); return; }
            const { match_percentage, justification } = await runMatchAnalysis(jobDescription, profileContent);
            executeQuery("UPDATE jobs SET match_percentage = ?, match_justification = ? WHERE id = ?", [match_percentage, justification, jobId]);
            logEvent('SUCCESS', `AI match for JobID ${jobId} is ${match_percentage}%.`);
            showStatus(`AI Match: ${match_percentage}%`, 'success');
            await renderJobs(currentJobViewStatus);
        } catch (error) {
            console.error("LLM Match Error (List View):", error);
            logEvent('ERROR', `LLM Match Error (List View): ${error.message}`);
            showStatus('AI match analysis failed.', 'error');
        }
    }

    async function generateAndDisplayFullAnalysis() {
        if (!currentOpenJobId) return;
        const generateBtn = document.getElementById('generate-ai-btn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="material-symbols-outlined spin">progress_activity</span>`;
        const [description, profile_id] = executeQuery("SELECT description, profile_id FROM jobs WHERE id = ?", [currentOpenJobId])[0].values[0];
        const keywordsPanel = document.getElementById('ai-detail-panel');
        const matchPanel = document.getElementById('ai-match-panel');
        keywordsPanel.innerHTML = `<div class="text-center"><span class="material-symbols-outlined spin mr-2">progress_activity</span>Analyzing keywords...</div>`;
        if (profile_id) { matchPanel.innerHTML = `<div class="text-center mt-4"><span class="material-symbols-outlined spin mr-2">progress_activity</span>Analyzing match...</div>`; }
        try {
            const analysisPromises = [runKeywordsAnalysis(description)];
            if (profile_id) {
                const profileContent = executeQuery("SELECT content FROM profiles WHERE id = ?", [profile_id])[0].values[0][0];
                analysisPromises.push(runMatchAnalysis(description, profileContent));
            }
            const [keywordsResult, matchResult] = await Promise.all(analysisPromises);
            unsavedAnalysisData = { keywords: keywordsResult, match: matchResult || null };
            renderKeywords(keywordsResult);
            if (matchResult) renderMatchAnalysis(matchResult);
            document.getElementById('save-ai-btn').classList.remove('hidden');
            showStatus('AI analysis generated. Click Save to keep it.', 'success');
            logEvent('SUCCESS', `Generated new AI analysis for JobID ${currentOpenJobId}`);
        } catch (error) {
            console.error("Full Analysis Error:", error);
            logEvent('ERROR', `Full analysis failed: ${error.message}`);
            showStatus('AI analysis failed. Check logs.', 'error');
            keywordsPanel.innerHTML = `<p class="text-destructive text-sm">Keyword analysis failed.</p>`;
            if (profile_id) matchPanel.innerHTML = `<p class="text-destructive text-sm">Match analysis failed.</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<span class="material-symbols-outlined">auto_awesome</span>`;
        }
    }

    async function handleSaveAnalysis() {
        if (!unsavedAnalysisData || !currentOpenJobId) { showStatus('No analysis data to save.', 'error'); return; }
        const { keywords, match } = unsavedAnalysisData;
        executeQuery("UPDATE jobs SET ai_keywords = ?, match_percentage = ?, match_justification = ? WHERE id = ?",
            [JSON.stringify(keywords), match ? match.match_percentage : null, match ? match.justification : null, currentOpenJobId]);
        logEvent('SUCCESS', `Saved AI analysis for JobID ${currentOpenJobId}`);
        showStatus('AI analysis saved successfully!', 'success');
        document.getElementById('save-ai-btn').classList.add('hidden');
        unsavedAnalysisData = null;
    }

    function renderKeywords(data) {
        const panel = document.getElementById('ai-detail-panel');
        panel.innerHTML = '';
        const categoryOrder = ['Requirements', 'Responsibilities', 'Preferred'];
        let contentExists = false;
        for (const category of categoryOrder) {
            if (data[category] && data[category].length > 0) {
                contentExists = true;
                const categoryDiv = document.createElement('div');
                categoryDiv.innerHTML = `<h4 class="font-semibold text-muted-foreground text-sm mb-2">${category}</h4>`;
                const tagContainer = document.createElement('div');
                tagContainer.className = 'flex flex-wrap gap-2';
                data[category].forEach(keyword => {
                    const tag = document.createElement('span');
                    tag.className = 'bg-primary bg-opacity-30 text-primary text-opacity-90 text-xs font-medium px-2.5 py-1 rounded-full';
                    tag.textContent = keyword;
                    tagContainer.appendChild(tag);
                });
                categoryDiv.appendChild(tagContainer);
                panel.appendChild(categoryDiv);
            }
        }
        if (!contentExists) {
            panel.innerHTML = `<p class="text-muted-foreground text-sm">The AI could not extract any specific keywords.</p>`;
        }
    }

    function renderMatchAnalysis(data) {
        const panel = document.getElementById('ai-match-panel');
        panel.innerHTML = `
             <h4 class="font-semibold text-muted-foreground text-sm mb-2">Profile Match Analysis</h4>
             <div class="text-3xl font-bold text-primary">${data.match_percentage}%</div>
             <p class="text-sm text-card-foreground mt-2">${data.justification}</p>
            `;
    }

    // ... (unchanged helper functions: showStatus, switchView) ...
    function showLoading(text) {
        loadingText.textContent = text;
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('flex');
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('flex');
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('flex');
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.remove('scale-95');
            modal.style.opacity = '1';
        }, 10);
    }

    function logEvent(type, message) {
        const timestamp = new Date().toISOString();
        logs.unshift({ timestamp, type, message });
        if (logs.length > 200) logs.pop(); // Keep logs from getting too big
        if (document.getElementById('logs-view').offsetParent !== null) {
            renderLogs();
        }
    }

    // UPDATED: Persistent Footer
    function showStatus(message, type = 'info') {
        const colors = { info: 'text-muted-foreground', success: 'text-green-400', error: 'text-destructive' };
        statusFooter.textContent = message;
        statusFooter.className = `bg-card text-center py-1 px-4 text-sm ${colors[type] || 'text-muted-foreground'} border-t border-border z-10 transition-all duration-300`;
    }

    async function switchView(viewId) {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            }
        });
        if (viewId === 'jobs-view') {
            await refreshJobsView(); // Refresh jobs view when switching to it
        }
        if (viewId === 'logs-view') renderLogs();
        if (viewId === 'profiles-view') await renderProfiles();
        if (viewId === 'companies-view') {
            companyGridContainer.classList.remove('hidden');
            companyDetailContainer.classList.add('hidden');
            await renderCompaniesGrid(); // Render company grid
        }
        logEvent('INFO', `Switched to view: ${viewId}`);
    }


    // --- App Initialization ---
    async function init() {
        showLoading('Initializing Database...');
        logEvent('INFO', 'Application initialization started.');
        try {
            // REPLACED: sql.js logic with initDB
            await initDB();
            logEvent('SUCCESS', 'Database initialized successfully.');

            // Load companies into cache
            const companies = await getAllCompanies();
            companyMap = new Map(companies.map(c => [c.id, c.name]));

            loadSettings(); // Load settings early to apply theme
            renderStatusTabs();
            renderColumnToggles();
            await Promise.all([
                refreshJobsView(),
                renderCompaniesGrid(),
                renderPeople(),
                renderProfiles()
            ]);
            setupEventListeners();
            logEvent('SUCCESS', 'Application initialized successfully.');
            showStatus('Ready', 'info'); // Set initial status
        } catch (err) {
            console.error("Initialization failed:", err);
            logEvent('ERROR', `Initialization failed: ${err.message || err}`);
            showStatus('Initialization failed. Check logs.', 'error');
        } finally {
            hideLoading();
        }
    }

    // --- Database Logic ---
    // REMOVED: createTables() (now in initDB)
    // REMOVED: executeQuery() (replaced by specific DB functions)

    // --- Rendering Logic ---

    // ... (unchanged helper functions: toggleJobsView, refreshJobsView, renderLogs, renderStatusTabs, updateActiveTab) ...

    // NEW: Function to toggle between Table and Kanban views
    function toggleJobsView(view) {
        currentJobsView = view;
        if (view === 'table') {
            showTableViewBtn.classList.add('active');
            showKanbanViewBtn.classList.remove('active');
            jobsTableContainer.classList.remove('hidden');
            jobsKanbanContainer.classList.add('hidden');
            statusTabs.classList.remove('hidden');
            sortControls.classList.remove('hidden');
            paginationControls.classList.remove('hidden'); // Show pagination
            renderJobs(currentJobViewStatus);
        } else {
            showTableViewBtn.classList.remove('active');
            showKanbanViewBtn.classList.add('active');
            jobsTableContainer.classList.add('hidden');
            jobsKanbanContainer.classList.remove('hidden');
            statusTabs.classList.add('hidden');
            sortControls.classList.add('hidden');
            paginationControls.classList.add('hidden'); // Hide pagination
            renderJobsKanban();
        }
        logEvent('INFO', `Switched to ${view} view.`);
    }

    // NEW: Main function to call the correct render function
    async function refreshJobsView() {
        if (currentJobsView === 'table') {
            await renderJobs(currentJobViewStatus);
        } else {
            await renderJobsKanban();
        }
    }

    function renderLogs() {
        const tableBody = document.getElementById('logs-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = logs.map(log => {
            const typeClass = { 'INFO': 'text-blue-400', 'SUCCESS': 'text-green-400', 'ERROR': 'text-destructive' }[log.type] || 'text-muted-foreground';
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">${new Date(log.timestamp).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-semibold ${typeClass}">${log.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${log.message}</td>
                </tr>`;
        }).join('');
    }

    function renderStatusTabs() {
        const tabsContainer = document.getElementById('status-tabs');
        tabsContainer.innerHTML = JOB_STATUSES.map(status => `<button class="status-tab border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition whitespace-nowrap" data-status="${status}">${status}</button>`).join('');
        updateActiveTab();
    }

    function updateActiveTab() {
        document.querySelectorAll('.status-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.status === currentJobViewStatus);
        });
    }


    // UPDATED: renderJobs (Table View) - Now async and uses IndexedDB
    async function renderJobs(status) {
        // 1. Get total count for pagination
        const totalItems = await getJobCount(status);
        const totalPages = Math.ceil(totalItems / appState.itemsPerPage);
        appState.currentPage = Math.min(appState.currentPage, totalPages) || 1;

        renderPaginationControls(totalItems, totalPages);

        // 2. Get profiles for dropdown
        const profiles = await getAllProfiles();

        // 3. Get paginated job data
        const jobs = await getPaginatedJobs(status, currentSortOrder, appState.currentPage, appState.itemsPerPage);

        // 4. Render Table Head (Unchanged)
        // ... (existing code for tableHead.innerHTML) ...
        const tableHead = jobsTableContainer.querySelector('thead');
        tableHead.innerHTML = `
            <tr>
                ${appState.columnConfig.map(col => `
                    <th class="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider ${col.visible ? '' : 'hidden'}" data-col-key="${col.key}">
                        ${col.label}
                    </th>
                `).join('')}
            </tr>
        `;

        // 5. Render Table Body
        if (jobs.length === 0) {
            // ... (existing code for empty table) ...
            const colSpan = appState.columnConfig.filter(c => c.visible).length;
            jobsTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 text-muted-foreground">No jobs in this category.</td></tr>`;
            return;
        }

        // UPDATED: Loop now uses job objects
        jobsTableBody.innerHTML = jobs.map(job => {
            const { id, title, company_id, location, status: currentStatus, created_at, profile_id, match_percentage, notes, salary, url, description } = job;

            // Use companyMap to get name from ID
            const company_name = companyMap.get(company_id) || 'Unknown Company';

            // UPDATED: Profile options use objects
            const profileOptionsHtml = `<option value="">- Select Profile -</option>` + profiles.map(p => `<option value="${p.id}" ${p.id === profile_id ? 'selected' : ''}>${p.name}</option>`).join('');

            // Create an object from the row data for easy access by key
            const rowData = { id, title, company_name, location, currentStatus, created_at, profile_id, match_percentage, notes, salary, url, description };

            // ... (The rest of the rendering logic is IDENTICAL because rowData object is the same) ...
            return `
                <tr class="job-row" data-id="${id}">
                    ${appState.columnConfig.map(col => {
                // Handle each cell based on its column key
                let content = '';
                switch (col.key) {
                    case 'title':
                    case 'company_name':
                    case 'location':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="details">${rowData[col.key] || 'N/A'}</td>`;
                        break;
                    case 'salary':
                        content = `<td class="px-6 py-4 whitespace-nowrap">${rowData.salary ? `₹${rowData.salary} LPA` : 'N/A'}</td>`;
                        break;
                    case 'url':
                        content = `<td class="px-6 py-4 whitespace-nowrap">
                                    ${rowData.url ? `<a href="${rowData.url}" target="_blank" class="text-primary hover:underline flex items-center"><span class="material-symbols-outlined text-sm mr-1">open_in_new</span>Link</a>` : 'N/A'}
                                </td>`;
                        break;
                    case 'description':
                        content = `<td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" title="${rowData.description || ''}">${(rowData.description || '').substring(0, 30)}${rowData.description && rowData.description.length > 30 ? '...' : ''}</td>`;
                        break;
                    case 'profile_id':
                        content = `<td class="px-6 py-4 whitespace-nowrap">
                                    <select data-job-id="${id}" class="profile-select editable-select text-sm">
                                        ${profileOptionsHtml}
                                    </select>
                                </td>`;
                        break;
                    case 'match_percentage':
                        content = `<td class="px-6 py-4 whitespace-nowrap text-center">
                                    <div class="flex items-center justify-center space-x-2">
                                        <span>${rowData.match_percentage === null || rowData.match_percentage === undefined ? 'N/A' : `${rowData.match_percentage}%`}</span>
                                        <button title="Run AI Match Analysis" class="analyze-match-btn text-primary hover:text-accent" data-job-id="${id}" ${!rowData.profile_id ? 'disabled' : ''}>
                                            <span class="material-symbols-outlined text-lg">biotech</span>
                                        </button>
                                    </div>
                                </td>`;
                        break;
                    case 'status':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="status" data-current-status="${rowData.currentStatus}">${rowData.currentStatus}</td>`;
                        break;
                    case 'notes':
                        content = `<td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="jobs" title="${rowData.notes || 'Click to add notes'}">${rowData.notes || ''}</td>`;
                        break;
                    case 'created_at':
                        content = `<td class="px-6 py-4 whitespace-nowrap" data-field="details">${new Date(rowData.created_at).toLocaleDateString()}</td>`;
                        break;
                }
                return col.visible ? content : content.replace('<td ', '<td class="hidden" ');
            }).join('')}
                </tr>`;
        }).join('');
    }

    // ... (unchanged helper functions: renderPaginationControls, renderColumnToggles, setupColumnDragAndDrop) ...

    // NEW: Render Pagination Controls
    function renderPaginationControls(totalItems, totalPages) {
        pageInfo.textContent = `Page ${appState.currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = appState.currentPage <= 1;
        nextPageBtn.disabled = appState.currentPage >= totalPages;
    }

    // NEW: Render Column Toggles - Now with drag and drop
    function renderColumnToggles() {
        manageColumnsPopover.innerHTML = appState.columnConfig.map((col, index) => `
            <div class="column-item" draggable="true" data-col-key="${col.key}">
                <span class="col-priority">${index + 1}</span>
                <span class="material-symbols-outlined drag-handle">drag_indicator</span>
                <label>
                    <input type="checkbox" data-col-key="${col.key}" class="h-4 w-4 rounded border-border text-primary focus:ring-primary" ${col.visible ? 'checked' : ''}>
                    <span class="text-sm">${col.label}</span>
                </label>
            </div>
        `).join('');

        // Add checkbox event listeners
        manageColumnsPopover.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const key = e.target.dataset.colKey;
                const colConfig = appState.columnConfig.find(c => c.key === key);
                if (colConfig) {
                    colConfig.visible = e.target.checked;
                }
                saveSettings(); // Save on toggle
                refreshJobsView(); // Re-render the table
            });
        });

        // Add drag/drop listeners
        setupColumnDragAndDrop();
    }

    // NEW: Drag and Drop for Columns
    function setupColumnDragAndDrop() {
        let draggedItem = null;

        manageColumnsPopover.querySelectorAll('.column-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                draggedItem?.classList.remove('dragging');
                draggedItem = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                if (target !== draggedItem && draggedItem) {
                    // Get bounding box of target
                    const rect = target.getBoundingClientRect();
                    // Get vertical center
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        target.parentNode.insertBefore(draggedItem, target);
                    } else {
                        target.parentNode.insertBefore(draggedItem, target.nextSibling);
                    }
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');

                    // Update the appState.columnConfig array based on the new DOM order
                    const newConfig = [];
                    manageColumnsPopover.querySelectorAll('.column-item').forEach(el => {
                        const key = el.dataset.colKey;
                        const config = appState.columnConfig.find(c => c.key === key);
                        if (config) {
                            newConfig.push(config);
                        }
                    });
                    appState.columnConfig = newConfig;

                    // Re-render popover to update numbers and re-render table
                    renderColumnToggles();
                    refreshJobsView();
                    saveSettings();
                }
            });
        });
    }


    // UPDATED: renderJobsKanban - now async
    async function renderJobsKanban() {
        // This is a bit inefficient as it gets *all* jobs, but IndexedDB
        // makes it hard to get *all* statuses sorted by date without cursors.
        // For Kanban, this is acceptable.

        // We can't sort by created_at AND filter by status easily.
        // Let's just get all jobs and sort/group in JS.
        const transaction = db.transaction('jobs', 'readonly');
        const store = transaction.objectStore('jobs');
        const request = store.getAll();

        request.onsuccess = () => {
            const jobs = request.result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const jobsByStatus = JOB_STATUSES.reduce((acc, status) => {
                acc[status] = [];
                return acc;
            }, {});

            jobs.forEach(job => {
                if (jobsByStatus[job.status]) {
                    jobsByStatus[job.status].push(job);
                }
            });

            jobsKanbanContainer.innerHTML = `
                <div class="flex space-x-4 overflow-x-auto pb-4">
                    ${JOB_STATUSES.map(status => {
                const jobsInStatus = jobsByStatus[status];
                return `
                        <div class="kanban-column w-72 md:w-80 flex-shrink-0">
                            <h3 class="font-semibold p-3 bg-muted rounded-t-lg flex justify-between items-center text-sm uppercase tracking-wide">
                                <span>${status}</span>
                                <span class="text-xs font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">${jobsInStatus.length}</span>
                            </h3>
                            <div id="kanban-col-${status}" data-status="${status}" class="kanban-dropzone space-y-3 p-3 bg-card rounded-b-lg h-full overflow-y-auto" style="min-height: 50vh;">
                                ${jobsInStatus.length === 0 ? `<p class="text-sm text-muted-foreground p-2">No jobs here.</p>` : ''}
                                ${jobsInStatus.map(job => `
                                    <div class="kanban-card p-3 bg-background rounded-lg shadow-sm cursor-pointer" data-id="${job.id}" draggable="true">
                                        <h4 class="font-semibold text-sm">${job.title}</h4>
                                        <p class="text-sm text-muted-foreground">${companyMap.get(job.company_id) || 'Unknown'}</p>
                                        <div class="flex justify-between items-center mt-2 text-xs">
                                            <span class="text-muted-foreground">${job.salary ? `₹${job.salary} LPA` : ''}</span>
                                            ${job.match_percentage !== null ? `<span class="font-medium ${job.match_percentage > 70 ? 'text-green-400' : 'text-muted-foreground'}">${job.match_percentage}% Match</span>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `;
            // Add drag-and-drop listeners
            setupDragAndDrop();
        };

        request.onerror = (event) => {
            jobsKanbanContainer.innerHTML = `<p class="text-destructive p-4">Error loading Kanban data.</p>`;
            logEvent('ERROR', `Failed to render Kanban: ${event.target.error}`);
        };
    }

    // UPDATED: setupDragAndDrop to use new DB functions
    function setupDragAndDrop() {
        let draggedItemId = null;
        // ... (dragstart, dragend listeners are the same) ...
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', e => {
                draggedItemId = e.target.dataset.id;
                setTimeout(() => e.target.classList.add('opacity-50'), 0);
            });

            card.addEventListener('dragend', e => {
                draggedItemId = null;
                e.target.classList.remove('opacity-50');
            });
        });

        document.querySelectorAll('.kanban-dropzone').forEach(zone => {
            // ... (dragover, dragleave listeners are the same) ...
            zone.addEventListener('dragover', e => {
                e.preventDefault(); // Allow drop
                zone.classList.add('bg-muted');
            });

            zone.addEventListener('dragleave', e => {
                zone.classList.remove('bg-muted');
            });

            zone.addEventListener('drop', async e => {
                e.preventDefault();
                zone.classList.remove('bg-muted');
                const newStatus = zone.dataset.status;

                if (draggedItemId && newStatus) {
                    // Update DB (now async)
                    try {
                        const jobId = parseInt(draggedItemId);
                        const job = await getJob(jobId);
                        if (job) {
                            job.status = newStatus;
                            await updateJob(job);
                            logEvent('INFO', `Dragged job ID ${jobId} to ${newStatus}`);

                            // Optimistically update UI
                            const draggedCard = document.querySelector(`.kanban-card[data-id="${draggedItemId}"]`);
                            if (draggedCard) {
                                zone.appendChild(draggedCard);
                            } else {
                                renderJobsKanban(); // Fallback to full re-render
                            }
                        }
                    } catch (err) {
                        logEvent('ERROR', `Failed to update job status via drag: ${err.message}`);
                        showStatus('Error updating status.', 'error');
                    }
                }
            });
        });
    }

    // UPDATED: renderProfiles - now async
    async function renderProfiles() {
        const tableBody = document.getElementById('profiles-table-body');
        const profiles = await getAllProfiles();

        if (profiles.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-muted-foreground">No profiles created yet.</td></tr>`;
            return;
        }
        // UPDATED: Loop uses objects
        tableBody.innerHTML = profiles.map(profile => {
            const { id, name, created_at, notes } = profile;
            return `
                <tr class="hover:bg-muted">
                    <td class="px-6 py-4 whitespace-nowrap">${name}</td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="profiles" title="${notes || 'Click to add notes'}">${notes || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(created_at).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="delete-profile-btn text-destructive hover:opacity-70" data-id="${id}"><span class="material-symbols-outlined">delete</span></button>
                    </td>
                </tr>`}).join('');
    }

    // UPDATED: renderCompaniesGrid - now async
    async function renderCompaniesGrid() {
        const searchTerm = companySearchInput.value.toLowerCase();
        const companies = await getAllCompanies();

        // UPDATED: Filter uses objects
        const filteredCompanies = companies.filter(({ id, name, industry, location }) =>
            name.toLowerCase().includes(searchTerm) ||
            (industry || '').toLowerCase().includes(searchTerm) ||
            (location || '').toLowerCase().includes(searchTerm)
        );

        if (filteredCompanies.length === 0) {
            companyGrid.innerHTML = `<p class="text-muted-foreground">No companies found.</p>`;
            return;
        }

        // UPDATED: Map uses objects
        companyGrid.innerHTML = filteredCompanies.map(({ id, name, industry, location }) => `
            <div class="company-card" data-id="${id}">
                <h3 class="font-semibold text-lg">${name}</h3>
                <p class="text-sm text-muted-foreground">${industry || 'No industry'}</p>
                <p class="text-sm text-muted-foreground mt-1 flex items-center">
                    <span class="material-symbols-outlined text-sm mr-1">location_on</span>
                    ${location || 'No location'}
                </p>
            </div>
        `).join('');

        // Add click listeners
        companyGrid.querySelectorAll('.company-card').forEach(card => {
            card.addEventListener('click', () => {
                showCompanyDetail(parseInt(card.dataset.id)); // Ensure ID is number
            });
        });
    }

    // UPDATED: showCompanyDetail - now async
    async function showCompanyDetail(companyId) {
        companyGridContainer.classList.add('hidden');
        companyDetailContainer.classList.remove('hidden');

        // 1. Fetch and populate company details
        const company = await getCompany(companyId);
        if (!company) return;

        const { id, name, industry, location, website, linkedin, notes } = company;
        editCompanyForm.elements.id.value = id;
        editCompanyForm.elements.name.value = name;
        editCompanyForm.elements.industry.value = industry || '';
        editCompanyForm.elements.location.value = location || '';
        editCompanyForm.elements.website.value = website || '';
        editCompanyForm.elements.linkedin.value = linkedin || '';
        editCompanyForm.elements.notes.value = notes || '';

        // 2. Fetch and render related jobs
        const profiles = await getAllProfiles();
        // UPDATED: Profile map uses objects
        const profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p.name;
            return acc;
        }, {});

        const jobs = await getJobsByCompanyId(companyId);

        if (jobs.length === 0) {
            relatedJobsList.innerHTML = `<p class="text-muted-foreground">No jobs found for this company.</p>`;
        } else {
            // UPDATED: Loop uses job objects
            relatedJobsList.innerHTML = jobs.map(job => {
                const { id: jobId, title, status, location, salary, created_at, match_percentage, profile_id } = job;
                return `
                <div class="related-job-card">
                    <div class="flex justify-between items-start">
                        <h4 class="text-sm" data-job-id="${jobId}">${title}</h4>
                        <span class="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">${status}</span>
                    </div>
                    <p><span class="material-symbols-outlined !text-sm">location_on</span> ${location || 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">paid</span> ${salary ? `₹${salary} LPA` : 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">badge</span> ${profilesMap[profile_id] || 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">percent</span> ${match_percentage !== null ? `${match_percentage}% Match` : 'N/A'}</p>
                    <p><span class="material-symbols-outlined !text-sm">calendar_today</span> ${new Date(created_at).toLocaleDateString()}</p>
                </div>
            `}).join('');

            // Add click listeners to job titles
            relatedJobsList.querySelectorAll('h4[data-job-id]').forEach(titleEl => {
                titleEl.addEventListener('click', () => {
                    switchView('jobs-view'); // Switch to main jobs view
                    showJobDetail(parseInt(titleEl.dataset.jobId)); // Open the detail modal
                });
            });
        }

        // Clear AI output
        document.getElementById('company-ai-output').innerHTML = '';
    }

    // UPDATED: handleEditCompany - now async and MERGE LOGIC REMOVED
    async function handleEditCompany(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        const companyId = parseInt(data.id);

        // 1. Get the old company data
        const oldCompany = await getCompany(companyId);

        // 2. Update the company
        const updatedCompany = {
            ...oldCompany, // Preserve any fields not in the form
            id: companyId,
            name: data.name,
            industry: data.industry,
            location: data.location,
            website: data.website,
            linkedin: data.linkedin,
            notes: data.notes
        };
        await updateCompany(updatedCompany);

        // 3. Update company cache
        companyMap.set(companyId, data.name);

        logEvent('SUCCESS', `Updated company: ${data.name}`);
        showStatus('Company updated successfully!', 'success');

        // 3. NO MERGE LOGIC NEEDED!

        await renderCompaniesGrid(); // Refresh grid
        // Refresh related jobs if user is still on the detail page
        if (!companyDetailContainer.classList.contains('hidden')) {
            await showCompanyDetail(companyId);
        }
        // Refresh job list if visible (to update company name)
        if (document.getElementById('jobs-view').offsetParent !== null) {
            await refreshJobsView();
        }
    }

    // REMOVED: openMergeModal, confirmMergeCompany

    // UPDATED: renderPeople - now async
    async function renderPeople() {
        const tableBody = document.getElementById('people-table-body');
        const people = await getAllPeople();

        // UPDATED: Loop uses objects
        tableBody.innerHTML = people.map(person => {
            const { id, first_name, last_name, job_title, company_name, email, linkedin, notes } = person;
            return `
                <tr class="hover:bg-muted">
                    <td class="px-6 py-4 whitespace-nowrap">${first_name} ${last_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${job_title || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${company_name || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${email || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><a href="${linkedin}" target="_blank" class="text-primary hover:underline">${linkedin || ''}</a></td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="people" title="${notes || 'Click to add notes'}">${notes || ''}</td>
                </tr>`}).join('');
    }

    // UPDATED: showJobDetail - now async
    async function showJobDetail(jobId) {
        currentOpenJobId = jobId;
        const job = await getJob(jobId);

        if (!job) {
            logEvent('ERROR', `Could not find job with ID ${jobId}`);
            return;
        }

        const { title, company_id, description, notes, profile_id, match_percentage, ai_keywords, match_justification } = job;

        // Look up company name
        const companyName = companyMap.get(company_id) || 'Unknown Company';

        document.getElementById('detail-job-title').textContent = title;
        document.getElementById('detail-job-company').textContent = companyName;
        // ... (rest of the function is the same, using object properties) ...
        document.getElementById('detail-job-description').innerHTML = description ? description.replace(/\n/g, '<br>') : 'No description provided.';
        document.getElementById('detail-job-notes').textContent = notes || 'No notes for this job.';

        document.getElementById('save-ai-btn').classList.add('hidden');
        unsavedAnalysisData = null;

        if (ai_keywords) {
            try { renderKeywords(JSON.parse(ai_keywords)); }
            catch (e) {
                logEvent('ERROR', `Failed to parse saved keywords for JobID ${jobId}`);
                document.getElementById('ai-detail-panel').innerHTML = `<p class="text-destructive text-sm">Could not load saved analysis.</p>`;
            }
        } else {
            document.getElementById('ai-detail-panel').innerHTML = `<p class="text-muted-foreground text-sm">Click the ✨ button to generate keyword analysis.</p>`;
        }

        if (match_percentage !== null && match_justification) {
            renderMatchAnalysis({ match_percentage, justification: match_justification });
        } else if (profile_id) {
            document.getElementById('ai-match-panel').innerHTML = `<p class="text-muted-foreground text-sm">Click the ✨ button to generate a profile match analysis.</p>`;
        } else {
            document.getElementById('ai-match-panel').innerHTML = `<p class="text-muted-foreground text-sm">Select a profile from the main list to enable match analysis.</p>`;
        }

        jobsListView.classList.add('hidden');
        jobDetailView.classList.remove('hidden');
    }

    // --- Event Handlers ---
    function setupEventListeners() {
        // ... (navLinks, modal buttons, cancel buttons - unchanged) ...
        navLinks.forEach(link => link.addEventListener('click', (e) => switchView(e.currentTarget.dataset.view)));
        ['add-job-btn', 'add-profile-btn', 'add-company-btn', 'add-person-btn'].forEach(id => {
            document.getElementById(id).addEventListener('click', () => openModal(id.replace('-btn', '-modal')));
        });
        document.querySelectorAll('.cancel-modal-btn').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal').id)));


        statusTabs.addEventListener('click', e => {
            if (e.target.classList.contains('status-tab')) {
                currentJobViewStatus = e.target.dataset.status;
                updateActiveTab();
                renderJobs(currentJobViewStatus); // This is now async, but event handler can't be
            }
        });

        document.getElementById('sort-jobs-select').addEventListener('change', e => {
            currentSortOrder = e.target.value;
            logEvent('INFO', `Changed job sort order to: ${e.target.options[e.target.selectedIndex].text}`);
            renderJobs(currentJobViewStatus);
        });

        // Event listener for Table view
        jobsTableBody.addEventListener('click', e => {
            const cell = e.target.closest('td');
            if (cell && cell.dataset.field === 'details') {
                const row = cell.closest('.job-row');
                if (row) showJobDetail(parseInt(row.dataset.id)); // Ensure ID is number
            }

            const analyzeBtn = e.target.closest('.analyze-match-btn');
            if (analyzeBtn) {
                const jobId = parseInt(analyzeBtn.dataset.jobId);
                const profileSelect = analyzeBtn.closest('tr').querySelector('.profile-select');
                if (profileSelect.value) {
                    handleAnalyzeMatchFromList(jobId, parseInt(profileSelect.value));
                } else {
                    showStatus("Please select a profile first.", "error");
                }
            }
        });

        // UPDATED: jobsTableBody 'change' listener
        jobsTableBody.addEventListener('change', async e => {
            if (e.target.classList.contains('profile-select')) {
                const jobId = parseInt(e.target.dataset.jobId);
                const profileId = e.target.value ? parseInt(e.target.value) : null;

                try {
                    const job = await getJob(jobId);
                    if (job) {
                        job.profile_id = profileId;
                        job.match_percentage = null;
                        job.match_justification = null;
                        await updateJob(job);

                        logEvent('INFO', `Set profile to ID ${profileId || 'None'} for job ID ${jobId}.`);
                        const analyzeBtn = e.target.closest('tr').querySelector('.analyze-match-btn');
                        analyzeBtn.disabled = !profileId;
                        await renderJobs(currentJobViewStatus);
                    }
                } catch (err) {
                    logEvent('ERROR', `Failed to update profile ID: ${err.message}`);
                }
            }
        });

        // ... (jobsTableBody dblclick listener - unchanged) ...
        jobsTableBody.addEventListener('dblclick', e => {
            const cell = e.target.closest('td');
            if (cell && cell.dataset.field === 'status') makeStatusEditable(cell);
        });

        // NEW: Event listener for Kanban view
        jobsKanbanContainer.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                showJobDetail(parseInt(card.dataset.id)); // Ensure ID is number
            }
        });

        // ... (View Toggle, Pagination listeners - unchanged) ...
        showTableViewBtn.addEventListener('click', () => toggleJobsView('table'));
        showKanbanViewBtn.addEventListener('click', () => toggleJobsView('kanban'));
        prevPageBtn.addEventListener('click', () => {
            if (appState.currentPage > 1) {
                appState.currentPage--;
                renderJobs(currentJobViewStatus);
            }
        });
        nextPageBtn.addEventListener('click', () => {
            appState.currentPage++; // renderJobs will cap this if it's too high
            renderJobs(currentJobViewStatus);
        });
        itemsPerPageSelect.addEventListener('change', (e) => {
            appState.itemsPerPage = parseInt(e.target.value, 10);
            appState.currentPage = 1; // Reset to first page
            renderJobs(currentJobViewStatus);
        });

        // ... (Column toggle popover listeners - unchanged) ...
        manageColumnsBtn.addEventListener('click', () => {
            manageColumnsPopover.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!manageColumnsBtn.contains(e.target) && !manageColumnsPopover.contains(e.target)) {
                manageColumnsPopover.classList.remove('show');
            }
        });


        // UPDATED: 'profiles-table-body' click listener
        document.getElementById('profiles-table-body').addEventListener('click', async e => {
            const deleteBtn = e.target.closest('.delete-profile-btn');
            if (deleteBtn && true) { // Bypassed confirm()
                const profileId = parseInt(deleteBtn.dataset.id);
                try {
                    // Cascade "delete": un-link jobs from this profile
                    const jobsToUpdate = await getJobsByProfileId(profileId);
                    for (const job of jobsToUpdate) {
                        job.profile_id = null;
                        job.match_percentage = null;
                        job.match_justification = null;
                        await updateJob(job);
                    }

                    // Delete the profile
                    await deleteProfile(profileId);

                    logEvent('SUCCESS', `Deleted profile ID ${profileId} and unlinked ${jobsToUpdate.length} jobs.`);
                    showStatus('Profile deleted.', 'success');
                    renderProfiles();
                    refreshJobsView(); // Refresh jobs view in case profile was used
                } catch (err) {
                    logEvent('ERROR', `Failed to delete profile: ${err.message}`);
                    showStatus('Error deleting profile.', 'error');
                }
            }
        });

        // ... (back-to-jobs-list, AI buttons - unchanged) ...
        document.getElementById('back-to-jobs-list').addEventListener('click', () => {
            jobDetailView.classList.add('hidden');
            jobsListView.classList.remove('hidden');
            refreshJobsView(); // Use new refresh function
        });
        document.getElementById('generate-ai-btn').addEventListener('click', generateAndDisplayFullAnalysis);
        document.getElementById('save-ai-btn').addEventListener('click', handleSaveAnalysis);

        // ... (Form submit listeners - unchanged) ...
        document.getElementById('add-job-form').addEventListener('submit', handleAddJob);
        document.getElementById('add-profile-form').addEventListener('submit', handleAddProfile);
        document.getElementById('add-company-form').addEventListener('submit', handleAddCompany);
        document.getElementById('add-person-form').addEventListener('submit', handleAddPerson);
        document.getElementById('edit-notes-form').addEventListener('submit', handleEditNotes);

        // ... (Company view listeners - unchanged) ...
        companySearchInput.addEventListener('input', renderCompaniesGrid);
        backToCompanyGridBtn.addEventListener('click', () => {
            companyDetailContainer.classList.add('hidden');
            companyGridContainer.classList.remove('hidden');
            renderCompaniesGrid(); // Refresh grid in case names changed
        });
        editCompanyForm.addEventListener('submit', handleEditCompany);


        // ... ('main' click listener for notes - unchanged) ...
        document.querySelector('main').addEventListener('click', e => {
            const notesCell = e.target.closest('td[data-field="notes"]');
            if (notesCell) {
                openNotesEditor(notesCell);
            }
        });

        // ... (Settings listeners - unchanged) ...
        document.getElementById('llm-api-url').addEventListener('change', saveSettings);
        autoCreateCompanyToggle.addEventListener('change', saveSettings);
        themeSelect.addEventListener('change', () => {
            applyTheme(themeSelect.value);
            saveSettings();
        });
        document.getElementById('test-connection-btn').addEventListener('click', testLLMConnection);
        document.getElementById('backup-db-btn').addEventListener('click', downloadBackup);
        document.getElementById('restore-db-input').addEventListener('change', restoreDatabase);
    }

    // ... (openNotesEditor - unchanged) ...
    function openNotesEditor(cell) {
        const id = cell.dataset.id;
        const type = cell.dataset.type;
        const currentNotes = cell.title.replace('Click to add notes', ''); // Use title to get full notes

        const form = document.getElementById('edit-notes-form');
        form.elements.itemId.value = id;
        form.elements.itemType.value = type;
        form.elements.notes.value = currentNotes;

        openModal('edit-notes-modal');
    }


    // UPDATED: handleEditNotes - now async
    async function handleEditNotes(e) {
        e.preventDefault();
        const form = e.target;
        const id = parseInt(form.elements.itemId.value);
        const type = form.elements.itemType.value;
        const notes = form.elements.notes.value;

        if (!id || !type) {
            showStatus("Error saving notes: missing data.", "error");
            return;
        }

        try {
            switch (type) {
                case 'jobs':
                    await updateJobNotes(id, notes);
                    await refreshJobsView();
                    break;
                case 'profiles':
                    const profile = await getProfile(id);
                    if (profile) {
                        profile.notes = notes;
                        await updateProfile(profile);
                    }
                    await renderProfiles();
                    break;
                case 'companies':
                    const company = await getCompany(id);
                    if (company) {
                        company.notes = notes;
                        await updateCompany(company);
                    }
                    await renderCompaniesGrid();
                    break;
                case 'people':
                    await updatePersonNotes(id, notes);
                    await renderPeople();
                    break;
            }
            logEvent('SUCCESS', `Updated notes for ${type} ID ${id}.`);
            showStatus('Notes updated successfully!', 'success');
            closeModal('edit-notes-modal');

        } catch (err) {
            logEvent('ERROR', `Failed to update notes: ${err.message}`);
            showStatus('Error saving notes.', 'error');
        }
    }

    // UPDATED: handleAddJob - now async
    async function handleAddJob(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        let companyId;

        try {
            // NEW: Auto-create company logic with foreign keys
            if (appState.autoCreateCompany && data.company_name) {
                let company = await getCompanyByName(data.company_name);
                if (!company) {
                    companyId = await addCompany({
                        name: data.company_name,
                        industry: null, location: null, website: null, linkedin: null, notes: null
                    });
                    companyMap.set(companyId, data.company_name); // Update cache
                    logEvent('INFO', `Auto-created new company: ${data.company_name}`);
                } else {
                    companyId = company.id;
                }
            }

            const newJob = {
                title: data.title,
                company_id: companyId,
                location: data.location,
                salary: data.salary ? parseFloat(data.salary) : null,
                url: data.url,
                description: data.description,
                status: 'Bookmarked',
                notes: data.notes,
                created_at: new Date().toISOString(),
                profile_id: null,
                match_percentage: null,
                ai_keywords: null,
                match_justification: null
            };

            await addJob(newJob);
            logEvent('SUCCESS', `Added new job: ${data.title}`);
            showStatus('Job saved successfully!', 'success');
            await refreshJobsView();
            closeModal('add-job-modal');
        } catch (err) {
            logEvent('ERROR', `Failed to add job: ${err.message}`);
            showStatus('Error saving job.', 'error');
        }
    }

    // UPDATED: handleAddProfile - now async
    async function handleAddProfile(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        if (!data.name || !data.content) {
            showStatus("Profile Name and Content are required.", "error"); return;
        }
        try {
            const newProfile = {
                name: data.name,
                content: data.content,
                notes: data.notes,
                created_at: new Date().toISOString()
            };
            await addProfile(newProfile);
            logEvent('SUCCESS', `Added new profile: ${data.name}`);
            showStatus('Profile saved!', 'success');
            await renderProfiles();
            closeModal('add-profile-modal');
        } catch (err) {
            logEvent('ERROR', `Failed to add profile: ${err.message}`);
            showStatus('Error saving profile.', 'error');
        }
    }

    // UPDATED: handleAddCompany - now async
    async function handleAddCompany(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            const newCompany = {
                name: data.name,
                industry: data.industry,
                location: data.location,
                website: data.website,
                linkedin: data.linkedin,
                notes: data.notes
            };
            const newId = await addCompany(newCompany);
            companyMap.set(newId, data.name); // Update cache

            logEvent('SUCCESS', `Added company: ${data.name}`);
            showStatus('Company saved!', 'success');
            await renderCompaniesGrid(); // Refresh grid
            closeModal('add-company-modal');
        } catch (err) {
            logEvent('ERROR', `Failed to add company: ${err.message}`);
            showStatus('Error saving company. Is the name unique?', 'error');
        }
    }

    // UPDATED: handleAddPerson - now async
    async function handleAddPerson(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            // No need to change data, just add it
            await addPerson(data);
            logEvent('SUCCESS', `Added contact: ${data.first_name} ${data.last_name}`);
            showStatus('Contact saved!', 'success');
            await renderPeople();
            closeModal('add-person-modal');
        } catch (err) {
            logEvent('ERROR', `Failed to add person: ${err.message}`);
            showStatus('Error saving contact.', 'error');
        }
    }

    // UPDATED: makeStatusEditable - now async
    function makeStatusEditable(cell) {
        const currentStatus = cell.dataset.currentStatus;
        cell.innerHTML = `<select class="editable-select text-sm">${JOB_STATUSES.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
        const select = cell.querySelector('select');
        select.focus();

        const saveChange = async () => {
            const newStatus = select.value;
            const jobId = parseInt(cell.closest('.job-row').dataset.id);
            try {
                const job = await getJob(jobId);
                if (job) {
                    job.status = newStatus;
                    await updateJob(job);
                    logEvent('INFO', `Updated status for job ID ${jobId} to ${newStatus}`);
                    showStatus('Status updated.', 'success');
                    await renderJobs(currentJobViewStatus); // Re-render the jobs list
                }
            } catch (err) {
                logEvent('ERROR', `Failed to update status: ${err.message}`);
                showStatus('Error updating status.', 'error');
                // Re-render to revert change
                await renderJobs(currentJobViewStatus);
            }
        };
        select.addEventListener('blur', saveChange);
        select.addEventListener('change', saveChange);
    }

    // --- Auto Backup & Persistence ---
    // REMOVED: autoBackupDatabase() - IndexedDB persists automatically

    // UPDATED: downloadBackup - now uses exportDB
    async function downloadBackup() {
        try {
            const jsonString = await exportDB();
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `careerjam_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            logEvent('SUCCESS', 'Manual database backup created.');
            showStatus('Backup file downloaded.', 'success');
        } catch (err) {
            logEvent('ERROR', `Backup failed: ${err.message}`);
            showStatus('Backup failed.', 'error');
        }
    }

    // ... (applyTheme, saveSettings, loadSettings - unchanged) ...
    // NOTE: 'auto-backup-db' is no longer used, but we keep settings in localStorage

    // NEW: Apply Theme Function
    function applyTheme(themeName) {
        if (themeName === 'Humanist Dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        appState.theme = themeName;
    }

    function saveSettings() {
        const apiUrl = document.getElementById('llm-api-url').value;
        appState.autoCreateCompany = autoCreateCompanyToggle.checked;
        appState.theme = themeSelect.value; // Save theme

        const settings = {
            llmApiUrl: apiUrl,
            autoCreateCompany: appState.autoCreateCompany,
            itemsPerPage: appState.itemsPerPage, // Save pagination setting
            columnConfig: appState.columnConfig, // Save NEW column config
            theme: appState.theme // Save theme
        };
        localStorage.setItem('jobTrackerSettings', JSON.stringify(settings));
        logEvent('SUCCESS', 'Settings saved.');
        showStatus('Settings saved!', 'success');
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('jobTrackerSettings'));
        if (settings) {
            if (settings.llmApiUrl) {
                document.getElementById('llm-api-url').value = settings.llmApiUrl;
            }
            appState.autoCreateCompany = settings.autoCreateCompany !== false; // default to true
            autoCreateCompanyToggle.checked = appState.autoCreateCompany;

            // Load theme
            appState.theme = settings.theme || 'Humanist Dark';
            themeSelect.value = appState.theme;
            applyTheme(appState.theme);

            // Load pagination and column settings
            appState.itemsPerPage = settings.itemsPerPage || 10;
            itemsPerPageSelect.value = appState.itemsPerPage;

            // NEW: Load columnConfig
            if (settings.columnConfig) {
                appState.columnConfig = settings.columnConfig;
                // Ensure all keys from COLUMN_DEFINITIONS exist in the loaded config
                const loadedKeys = appState.columnConfig.map(c => c.key);
                Object.keys(COLUMN_DEFINITIONS).forEach(key => {
                    if (!loadedKeys.includes(key)) {
                        appState.columnConfig.push({
                            key: key,
                            label: COLUMN_DEFINITIONS[key],
                            visible: false // Default new columns to hidden
                        });
                    }
                });
                // Ensure all labels are up-to-date
                appState.columnConfig.forEach(col => {
                    if (COLUMN_DEFINITIONS[col.key]) {
                        col.label = COLUMN_DEFINITIONS[col.key];
                    }
                });
            }
        }

        // Load legacy visibility settings if they exist and convert them
        const legacyColumnVisibility = JSON.parse(localStorage.getItem('jobTrackerColumnVisibility'));
        if (legacyColumnVisibility) {
            // ... (existing code for legacy settings) ...
            appState.columnConfig.forEach(col => {
                if (legacyColumnVisibility[col.key] !== undefined) {
                    col.visible = legacyColumnVisibility[col.key];
                }
            });
            localStorage.removeItem('jobTrackerColumnVisibility'); // Remove old key
            saveSettings(); // Re-save under new structure
        }
    }


    // UPDATED: restoreDatabase - now uses importDB
    async function restoreDatabase(event) {
        const file = event.target.files[0];
        if (!file) return;
        showLoading('Restoring Database...');
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const jsonString = e.target.result;
                await importDB(jsonString);

                // Re-init the app to load new data
                await init();

                logEvent('SUCCESS', `Database restored from file: ${file.name}`);
                showStatus('Database restored successfully!', 'success');
                switchView('jobs-view');
            } catch (err) {
                console.error("Restore failed:", err);
                logEvent('ERROR', `Database restore failed: ${err.message}`);
                showStatus('Database restore failed. Check file format.', 'error');
            } finally {
                hideLoading();
                event.target.value = '';
            }
        };
        reader.readAsText(file); // Read as text for JSON
    }

    // --- AI Integration ---
    // ... (testLLMConnection, callLLM, runKeywordsAnalysis, runMatchAnalysis - unchanged) ...
    async function testLLMConnection() {
        const apiUrl = document.getElementById('llm-api-url')?.value;
        if (!apiUrl) { showStatus('Please enter an API Endpoint URL first.', 'error'); return; }
        const btn = document.getElementById('test-connection-btn');
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined spin">progress_activity</span>`;
        showStatus('Testing connection...', 'info');
        logEvent('INFO', `Testing LLM connection to ${apiUrl}`);
        try {
            const response = await fetch(apiUrl, {
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "local-model", messages: [{ role: "user", content: "Say 'Hello'" }] })
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const result = await response.json();
            if (result.choices && result.choices[0]) {
                showStatus('Connection successful!', 'success');
                logEvent('SUCCESS', 'LLM connection test was successful.');
            } else { throw new Error('Invalid response format from server.'); }
        } catch (error) {
            console.error("LLM Connection Test Error:", error);
            showStatus(`Connection failed. Check logs.`, 'error');
            logEvent('ERROR', `LLM connection test failed: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Test';
        }
    }

    async function callLLM(prompt, content) {
        const apiUrl = document.getElementById('llm-api-url')?.value;
        if (!apiUrl) throw new Error("LLM API Endpoint not set in Settings.");

        // Add try-catch for network/parsing errors
        try {
            const response = await fetch(apiUrl, {
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "local-model", messages: [{ role: "user", content: `${prompt}\n\n---\n\n${content}` }], stream: false })
            });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const result = await response.json();
            let llmContent = result.choices[0]?.message?.content;

            if (llmContent) {
                // More robust JSON extraction
                const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    llmContent = jsonMatch[0];
                } else {
                    llmContent = llmContent.replace(/```json/g, '').replace(/```/g, '').trim();
                }
            }
            return llmContent;
        } catch (err) {
            logEvent('ERROR', `LLM call failed: ${err.message}`);
            throw err;
        }
    }

    async function runKeywordsAnalysis(description) {
        const prompt = `Based on the following job description, extract key skills and technologies. Categorize them under 'Requirements', 'Responsibilities', and 'Preferred'. Provide the output as a single, minified JSON object with no extra text or markdown. Example: {"Requirements":["Skill A","Skill B"],"Responsibilities":["Task C","Task D"],"Preferred":["Tool E"]}`;
        // Add try-catch for JSON parsing
        try {
            const content = await callLLM(prompt, description);
            return JSON.parse(content);
        } catch (err) {
            logEvent('ERROR', `Failed to parse keywords JSON: ${err.message}`);
            throw new Error('AI failed to return valid JSON for keywords.');
        }
    }

    async function runMatchAnalysis(jobDescription, profileContent) {
        const prompt = `Analyze the following resume against the job description. Provide a percentage match score (0-100) and a brief, one-sentence justification. Return a single, minified JSON object with keys "match_percentage" and "justification". Example: {"match_percentage":85,"justification":"Strong match in key skills, but lacks preferred experience."}`;
        const combinedContent = `[RESUME]\n${profileContent}\n\n[JOB DESCRIPTION]\n${jobDescription}`;
        // Add try-catch for JSON parsing
        try {
            const content = await callLLM(prompt, combinedContent);
            return JSON.parse(content);
        } catch (err) {
            logEvent('ERROR', `Failed to parse match JSON: ${err.message}`);
            throw new Error('AI failed to return valid JSON for match analysis.');
        }
    }


    // UPDATED: handleAnalyzeMatchFromList - now async
    async function handleAnalyzeMatchFromList(jobId, profileId) {
        showStatus(`Analyzing match for job...`, 'info');
        logEvent('INFO', `Starting AI profile match for JobID: ${jobId} & ProfileID: ${profileId}`);
        try {
            const job = await getJob(jobId);
            const profile = await getProfile(profileId);

            if (!job || !profile) { showStatus("Job/profile content is empty.", "error"); return; }

            const { match_percentage, justification } = await runMatchAnalysis(job.description, profile.content);

            job.match_percentage = match_percentage;
            job.match_justification = justification;
            await updateJob(job);

            logEvent('SUCCESS', `AI match for JobID ${jobId} is ${match_percentage}%.`);
            showStatus(`AI Match: ${match_percentage}%`, 'success');
            await renderJobs(currentJobViewStatus);
        } catch (error) {
            console.error("LLM Match Error (List View):", error);
            logEvent('ERROR', `LLM Match Error (List View): ${error.message}`);
            showStatus('AI match analysis failed.', 'error');
        }
    }

    // UPDATED: generateAndDisplayFullAnalysis - now async
    async function generateAndDisplayFullAnalysis() {
        if (!currentOpenJobId) return;
        const generateBtn = document.getElementById('generate-ai-btn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="material-symbols-outlined spin">progress_activity</span>`;

        const keywordsPanel = document.getElementById('ai-detail-panel');
        const matchPanel = document.getElementById('ai-match-panel');
        keywordsPanel.innerHTML = `<div class="text-center"><span class="material-symbols-outlined spin mr-2">progress_activity</span>Analyzing keywords...</div>`;

        try {
            const job = await getJob(currentOpenJobId);
            const { description, profile_id } = job;

            const analysisPromises = [runKeywordsAnalysis(description)];

            if (profile_id) {
                matchPanel.innerHTML = `<div class="text-center mt-4"><span class="material-symbols-outlined spin mr-2">progress_activity</span>Analyzing match...</div>`;
                const profile = await getProfile(profile_id);
                if (profile) {
                    analysisPromises.push(runMatchAnalysis(description, profile.content));
                }
            }

            const [keywordsResult, matchResult] = await Promise.all(analysisPromises);

            unsavedAnalysisData = { keywords: keywordsResult, match: matchResult || null };
            renderKeywords(keywordsResult);
            if (matchResult) renderMatchAnalysis(matchResult);

            document.getElementById('save-ai-btn').classList.remove('hidden');
            showStatus('AI analysis generated. Click Save to keep it.', 'success');
            logEvent('SUCCESS', `Generated new AI analysis for JobID ${currentOpenJobId}`);
        } catch (error) {
            console.error("Full Analysis Error:", error);
            logEvent('ERROR', `Full analysis failed: ${error.message}`);
            showStatus('AI analysis failed. Check logs.', 'error');
            keywordsPanel.innerHTML = `<p class="text-destructive text-sm">Keyword analysis failed.</p>`;
            if (document.getElementById('ai-match-panel').innerHTML.includes('spin')) {
                matchPanel.innerHTML = `<p class="text-destructive text-sm">Match analysis failed.</p>`;
            }
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<span class="material-symbols-outlined">auto_awesome</span>`;
        }
    }

    // UPDATED: handleSaveAnalysis - now async
    async function handleSaveAnalysis() {
        if (!unsavedAnalysisData || !currentOpenJobId) { showStatus('No analysis data to save.', 'error'); return; }
        const { keywords, match } = unsavedAnalysisData;

        try {
            const job = await getJob(currentOpenJobId);
            if (job) {
                job.ai_keywords = JSON.stringify(keywords);
                job.match_percentage = match ? match.match_percentage : null;
                job.match_justification = match ? match.justification : null;
                await updateJob(job);

                logEvent('SUCCESS', `Saved AI analysis for JobID ${currentOpenJobId}`);
                showStatus('AI analysis saved successfully!', 'success');
                document.getElementById('save-ai-btn').classList.add('hidden');
                unsavedAnalysisData = null;
            }
        } catch (err) {
            logEvent('ERROR', `Failed to save analysis: ${err.message}`);
            showStatus('Error saving analysis.', 'error');
        }
    }

    // ... (renderKeywords, renderMatchAnalysis - unchanged) ...
    function renderKeywords(data) {
        const panel = document.getElementById('ai-detail-panel');
        panel.innerHTML = '';
        const categoryOrder = ['Requirements', 'Responsibilities', 'Preferred'];
        let contentExists = false;
        for (const category of categoryOrder) {
            if (data && data[category] && data[category].length > 0) {
                contentExists = true;
                const categoryDiv = document.createElement('div');
                categoryDiv.innerHTML = `<h4 class="font-semibold text-muted-foreground text-sm mb-2">${category}</h4>`;
                const tagContainer = document.createElement('div');
                tagContainer.className = 'flex flex-wrap gap-2';
                data[category].forEach(keyword => {
                    const tag = document.createElement('span');
                    tag.className = 'bg-primary bg-opacity-30 text-primary text-opacity-90 text-xs font-medium px-2.5 py-1 rounded-full';
                    tag.textContent = keyword;
                    tagContainer.appendChild(tag);
                });
                categoryDiv.appendChild(tagContainer);
                panel.appendChild(categoryDiv);
            }
        }
        if (!contentExists) {
            panel.innerHTML = `<p class="text-muted-foreground text-sm">The AI could not extract any specific keywords.</p>`;
        }
    }

    function renderMatchAnalysis(data) {
        const panel = document.getElementById('ai-match-panel');
        panel.innerHTML = `
             <h4 class="font-semibold text-muted-foreground text-sm mb-2">Profile Match Analysis</h4>
             <div class="text-3xl font-bold text-primary">${data.match_percentage}%</div>
             <p class="text-sm text-card-foreground mt-2">${data.justification}</p>
            `;
        // SANITIZE: Use textContent for user-generated content
        panel.querySelector('p').textContent = data.justification;
    }


    // --- Start the App ---
    init();
});
