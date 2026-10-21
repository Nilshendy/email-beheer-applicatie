from flask import Flask, request, render_template_string, jsonify
import sys
import os

# Add the current directory to path to import send.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from send import send_email, test_connection

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Versturen</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            box-sizing: border-box;
        }
        textarea {
            height: 100px;
            resize: vertical;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #0030FF;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0025CC;
        }
        .message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .test-button {
            background-color: #28a745;
            margin-top: 10px;
        }
        .test-button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Versturen</h1>
        <form method="POST">
            <div class="form-group">
                <label for="email">Jouw Email:</label>
                <input type="email" id="email" name="email" required placeholder="your.email@gmail.com">
            </div>
            <div class="form-group">
                <label for="password">Wachtwoord (of App Password):</label>
                <input type="password" id="password" name="password" required placeholder="Wachtwoord">
            </div>
            <div class="form-group">
                <label for="receiver">Ontvanger:</label>
                <input type="email" id="receiver" name="receiver" required placeholder="receiver@gmail.com">
            </div>
            <div class="form-group">
                <label for="subject">Onderwerp:</label>
                <input type="text" id="subject" name="subject" required placeholder="Onderwerp">
            </div>
            <div class="form-group">
                <label for="message">Bericht:</label>
                <textarea id="message" name="message" required placeholder="Typ je bericht hier..."></textarea>
            </div>
            <div class="form-group">
                <label for="smtp_server">SMTP Server (optioneel):</label>
                <input type="text" id="smtp_server" name="smtp_server" placeholder="smtp.gmail.com" value="smtp.gmail.com">
            </div>
            <div class="form-group">
                <label for="smtp_port">SMTP Poort (optioneel):</label>
                <input type="number" id="smtp_port" name="smtp_port" placeholder="465" value="465">
            </div>
            <button type="submit">Verstuur Email</button>
        </form>
        <button type="button" class="test-button" onclick="testConnection()">Test SMTP Verbinding</button>
        {% if message %}
        <div class="message {{ message_type }}">
            {{ message }}
        </div>
        {% endif %}
    </div>
    <script>
        function testConnection() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const smtpServer = document.getElementById('smtp_server').value;
            const smtpPort = document.getElementById('smtp_port').value;

            if (!email || !password) {
                alert('Vul eerst email en wachtwoord in voor de test');
                return;
            }

            fetch('/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    smtp_server: smtpServer,
                    smtp_port: smtpPort
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('SMTP verbinding test geslaagd! Je kunt nu emails versturen.');
                } else {
                    alert('SMTP verbinding test mislukt: ' + data.message);
                }
            })
            .catch(error => {
                alert('Fout bij testen: ' + error);
            });
        }
    </script>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def index():
    message = None
    message_type = None

    if request.method == 'POST':
        try:
            email = request.form['email']
            password = request.form['password']
            receiver = request.form['receiver']
            subject = request.form['subject']
            message_content = request.form['message']

            # Optional: Get SMTP server settings from form
            smtp_server = request.form.get('smtp_server', 'smtp.gmail.com')
            smtp_port = int(request.form.get('smtp_port', '465'))

            print(f"Attempting to send email from {email} to {receiver}")
            result = send_email(email, receiver, subject, message_content, password, smtp_server, smtp_port)

            if result:
                message = "Email succesvol verzonden!"
                message_type = "success"
            else:
                message = "Email verzenden mislukt. Controleer je SMTP instellingen en wachtwoord. Zie de console voor details."
                message_type = "error"
        except Exception as e:
            print(f"Error in index route: {str(e)}")
            import traceback
            traceback.print_exc()
            message = f"Fout: {str(e)}"
            message_type = "error"

    return render_template_string(HTML_TEMPLATE, message=message, message_type=message_type)

@app.route('/test-connection', methods=['POST'])
def test_smtp_connection():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        smtp_server = data.get('smtp_server', 'smtp.gmail.com')
        smtp_port = data.get('smtp_port', 465)

        print(f"Testing connection: {email} @ {smtp_server}:{smtp_port}")
        result = test_connection(email, password, smtp_server, smtp_port)

        if result:
            return jsonify({'success': True, 'message': 'SMTP verbinding test geslaagd'})
        else:
            return jsonify({'success': False, 'message': 'SMTP verbinding test mislukt - Controleer je wachtwoord (App Password) en 2FA instellingen'})
    except Exception as e:
        print(f"Test connection error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Fout: {str(e)}'})

if __name__ == "__main__":
    print("Email server draait op http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
