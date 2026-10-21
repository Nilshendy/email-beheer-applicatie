import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os

def send_email(sender_email, receiver_email, subject, message, password, smtp_server='smtp.gmail.com', smtp_port=465, attachments=None, message_id=None):
    """
    Send an email with optional attachments

    Args:
        sender_email: Sender's email address
        receiver_email: Recipient's email address
        subject: Email subject
        message: Email body (plain text)
        password: Email password or App Password
        smtp_server: SMTP server address (default: smtp.gmail.com)
        smtp_port: SMTP port (default: 465 for SSL)
        attachments: List of file paths to attach (optional)
        message_id: Message-ID header to use (optional)

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        if message_id:
            msg['Message-ID'] = message_id

        # Attach message body
        msg.attach(MIMEText(message, 'plain'))

        # Attach files if provided
        if attachments:
            for file_path in attachments:
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'rb') as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {os.path.basename(file_path)}'
                            )
                            msg.attach(part)
                            print(f"Attached: {os.path.basename(file_path)}")
                    except Exception as e:
                        print(f"Warning: Could not attach {file_path}: {e}")
                else:
                    print(f"Warning: File not found: {file_path}")

        # Create SSL context for secure connection
        context = ssl.create_default_context()

        # Connect to SMTP server using SSL (port 465)
        print(f"Connecting to {smtp_server}:{smtp_port} (SSL)...")
        server = smtplib.SMTP_SSL(smtp_server, smtp_port, context=context, timeout=60)

        # Login
        print(f"Logging in as {sender_email}...")
        try:
            server.login(sender_email, password)
        except smtplib.SMTPAuthenticationError as e:
            print(f"[ERROR] Authentication failed: {e}")
            print("\nTroubleshooting:")
            print("  - For Gmail, use an App Password instead of your regular password")
            print("  - Enable 2FA and create App Password at: https://myaccount.google.com/apppasswords")
            print("  - Ensure the App Password is correct (16 characters, no spaces)")
            return False

        # Send email
        print(f"Sending email to {receiver_email}...")
        server.send_message(msg)
        server.quit()

        print("[OK] Email sent successfully!")
        return True

    except smtplib.SMTPConnectError as e:
        print(f"[ERROR] Connection failed: {e}")
        print("\nTroubleshooting:")
        print("  - Check if SMTP server and port are correct")
        print("  - Check your firewall/network connection")
        print("  - Try disabling VPN if you're using one")
        return False
    except smtplib.SMTPException as e:
        print(f"[ERROR] SMTP error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Error sending email: {e}")
        return False

def test_connection(sender_email, password, smtp_server='smtp.gmail.com', smtp_port=465):
    """
    Test SMTP connection without sending email

    Args:
        sender_email: Email address to test
        password: Password or App Password
        smtp_server: SMTP server address
        smtp_port: SMTP port (default: 465 for SSL)

    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        print(f"Testing connection to {smtp_server}:{smtp_port} (SSL)...")
        context = ssl.create_default_context()
        server = smtplib.SMTP_SSL(smtp_server, smtp_port, context=context, timeout=30)
        server.login(sender_email, password)
        server.quit()
        print("[OK] SMTP connection test successful!")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"[ERROR] Authentication failed: {e}")
        print("\nTroubleshooting:")
        print("  - For Gmail, use an App Password instead of your regular password")
        print("  - Enable 2FA and create App Password at: https://myaccount.google.com/apppasswords")
        return False
    except Exception as e:
        print(f"[ERROR] Connection test failed: {e}")
        return False