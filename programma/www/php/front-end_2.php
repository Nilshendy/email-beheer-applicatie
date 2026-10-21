<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Beheer Applicatie</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <!-- Notification Container -->
        <div class="notification-container" id="notificationContainer"></div>

        <!-- New Email Modal -->
        <div class="modal" id="newEmailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Nieuwe E-mail</h2>
                    <button class="modal-close" id="closeModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="email-form" id="newEmailForm">
                        <div class="form-group">
                            <label for="emailTo">Aan:</label>
                            <input type="email" id="emailTo" name="to" required placeholder="ontvanger@voorbeeld.com">
                        </div>
                        <div class="form-group">
                            <label for="emailSubject">Onderwerp:</label>
                            <input type="text" id="emailSubject" name="subject" required placeholder="Onderwerp van de e-mail">
                        </div>
                        <div class="form-group">
                            <label for="emailContent">Inhoud:</label>
                            <textarea id="emailContent" name="content" required placeholder="Typ uw bericht hier..." rows="10"></textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancelEmail">Annuleren</button>
                            <button type="submit" class="btn btn-primary">Verzenden</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Top Navigation Bar -->
        <header class="top-nav">
            <div class="nav-left">
                <button class="dark-mode-btn" id="darkModeBtn" title="Dark Mode">
                    <i class="fas fa-moon"></i>
                </button>
                <i class="fas fa-envelope mail-icon"></i>
            </div>
            <div class="nav-center">
                <div class="search-bar">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchInput" placeholder="Zoek e-mails...">
                </div>
            </div>
            <div class="nav-right">
                <div class="profile-dropdown">
                    <button class="profile-btn" id="profileBtn" title="Profiel">
                        <i class="fas fa-user user-profile"></i>
                    </button>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <div class="dropdown-header">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-info">
                                <span class="user-email" id="userEmail">user@example.com</span>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" id="profileItem">
                            <i class="fas fa-user-circle"></i>
                            <span>Profiel</span>
                        </a>
                        <a href="#" class="dropdown-item" id="settingsItem">
                            <i class="fas fa-cog"></i>
                            <span>Instellingen</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout-item" id="logoutItem">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Uitloggen</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Secondary Navigation Bar -->
        <nav class="secondary-nav">
            <div class="nav-actions">
                <button class="action-btn" id="newEmailBtn" title="Mail">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="action-btn" id="importantEmailsBtn" title="Waarschuwing">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
                <button class="action-btn" id="forwardEmailBtn" title="Delen">
                    <i class="fas fa-share"></i>
                </button>
                <button class="action-btn" id="downloadAttachmentsBtn" title="Downloaden">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn" id="refreshBtn" title="Vernieuwen">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="action-btn" id="starEmailBtn" title="Ster">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn" id="archiveEmailBtn" title="Document">
                    <i class="fas fa-file-alt"></i>
                </button>
                <button class="action-btn" id="deleteEmailBtn" title="Prullenbak">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </nav>

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Sidebar with Email List -->
            <aside class="email-sidebar">
                <!-- Folder Dropdown -->
                <div class="folder-selector">
                    <button class="folder-dropdown-btn" id="folderDropdownBtn">
                        <i class="fas fa-folder"></i>
                        <span id="currentFolderName">Postvak</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="folder-dropdown-menu" id="folderDropdownMenu">
                        <div class="folder-item" data-folder="inbox">
                            <i class="fas fa-inbox"></i>
                            <span>Postvak</span>
                        </div>
                        <div class="folder-item" data-folder="sent">
                            <i class="fas fa-paper-plane"></i>
                            <span>Verzonden</span>
                        </div>
                        <div class="folder-item" data-folder="archived">
                            <i class="fas fa-archive"></i>
                            <span>Gearchiveerd</span>
                        </div>
                    </div>
                </div>
                <div class="email-list" id="emailList">
                    <!-- Email items will be dynamically inserted here -->
                </div>
            </aside>

            <!-- Email Content Display -->
            <main class="email-content">
                <div class="content-header">
                    <h2 id="emailSubject">Selecteer een e-mail</h2>
                    <button class="star-btn" id="contentStarBtn">
                        <i class="far fa-star"></i>
                    </button>
                </div>
                <div class="content-body" id="emailContent">
                    <p>De inhoud van de geselecteerde mail</p>
                </div>
            </main>
        </div>
    </div>

    
</body>
</html>