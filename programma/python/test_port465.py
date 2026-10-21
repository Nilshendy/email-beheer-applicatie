#!/usr/bin/env python3
"""
Test SMTP connection using port 465 (SSL) instead of 587 (TLS)
"""

import smtplib
import ssl

def test_connection_465(sender_email, password, smtp_server='smtp.gmail.com', smtp_port=465):
    """Test SMTP connection using SSL on port 465"""
    try:
        print(f"Testing connection to {smtp_server}:{smtp_port} (SSL)...")
        context = ssl.create_default_context()
        server = smtplib.SMTP_SSL(smtp_server, smtp_port, context=context, timeout=30)
        server.login(sender_email, password)
        server.quit()
        print("[OK] SMTP connection test successful (port 465)!")
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

def test_basic_connectivity():
    """Test if we can reach smtp.gmail.com at all"""
    import socket
    try:
        print("Testing basic network connectivity to smtp.gmail.com...")
        socket.setdefaulttimeout(10)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("smtp.gmail.com", 587))
        print("[OK] Can reach smtp.gmail.com:587")
        return True
    except Exception as e:
        print(f"[ERROR] Cannot reach smtp.gmail.com:587 - {e}")
        print("Trying port 465...")
        try:
            socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("smtp.gmail.com", 465))
            print("[OK] Can reach smtp.gmail.com:465")
            return True
        except Exception as e2:
            print(f"[ERROR] Cannot reach smtp.gmail.com:465 either - {e2}")
            print("\nThis suggests a network/firewall issue blocking Gmail SMTP entirely.")
            return False

if __name__ == "__main__":
    print("=" * 60)
    print("SMTP CONNECTION TEST - PORT 465 (SSL)")
    print("=" * 60)
    print()

    # First test basic connectivity
    test_basic_connectivity()
    print()

    # Get credentials
    email = input("Enter your Gmail address: ").strip()
    password = input("Enter your App Password (16 chars, no spaces): ").strip()

    print()
    print(f"Testing connection for: {email}")
    print(f"Server: smtp.gmail.com:465 (SSL)")
    print("-" * 60)
    print()

    result = test_connection_465(email, password)

    print()
    print("=" * 60)
    if result:
        print("SUCCESS: Connection works on port 465!")
        print("I will update the code to use port 465 by default.")
    else:
        print("FAILED: Both ports 587 and 465 are not working")
        print()
        print("Possible causes:")
        print("1. Your ISP is blocking Gmail SMTP ports")
        print("2. Corporate/school network is blocking SMTP")
        print("3. Antivirus software is blocking the connection")
        print("4. Proxy settings are interfering")
        print()
        print("Solutions:")
        print("- Try from a different network (e.g., mobile hotspot)")
        print("- Temporarily disable antivirus")
        print("- Use a different email provider (Outlook, Yahoo, etc.)")
    print("=" * 60)
