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
from groq import Groq
from .tasks import send_registration_email
from django.conf import settings
from .throttles import AIGenerationThrottle

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
        
        
        send_registration_email.delay(
            request.user.email,
            request.user.name,
            event.title,
            str(event.date),
            event.location,
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




class GenerateDescriptionView(APIView):
    permission_classes = [IsAdminUser]
    throttle_classes = [AIGenerationThrottle]
    throttle_scope = 'ai_generation'
    def post(self, request):
        title = request.data.get('title', '')
        location = request.data.get('location', '')

        if not title:
            return Response({'detail': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Write a short, engaging event description (2-3 sentences) for an event titled "
            f"'{title}'"
            + (f" taking place in {location}." if location else ".")
            + " Keep it professional and inviting. Only return the description, no preamble."
        )

        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
            )
            description = response.choices[0].message.content.strip()
            return Response({'description': description})
        except Exception as e:
            return Response({'detail': f'AI generation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)