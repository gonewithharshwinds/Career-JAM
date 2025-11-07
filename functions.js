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

// NEW: Function to delete a company
async function deleteCompany(id) {
    // Note: This only deletes the company.
    // Related jobs will now show 'Unknown Company' unless you update them.
    return await deleteItem('companies', id);
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

// NEW: Function to update a profile
async function updateProfile(profile) {
    return await updateItem('profiles', profile);
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

// --- People ---

async function addPerson(person) {
    return await addItem('people', person);
}

// NEW: Function to get a single person
async function getPerson(id) {
    return await getItem('people', id);
}

// NEW: Function to update a person
async function updatePerson(person) {
    return await updateItem('people', person);
}

// NEW: Function to delete a person
async function deletePerson(id) {
    return await deleteItem('people', id);
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

// NEW: Function to delete a job
async function deleteJob(id) {
    return await deleteItem('jobs', id);
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

    // NEW: Variables to store detail view IDs
    let currentJobDetailId = null;
    let currentCompanyDetailId = null;

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

    // --- Utility Functions ---

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

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.querySelector('.modal-content').classList.add('scale-95');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('flex');
            // Reset forms, but not the delete modal
            if (modalId !== 'confirm-delete-modal') {
                modal.querySelector('form')?.reset();
            }
            // Reset job modal title
            if (modalId === 'add-job-modal') {
                modal.querySelector('h3').textContent = 'Add a New Job Post';
                modal.querySelector('button[type="submit"]').textContent = 'Save Job';
                modal.querySelector('input[name="id"]').value = '';
            }
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
            initDeleteAndEditHandlers(); // NEW: Initialize edit/delete listeners
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

        // UPDATED: Loop now uses job objects
        jobsTableBody.innerHTML = jobs.map(job => {
            const { id, title, company_id, location, status: currentStatus, created_at, profile_id, match_percentage, notes, salary, url, description } = job;

            // Use companyMap to get name from ID
            const company_name = companyMap.get(company_id) || 'Unknown Company';

            // UPDATED: Profile options use objects
            const profileOptionsHtml = `<option value="">- Select Profile -</option>` + profiles.map(p => `<option value="${p.id}" ${p.id === profile_id ? 'selected' : ''}>${p.name}</option>`).join('');

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
                        content = `<td class="px-6 py-4 whitespace-nowrap max-w-xs truncate" data-field="notes" data-id="${id}" data-type="jobs" title="${notes || 'Click to add notes'}">${notes || ''}</td>`;
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

    // REPLACED: renderProfiles with new version (was renderProfilesTable)
    async function renderProfiles() {
        try {
            const profiles = await getAllProfiles();
            const tbody = document.getElementById('profiles-table-body');
            tbody.innerHTML = '';

            if (profiles.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-muted-foreground">No profiles found. Add one to get started.</td></tr>';
                return;
            }

            profiles.forEach(profile => {
                const tr = document.createElement('tr');
                tr.className = 'job-row';
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${escapeHTML(profile.name)}</td>
                    <td data-field="notes" data-id="${profile.id}" data-type="profiles" class="px-6 py-4 whitespace-pre-wrap text-sm cursor-pointer hover:bg-muted" title="${profile.notes || 'Click to add notes'}">${escapeHTML(truncateText(profile.notes, 100))}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">${new Date(profile.created_at).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="edit-profile-btn p-1 text-primary hover:text-accent" data-id="${profile.id}" title="Edit Profile">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="delete-profile-btn p-1 text-destructive hover:text-red-700" data-id="${profile.id}" data-name="${escapeHTML(profile.name)}" title="Delete Profile">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners for new buttons
            tbody.querySelectorAll('.edit-profile-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    openEditProfileModal(id);
                });
            });

            tbody.querySelectorAll('.delete-profile-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    const name = e.currentTarget.dataset.name;
                    openDeleteModal(id, 'profile', name);
                });
            });

            // Re-attach notes listener
            tbody.querySelectorAll('td[data-field="notes"]').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    openNotesEditor(e.currentTarget);
                });
            });

        } catch (error) {
            console.error("Error rendering profiles table:", error);
        }
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
        currentCompanyDetailId = companyId; // NEW: Set current company ID
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

        try {
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

            // 4. Refresh grid/views
            await renderCompaniesGrid(); // Refresh grid
            // Refresh related jobs if user is still on the detail page
            if (!companyDetailContainer.classList.contains('hidden')) {
                await showCompanyDetail(companyId);
            }
            // Refresh job list if visible (to update company name)
            if (document.getElementById('jobs-view').offsetParent !== null) {
                await refreshJobsView();
            }
        } catch (err) {
            logEvent('ERROR', `Failed to update company: ${err.message}`);
            showStatus('Error updating company. Is the name unique?', 'error');
        }
    }

    // REMOVED: openMergeModal, confirmMergeCompany

    // REPLACED: renderPeople with new version (was renderPeopleTable)
    async function renderPeople() {
        try {
            const people = await getAllPeople();
            const tbody = document.getElementById('people-table-body');
            tbody.innerHTML = '';

            if (people.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-muted-foreground">No contacts found.</td></tr>';
                return;
            }

            people.forEach(person => {
                const tr = document.createElement('tr');
                tr.className = 'job-row';
                const fullName = `${person.first_name} ${person.last_name}`;
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${escapeHTML(fullName)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${escapeHTML(person.job_title)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${escapeHTML(person.company_name)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${person.email ? `<a href="mailto:${escapeHTML(person.email)}" class="text-primary hover:underline">${escapeHTML(person.email)}</a>` : ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${person.linkedin ? `<a href="${person.linkedin}" target="_blank" class="text-primary hover:underline">View Profile</a>` : ''}</td>
                    <td data-field="notes" data-id="${person.id}" data-type="people" class="px-6 py-4 whitespace-pre-wrap text-sm cursor-pointer hover:bg-muted" title="${person.notes || 'Click to add notes'}">${escapeHTML(truncateText(person.notes, 100))}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="edit-person-btn p-1 text-primary hover:text-accent" data-id="${person.id}" title="Edit Contact">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="delete-person-btn p-1 text-destructive hover:text-red-700" data-id="${person.id}" data-name="${escapeHTML(fullName)}" title="Delete Contact">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners for new buttons
            tbody.querySelectorAll('.edit-person-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    openEditPersonModal(id);
                });
            });

            tbody.querySelectorAll('.delete-person-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    const name = e.currentTarget.dataset.name;
                    openDeleteModal(id, 'person', name);
                });
            });

            // Re-attach notes listener
            tbody.querySelectorAll('td[data-field="notes"]').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    openNotesEditor(e.currentTarget);
                });
            });

        } catch (error) {
            console.error("Error rendering people table:", error);
        }
    }

    // UPDATED: showJobDetail - now async
    async function showJobDetail(jobId) {
        currentOpenJobId = jobId;
        currentJobDetailId = jobId; // NEW: Set detail ID
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
        
        // Modal Open Buttons
        document.getElementById('add-job-btn').addEventListener('click', () => {
            // NEW: Reset form for 'add' mode
            const modal = document.getElementById('add-job-modal');
            const form = document.getElementById('add-job-form');
            form.reset();
            form.querySelector('input[name="id"]').value = ''; // Clear ID field
            modal.querySelector('h3').textContent = 'Add a New Job Post';
            modal.querySelector('button[type="submit"]').textContent = 'Save Job';
            openModal('add-job-modal');
        });
        document.getElementById('add-profile-btn').addEventListener('click', () => openModal('add-profile-modal'));
        document.getElementById('add-company-btn').addEventListener('click', () => openModal('add-company-modal'));
        document.getElementById('add-person-btn').addEventListener('click', () => openModal('add-person-modal'));
        
        // Modal Cancel Buttons
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


        // REMOVED: Old profiles-table-body delete listener (now handled in renderProfiles)

        document.getElementById('back-to-jobs-list').addEventListener('click', () => {
            jobDetailView.classList.add('hidden');
            jobsListView.classList.remove('hidden');
            currentJobDetailId = null; // NEW: Clear detail ID
            refreshJobsView(); // Use new refresh function
        });

        document.getElementById('generate-ai-btn').addEventListener('click', generateAndDisplayFullAnalysis);
        document.getElementById('save-ai-btn').addEventListener('click', handleSaveAnalysis);

        // REPLACED: 'add-job-form' listener with new one
        document.getElementById('add-job-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            
            const jobId = formData.get('id') ? parseInt(formData.get('id')) : null;
            const companyName = formData.get('company_name').trim();
            
            try {
                // Find or create company
                let company = await getCompanyByName(companyName);
                let companyId;
                if (!company && appState.autoCreateCompany) {
                    const newCompany = { name: companyName, industry: '', location: formData.get('location'), website: '', linkedin: '', notes: '' };
                    companyId = await addCompany(newCompany);
                    companyMap.set(companyId, companyName); // Update cache
                } else if (company) {
                    companyId = company.id;
                } else {
                    showStatus(`Company "${companyName}" not found. Add it from the Companies tab or enable auto-create in settings.`, "error");
                    return;
                }

                const jobData = {
                    title: formData.get('title'),
                    company_id: companyId, // Use foreign key
                    location: formData.get('location'),
                    salary: parseFloat(formData.get('salary')) || null,
                    url: formData.get('url'),
                    description: formData.get('description'),
                    notes: formData.get('notes'),
                };

                if (jobId) {
                    // UPDATE existing job
                    jobData.id = jobId;
                    // We need to fetch the original job to preserve status, etc.
                    const originalJob = await getJob(jobId);
                    jobData.status = originalJob.status;
                    jobData.created_at = originalJob.created_at;
                    jobData.profile_id = originalJob.profile_id;
                    jobData.match_percentage = originalJob.match_percentage;
                    jobData.match_justification = originalJob.match_justification;
                    jobData.ai_keywords = originalJob.ai_keywords;

                    await updateJob(jobData);
                    showStatus(`Job "${jobData.title}" updated successfully.`);
                    // If the updated job is the one in the detail view, refresh it
                    if (jobId === currentJobDetailId) {
                        await showJobDetail(jobId);
                    }
                } else {
                    // ADD new job
                    jobData.created_at = new Date().toISOString();
                    jobData.status = 'Bookmarked'; // Default status for new jobs
                    jobData.match_percentage = null;
                    jobData.profile_id = null;
                    jobData.match_justification = null;
                    jobData.ai_keywords = null;
                    
                    await addJob(jobData);
                    showStatus(`New job "${jobData.title}" added.`);
                }
                
                closeModal('add-job-modal');
                form.reset();
                await refreshJobsView();
            } catch (error) {
                console.error('Error saving job:', error);
                showStatus(`Error saving job: ${error.message}`, 'error');
            }
        });
        
        document.getElementById('add-profile-form').addEventListener('submit', handleAddProfile);
        document.getElementById('add-company-form').addEventListener('submit', handleAddCompany);
        document.getElementById('add-person-form').addEventListener('submit', handleAddPerson);
        document.getElementById('edit-notes-form').addEventListener('submit', handleEditNotes);
        
        // NEW: Company view listeners
        companySearchInput.addEventListener('input', renderCompaniesGrid);
        backToCompanyGridBtn.addEventListener('click', () => {
            companyDetailContainer.classList.add('hidden');
            companyGridContainer.classList.remove('hidden');
            currentCompanyDetailId = null; // NEW: Clear detail ID
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
        // Use title to get full notes, fallback to textContent
        const currentNotes = cell.title.replace('Click to add notes', '') || cell.textContent;

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

    // REMOVED: handleAddJob (now inline in setupEventListeners)

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
             <p class="text-sm text-card-foreground mt-2"></p>
             `;
        // SANITIZE: Use textContent for user-generated content
        panel.querySelector('p').textContent = data.justification;
    }


    // =========================================================================
    // NEW: EDIT/DELETE FUNCTIONS
    // =========================================================================

    /**
     * 1. NEW: MAIN INITIALIZER FOR EDIT/DELETE LISTENERS
     */
    function initDeleteAndEditHandlers() {

        // --- Generic Delete Modal Handlers ---
        const deleteModal = document.getElementById('confirm-delete-modal');
        document.getElementById('confirm-delete-btn').addEventListener('click', handleDeleteConfirmed);

        // Add listeners to all 'cancel' buttons to close the delete modal
        deleteModal.querySelectorAll('.cancel-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => closeDeleteModal());
        });

        // --- Job Edit/Delete (Detail View) ---
        document.getElementById('edit-job-detail-btn').addEventListener('click', handleEditJobDetail);
        document.getElementById('delete-job-detail-btn').addEventListener('click', handleDeleteJobDetail);

        // --- Company Delete (Detail View) ---
        document.getElementById('delete-company-btn').addEventListener('click', handleDeleteCompanyDetail);

        // --- Profile Edit (Modal) ---
        document.getElementById('edit-profile-form').addEventListener('submit', handleEditProfileSubmit);

        // --- Person Edit (Modal) ---
        document.getElementById('edit-person-form').addEventListener('submit', handleEditPersonSubmit);
    }

    /**
     * 2. GENERIC DELETE MODAL FUNCTIONS
     */
    function openDeleteModal(id, type, name) {
        const modal = document.getElementById('confirm-delete-modal');
        document.getElementById('delete-confirmation-text').textContent = `Do you really want to delete "${name}"? This action cannot be undone.`;
        document.getElementById('delete-item-id').value = id;
        document.getElementById('delete-item-type').value = type;
        modal.classList.add('flex');
        setTimeout(() => modal.style.opacity = '1', 10);
        setTimeout(() => modal.querySelector('.modal-content').classList.remove('scale-95'), 100);
    }

    function closeDeleteModal() {
        const modal = document.getElementById('confirm-delete-modal');
        modal.querySelector('.modal-content').classList.add('scale-95');
        modal.style.opacity = '0';
        setTimeout(() => modal.classList.remove('flex'), 300);
    }

    /**
     * Handles the final deletion after user confirms.
     */
    async function handleDeleteConfirmed() {
        const id = parseInt(document.getElementById('delete-item-id').value);
        const type = document.getElementById('delete-item-type').value;

        try {
            switch (type) {
                case 'job':
                    await deleteJob(id);
                    showStatus(`Job deleted successfully.`);
                    // If the deleted job was in the detail view, go back to the list
                    if (id === currentJobDetailId) {
                        document.getElementById('job-detail-container').classList.add('hidden');
                        document.getElementById('jobs-list-container').classList.remove('hidden');
                        currentJobDetailId = null;
                    }
                    await refreshJobsView(); 
                    break;
                case 'profile':
                    await deleteProfile(id);
                    showStatus(`Profile deleted successfully.`);
                    await renderProfiles();
                    await refreshJobsView(); // Refresh jobs in case profile was used
                    break;
                case 'person':
                    await deletePerson(id);
                    showStatus(`Contact deleted successfully.`);
                    await renderPeople();
                    break;
                case 'company':
                    const companyName = companyMap.get(id) || 'Unknown';
                    await deleteCompany(id);
                    companyMap.delete(id); // Remove from cache
                    showStatus(`Company "${companyName}" deleted.`);
                    // Go back to company grid
                    document.getElementById('company-detail-container').classList.add('hidden');
                    document.getElementById('company-grid-container').classList.remove('hidden');
                    currentCompanyDetailId = null;
                    await renderCompaniesGrid();
                    await refreshJobsView(); // Refresh jobs to show 'Unknown Company'
                    break;
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showStatus(`Error deleting item: ${error.message}`, 'error');
        }

        closeDeleteModal();
    }


    /**
     * 3. JOB EDIT/DELETE FUNCTIONS
     */
    async function handleEditJobDetail() {
        if (!currentJobDetailId) return;

        const job = await getJob(currentJobDetailId);
        if (!job) {
            showStatus('Error: Job not found.', 'error');
            return;
        }

        const modal = document.getElementById('add-job-modal');
        const form = document.getElementById('add-job-form');

        // Populate the form
        form.querySelector('input[name="id"]').value = job.id;
        form.querySelector('input[name="title"]').value = job.title;
        // Get company name from map
        form.querySelector('input[name="company_name"]').value = companyMap.get(job.company_id) || '';
        form.querySelector('input[name="location"]').value = job.location || '';
        form.querySelector('input[name="salary"]').value = job.salary || '';
        form.querySelector('input[name="url"]').value = job.url || '';
        form.querySelector('textarea[name="description"]').value = job.description || '';
        form.querySelector('textarea[name="notes"]').value = job.notes || '';

        // Change modal title and button text
        modal.querySelector('h3').textContent = 'Edit Job Post';
        modal.querySelector('button[type="submit"]').textContent = 'Update Job';

        openModal('add-job-modal');
    }

    function handleDeleteJobDetail() {
        if (!currentJobDetailId) return;
        const jobTitle = document.getElementById('detail-job-title').textContent;
        openDeleteModal(currentJobDetailId, 'job', jobTitle);
    }

    /**
     * 4. COMPANY DELETE FUNCTIONS
     */
    function handleDeleteCompanyDetail() {
        if (!currentCompanyDetailId) return;
        const companyName = document.querySelector('#edit-company-form input[name="name"]').value;
        openDeleteModal(currentCompanyDetailId, 'company', companyName);
    }


    /**
     * 5. PROFILES TABLE, EDIT, AND DELETE
     */
    async function openEditProfileModal(id) {
        const profile = await getProfile(id);
        if (!profile) {
            showStatus('Error: Profile not found.', 'error');
            return;
        }

        const form = document.getElementById('edit-profile-form');
        form.querySelector('input[name="id"]').value = profile.id;
        form.querySelector('input[name="name"]').value = profile.name;
        form.querySelector('textarea[name="content"]').value = profile.content || '';
        form.querySelector('textarea[name="notes"]').value = profile.notes || '';

        openModal('edit-profile-modal');
    }

    async function handleEditProfileSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const id = parseInt(formData.get('id'));

        try {
            // Get original created_at date
            const originalProfile = await getProfile(id);

            const profileData = {
                id: id,
                name: formData.get('name'),
                content: formData.get('content'),
                notes: formData.get('notes'),
                created_at: originalProfile.created_at // Preserve original creation date
            };

            await updateProfile(profileData);
            showStatus('Profile updated successfully.');
            closeModal('edit-profile-modal');
            await renderProfiles();
        } catch (error) {
            console.error('Error updating profile:', error);
            showStatus(`Error: ${error.message}`, 'error');
        }
    }


    /**
     * 6. PEOPLE TABLE, EDIT, AND DELETE
     */
    async function openEditPersonModal(id) {
        const person = await getPerson(id);
        if (!person) {
            showStatus('Error: Contact not found.', 'error');
            return;
        }

        const form = document.getElementById('edit-person-form');
        form.querySelector('input[name="id"]').value = person.id;
        form.querySelector('input[name="first_name"]').value = person.first_name;
        form.querySelector('input[name="last_name"]').value = person.last_name;
        form.querySelector('input[name="job_title"]').value = person.job_title || '';
        form.querySelector('input[name="company_name"]').value = person.company_name || '';
        form.querySelector('input[name="email"]').value = person.email || '';
        form.querySelector('input[name="linkedin"]').value = person.linkedin || '';
        form.querySelector('textarea[name="notes"]').value = person.notes || '';

        openModal('edit-person-modal');
    }

    async function handleEditPersonSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const personData = {
            id: parseInt(formData.get('id')),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            job_title: formData.get('job_title'),
            company_name: formData.get('company_name'),
            email: formData.get('email'),
            linkedin: formData.get('linkedin'),
            notes: formData.get('notes')
        };

        try {
            await updatePerson(personData);
            showStatus('Contact updated successfully.');
            closeModal('edit-person-modal');
            await renderPeople();
        } catch (error) {
            console.error('Error updating contact:', error);
            showStatus(`Error: ${error.message}`, 'error');
        }
    }


    /**
     * 7. HELPER FUNCTIONS
     */

    // Helper to escape HTML to prevent XSS
    function escapeHTML(str) {
        if (str === null || str === undefined) {
            return '';
        }
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Helper to truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) {
            return text;
        }
        return text.substr(0, maxLength) + '...';
    }


    // --- Start the App ---
    init();
});
