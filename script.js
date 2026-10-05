// Sample email data with extended fields
const emails = [
    {
        id: 1,
        subject: "Welkom bij Email Beheer",
        from: "Systeem",
        content: "Welkom bij de Email Beheer applicatie. Dit is een voorbeeld e-mail om de functionaliteit te demonstreren.",
        starred: false,
        important: false,
        archived: false,
        hasAttachments: false,
        attachments: [],
        folder: "inbox"
    },
    {
        id: 2,
        subject: "Project update",
        from: "Team",
        content: "Hier is de laatste update over het project. We hebben goede voortgang geboekt en zijn op schema.",
        starred: true,
        important: true,
        archived: false,
        hasAttachments: true,
        attachments: ["project_rapport.pdf", "schema.xlsx"],
        folder: "inbox"
    },
    {
        id: 3,
        subject: "Vergadering morgen",
        from: "Manager",
        content: "Vergeet niet de vergadering morgen om 10:00 uur. We zullen de resultaten bespreken.",
        starred: false,
        important: true,
        archived: false,
        hasAttachments: true,
        attachments: ["agenda.docx"],
        folder: "inbox"
    },
    {
        id: 4,
        subject: "Nieuwe functies",
        from: "Development",
        content: "We hebben nieuwe functies toegevoegd aan de applicatie. Bekijk de documentatie voor meer informatie.",
        starred: false,
        important: false,
        archived: false,
        hasAttachments: false,
        attachments: [],
        folder: "inbox"
    },
    {
        id: 5,
        subject: "Factuur ontvangen",
        from: "Financiën",
        content: "Uw factuur voor deze maand is beschikbaar. Log in op het portaal om te betalen.",
        starred: false,
        important: true,
        archived: false,
        hasAttachments: true,
        attachments: ["factuur_september.pdf"],
        folder: "inbox"
    },
    {
        id: 6,
        subject: "Antwoord op project update",
        from: "Ik",
        content: "Bedankt voor de update. Het ziet er goed uit!",
        starred: false,
        important: false,
        archived: false,
        hasAttachments: false,
        attachments: [],
        folder: "sent"
    },
    {
        id: 7,
        subject: "Vergadering bevestiging",
        from: "Ik",
        content: "Ik zal er zijn bij de vergadering morgen.",
        starred: false,
        important: false,
        archived: false,
        hasAttachments: false,
        attachments: [],
        folder: "sent"
    },
    {
        id: 8,
        subject: "Oude project documentatie",
        from: "Archief",
        content: "Dit is oude documentatie die is gearchiveerd.",
        starred: false,
        important: false,
        archived: true,
        hasAttachments: true,
        attachments: ["oud_document.pdf"],
        folder: "archived"
    }
];

let currentEmail = null;
let currentFilter = 'all'; // all, important, starred, archived
let currentFolder = 'inbox'; // inbox, sent, archived

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.php';
        return;
    }

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
});

// Render the email list in the sidebar
function renderEmailList(filter = '') {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';

    let filteredEmails = emails.filter(email =>
        email.subject.toLowerCase().includes(filter.toLowerCase()) ||
        email.from.toLowerCase().includes(filter.toLowerCase())
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
            <span class="email-label">Mail ${email.id}</span>
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
    document.getElementById('emailSubject').textContent = email.subject;

    // Build attachments HTML if any
    let attachmentsHtml = '';
    if (email.hasAttachments && email.attachments.length > 0) {
        attachmentsHtml = '<div class="attachments-container">';
        attachmentsHtml += '<strong>Bijlagen:</strong><ul class="attachments-list">';
        email.attachments.forEach(att => {
            attachmentsHtml += `<li class="attachment-item"><i class="fas fa-paperclip"></i> ${att}</li>`;
        });
        attachmentsHtml += '</ul></div>';
    }

    document.getElementById('emailContent').innerHTML = `
        <p><strong>Van:</strong> ${email.from}</p>
        <p><strong>Onderwerp:</strong> ${email.subject}</p>
        <p><strong>Status:</strong> ${email.starred ? 'Gemarkeerd' : ''} ${email.important ? 'Belangrijk' : ''} ${email.archived ? 'Gearchiveerd' : ''}</p>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #B9B9B9;">
        <p>${email.content}</p>
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
function toggleStar() {
    if (!currentEmail) return;

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
    const subject = prompt('Onderwerp van de nieuwe e-mail:');
    if (subject) {
        const content = prompt('Inhoud van de e-mail:');
        if (content) {
            const newEmail = {
                id: emails.length + 1,
                subject: subject,
                from: "Ik",
                content: content,
                starred: false,
                important: false,
                archived: false,
                hasAttachments: false,
                attachments: [],
                folder: "sent"
            };
            emails.unshift(newEmail); // Add to beginning of list
            renderEmailList(document.getElementById('searchInput').value);
            showNotification('Nieuwe e-mail aangemaakt en verzonden!', 'success');
        }
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

    const recipient = prompt('Naar wie wilt u deze e-mail doorsturen?');
    if (recipient) {
        showNotification(`E-mail wordt doorgestuurd naar: ${recipient}`, 'success');
    }
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
function refreshEmailList() {
    const searchValue = document.getElementById('searchInput').value;
    currentFilter = 'all';
    renderEmailList(searchValue);

    // Add visual feedback
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);

    showNotification('E-maillijst vernieuwd!', 'success');
}

// Archive email
function archiveEmail() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om te archiveren', 'warning');
        return;
    }

    currentEmail.archived = !currentEmail.archived;

    // Move to archived folder if being archived
    if (currentEmail.archived) {
        currentEmail.folder = 'archived';
    } else {
        // Move back to inbox if being unarchived
        currentEmail.folder = 'inbox';
    }

    const status = currentEmail.archived ? 'gearchiveerd' : 'gedearchiveerd';
    showNotification(`E-mail is ${status}`, 'info');

    // Refresh the list
    renderEmailList(document.getElementById('searchInput').value);
}

// Delete email
function deleteEmail() {
    if (!currentEmail) {
        showNotification('Selecteer eerst een e-mail om te verwijderen', 'warning');
        return;
    }

    const confirmDelete = confirm(`Weet u zeker dat u "${currentEmail.subject}" wilt verwijderen?`);
    if (confirmDelete) {
        const index = emails.findIndex(e => e.id === currentEmail.id);
        if (index > -1) {
            emails.splice(index, 1);
            currentEmail = null;

            // Reset content display
            document.getElementById('emailSubject').textContent = 'Selecteer een e-mail';
            document.getElementById('emailContent').innerHTML = '<p>De inhoud van de geselecteerde mail</p>';

            // Refresh the list
            renderEmailList(document.getElementById('searchInput').value);
            showNotification('E-mail verwijderd', 'success');
        }
    }
}

// Setup logout functionality (now handled in dropdown)
function setupLogout() {
    // Logout is now handled in setupProfileDropdown
}

// Authentication helper functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.php';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
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
            if (confirm('Weet u zeker dat u wilt uitloggen?')) {
                logout();
            }
        });
    }

    // Profile action (placeholder)
    if (profileItem) {
        profileItem.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Profiel pagina komt soon', 'info');
        });
    }

    // Settings action (placeholder)
    if (settingsItem) {
        settingsItem.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Instellingen pagina komt soon', 'info');
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
