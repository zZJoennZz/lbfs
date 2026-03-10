from django.urls import path
from . import views

urlpatterns = [
    path('folders/', views.FolderListCreateView.as_view(), name='folder-list'),
    path('folders/<int:pk>/', views.FolderDetailView.as_view(), name='folder-detail'),
    path('folders/<int:pk>/participants/', views.FolderParticipantsView.as_view(), name='folder-participants'),
    path('files/', views.FileListCreateView.as_view(), name='file-list'),
    path('files/<int:pk>/', views.FileDetailView.as_view(), name='file-detail'),
    path('share/', views.ShareView.as_view(), name='share'),
    path('download/<int:file_id>/', views.FileDownloadView.as_view(), name='file-download'),
]