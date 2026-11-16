"""Sending email over SMTP. With no SMTP server configured, the message goes to the server log."""

import logging
import smtplib
import ssl
from email.message import EmailMessage

from .config import MAIL_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER

log = logging.getLogger("uvicorn.error")


def send_mail(to: str, subject: str, body: str) -> bool:
    """True when the message was handed over. Never raises: callers offer "send it again"."""
    if not SMTP_HOST:
        # Local development only. The log then holds working links, so set MVQ_SMTP_HOST
        # anywhere other people can read the logs.
        log.warning(
            "No SMTP server set, so this email was not sent.\nTo: %s\n%s\n\n%s", to, subject, body
        )
        return True
    message = EmailMessage()
    message["From"], message["To"], message["Subject"] = MAIL_FROM, to, subject
    message.set_content(body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            if SMTP_USER:
                smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(message)
        return True
    except (smtplib.SMTPException, OSError, ValueError):
        log.exception("Could not send email to %s", to)
        return False
