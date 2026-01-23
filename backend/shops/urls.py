from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('shops/category-list/', views.ProductCategoryListView.as_view(), name='category-lis'),
    path('shops/category-create/', views.ProductCategoryCreateView.as_view(), name='category-create'),
    path('shops/category-edit/<str:pk>/', views.ProductCategoryEditorView.as_view(), name='category-edit'),
    # product property url
    path('shops/properties-list/', views.ProductPropertyListView.as_view(), name='properties-list'),
    path('shops/properties-create/', views.ProductPropertyCreateView.as_view(), name='properties-create'),
    path('shops/properties-edit/<str:pk>/', views.ProductPropertyEditorView.as_view(), name='properties-edit'),
    # shop url
    path('shops/shop-list-view/', views.ShopListView.as_view(), name='shop-list-view'),
    path('shops/shop-list-create/', views.ShopListAndCreateView.as_view(), name='shop-list'),
    path('shops/shop-editor/<str:pk>/', views.ShopEditorView.as_view(), name='shop-editor'),
    # product url
    path('shops/product-list-view/', views.ProductListView.as_view(), name='product-list-view'),
    path('shops/product-list-create/', views.ProductListAndCreateView.as_view(), name='product-list'),
    path('shops/product-editor/<str:pk>/', views.ProductEditorView.as_view(), name='product-list'),
    path('shops/products/search-products/', views.ProductSearchView.as_view(), name='product-list-search'),
    # product image url
    path('shops/product-image-view/', views.ProductImageListView.as_view(), name='product-image-view'),
    path('shops/product-image-create/', views.ProductImageCreateView.as_view(), name='product-image-view'),
    path('shops/product-image-editor/<str:pk>/', views.ProductImageEditorView.as_view(), name='product-image-view'),
    #order url
    path('shops/order-list-view/', views.OrderListView.as_view(), name='order-list-view'),
    path('shops/order-create/', views.OrderCreateView.as_view(), name='order-list-view'),
    path('shops/order-editor/<str:pk>/', views.OrderEditorView.as_view(), name='order-list-view'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)