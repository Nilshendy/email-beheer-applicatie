#!/usr/bin/env python3
"""
Gmail IMAP Client - Fetch emails from Gmail and store in database
"""

import imaplib
import email
from email.header import decode_header
import re
import datetime
import mysql.connector
from mysql.connector import Error
import os
import sys

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3307'))
DB_USER = os.getenv('DB_USER', 'mail')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'base')
DB_NAME = os.getenv('DB_NAME', 'mailbase')


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


def fetch_emails_from_gmail(user_id, gmail_address, app_password, folder='INBOX', limit=50):
    """
    Fetch emails from Gmail using IMAP

    Args:
        user_id: User ID in database
        gmail_address: Gmail address
        app_password: Gmail App Password
        folder: IMAP folder (default: INBOX)
        limit: Maximum number of emails to fetch

    Returns:
        int: Number of emails fetched
    """
    try:
        # Connect to Gmail IMAP
        print(f"[INFO] Connecting to IMAP for {gmail_address}...")
        imap_server = imaplib.IMAP4_SSL('imap.gmail.com', 993)
        imap_server.login(gmail_address, app_password)
        imap_server.select(folder)

        # Search for all emails
        print(f"[INFO] Fetching emails from {folder}...")
        status, messages = imap_server.search(None, 'ALL')

        if status != 'OK':
            print(f"[ERROR] Failed to search emails: {status}")
            return 0

        # Get message IDs
        email_ids = messages[0].split()
        print(f"[INFO] Found {len(email_ids)} emails in {folder}")

        # Fetch latest emails (reverse order)
        email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids
        email_ids.reverse()

        # Get database connection
        conn = get_db_connection()
        if not conn:
            return 0

        cursor = conn.cursor()

        fetched_count = 0

        for email_id in email_ids:
            try:
                # Fetch email
                status, msg_data = imap_server.fetch(email_id, '(RFC822)')
                if status != 'OK':
                    continue

                # Parse email
                raw_email = msg_data[0][1]
                email_message = email.message_from_bytes(raw_email)

                # Extract email details
                gmail_msg_id = email_id.decode()
                subject = decode_email_header(email_message.get('Subject', ''))
                sender = decode_email_header(email_message.get('From', ''))
                sender_email = extract_email_address(sender)
                sender_name = extract_name_from_address(sender)

                # Get email body
                body = ""
                if email_message.is_multipart():
                    for part in email_message.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))

                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            try:
                                body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                break
                            except:
                                pass
                else:
                    try:
                        body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except:
                        body = str(email_message.get_payload())

                # Get date
                date_str = email_message.get('Date', '')
                received_date = None
                try:
                    email_date = email.utils.parsedate_to_datetime(date_str)
                    received_date = email_date.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    received_date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                # Check attachments
                has_attachments = False
                attachments = []
                for part in email_message.walk():
                    if part.get_content_maintype() == 'multipart':
                        continue
                    if part.get('Content-Disposition') is None:
                        continue
                    if 'attachment' in part.get('Content-Disposition'):
                        has_attachments = True
                        filename = part.get_filename()
                        if filename:
                            attachments.append(filename)

                # Check if email already exists
                cursor.execute(
                    "SELECT id FROM emails WHERE user_id = %s AND gmail_message_id = %s",
                    (user_id, gmail_msg_id)
                )
                existing = cursor.fetchone()

                if not existing:
                    # Insert new email
                    cursor.execute("""
                        INSERT INTO emails
                        (user_id, gmail_message_id, subject, sender, sender_email, body,
                         received_date, folder, has_attachments, attachments)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        user_id, gmail_msg_id, subject, sender_name, sender_email, body,
                        received_date, folder.lower(), has_attachments, ','.join(attachments)
                    ))
                    fetched_count += 1
                    print(f"[OK] Fetched: {subject[:50]}...")

            except Exception as e:
                print(f"[ERROR] Failed to process email {email_id}: {e}")
                continue

        # Commit and close
        conn.commit()
        cursor.close()
        conn.close()

        # Close IMAP connection
        imap_server.close()
        imap_server.logout()

        print(f"[INFO] Successfully fetched {fetched_count} new emails")
        return fetched_count

    except imaplib.IMAP4.error as e:
        print(f"[ERROR] IMAP error: {e}")
        print("[TIP] Make sure you're using an App Password, not your regular password")
        print("[TIP] Enable 2FA and create App Password at: https://myaccount.google.com/apppasswords")
        return 0
    except Exception as e:
        print(f"[ERROR] Failed to fetch emails: {e}")
        return 0


def sync_user_emails(user_id):
    """
    Sync emails for a specific user

    Args:
        user_id: User ID in database

    Returns:
        int: Number of emails fetched
    """
    try:
        conn = get_db_connection()
        if not conn:
            return 0

        cursor = conn.cursor()

        # Get user's Gmail credentials
        cursor.execute(
            "SELECT gmail_address, app_password FROM gmail_credentials WHERE user_id = %s",
            (user_id,)
        )
        credentials = cursor.fetchone()

        cursor.close()
        conn.close()

        if not credentials:
            print(f"[INFO] No Gmail credentials found for user {user_id}")
            return 0

        gmail_address, app_password = credentials

        # Fetch emails
        return fetch_emails_from_gmail(user_id, gmail_address, app_password)

    except Exception as e:
        print(f"[ERROR] Failed to sync user emails: {e}")
        return 0


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

            fetched = sync_user_emails(user[0])
            total_fetched += fetched

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
            user_id = int(sys.argv[2])
            sync_user_emails(user_id)
        else:
            print("Usage:")
            print("  python imap_client.py              # Sync all users")
            print("  python imap_client.py --user <id>  # Sync specific user")
    else:
        sync_all_users()
