#!/usr/bin/env python3
"""
Simple test to verify send.py can be imported and functions are available
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from send import send_email, test_connection
    print("[OK] send.py imported successfully")
    print("[OK] send_email function is available")
    print("[OK] test_connection function is available")
    print("\nEmail sending functionality is ready to use.")
    print("\nTo send an email, you need to:")
    print("  1. Have a Gmail account with 2FA enabled")
    print("  2. Generate an App Password at: https://myaccount.google.com/apppasswords")
    print("  3. Use the App Password (not your regular password)")
    print("\nThen call:")
    print("  send_email('your@gmail.com', 'recipient@gmail.com', 'Subject', 'Message', 'app_password')")
    print("\nOr run the Flask server:")
    print("  python email_server.py")
    print("  Then open http://localhost:5001 in your browser")
except Exception as e:
    print(f"[ERROR] Error importing send.py: {e}")
    sys.exit(1)
