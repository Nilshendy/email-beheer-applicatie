import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender_email, receiver_email, subject, message, password):
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject

        msg.attach(MIMEText(message, 'plain'))

        # Connect the SMTP server (using Gmail as example)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, password)

        # Send email
        server.send_message(msg)
        server.quit()

        print("Email sent successfully!")
        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Get user input
email = input("Your Email: ")
password = input("Your Password (or App Password): ")
receiver = input("Receiver: ")
subject = input("Subject: ")
message = input("Message: ")

# Send the email
send_email(email, receiver, subject, message, password)