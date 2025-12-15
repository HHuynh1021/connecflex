from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views


urlpatterns = [
    path('member/create/', views.MemberListAndCreateView.as_view(), name='member-create'),
    path('member/list/', views.MemberListAndCreateView.as_view(), name='member-list'),
    path('member/update/<str:pk>/', views.MemberEditorView.as_view(), name='member-update'),
    path('member/delete/<str:pk>/', views.MemberEditorView.as_view(), name='member-delete'),
    path('member/search-member/', views.MemberSearchView.as_view(), name='member-search'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)