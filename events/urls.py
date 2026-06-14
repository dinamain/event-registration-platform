from django.urls import path
from .views import EventListView, EventDetailView, EventRegisterView, MyRegistrationsView
from .views import (
    EventListView, EventDetailView, EventRegisterView, MyRegistrationsView,
    EventCreateView, EventUpdateDeleteView, AdminRegistrationsView
)

urlpatterns = [
    path('events', EventListView.as_view(), name='event-list'),
    path('events/<int:pk>', EventDetailView.as_view(), name='event-detail'),
    path('events/<int:pk>/register', EventRegisterView.as_view(), name='event-register'),
    path('my-registrations', MyRegistrationsView.as_view(), name='my-registrations'),
    path('admin/events', EventCreateView.as_view(), name='admin-event-create'),
    path('admin/events/<int:pk>', EventUpdateDeleteView.as_view(), name='admin-event-update-delete'),
    path('admin/registrations', AdminRegistrationsView.as_view(), name='admin-registrations'),
]
