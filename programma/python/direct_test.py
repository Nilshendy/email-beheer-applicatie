#!/usr/bin/env python3
"""
Direct SMTP test - run this to see detailed error messages
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from send import test_connection

print("=" * 60)
print("DIRECT SMTP CONNECTION TEST")
print("=" * 60)
print()

# Get credentials
email = input("Enter your Gmail address: ").strip()
password = input("Enter your App Password (16 chars, no spaces): ").strip()

print()
print(f"Testing connection for: {email}")
print(f"Server: smtp.gmail.com:587")
print("-" * 60)
print()

result = test_connection(email, password)

print()
print("=" * 60)
if result:
    print("SUCCESS: Connection works!")
    print("You can now send emails.")
else:
    print("FAILED: Connection did not work")
    print()
    print("Common issues:")
    print("1. Make sure you're using an App Password (NOT regular password)")
    print("2. Enable 2-Factor Authentication on your Google account")
    print("3. Generate App Password at: https://myaccount.google.com/apppasswords")
    print("4. The App Password should be 16 characters (no spaces)")
    print("5. Try disabling VPN if you're using one")
    print("6. Check your firewall settings")
print("=" * 60)
