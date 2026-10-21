# Email Beheer Applicatie

Een eenvoudige e-mail beheer applicatie met een moderne interface voor het beheren en bekijken van e-mails, inclusief authenticatie.

## Functionaliteiten

- **Authenticatie**: Login en registratie systeem met gebruikersbeheer
- **E-maillijst**: Bekijk een lijst met e-mails in de zijbalk
- **E-mail weergave**: Selecteer een e-mail om de volledige inhoud te bekijken
- **Zoeken**: Zoek e-mails op onderwerp of afzender
- **Sterren**: Markeer belangrijke e-mails met een ster
- **Actieknoppen**: Sneltoegang tot verschillende functies zoals mail, delen, downloaden, etc.
- **Nieuwe e-mail**: Maak en verzend nieuwe e-mails
- **Belangrijke e-mails**: Filter op belangrijke/gemarkeerde e-mails
- **E-mail doorsturen**: Stuur e-mails door naar andere ontvangers
- **Bijlagen downloaden**: Download bijlagen van e-mails
- **E-mail archiveren**: Archiveer e-mails voor later gebruik
- **E-mail verwijderen**: Verwijder e-mails uit de lijst
- **Folder navigatie**: Wissel tussen postvak, verzonden en gearchiveerde e-mails

## Bestandsstructuur

```
Email-beheer applicatie/
├── login.php           # Login pagina
├── register.php        # Registratie pagina
├── front-end.php       # Hoofd applicatie pagina
├── auth.css            # Styling voor auth pagina's
├── styles.css          # Styling voor de applicatie
├── auth.js             # Authenticatie functionaliteit
├── script.js           # JavaScript functionaliteit
├── data/
│   └── emails.json     # Dummy e-mail data
├── afbeeldingen email beheer applicatie/
│   └── log in .png     # Achtergrondafbeelding
└── README.md           # Dit bestand
```

## Hoe te gebruiken

1. Start een lokale PHP webserver in de projectmap:
   ```bash
   php -S localhost:8000
   ```

2. Open je browser en ga naar de **login pagina**:
   ```
   http://localhost:8000/login.php
   ```

3. Registreer een nieuw account of log in met bestaande gegevens

4. Na succesvolle login wordt u doorgestuurd naar de e-mail applicatie

## Features

### Authenticatie
- **Registratie**: Maak een nieuw account aan met e-mail en wachtwoord
- **Login**: Log in met uw geregistreerde gegevens
- **Uitloggen**: Log veilig uit de applicatie
- **Sessiebeheer**: Automatische controle op ingelogde status

### E-mail Beheer
- **Zoekbalk**: Typ in de zoekbalk om e-mails te filteren
- **E-mail selectie**: Klik op een e-mail in de zijbalk om de inhoud te bekijken
- **Ster functie**: Klik op de ster-knop om een e-mail te markeren als belangrijk
- **Status indicatoren**: Iconen voor gemarkeerde, belangrijke e-mails en bijlagen
- **Navigatieknoppen**: Gebruik de knoppen in de bovenste balk voor snelle acties

### Toolbar Functionaliteit
-  **Mail**: Maak een nieuwe e-mail
-  **Waarschuwing**: Toon alleen belangrijke e-mails
-  **Delen**: Stuur de geselecteerde e-mail door
-  **Downloaden**: Download bijlagen van de geselecteerde e-mail
-  **Vernieuwen**: Vernieuw de e-maillijst
-  **Ster**: Markeer de geselecteerde e-mail als belangrijk
-  **Document**: Archiveer de geselecteerde e-mail
-  **Prullenbak**: Verwijder de geselecteerde e-mail

## Technologieën

- PHP
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome (iconen)
- LocalStorage (gebruikersdata opslag)

## Kleurenschema

- Wit: #FFFFFF
- Zwart: #000000
- Grijs: #B9B9B9
- Blauw: #0030FF


