from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Shop, Product, ProductImage, OrderProduct
from .serializers import ShopSerializer, ProductSerializer, ProductImageSerializer, OrderSerializer


# Create your views here.
class ShopListView(generics.ListAPIView):
    queryset = Shop.objects.all()
    permission_classes = [AllowAny]
    serializer_class = ShopSerializer
    # authentication_classes=[JWTAuthentication]

class ShopListAndCreateView(generics.ListCreateAPIView):
    queryset = Shop.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ShopSerializer
    
    def get_queryset(self):
        return Shop.objects.filter(shop_account=self.request.user)

class ShopEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shop.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ShopSerializer

# Product Views
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

class ProductListAndCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]  # ✅ Added authentication
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        # ✅ FIXED: Get all shops owned by the user, then filter products by those shops
        user_shops = Shop.objects.filter(shop_account=self.request.user)
        return Product.objects.filter(shop_id__in=user_shops)

class ProductEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    serializer_class = ProductSerializer

# ProductImageView
class ProductImageListView(generics.ListAPIView):
    queryset = ProductImage.objects.all()  # ✅ FIXED: Use ProductImage, not Product
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProductImageSerializer

class ProductImageCreateView(generics.ListCreateAPIView):
    queryset = ProductImage.objects.all()  # ✅ FIXED: Use ProductImage, not Product
    permission_classes = [IsAuthenticated]
    serializer_class = ProductImageSerializer
    authentication_classes = [JWTAuthentication]

class ProductImageEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductImage.objects.all()  # ✅ FIXED: Use ProductImage, not Product
    permission_classes = [IsAuthenticated]
    serializer_class = ProductImageSerializer
    authentication_classes = [JWTAuthentication]

#OrderView
class OrderListView(generics.ListAPIView):
    # queryset = OrderProduct.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        return OrderProduct.objects.filter(shop__shop_account=self.request.user)

class OrderCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        return OrderProduct.objects.filter(customer=self.request.user)

class OrderEditorView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        return OrderProduct.objects.filter(customer=self.request.user)