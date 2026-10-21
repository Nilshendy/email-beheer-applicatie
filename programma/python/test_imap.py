#!/usr/bin/env python3
"""
Test IMAP connection to Gmail
"""

import imaplib

print("=" * 60)
print("GMAIL IMAP CONNECTION TEST")
print("=" * 60)
print()

gmail_address = input("Enter your Gmail address: ").strip()
app_password = input("Enter your App Password (16 chars, no spaces): ").strip()

print()
print(f"Testing IMAP connection for: {gmail_address}")
print("-" * 60)
print()

try:
    print("Connecting to imap.gmail.com:993...")
    imap_server = imaplib.IMAP4_SSL('imap.gmail.com', 993)

    print("Logging in...")
    imap_server.login(gmail_address, app_password)

    print("Selecting INBOX...")
    imap_server.select('INBOX')

    print("Searching for emails...")
    status, messages = imap_server.search(None, 'ALL')

    if status == 'OK':
        email_count = len(messages[0].split())
        print(f"[OK] IMAP connection successful!")
        print(f"[OK] Found {email_count} emails in INBOX")
    else:
        print(f"[ERROR] Failed to search emails: {status}")

    imap_server.close()
    imap_server.logout()

except imaplib.IMAP4.error as e:
    print(f"[ERROR] IMAP error: {e}")
    print("\nTroubleshooting:")
    print("  - Make sure you're using an App Password (NOT regular password)")
    print("  - Enable 2FA and create App Password at: https://myaccount.google.com/apppasswords")
    print("  - For IMAP, you may need to enable 'Less secure app access' if 2FA is not enabled")
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")

print()
print("=" * 60)
