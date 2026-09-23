// Sample email data
const emails = [
    {
        id: 1,
        subject: "Welkom bij Email Beheer",
        from: "Systeem",
        content: "Welkom bij de Email Beheer applicatie. Dit is een voorbeeld e-mail om de functionaliteit te demonstreren."
    },
    {
        id: 2,
        subject: "Project update",
        from: "Team",
        content: "Hier is de laatste update over het project. We hebben goede voortgang geboekt en zijn op schema."
    },
    {
        id: 3,
        subject: "Vergadering morgen",
        from: "Manager",
        content: "Vergeet niet de vergadering morgen om 10:00 uur. We zullen de resultaten bespreken."
    },
    {
        id: 4,
        subject: "Nieuwe functies",
        from: "Development",
        content: "We hebben nieuwe functies toegevoegd aan de applicatie. Bekijk de documentatie voor meer informatie."
    },
    {
        id: 5,
        subject: "Factuur ontvangen",
        from: "Financiën",
        content: "Uw factuur voor deze maand is beschikbaar. Log in op het portaal om te betalen."
    }
];

let currentEmail = null;
let starredEmails = new Set();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderEmailList();
    setupEventListeners();
});

// Render the email list in the sidebar
function renderEmailList(filter = '') {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';

    const filteredEmails = emails.filter(email => 
        email.subject.toLowerCase().includes(filter.toLowerCase()) ||
        email.from.toLowerCase().includes(filter.toLowerCase())
    );

    filteredEmails.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item';
        emailItem.dataset.id = email.id;
        
        emailItem.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Mail ${email.id}</span>
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
    document.getElementById('emailContent').innerHTML = `
        <p><strong>Van:</strong> ${email.from}</p>
        <p><strong>Onderwerp:</strong> ${email.subject}</p>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p>${email.content}</p>
    `;

    // Update star button
    const starBtn = document.getElementById('contentStarBtn');
    if (starredEmails.has(email.id)) {
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

    // Action buttons in secondary nav
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleAction);
    });
}

// Toggle star status for current email
function toggleStar() {
    if (!currentEmail) return;

    const starBtn = document.getElementById('contentStarBtn');

    if (starredEmails.has(currentEmail.id)) {
        starredEmails.delete(currentEmail.id);
        starBtn.innerHTML = '<i class="far fa-star"></i>';
        starBtn.classList.remove('active');
    } else {
        starredEmails.add(currentEmail.id);
        starBtn.innerHTML = '<i class="fas fa-star"></i>';
        starBtn.classList.add('active');
    }
}

// Handle action button clicks
function handleAction(e) {
    const btn = e.currentTarget;
    const title = btn.getAttribute('title');

    switch(title) {
        case 'Mail':
            alert('Mail functie - Nieuwe e-mail maken');
            break;
        case 'Waarschuwing':
            alert('Waarschuwing functie');
            break;
        case 'Delen':
            alert('Delen functie');
            break;
        case 'Downloaden':
            alert('Downloaden functie');
            break;
        case 'Vernieuwen':
            renderEmailList(document.getElementById('searchInput').value);
            alert('E-maillijst vernieuwd');
            break;
        case 'Ster':
            alert('Gesterde e-mails bekijken');
            break;
        case 'Document':
            alert('Document functie');
            break;
        case 'Prullenbak':
            alert('Prullenbak functie');
            break;
        default:
            console.log('Onbekende actie:', title);
    }
}
