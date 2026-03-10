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
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        print("\n=== LOGOUT DEBUG ===")
        print(f"User logging out: {request.user.username} (ID: {request.user.id})")
        print(f"Session key before logout: {request.session.session_key}")
        
        try:
            # Perform logout
            logout(request)
            print("Logout successful")
            
            # Create response
            response = Response(
                {'message': 'Logged out successfully'},
                status=status.HTTP_200_OK
            )
            
            # Clear session cookie
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            response.delete_cookie('session')
            
            # Add CORS headers
            response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
            response['Access-Control-Allow-Credentials'] = 'true'
            
            return response
            
        except Exception as e:
            print(f"Error during logout: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Logout failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response

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