#!/usr/bin/env python3
"""
Verstuurt een mail voor api_send.php.
Leest JSON van stdin: {"sender", "password", "to", "subject", "message"}
Print als laatste regel: RESULT {"success": ..., "message_id": ...}
"""

import json
import os
import sys
from email.utils import make_msgid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from send import send_email

SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '465'))


def main():
    data = json.load(sys.stdin)
    sender = data['sender']
    message_id = make_msgid(domain=sender.split('@')[-1])

    success = send_email(
        sender, data['to'], data.get('subject', ''), data.get('message', ''),
        data['password'], SMTP_HOST, SMTP_PORT, message_id=message_id
    )

    if success:
        result = {'success': True, 'message_id': message_id, 'message': 'E-mail verzonden'}
    else:
        result = {'success': False, 'message': 'Verzenden mislukt - controleer je Gmail App Password bij Instellingen'}
    print('RESULT ' + json.dumps(result))


if __name__ == '__main__':
    main()
