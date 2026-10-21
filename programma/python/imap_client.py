#!/usr/bin/env python3
"""
Gmail IMAP Client - Fetch emails from Gmail and store in database
"""

import imaplib
import email
import email.utils
from email.header import decode_header
import re
import datetime
import mysql.connector
from mysql.connector import Error
import os
import sys
import json

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3307'))
DB_USER = os.getenv('DB_USER', 'mail')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'base')
DB_NAME = os.getenv('DB_NAME', 'mailbase')

IMAP_HOST = os.getenv('IMAP_HOST', 'imap.gmail.com')
IMAP_PORT = int(os.getenv('IMAP_PORT', '993'))


def decode_email_header(header):
    """Decode email header"""
    if header is None:
        return ""
    decoded_list = decode_header(header)
    decoded_str = ""
    for content, encoding in decoded_list:
        if isinstance(content, bytes):
            decoded_str += content.decode(encoding if encoding else 'utf-8', errors='ignore')
        else:
            decoded_str += str(content)
    return decoded_str


def extract_email_address(addr_str):
    """Extract email address from string like 'Name <email@example.com>'"""
    match = re.search(r'<(.+?)>', addr_str)
    if match:
        return match.group(1)
    return addr_str.strip()


def extract_name_from_address(addr_str):
    """Extract name from string like 'Name <email@example.com>'"""
    match = re.search(r'(.+?)<', addr_str)
    if match:
        return match.group(1).strip().strip('"\'')
    return addr_str.strip()


def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return connection
    except Error as e:
        print(f"[ERROR] Database connection failed: {e}")
        return None


# Gmail mappen -> mappen in de applicatie
SYNC_FOLDERS = [
    ('INBOX', 'inbox'),
    ('"[Gmail]/Sent Mail"', 'sent'),
]


def get_email_body(email_message):
    """Plain text body, with HTML (tags removed) as fallback"""
    plain, html = None, None
    parts = email_message.walk() if email_message.is_multipart() else [email_message]
    for part in parts:
        if 'attachment' in str(part.get('Content-Disposition', '')):
            continue
        content_type = part.get_content_type()
        if content_type not in ('text/plain', 'text/html'):
            continue
        payload = part.get_payload(decode=True)
        if payload is None:
            continue
        text = payload.decode(part.get_content_charset() or 'utf-8', errors='ignore')
        if content_type == 'text/plain' and plain is None:
            plain = text
        elif content_type == 'text/html' and html is None:
            html = text

    if plain is not None:
        return plain
    if html is not None:
        html = re.sub(r'(?is)<(script|style).*?</\1>', '', html)
        html = re.sub(r'(?i)<br\s*/?>|</p>|</div>', '\n', html)
        return re.sub(r'<[^>]+>', '', html).strip()
    return ""


def get_attachments(email_message):
    attachments = []
    for part in email_message.walk():
        if part.get_content_maintype() == 'multipart':
            continue
        if 'attachment' in str(part.get('Content-Disposition', '')):
            filename = part.get_filename()
            if filename:
                attachments.append(decode_email_header(filename))
    return attachments


def fetch_folder(imap_server, cursor, user_id, imap_folder, app_folder, limit):
    """Haal de laatste `limit` mails uit een IMAP map op. Returns aantal nieuwe mails."""
    status, _ = imap_server.select(imap_folder, readonly=True)
    if status != 'OK':
        print(f"[INFO] Folder {imap_folder} not found, skipping")
        return 0

    status, messages = imap_server.uid('search', None, 'ALL')
    if status != 'OK':
        print(f"[ERROR] Failed to search emails in {imap_folder}: {status}")
        return 0

    uids = messages[0].split()[-limit:]
    uids.reverse()
    print(f"[INFO] Checking {len(uids)} emails in {imap_folder}")

    fetched_count = 0
    for uid in uids:
        try:
            status, msg_data = imap_server.uid('fetch', uid, '(RFC822)')
            if status != 'OK' or not msg_data or msg_data[0] is None:
                continue

            email_message = email.message_from_bytes(msg_data[0][1])

            # Message-ID is uniek per mail en gelijk aan wat api_send.php opslaat
            message_id = (email_message.get('Message-ID') or '').strip()
            if not message_id:
                message_id = f"{app_folder}:{uid.decode()}"

            subject = decode_email_header(email_message.get('Subject', ''))
            sender = decode_email_header(email_message.get('From', ''))

            try:
                email_date = email.utils.parsedate_to_datetime(email_message.get('Date', ''))
                received_date = email_date.strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                received_date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            attachments = get_attachments(email_message)

            # INSERT IGNORE: bestaat al (unique user_id + gmail_message_id) -> overslaan
            cursor.execute("""
                INSERT IGNORE INTO emails
                (user_id, gmail_message_id, subject, sender, sender_email, body,
                 received_date, folder, has_attachments, attachments)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id, message_id[:255], subject[:500], extract_name_from_address(sender)[:255],
                extract_email_address(sender)[:255], get_email_body(email_message),
                received_date, app_folder, bool(attachments), ','.join(attachments)
            ))
            if cursor.rowcount > 0:
                fetched_count += 1
                print(f"[OK] Fetched: {subject[:50]}...")

        except Exception as e:
            print(f"[ERROR] Failed to process email {uid}: {e}")

    return fetched_count


def fetch_emails_from_gmail(user_id, gmail_address, app_password, limit=50):
    """
    Fetch emails (inbox + sent) from Gmail using IMAP and store them for this user.
    Raises an exception when login or the database connection fails.

    Returns:
        int: Number of new emails
    """
    print(f"[INFO] Connecting to IMAP for {gmail_address}...")
    imap_server = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    try:
        imap_server.login(gmail_address, app_password)

        conn = get_db_connection()
        if not conn:
            raise RuntimeError("Database connection failed")

        cursor = conn.cursor()
        fetched_count = 0
        for imap_folder, app_folder in SYNC_FOLDERS:
            fetched_count += fetch_folder(imap_server, cursor, user_id, imap_folder, app_folder, limit)
            conn.commit()

        cursor.close()
        conn.close()
    finally:
        try:
            imap_server.logout()
        except Exception:
            pass

    print(f"[INFO] Successfully fetched {fetched_count} new emails")
    return fetched_count


def sync_user_emails(user_id):
    """
    Sync emails for a specific user

    Returns:
        int: Number of emails fetched

    Raises:
        LookupError when the user has no Gmail credentials
    """
    conn = get_db_connection()
    if not conn:
        raise RuntimeError("Database connection failed")

    cursor = conn.cursor()
    cursor.execute(
        "SELECT gmail_address, app_password FROM gmail_credentials WHERE user_id = %s",
        (user_id,)
    )
    credentials = cursor.fetchone()
    cursor.close()
    conn.close()

    if not credentials:
        raise LookupError(f"No Gmail credentials found for user {user_id}")

    gmail_address, app_password = credentials
    return fetch_emails_from_gmail(user_id, gmail_address, app_password)


def sync_all_users():
    """Sync emails for all users with Gmail credentials"""
    try:
        conn = get_db_connection()
        if not conn:
            return 0

        cursor = conn.cursor()

        # Get all users with Gmail credentials
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, gc.gmail_address
            FROM users u
            JOIN gmail_credentials gc ON u.id = gc.user_id
        """)

        users = cursor.fetchall()
        cursor.close()
        conn.close()

        total_fetched = 0

        for user in users:
            print(f"\n{'='*60}")
            print(f"Syncing emails for: {user[1]} ({user[2]})")
            print(f"Gmail: {user[3]}")
            print(f"{'='*60}")

            try:
                total_fetched += sync_user_emails(user[0])
            except Exception as e:
                print(f"[ERROR] Failed to sync user {user[0]}: {e}")

        print(f"\n{'='*60}")
        print(f"Total emails fetched: {total_fetched}")
        print(f"{'='*60}")

        return total_fetched

    except Exception as e:
        print(f"[ERROR] Failed to sync all users: {e}")
        return 0


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--user" and len(sys.argv) > 2:
            # Gebruikt door api_sync.php: laatste regel is RESULT {json}
            user_id = int(sys.argv[2])
            try:
                result = {'success': True, 'fetched': sync_user_emails(user_id)}
            except LookupError:
                result = {'success': False, 'no_credentials': True,
                          'message': 'Koppel eerst je Gmail bij Instellingen'}
            except imaplib.IMAP4.error as e:
                print(f"[ERROR] IMAP error: {e}")
                result = {'success': False,
                          'message': 'Inloggen bij Gmail mislukt - controleer je App Password bij Instellingen'}
            except Exception as e:
                print(f"[ERROR] Failed to sync user emails: {e}")
                result = {'success': False, 'message': 'Mails ophalen mislukt'}
            print('RESULT ' + json.dumps(result))
        else:
            print("Usage:")
            print("  python imap_client.py              # Sync all users")
            print("  python imap_client.py --user <id>  # Sync specific user")
    else:
        sync_all_users()
