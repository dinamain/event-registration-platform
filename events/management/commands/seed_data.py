from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed superuser and sample events'

    def handle(self, *args, **options):
        email = config('ADMIN_EMAIL', default=None)
        password = config('ADMIN_PASSWORD', default=None)

        if email and password and not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, name='Admin', password=password)
            self.stdout.write(f'Superuser {email} created')

        if Event.objects.count() == 0:
            Event.objects.create(
                title='AI Era',
                description='Conducted by Google',
                date='2026-06-24T12:00:00Z',
                location='Thiruvananthapuram',
            )
            Event.objects.create(
                title='Java Developers Talk',
                description='Conducted by ICFOSS',
                date='2026-06-28T06:00:00Z',
                location='Kochi',
            )
            Event.objects.create(
                title='Web Development Workshop',
                description='Conducted at Calicut',
                date='2026-06-30T12:00:00Z',
                location='Calicut',
            )
            self.stdout.write('Sample events created')