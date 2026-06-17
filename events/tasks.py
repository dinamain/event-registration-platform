from celery import shared_task
from django.core.mail import send_mail


@shared_task
def send_registration_email(user_email, user_name, event_title, event_date, event_location):
    send_mail(
        subject=f'Registration Confirmed: {event_title}',
        message=f'Hi {user_name},\n\nYou have successfully registered for "{event_title}" on {event_date} at {event_location}.\n\nThanks!',
        from_email=None,
        recipient_list=[user_email],
        fail_silently=False,
    )