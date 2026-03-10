from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate, login, logout
from .serializers import UserSerializer, RegisterSerializer
from django.middleware.csrf import get_token
from django.http import JsonResponse

User = get_user_model()


def test_view(request):
    return JsonResponse({"message": "Users app is working!"})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            serializer = UserSerializer(user)
            
            # Return session info in response
            response = Response({
                'user': serializer.data,
                'sessionid': request.session.session_key,
                'message': 'Login successful'
            })
            
            # Ensure session cookie is set
            request.session.save()
            
            return response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id)
        return User.objects.none()

class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})