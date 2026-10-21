from imapclient import IMAPClient
import email
from email.header import decode_header

GMAIL_GEBRUIKER = "tt0878884@gmail.com"
APP_WACHTWOORD = "gkvystcxicnmdjan"  # het 16-tekens app-wachtwoord, zonder spaties

with IMAPClient("imap.gmail.com", port=993, use_uid=True, ssl=True) as server:
    server.login(GMAIL_GEBRUIKER, APP_WACHTWOORD)
    server.select_folder("INBOX", readonly=True)

    messages = server.search("ALL")
    laatste10 = messages[-10:]

    for uid in reversed(laatste10):
        raw = server.fetch([uid], ["RFC822"])[uid][b"RFC822"]
        msg = email.message_from_bytes(raw)

        onderwerp, encoding = decode_header(msg["Subject"])[0]
        if isinstance(onderwerp, bytes):
            onderwerp = onderwerp.decode(encoding or "utf-8")

        print(f"Van: {msg['From']}")
        print(f"Onderwerp: {onderwerp}")
        print("-" * 40)