from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Shop, Product
from django.db.models import Q

from .serializers import ShopSerializer, ProductSerializer

# Create your views here.
class ShopListAndCreateView(generics.ListCreateAPIView):
    queryset = Shop.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ShopSerializer
class ShopEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shop.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ShopSerializer

class ProductListAndCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ProductSerializer
class ProductEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ProductSerializer
