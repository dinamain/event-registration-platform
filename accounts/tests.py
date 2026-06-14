import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestRegistration:
    def test_register_creates_user_with_hashed_password(self):
        client = APIClient()
        response = client.post('/api/register', {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'StrongPass123!'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data

        user = User.objects.get(email='test@example.com')
        assert user.password != 'StrongPass123!'  # password is hashed
        assert user.check_password('StrongPass123!')

    def test_register_duplicate_email_fails(self):
        client = APIClient()
        client.post('/api/register', {
            'name': 'First', 'email': 'dup@example.com', 'password': 'StrongPass123!'
        })
        response = client.post('/api/register', {
            'name': 'Second', 'email': 'dup@example.com', 'password': 'AnotherPass123!'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data


@pytest.mark.django_db
class TestLogin:
    def setup_method(self):
        self.user = User.objects.create_user(
            email='login@example.com', name='Login User', password='LoginPass123!'
        )

    def test_login_with_correct_credentials(self):
        client = APIClient()
        response = client.post('/api/login', {
            'email': 'login@example.com', 'password': 'LoginPass123!'
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_login_with_wrong_password_fails(self):
        client = APIClient()
        response = client.post('/api/login', {
            'email': 'login@example.com', 'password': 'WrongPassword'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data