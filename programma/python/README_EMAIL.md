# Email Versturen - Gebruiksinstructies

## Overzicht
De `send.py` module bevat functionaliteit om emails te versturen via SMTP. Dit wordt gebruikt door de Flask server in `email_server.py`.

## Vereisten

### 1. Gmail Account Setup
- Je hebt een Gmail account nodig
- 2-Factor Authenticatie (2FA) moet ingeschakeld zijn
- Je moet een App Password genereren (geen normaal wachtwoord!)

### 2. App Password Genereren
1. Ga naar: https://myaccount.google.com/apppasswords
2. Log in met je Google account
3. Kies "Mail" als app en "Windows computer" als apparaat (of andere optie)
4. Klik op "Genereren"
5. Kopieer het 16-teken wachtwoord (dit is je App Password)

**BELANGRIJK:** Gebruik dit App Password, NIET je normale Gmail wachtwoord!

## Gebruiksmogelijkheden

### Optie 1: Via Flask Web Interface (Aanbevolen)
```bash
cd programma/python
python email_server.py
```
Open dan je browser op: http://localhost:5001

Voer in:
- Jouw Gmail adres
- Jouw App Password (NIET normaal wachtwoord)
- Ontvanger email
- Onderwerp
- Bericht

Klik op "Verstuur Email" of "Test SMTP Verbinding"

### Optie 2: Direct in Python Code
```python
from send import send_email

sender = "your@gmail.com"
password = "your_app_password"  # 16-character App Password
receiver = "recipient@gmail.com"
subject = "Test Email"
message = "Hello, this is a test email!"

success = send_email(sender, receiver, subject, message, password)
if success:
    print("Email sent!")
```

### Optie 3: Via Test Script
```bash
cd programma/python
python test_send.py
```
Volg de instructies op het scherm.

## Testen van de Connectie

```python
from send import test_connection

sender = "your@gmail.com"
password = "your_app_password"

success = test_connection(sender, password)
if success:
    print("Connection works!")
```

## Bijlagen Toevoegen

```python
from send import send_email

attachments = ["file1.pdf", "image.png"]
send_email(
    sender_email="your@gmail.com",
    receiver_email="recipient@gmail.com",
    subject="Email with attachments",
    message="Please find attached files",
    password="your_app_password",
    attachments=attachments
)
```

## Probleemoplossing

### Authentication Failed
- Controleer of je een App Password gebruikt (geen normaal wachtwoord)
- Zorg dat 2FA is ingeschakeld op je Google account
- Regenerer het App Password als het niet werkt

### Connection Failed
- Controleer je internetverbinding
- Schakel VPN uit indien actief
- Controleer firewall instellingen
- Verifieer SMTP server: smtp.gmail.com en poort: 587

### Email Not Received
- Check je spam folder
- Wacht een paar minuten (kan even duren)
- Controleer of het ontvanger email adres correct is

## SMTP Server Configuraties

Standaard (Gmail):
- Server: smtp.gmail.com
- Poort: 587 (TLS)
- Gebruik: Jouw Gmail adres
- Wachtwoord: App Password

Andere providers kunnen verschillende instellingen hebben. Je kunt deze aanpassen:

```python
send_email(
    sender_email="your@email.com",
    receiver_email="recipient@email.com",
    subject="Test",
    message="Message",
    password="password",
    smtp_server="smtp.example.com",  # Custom SMTP server
    smtp_port=25                     # Custom port
)
```

## Beveiliging

⚠️ **BELANGRIJK:**
- Sla NIET je wachtwoorden op in de code repository
- Gebruik environment variables voor wachtwoorden in productie
- Deel nooit je App Password met anderen
- App Passwords kunnen worden ingetrokken in Google instellingen

## Flask Server Details

De `email_server.py` server draait op:
- Host: 0.0.0.0 (alle interfaces)
- Poort: 5001
- URL: http://localhost:5001

Functionaliteiten:
- Web interface voor email versturen
- SMTP verbinding test endpoint
- Real-time feedback bij verzenden
