import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Event, Registration

User = get_user_model()


@pytest.fixture
def regular_user():
    return User.objects.create_user(email='user@example.com', name='Regular User', password='Pass123!')


@pytest.fixture
def staff_user():
    return User.objects.create_user(email='staff@example.com', name='Staff User', password='Pass123!', is_staff=True)


@pytest.fixture
def event():
    return Event.objects.create(
        title='Test Event', description='A test event', date='2026-12-01T10:00:00Z', location='Test City'
    )


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
class TestEventListing:
    def test_list_events_no_auth_required(self, event):
        client = APIClient()
        response = client.get('/api/events')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_event_detail(self, event):
        client = APIClient()
        response = client.get(f'/api/events/{event.id}')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Event'


@pytest.mark.django_db
class TestEventRegistration:
    def test_register_for_event_requires_auth(self, event):
        client = APIClient()
        response = client.post(f'/api/events/{event.id}/register')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_register_for_event_success(self, regular_user, event):
        client = auth_client(regular_user)
        response = client.post(f'/api/events/{event.id}/register')
        assert response.status_code == status.HTTP_201_CREATED
        assert Registration.objects.filter(user=regular_user, event=event).exists()

    def test_cannot_register_twice(self, regular_user, event):
        client = auth_client(regular_user)
        client.post(f'/api/events/{event.id}/register')
        response = client.post(f'/api/events/{event.id}/register')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['detail'] == 'Already registered for this event'

    def test_my_registrations_returns_only_own(self, regular_user, staff_user, event):
        Registration.objects.create(user=regular_user, event=event)
        Registration.objects.create(user=staff_user, event=event)

        client = auth_client(regular_user)
        response = client.get('/api/my-registrations')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

@pytest.mark.django_db
class TestAdminPermissions:
    def test_regular_user_cannot_create_event(self, regular_user):
        client = auth_client(regular_user)
        response = client.post('/api/admin/events', {
            'title': 'New Event', 'description': '...', 'date': '2026-12-01T10:00:00Z', 'location': 'X'
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_staff_user_can_create_event(self, staff_user):
        client = auth_client(staff_user)
        response = client.post('/api/admin/events', {
            'title': 'New Event', 'description': '...', 'date': '2026-12-01T10:00:00Z', 'location': 'X'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert Event.objects.filter(title='New Event').exists()