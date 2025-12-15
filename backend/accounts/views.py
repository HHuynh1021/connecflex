from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import User
from .serializers import UserSerializer,MemberUserSerializer
from django.db.models import Q


# Create your views here.
class MemberListAndCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    Serializer_class = MemberUserSerializer
class MemberEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = MemberUserSerializer
class MemberSearchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MemberUserSerializer
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        keyword = self.request.GET.get('keyword', '').strip()
        if not keyword:
            return User.objects.none()
        keywords = keyword.split()
        query = Q()
        for word in keywords:
            query |= (
                    Q(first_name__icontains=word) |
                    Q(last_name__icontains=word) |
                    Q(email__icontains=word) |
                    Q(role__icontains=word) |
                    Q(shop__name__icontains=word)
            )