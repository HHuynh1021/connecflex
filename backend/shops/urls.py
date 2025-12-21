from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    # shop url
    path('shops/shop-list-view/', views.ShopListView.as_view(), name='shop-list-view'),
    path('shops/shop-list-create/', views.ShopListAndCreateView.as_view(), name='shop-list'),
    path('shops/shop-editor/<str:pk>/', views.ShopEditorView.as_view(), name='shop-editor'),
    # product url
    path('shops/product-list-view/', views.ProductListView.as_view(), name='product-list-view'),
    path('shops/product-list-create/', views.ProductListAndCreateView.as_view(), name='product-list'),
    path('shops/product-editor/<str:pk>/', views.ProductEditorView.as_view(), name='product-list'),
    # product image url
    path('shops/product-image-view/', views.ProductImageListView.as_view(), name='product-image-view'),
    path('shops/product-image-create/', views.ProductImageCreateView.as_view(), name='product-image-view'),
    path('shops/product-image-editor/<str:pk>/', views.ProductImageEditorView.as_view(), name='product-image-view'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)