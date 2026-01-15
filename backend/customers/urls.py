from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path('customer/guest-user-list/', views.GuestUserListView.as_view(), name='customer-list'),
    path('customer/user-create/', views.GuestUserCreateView.as_view(), name='customer-create'),
    path('customer/user-info-edit/<str:pk>', views.GuestUserEditorView.as_view(), name='customer-edit'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)