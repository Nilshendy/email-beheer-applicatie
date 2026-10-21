# Email Beheer Applicatie

Een e-mailbeheer-applicatie waarin elke gebruiker na registreren en inloggen zijn **eigen mailbox** krijgt. Je koppelt je Gmail-account en ziet en verstuurt daarna je eigen mails. Andere gebruikers kunnen niet bij jouw mails.

## Functionaliteiten

- **Registreren en inloggen** met elk e-mailadres. Wachtwoorden worden versleuteld opgeslagen (`password_hash`).
- **Eigen mailbox per gebruiker**: de server bepaalt via de PHP-sessie wie je bent, en alle mails zijn gekoppeld aan jouw account.
- **Gmail koppelen** via Instellingen (Gmail-adres + App Password).
- **Synchroniseren**: haalt Postvak en Verzonden op uit Gmail (IMAP), automatisch bij het openen en via de Vernieuwen-knop.
- **Versturen** via Gmail (SMTP). Verzonden mail verschijnt direct in Verzonden.
- **Zoeken** op onderwerp of afzender.
- **Ster, archiveren en verwijderen**. Wordt bewaard in de database; een verwijderde mail komt niet terug bij de volgende sync.
- **Mappen**: Postvak, Verzonden en Gearchiveerd.
- **Dark mode**.

## Benodigdheden

- PHP 8 met de `mysqli`-extensie
- Python 3 met `mysql-connector-python`
- Docker (voor de MariaDB-database)
- Een Gmail-account met tweestapsverificatie en een App Password (alleen nodig om echte mails te zien en te versturen)

## Installatie

1. Clone de repo en ga naar de map:
   ```bash
   git clone https://github.com/Nilshendy/email-beheer-applicatie.git
   cd email-beheer-applicatie
   ```

2. Maak het `.env`-bestand voor de database aan en vul je eigen wachtwoorden in:
   ```bash
   cp programma/.env.example programma/.env      # Windows: copy programma\.env.example programma\.env
   ```

3. Start de database (MariaDB op poort 3307):
   ```bash
   cd programma
   docker compose up -d db
   cd ..
   ```

4. Installeer de Python-module:
   ```bash
   pip install mysql-connector-python
   ```

5. Start de website in de hoofdmap:
   ```bash
   php -S localhost:8000
   ```

6. Open http://localhost:8000. De tabellen worden automatisch aangemaakt.

## Gebruik

1. **Registreer** een account op `register.php` en **log in**. Je komt in je eigen, lege mailbox.
2. Maak een App Password aan via https://myaccount.google.com/apppasswords.
3. Open **Instellingen** (profielmenu) en vul je Gmail-adres en het App Password in. Klik op Opslaan.
4. Klik op **Vernieuwen**: je Gmail-mails verschijnen.
5. Met het mail-icoon schrijf en verstuur je een nieuwe mail.

Elke gebruiker koppelt zijn eigen Gmail-account. Het e-mailadres waarmee je registreert hoeft niet hetzelfde te zijn als je Gmail-adres.

## Configuratie (optioneel)

Deze omgevingsvariabelen kun je zetten voordat je `php -S` start:

| Variabele | Standaard | Uitleg |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | Databaseserver (poort 3307, in `database.php`) |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `mail` / `base` / `mailbase` | Moeten overeenkomen met `programma/.env` |
| `PYTHON_BIN` | `python` (Windows) / `python3` | Python-programma voor sync en versturen |
| `IMAP_HOST` / `IMAP_PORT` | `imap.gmail.com` / `993` | IMAP-server |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `465` | SMTP-server |

## Hoe het werkt

```
Browser (script.js)
  │  fetch, met PHP-sessiecookie
  ▼
PHP API's ── auth_check.php: alleen ingelogd, user_id komt uit de sessie
  ├── api_register.php / api_login.php / loginCM.php   registreren en inloggen
  ├── api_gmail.php    Gmail-gegevens opslaan per gebruiker
  ├── api_emails.php   mails ophalen, ster/archiveren/verwijderen (WHERE user_id = ?)
  ├── api_sync.php  ──► programma/python/imap_client.py   Gmail → database
  └── api_send.php  ──► programma/python/send_cli.py      versturen via Gmail
  ▼
MariaDB: users, gmail_credentials, emails
```

## Bestandsstructuur

```
email-beheer-applicatie/
├── index.php            # Stuurt door naar login.php
├── login.php            # Loginpagina (formulier → loginCM.php)
├── register.php         # Registratiepagina (→ api_register.php)
├── front-end.php        # De mailbox (alleen voor ingelogde gebruikers)
├── logout.php           # Uitloggen
├── database.php         # Databaseverbinding + tabellen aanmaken
├── user_auth.php        # Inloggen en sessie starten
├── auth_check.php       # Beveiliging van de API's
├── api_*.php            # API's (zie "Hoe het werkt")
├── python_runner.php    # Start de Python-scripts vanuit PHP
├── script.js            # Mailbox-interface
├── auth.js              # Registratie/login in de browser
├── styles.css, login.css
├── afbeeldingen email beheer applicatie/
└── programma/
    ├── docker-compose.yml   # MariaDB (en een oudere web/app-opzet)
    ├── .env.example         # Voorbeeld voor programma/.env
    └── python/              # imap_client.py, send.py, send_cli.py
```

## Beveiliging

- Zet nooit wachtwoorden of App Passwords in de code: de repo is openbaar. `programma/.env` staat in `.gitignore`.
- Gmail App Passwords worden per gebruiker in de database opgeslagen en nooit naar de browser gestuurd.
- Mailinhoud wordt ge-escaped weergegeven, zodat een mail geen scripts kan uitvoeren.

## Technologieën

PHP, MariaDB, Python (IMAP/SMTP), HTML5, CSS3, Vanilla JavaScript, Font Awesome, Docker.

## Kleurenschema

- Wit: #FFFFFF
- Zwart: #000000
- Grijs: #B9B9B9
- Blauw: #0030FF
