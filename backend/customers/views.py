from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import GuestUser
from .serializers import GuestUserSerializer

# Create your views here.
class GuestUserListView(generics.ListAPIView):
    serializer_class=GuestUserSerializer
    permission_classes=[IsAuthenticatedOrReadOnly]
    authentication_classes=[JWTAuthentication]
    queryset = GuestUser.objects.all()
class GuestUserCreateView(generics.CreateAPIView):
    serializer_class=GuestUserSerializer
    permission_classes=[IsAuthenticated]
    authentication_classes=[JWTAuthentication]
    def get_queryset(self):
        return GuestUser.objects.filter(user=self.request.user)
class GuestUserEditorView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class=GuestUserSerializer
    permission_classes=[IsAuthenticated]
    authentication_classes=[JWTAuthentication]
    def get_queryset(self):
        return GuestUser.objects.filter(user=self.request.user)
    
