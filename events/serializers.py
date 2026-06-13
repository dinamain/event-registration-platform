from rest_framework import serializers
from .models import Event, Registration

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model=Event
        fields=['id','title','description','date','location','created_at']

class RegistrationSerializer(serializers.ModelSerializer):
    event=EventSerializer(read_only=True)
    class Meta:
        model=Registration
        fields=['id', 'event', 'registered_at']