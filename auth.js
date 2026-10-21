// Setup register form
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // Basic validation
        if (password.length < 6) {
            showNotification('Wachtwoord moet minimaal 6 tekens zijn', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Wachtwoorden komen niet overeen', 'error');
            return;
        }

        const success = await registerUser(email, password);
        if (success) {
            showNotification('Registratie succesvol! U kunt nu inloggen.', 'success');
            window.location.href = 'login.php';
        } else {
            showNotification('Dit e-mailadres is al geregistreerd', 'error');
        }
    });
}

// Login user with database API
async function loginUser(email, password) {
    try {
        const response = await fetch('api_login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Register new user with database API
async function registerUser(email, password) {
    try {
        const response = await fetch('api_register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        return false;
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.php';
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    setupRegisterForm();
});