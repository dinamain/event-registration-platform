from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

User = get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    password =  serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model=User
        fields=('id','name','email','password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
        )
        return user
    
class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField(write_only=True)

    def validate(self, data):
        user=authenticate(username=data['email'],password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        data['user']=user
        return data
    
