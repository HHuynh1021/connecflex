from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('shops/shop-list-create/', views.ShopListAndCreateView.as_view(), name='shop-list'),
    path('shops/shop-editor/<str:pk>/', views.ShopEditorView.as_view(), name='shop-editor'),
    path('shops/product-list-create/', views.ProductListAndCreateView.as_view(), name='product-list'),
    path('shops/product-editor/<str:pk>/', views.ProductEditorView.as_view(), name='product-list'),
]