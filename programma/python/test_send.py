#!/usr/bin/env python3
"""
Test script for send.py email functionality
This script tests if the email sending works correctly
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from send import send_email, test_connection

def test_smtp_connection():
    """Test SMTP connection"""
    print("=" * 60)
    print("TEST 1: SMTP Connection Test")
    print("=" * 60)
    
    # Replace with your actual credentials
    sender_email = input("Enter your Gmail address: ").strip()
    password = input("Enter your App Password (NOT regular password): ").strip()
    
    print(f"\nTesting connection for: {sender_email}")
    print("Note: For Gmail, use an App Password from: https://myaccount.google.com/apppasswords")
    print("-" * 60)
    
    result = test_connection(sender_email, password)

    if result:
        print("[OK] SMTP connection test PASSED")
        return sender_email, password
    else:
        print("[ERROR] SMTP connection test FAILED")
        print("\nTroubleshooting tips:")
        print("1. Enable 2-Factor Authentication on your Google account")
        print("2. Generate an App Password at: https://myaccount.google.com/apppasswords")
        print("3. Use the App Password (16 chars) instead of your regular password")
        print("4. Check if 'Less secure app access' is enabled (for older accounts)")
        return None, None

def test_send_email(sender_email, password):
    """Test sending an actual email"""
    print("\n" + "=" * 60)
    print("TEST 2: Send Email Test")
    print("=" * 60)
    
    receiver_email = input("Enter recipient email (can be your own): ").strip()
    subject = "Test Email from Python"
    message = """
    This is a test email sent from the email management application.
    
    If you receive this, the email sending functionality is working correctly!
    
    Best regards,
    Email Beheer Applicatie
    """
    
    print(f"\nSending email from: {sender_email}")
    print(f"Sending email to: {receiver_email}")
    print("-" * 60)
    
    result = send_email(sender_email, receiver_email, subject, message, password)

    if result:
        print("[OK] Email sent successfully!")
        print(f"Check your inbox (and spam folder) at: {receiver_email}")
    else:
        print("[ERROR] Email sending failed")
        print("Check the error messages above for troubleshooting")

def main():
    print("\n" + "=" * 60)
    print("EMAIL SENDING TEST SCRIPT")
    print("=" * 60)
    print("\nThis script will test the email sending functionality.")
    print("You will need:")
    print("  - A Gmail address")
    print("  - An App Password (NOT your regular password)")
    print("  - 2-Factor Authentication enabled on your Google account")
    print("\nGet App Password at: https://myaccount.google.com/apppasswords")
    print("=" * 60)
    
    # Test 1: Connection
    sender_email, password = test_smtp_connection()
    
    if not sender_email or not password:
        print("\nCannot proceed with email sending test - connection failed.")
        sys.exit(1)
    
    # Test 2: Send email
    test_send_email(sender_email, password)
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
