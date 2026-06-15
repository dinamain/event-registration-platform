from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Event, Registration
from .serializers import EventSerializer,RegistrationSerializer
from rest_framework import filters
 #searchfilter
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import EventSerializer, RegistrationSerializer, AdminRegistrationSerializer
from django.core.mail import send_mail


class EventListView(generics.ListAPIView):
    queryset=Event.objects.all().order_by('date')
    serializer_class=EventSerializer
    permission_classes=[AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields=['title','description','location']

class EventDetailView(generics.RetrieveAPIView):
    queryset=Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[AllowAny]


class EventRegisterView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, pk):
        try:
            event=Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'detail':'Event not found'},status=status.HTTP_404_NOT_FOUND)
        
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response({'detail': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration = Registration.objects.create(user=request.user, event=event)
        send_mail(
            subject=f'Registration Confirmed: {event.title}',
            message=f'Hi {request.user.name},\n\nYou have successfully registered for "{event.title}" on {event.date} at {event.location}.\n\nThanks!',
            from_email=None,
            recipient_list=[request.user.email],
            fail_silently=False,
        )
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user).order_by('-registered_at')
    

class EventCreateView(generics.CreateAPIView):
    queryset=Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[IsAdminUser]

class EventUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset=Event.objects.all()
    serializer_class=EventSerializer
    permission_classes=[IsAdminUser]

class AdminRegistrationsView(generics.ListAPIView):
    queryset = Registration.objects.all().order_by('-registered_at')
    serializer_class = AdminRegistrationSerializer
    permission_classes = [IsAdminUser]