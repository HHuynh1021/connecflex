from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Shop, Product, ProductImage, OrderProduct, ProductCategory, ProductProperty
from .serializers import ShopSerializer, ProductSerializer, ProductImageSerializer, OrderSerializer, \
    ProductCategorySerializer, ProductPropertySerializer


# category
class ProductCategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [AllowAny]
class ProductCategoryCreateView(generics.CreateAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
class ProductCategoryEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
# property
class ProductPropertyListView(generics.ListAPIView):
    queryset = ProductProperty.objects.all()
    serializer_class = ProductPropertySerializer
    permission_classes = [AllowAny]
class ProductPropertyCreateView(generics.CreateAPIView):
    queryset = ProductProperty.objects.all()
    serializer_class = ProductPropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
class ProductPropertyEditorView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductProperty.objects.all()
    serializer_class = ProductPropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
# Shop Views
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

class ProductSearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    # authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        keyword = self.request.GET.get('keyword', '').strip()
        if not keyword:
            return Product.objects.none()

        keywords = keyword.split()
        query = Q()
        for word in keywords:
            query &= (
                Q(name__icontains=word) |
                Q(category__icontains=word) |
                Q(shop_id__name__icontains=word) |
                Q(color__icontains=word) |
                Q(dimension__icontains=word) |
                Q(other__icontains=word) |
                Q(weight__icontains=word) |
                Q(price__icontains=word) |
                Q(new_price__icontains=word) |
                Q(currency_unit__icontains=word) |
                Q(description__icontains=word)
            )

        return Product.objects.filter(query).order_by('-name')

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