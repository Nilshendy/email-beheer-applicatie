// E-mails van de ingelogde gebruiker (geladen via api_emails.php)
let emails = [];

let currentEmail = null;
let currentFilter = 'all'; // all, important, starred, archived
let currentFolder = 'inbox'; // inbox, sent, archived

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load dark mode preference
    loadDarkModePreference();

    // Load user info
    loadUserInfo();

    renderEmailList();
    setupEventListeners();
    setupLogout();
    setupDarkMode();
    setupProfileDropdown();
    setupFolderDropdown();
    setupNewEmailModal();
    setupSettingsModal();

    loadEmails().then(() => syncEmails(true));
});

// Escape tekst voordat het in innerHTML komt (mails kunnen HTML/scripts bevatten)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

async function postJson(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {})
    });
    if (response.status === 401) {
        window.location.href = 'login.php';
    }
    return response.json();
}

// Mails van de ingelogde gebruiker uit de database laden
async function loadEmails() {
    try {
        const response = await fetch('api_emails.php');
        if (response.status === 401) {
            window.location.href = 'login.php';
            return;
        }
        const data = await response.json();
        if (data.success) {
            emails = data.emails;
            if (currentEmail) {
                currentEmail = emails.find(e => e.id === currentEmail.id) || null;
            }
            renderEmailList(document.getElementById('searchInput').value);
        } else {
            showNotification(data.message || 'E-mails laden mislukt', 'error');
        }
    } catch (error) {
        showNotification('E-mails laden mislukt', 'error');
    }
}

// Nieuwe mails uit Gmail ophalen (IMAP) en daarna de lijst herladen
async function syncEmails(silent = false) {
    try {
        const data = await postJson('api_sync.php');
        if (data.success) {
            if (data.fetched > 0) {
                await loadEmails();
            }
            if (!silent || data.fetched > 0) {
                showNotification(data.fetched > 0 ? `${data.fetched} nieuwe e-mail(s)` : 'Geen nieuwe e-mails', 'success');
            }
        } else if (!(silent && data.no_credentials)) {
            showNotification(data.message || 'Mails ophalen mislukt', silent ? 'warning' : 'error');
        }
        return data;
    } catch (error) {
        if (!silent) showNotification('Mails ophalen mislukt', 'error');
        return { success: false };
    }
}

async function emailAction(email, action) {
    const data = await postJson('api_emails.php', { email_id: email.id, action: action });
    if (!data.success) {
        showNotification(data.message || 'Actie mislukt', 'error');
    }
    return data.success;
}

// Render the email list in the sidebar
function renderEmailList(filter = '') {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';

    const search = filter.toLowerCase();
    let filteredEmails = emails.filter(email =>
        (email.subject || '').toLowerCase().includes(search) ||
        (email.from || '').toLowerCase().includes(search) ||
        (email.from_email || '').toLowerCase().includes(search)
    );

    // Apply folder filter
    filteredEmails = filteredEmails.filter(email => email.folder === currentFolder);

    // Apply category filter
    if (currentFilter === 'important') {
        filteredEmails = filteredEmails.filter(email => email.important);
    } else if (currentFilter === 'starred') {
        filteredEmails = filteredEmails.filter(email => email.starred);
    } else if (currentFilter === 'archived') {
        filteredEmails = filteredEmails.filter(email => email.archived);
    }

    if (filteredEmails.length === 0) {
        emailList.innerHTML = '<p class="email-empty" style="padding: 16px 20px; color: #888;">Geen e-mails</p>';
    }

    filteredEmails.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item';
        emailItem.dataset.id = email.id;

        // Add icons for starred, important, and attachments
        let iconsHtml = '';
        if (email.starred) iconsHtml += '<i class="fas fa-star" style="color: #0030FF; margin-right: 5px;"></i>';
        if (email.important) iconsHtml += '<i class="fas fa-exclamation-triangle" style="color: #FFA500; margin-right: 5px;"></i>';
        if (email.hasAttachments) iconsHtml += '<i class="fas fa-paperclip" style="color: #666; margin-right: 5px;"></i>';

        emailItem.innerHTML = `
            <i class="fas fa-key email-key"></i>
            <span class="email-label" title="${escapeHtml(email.from)}">${escapeHtml(email.subject || '(geen onderwerp)')}</span>
            <div class="email-icons">${iconsHtml}</div>
        `;

        emailItem.addEventListener('click', () => selectEmail(email));
        emailList.appendChild(emailItem);
    });
}

// Select an email and display its content
function selectEmail(email) {
    currentEmail = email;

    // Update active state in the list
    document.querySelectorAll('.email-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.id) === email.id) {
            item.classList.add('active');
        }
    });

    // Update content display
    document.getElementById('emailSubject').textContent = email.subject || '(geen onderwerp)';
    const fromText = email.from_email && email.from_email !== email.from
        ? `${email.from} <${email.from_email}>`
        : (email.from || email.from_email || '');

    // Build attachments HTML if any
    let attachmentsHtml = '';
    if (email.hasAttachments && email.attachments.length > 0) {
        attachmentsHtml = '<div class="attachments-container">';
        attachmentsHtml += '<strong>Bijlagen:</strong><ul class="attachments-list">';
        email.attachments.forEach(att => {
            attachmentsHtml += `<li class="attachment-item"><i class="fas fa-paperclip"></i> ${escapeHtml(att)}</li>`;
        });
        attachmentsHtml += '</ul></div>';
    }

    document.getElementById('emailContent').innerHTML = `
        <p><strong>Van:</strong> ${escapeHtml(fromText)}</p>
        <p><strong>Datum:</strong> ${escapeHtml(email.received_date)}</p>
        <p><strong>Onderwerp:</strong> ${escapeHtml(email.subject)}</p>
        <p><strong>Status:</strong> ${email.starred ? 'Gemarkeerd' : ''} ${email.important ? 'Belangrijk' : ''} ${email.archived ? 'Gearchiveerd' : ''}</p>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #B9B9B9;">
        <div class="email-body" style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(email.content)}</div>
        ${attachmentsHtml}
    `;

    // Update star button
    const starBtn = document.getElementById('contentStarBtn');
    if (email.starred) {
        starBtn.innerHTML = '<i class="fas fa-star"></i>';
        starBtn.classList.add('active');
    } else {
        starBtn.innerHTML = '<i class="far fa-star"></i>';
        starBtn.classList.remove('active');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        renderEmailList(e.target.value);
    });

    // Star button in content area
    const starBtn = document.getElementById('contentStarBtn');
    starBtn.addEventListener('click', toggleStar);

    // New email button
    document.getElementById('newEmailBtn').addEventListener('click', createNewEmail);

    // Important emails button
    document.getElementById('importantEmailsBtn').addEventListener('click', showImportantEmails);

    // Forward email button
    document.getElementById('forwardEmailBtn').addEventListener('click', forwardEmail);

    // Download attachments button
    document.getElementById('downloadAttachmentsBtn').addEventListener('click', downloadAttachments);

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshEmailList);

    // Star email button (toolbar)
    document.getElementById('starEmailBtn').addEventListener('click', toggleStarFromToolbar);

    // Archive email button
    document.getElementById('archiveEmailBtn').addEventListener('click', archiveEmail);

    // Delete email button
    document.getElementById('deleteEmailBtn').addEventListener('click', deleteEmail);
}

// Toggle star status for current email (from content area)
async function toggleStar() {
    if (!currentEmail) return;

    if (!(await emailAction(currentEmail, 'star'))) return;
    currentEmail.starred = !currentEmail.starred;
    const starBtn = document.getElementById('contentStarBtn');

    if (currentEmail.starred) {
        starBtn.innerHTML = '<i class="fas fa-star"></i>';
        starBtn.classList.add('active');
    } else {
        starBtn.innerHTML = '<i class="far fa-star"></i>';
        starBtn.classList.remove('active');
    }

    // Refresh the list to show updated star status
    renderEmailList(document.getElementById('searchInput').value);
}

// Toggle star status from toolbar
function toggleStarFromToolbar() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om te markeren', 'warning');
        return;
    }
    toggleStar();
}

// Create new email
function createNewEmail() {
    const modal = document.getElementById('newEmailModal');
    if (modal) {
        modal.classList.add('active');
        // Reset form
        document.getElementById('newEmailForm').reset();
        // Focus on first input
        document.getElementById('emailTo').focus();
    }
}

// Show important emails
function showImportantEmails() {
    currentFilter = currentFilter === 'important' ? 'all' : 'important';
    renderEmailList(document.getElementById('searchInput').value);

    if (currentFilter === 'important') {
        showNotification('Toont nu alleen belangrijke e-mails', 'info');
    } else {
        showNotification('Toont weer alle e-mails', 'info');
    }
}

// Forward email
function forwardEmail() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om door te sturen', 'warning');
        return;
    }

    showNotification('Doorsturen functionaliteit komt binnenkort', 'info');
}

// Download attachments
function downloadAttachments() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail', 'warning');
        return;
    }

    if (!currentEmail.hasAttachments || currentEmail.attachments.length === 0) {
        showNotification('Deze e-mail heeft geen bijlagen', 'warning');
        return;
    }

    showNotification(`Bijlagen downloaden: ${currentEmail.attachments.join(', ')}`, 'info');
}

// Refresh email list
async function refreshEmailList() {
    currentFilter = 'all';

    // Add visual feedback
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);

    await syncEmails(false);
    await loadEmails();
}

// Archive email
async function archiveEmail() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om te archiveren', 'warning');
        return;
    }

    if (!(await emailAction(currentEmail, 'archive'))) return;
    const wasArchived = currentEmail.archived;
    await loadEmails();

    showNotification(`E-mail is ${wasArchived ? 'gedearchiveerd' : 'gearchiveerd'}`, 'info');
}

// Delete email
async function deleteEmail() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om te verwijderen', 'warning');
        return;
    }

    if (!(await emailAction(currentEmail, 'delete'))) return;
    currentEmail = null;

    // Reset content display
    document.getElementById('emailSubject').textContent = 'Selecteer een e-mail';
    document.getElementById('emailContent').innerHTML = '<p>De inhoud van de geselecteerde mail</p>';

    await loadEmails();
    showNotification('E-mail verwijderd', 'success');
}

// Setup logout functionality (now handled in dropdown)
function setupLogout() {
    // Logout is now handled in setupProfileDropdown
}

// Authentication helper functions
function isLoggedIn() {
    // Check PHP session by making a request
    return true; // PHP session check is done server-side
}

function logout() {
    window.location.href = 'logout.php';
}

function getCurrentUser() {
    // Return email from PHP session
    const userEmailElement = document.getElementById('userEmail');
    return userEmailElement ? { email: userEmailElement.textContent } : null;
}

// Dark Mode functionality
function setupDarkMode() {
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Update icon
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        darkModeBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkModePreference() {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    if (darkModePreference) {
        document.body.classList.add('dark-mode');
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) {
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

// Load user info in dropdown
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    }
}

// Setup profile dropdown
function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutItem = document.getElementById('logoutItem');
    const profileItem = document.getElementById('profileItem');
    const settingsItem = document.getElementById('settingsItem');

    // Toggle dropdown
    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Logout action
    if (logoutItem) {
        logoutItem.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Profile action (placeholder)
    if (profileItem) {
        profileItem.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Profiel pagina komt soon', 'info');
        });
    }

}

// Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Setup folder dropdown
function setupFolderDropdown() {
    const folderDropdownBtn = document.getElementById('folderDropdownBtn');
    const folderDropdownMenu = document.getElementById('folderDropdownMenu');
    const folderItems = document.querySelectorAll('.folder-item');
    const currentFolderName = document.getElementById('currentFolderName');

    // Toggle dropdown
    if (folderDropdownBtn && folderDropdownMenu) {
        folderDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            folderDropdownBtn.classList.toggle('active');
            folderDropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!folderDropdownBtn.contains(e.target) && !folderDropdownMenu.contains(e.target)) {
                folderDropdownBtn.classList.remove('active');
                folderDropdownMenu.classList.remove('active');
            }
        });
    }

    // Handle folder selection
    folderItems.forEach(item => {
        item.addEventListener('click', () => {
            const folder = item.dataset.folder;
            currentFolder = folder;

            // Update active state
            folderItems.forEach(fi => fi.classList.remove('active'));
            item.classList.add('active');

            // Update button text
            const folderNames = {
                'inbox': 'Postvak',
                'sent': 'Verzonden',
                'archived': 'Gearchiveerd'
            };
            if (currentFolderName) {
                currentFolderName.textContent = folderNames[folder];
            }

            // Close dropdown
            folderDropdownBtn.classList.remove('active');
            folderDropdownMenu.classList.remove('active');

            // Reset filter and refresh list
            currentFilter = 'all';
            renderEmailList(document.getElementById('searchInput').value);

            // Show notification
            showNotification(`Overgeschakeld naar ${folderNames[folder]}`, 'info');
        });
    });

    // Set initial active state
    const initialFolderItem = document.querySelector('.folder-item[data-folder="inbox"]');
    if (initialFolderItem) {
        initialFolderItem.classList.add('active');
    }
}

// Setup new email modal
function setupNewEmailModal() {
    const modal = document.getElementById('newEmailModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelEmail');
    const emailForm = document.getElementById('newEmailForm');

    // Close modal when clicking X button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Handle form submission
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const to = document.getElementById('emailTo').value;
            const subject = document.getElementById('newEmailSubject').value;
            const content = document.getElementById('newEmailContent').value;

            try {
                const data = await postJson('api_send.php', { to: to, subject: subject, message: content });

                if (data.success) {
                    modal.classList.remove('active');
                    showNotification('E-mail verzonden naar ' + to, 'success');

                    // Switch to sent folder
                    currentFolder = 'sent';
                    currentFilter = 'all';
                    document.querySelectorAll('.folder-item').forEach(item => {
                        item.classList.toggle('active', item.dataset.folder === 'sent');
                    });
                    document.getElementById('currentFolderName').textContent = 'Verzonden';

                    await loadEmails();
                } else {
                    showNotification(data.message || 'Email verzenden mislukt', 'error');
                }
            } catch (error) {
                showNotification('Fout bij verzenden: ' + error, 'error');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Setup settings modal
function setupSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeSettingsModal');
    const cancelBtn = document.getElementById('cancelSettings');
    const settingsForm = document.getElementById('settingsForm');
    const settingsItem = document.getElementById('settingsItem');

    // Open modal when clicking settings
    if (settingsItem) {
        settingsItem.addEventListener('click', (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            document.getElementById('settingEmail').value = user && user.email ? user.email : '';
            document.getElementById('settingPassword').value = '';
            fetch('api_gmail.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('settingEmail').value = data.gmail_address;
                    }
                })
                .catch(() => {});

            modal.classList.add('active');
        });
    }

    // Close modal when clicking X button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Handle form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const gmailAddress = document.getElementById('settingEmail').value;
            const appPassword = document.getElementById('settingPassword').value;

            try {
                const data = await postJson('api_gmail.php', { gmail_address: gmailAddress, app_password: appPassword });
                if (!data.success) {
                    showNotification(data.message || 'Opslaan mislukt', 'error');
                    return;
                }
                modal.classList.remove('active');
                showNotification('Gmail gekoppeld, mails worden opgehaald...', 'success');
                await syncEmails(false);
                await loadEmails();
            } catch (error) {
                showNotification('Opslaan mislukt', 'error');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}
