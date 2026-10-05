// Authentication functionality
const users = JSON.parse(localStorage.getItem('users')) || [];

// Check if we're on login or register page
const isLoginPage = window.location.pathname.includes('login.php');
const isRegisterPage = window.location.pathname.includes('register.php');

if (isLoginPage) {
    setupLoginForm();
} else if (isRegisterPage) {
    setupRegisterForm();
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginToggle = document.querySelector('.login-toggle');
    const goToRegisterBtn = document.getElementById('goToRegister');

    // Toggle to register page
    loginToggle.addEventListener('click', () => {
        window.location.href = 'register.php';
    });

    // Register button goes to register page
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener('click', () => {
            window.location.href = 'register.php';
        });
    }

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Login attempt:', email); // Debug log

        if (loginUser(email, password)) {
            showNotification('Succesvol ingelogd!', 'success');
            console.log('Login successful, redirecting to front-end.html'); // Debug log
            window.location.href = 'front-end.html';
        } else {
            showNotification('Ongeldige e-mail of wachtwoord', 'error');
            console.log('Login failed'); // Debug log
        }
    });

    // Forgot password (placeholder)
    document.querySelector('.forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Wachtwoord reset functionaliteit komt soon (placeholder)', 'info');
    });
}

// Setup register form
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerToggle = document.querySelector('.login-toggle');
    const loginBtn = document.querySelector('.login-btn');

    // Toggle to login page
    registerToggle.addEventListener('click', () => {
        window.location.href = 'login.php';
    });

    // Login button goes to login page
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.php';
    });

    // Handle registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            showNotification('Wachtwoorden komen niet overeen', 'error');
            return;
        }

        if (registerUser(email, password)) {
            showNotification('Registratie succesvol! U kunt nu inloggen.', 'success');
            window.location.href = 'login.php';
        } else {
            showNotification('Dit e-mailadres is al geregistreerd', 'error');
        }
    });
}

// Login user
function loginUser(email, password) {
    console.log('Attempting login with:', email);
    console.log('Current users in storage:', users);

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        console.log('User found:', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    } else {
        console.log('User not found or password incorrect');
        // Check if email exists
        const emailExists = users.find(u => u.email === email);
        if (emailExists) {
            console.log('Email exists but password is wrong');
        } else {
            console.log('Email does not exist in database');
        }
        return false;
    }
}

// Register new user
function registerUser(email, password) {
    console.log('Registration attempt:', email); // Debug log

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        console.log('User already exists'); // Debug log
        return false;
    }

    const newUser = {
        id: Date.now(),
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User registered successfully'); // Debug log
    return true;
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