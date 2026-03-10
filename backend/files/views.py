# from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
# from django.utils.decorators import method_decorator
# from rest_framework import generics, permissions, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.db.models import Q
# from .models import Folder, File, Share
# from .serializers import FolderSerializer, FileSerializer, ShareSerializer
# from users.serializers import UserSerializer

# # Add this decorator to handle CSRF for all views
# @method_decorator(csrf_exempt, name='dispatch')
# class FolderListCreateView(generics.ListCreateAPIView):
#     serializer_class = FolderSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         user = self.request.user
#         return Folder.objects.filter(
#             Q(owner=user) | Q(participants=user)
#         ).distinct()
    
#     def perform_create(self, serializer):
#         serializer.save(owner=self.request.user)
    
#     def options(self, request, *args, **kwargs):
#         response = super().options(request, *args, **kwargs)
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
#         response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
#         return response

# @method_decorator(csrf_exempt, name='dispatch')
# class FolderDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FolderSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         user = self.request.user
#         return Folder.objects.filter(
#             Q(owner=user) | Q(participants=user)
#         ).distinct()
    
#     def options(self, request, *args, **kwargs):
#         response = super().options(request, *args, **kwargs)
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         return response

# @method_decorator(csrf_exempt, name='dispatch')
# class FolderParticipantsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pk):
#         try:
#             folder = Folder.objects.get(pk=pk)
#             if request.user != folder.owner and request.user not in folder.participants.all():
#                 return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
#             participants = folder.participants.all()
#             serializer = UserSerializer(participants, many=True)
#             return Response(serializer.data)
#         except Folder.DoesNotExist:
#             return Response({'error': 'Folder not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     def options(self, request, *args, **kwargs):
#         response = HttpResponse()
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         return response

# @method_decorator(csrf_exempt, name='dispatch')
# class FileListCreateView(generics.ListCreateAPIView):
#     serializer_class = FileSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         user = self.request.user
#         folder_id = self.request.query_params.get('folder')
        
#         if folder_id:
#             return File.objects.filter(
#                 folder_id=folder_id,
#                 folder__in=Folder.objects.filter(
#                     Q(owner=user) | Q(participants=user)
#                 )
#             )
#         return File.objects.filter(
#             folder__in=Folder.objects.filter(
#                 Q(owner=user) | Q(participants=user)
#             )
#         )
    
#     def perform_create(self, serializer):
#         serializer.save(uploaded_by=self.request.user)
    
#     def options(self, request, *args, **kwargs):
#         response = super().options(request, *args, **kwargs)
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         return response

# @method_decorator(csrf_exempt, name='dispatch')
# class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FileSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         user = self.request.user
#         return File.objects.filter(
#             folder__in=Folder.objects.filter(
#                 Q(owner=user) | Q(participants=user)
#             )
#         )
    
#     def options(self, request, *args, **kwargs):
#         response = super().options(request, *args, **kwargs)
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         return response

# @method_decorator(csrf_exempt, name='dispatch')
# class ShareView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request):
#         share_type = request.data.get('share_type')
#         item_id = request.data.get('item_id')
#         shared_with_id = request.data.get('shared_with_id')
        
#         try:
#             shared_with = User.objects.get(id=shared_with_id)
            
#             if share_type == 'FOLDER':
#                 folder = Folder.objects.get(id=item_id, owner=request.user)
                
#                 # Add user to folder participants
#                 folder.participants.add(shared_with)
                
#                 # Create share record
#                 share = Share.objects.create(
#                     folder=folder,
#                     shared_by=request.user,
#                     shared_with=shared_with,
#                     share_type='FOLDER'
#                 )
                
#             elif share_type == 'FILE':
#                 file = File.objects.get(id=item_id, uploaded_by=request.user)
                
#                 # Create or get folder named after the user
#                 user_folder, created = Folder.objects.get_or_create(
#                     name=shared_with.username,
#                     owner=request.user,
#                     defaults={'parent_folder': None}
#                 )
                
#                 # Move file to user's folder
#                 file.folder = user_folder
#                 file.save()
                
#                 # Add user to folder participants
#                 user_folder.participants.add(shared_with)
                
#                 # Create share record
#                 share = Share.objects.create(
#                     file=file,
#                     shared_by=request.user,
#                     shared_with=shared_with,
#                     share_type='FILE'
#                 )
            
#             serializer = ShareSerializer(share)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#         except User.DoesNotExist:
#             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
#         except Folder.DoesNotExist:
#             return Response({'error': 'Folder not found'}, status=status.HTTP_404_NOT_FOUND)
#         except File.DoesNotExist:
#             return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
    
#     def options(self, request, *args, **kwargs):
#         response = HttpResponse()
#         response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#         response['Access-Control-Allow-Credentials'] = 'true'
#         response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
#         response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
#         return response

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.http import FileResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
import logging
import shutil
import traceback
import os
from .models import Folder, File, Share
from .serializers import FolderSerializer, FileSerializer, ShareSerializer
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class FolderListCreateView(generics.ListCreateAPIView):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Folder.objects.filter(
            Q(owner=user) | Q(participants=user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    def options(self, request, *args, **kwargs):
        response = super().options(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class FolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Folder.objects.filter(
            Q(owner=user) | Q(participants=user)
        ).distinct()

    def delete(self, request, *args, **kwargs):
        print("\n=== FOLDER DELETE DEBUG ===")
        print(f"User: {request.user} (ID: {request.user.id})")
        print(f"Folder ID: {kwargs.get('pk')}")
        
        try:
            # Try to get the folder instance
            try:
                instance = self.get_object()
                print(f"Found folder: {instance.name}")
                print(f"Folder owner: {instance.owner.username} (ID: {instance.owner.id})")
            except Http404:
                print(f"Folder with ID {kwargs.get('pk')} not found in database")
                return Response(
                    {'message': 'Folder already deleted'},
                    status=status.HTTP_200_OK
                )
            
            # Check if user has permission to delete (only owner can delete)
            if instance.owner != request.user:
                print(f"Permission denied: User {request.user.id} trying to delete folder owned by {instance.owner.id}")
                return Response(
                    {'error': 'Only the owner can delete this folder'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all files in this folder and subfolders
            files_to_delete = []
            
            def collect_files(folder):
                """Recursively collect all files in folder and subfolders"""
                # Files in current folder
                for file in folder.files.all():
                    files_to_delete.append(file)
                    print(f"  Found file: {file.name} (ID: {file.id})")
                
                # Files in subfolders
                for subfolder in folder.subfolders.all():
                    collect_files(subfolder)
            
            collect_files(instance)
            print(f"Total files to delete: {len(files_to_delete)}")
            
            # Store folder info for response
            folder_id = instance.id
            folder_name = instance.name
            
            # Delete all physical files first
            deleted_files = []
            failed_files = []
            
            for file in files_to_delete:
                try:
                    if file.file:
                        file_path = file.file.path
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"  Deleted file: {file_path}")
                            deleted_files.append(file.name)
                        else:
                            print(f"  File not found: {file_path}")
                except Exception as e:
                    print(f"  Error deleting file {file.name}: {e}")
                    failed_files.append(file.name)
            
            # Delete all database records (cascade will handle folders)
            # But we need to delete files first to avoid FK constraints
            for file in files_to_delete:
                file.delete()
                print(f"  Deleted file record: {file.name}")
            
            # Now delete the folder (this will cascade to subfolders)
            folder_path = None
            if instance.name:
                # Check if there's a corresponding physical folder
                potential_path = os.path.join(settings.MEDIA_ROOT, 'uploads', instance.name)
                if os.path.exists(potential_path) and os.path.isdir(potential_path):
                    folder_path = potential_path
            
            instance.delete()
            print(f"Deleted folder record: {folder_name}")
            
            # Try to delete physical folder if it exists and is empty
            if folder_path and os.path.exists(folder_path):
                try:
                    # Check if folder is empty
                    if not os.listdir(folder_path):
                        os.rmdir(folder_path)
                        print(f"Deleted empty folder: {folder_path}")
                    else:
                        print(f"Folder not empty, skipping: {folder_path}")
                except Exception as e:
                    print(f"Error deleting folder {folder_path}: {e}")
            
            # Prepare response message
            message = f'Folder "{folder_name}" deleted successfully'
            if deleted_files:
                message += f'. Deleted {len(deleted_files)} files'
            if failed_files:
                message += f'. Failed to delete {len(failed_files)} files'
            
            return Response(
                {
                    'message': message,
                    'deleted_files': len(deleted_files),
                    'failed_files': failed_files if failed_files else None
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"!!! ERROR IN FOLDER DELETE: {str(e)}")
            print("Traceback:")
            traceback.print_exc()
            return Response(
                {'error': f'Failed to delete folder: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def options(self, request, *args, **kwargs):
        response = super().options(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class FolderParticipantsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            folder = Folder.objects.get(pk=pk)
            if request.user != folder.owner and request.user not in folder.participants.all():
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            participants = folder.participants.all()
            serializer = UserSerializer(participants, many=True)
            return Response(serializer.data)
        except Folder.DoesNotExist:
            return Response({'error': 'Folder not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class FileListCreateView(generics.ListCreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        folder_id = self.request.query_params.get('folder')
        
        if folder_id:
            return File.objects.filter(
                folder_id=folder_id,
                folder__in=Folder.objects.filter(
                    Q(owner=user) | Q(participants=user)
                )
            )
        return File.objects.filter(
            folder__in=Folder.objects.filter(
                Q(owner=user) | Q(participants=user)
            )
        )
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    def options(self, request, *args, **kwargs):
        response = super().options(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return File.objects.filter(
            folder__in=Folder.objects.filter(
                Q(owner=user) | Q(participants=user)
            )
        )

    def delete(self, request, *args, **kwargs):
        print("\n=== FILE DELETE DEBUG ===")
        print(f"User: {request.user} (ID: {request.user.id})")
        print(f"File ID: {kwargs.get('pk')}")
        
        try:
            # Get the file instance
            instance = self.get_object()
            print(f"Found file: {instance.name}")
            print(f"File path: {instance.file.path if instance.file else 'No file'}")
            
            # Check if user has permission to delete
            if instance.uploaded_by != request.user:
                print(f"Permission denied: User {request.user.id} trying to delete file uploaded by {instance.uploaded_by.id}")
                return Response(
                    {'error': 'You do not have permission to delete this file'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Store file info before deletion
            file_path = None
            if instance.file:
                file_path = instance.file.path
                print(f"Physical file path: {file_path}")
            
            # Delete the database record first
            print("Deleting database record...")
            instance.delete()
            print("Database record deleted")
            
            # Then delete the physical file if it exists
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Physical file deleted: {file_path}")
                except Exception as e:
                    print(f"Error deleting physical file: {e}")
                    # Log but don't fail the request - database record is already gone
                    print(f"Physical file may need manual cleanup: {file_path}")
            else:
                print(f"Physical file not found at: {file_path}")
            
            return Response(
                {'message': 'File deleted successfully'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"!!! ERROR IN FILE DELETE: {str(e)}")
            print("Traceback:")
            traceback.print_exc()
            return Response(
                {'error': f'Failed to delete file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def options(self, request, *args, **kwargs):
        response = super().options(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class ShareView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        print("\n=== SHARE VIEW DEBUG ===")
        print(f"User: {request.user} (ID: {request.user.id})")
        print(f"Request data: {request.data}")
        print(f"Headers: {dict(request.headers)}")
        
        try:
            share_type = request.data.get('share_type')
            item_id = request.data.get('item_id')
            shared_with_id = request.data.get('shared_with_id')
            
            print(f"share_type: {share_type}")
            print(f"item_id: {item_id}")
            print(f"shared_with_id: {shared_with_id}")
            
            # Validate input
            if not all([share_type, item_id, shared_with_id]):
                missing = []
                if not share_type: missing.append('share_type')
                if not item_id: missing.append('item_id')
                if not shared_with_id: missing.append('shared_with_id')
                return Response(
                    {'error': f'Missing required fields: {", ".join(missing)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the user to share with
            try:
                shared_with = User.objects.get(id=shared_with_id)
                print(f"Found user to share with: {shared_with.username} (ID: {shared_with.id})")
            except User.DoesNotExist:
                print(f"User with ID {shared_with_id} not found")
                return Response(
                    {'error': f'User with id {shared_with_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if trying to share with self
            if shared_with.id == request.user.id:
                return Response(
                    {'error': 'Cannot share with yourself'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if share_type == 'FOLDER':
                try:
                    folder = Folder.objects.get(id=item_id, owner=request.user)
                    print(f"Found folder: {folder.name} (ID: {folder.id})")
                    
                    # Add user to folder participants
                    folder.participants.add(shared_with)
                    print(f"Added {shared_with.username} to folder participants")
                    
                    # Create share record
                    share = Share.objects.create(
                        folder=folder,
                        shared_by=request.user,
                        shared_with=shared_with,
                        share_type='FOLDER'
                    )
                    print(f"Created share record with ID: {share.id}")
                    
                except Folder.DoesNotExist:
                    print(f"Folder with ID {item_id} not found or not owned by user")
                    return Response(
                        {'error': 'Folder not found or you do not have permission to share it'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
            elif share_type == 'FILE':
                try:
                    file = File.objects.get(id=item_id, uploaded_by=request.user)
                    print(f"Found file: {file.name} (ID: {file.id})")
                    
                    # Create or get folder named after the user
                    user_folder, created = Folder.objects.get_or_create(
                        name=shared_with.username,
                        owner=request.user,
                        defaults={'parent_folder': None}
                    )
                    print(f"{'Created' if created else 'Found'} user folder: {user_folder.name} (ID: {user_folder.id})")
                    
                    # Move file to user's folder
                    old_folder = file.folder
                    file.folder = user_folder
                    file.save()
                    print(f"Moved file from folder {old_folder.id} to {user_folder.id}")
                    
                    # Add user to folder participants
                    user_folder.participants.add(shared_with)
                    print(f"Added {shared_with.username} to folder participants")
                    
                    # Create share record
                    share = Share.objects.create(
                        file=file,
                        shared_by=request.user,
                        shared_with=shared_with,
                        share_type='FILE'
                    )
                    print(f"Created share record with ID: {share.id}")
                    
                except File.DoesNotExist:
                    print(f"File with ID {item_id} not found or not uploaded by user")
                    return Response(
                        {'error': 'File not found or you do not have permission to share it'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                print(f"Invalid share_type: {share_type}")
                return Response(
                    {'error': f'Invalid share_type: {share_type}. Must be "FOLDER" or "FILE"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ShareSerializer(share)
            print("Share successful!")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"!!! UNHANDLED EXCEPTION: {str(e)}")
            print("Traceback:")
            traceback.print_exc()
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class FileDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(
                id=file_id,
                folder__in=Folder.objects.filter(
                    Q(owner=request.user) | Q(participants=request.user)
                )
            )
            
            # Serve the file
            response = FileResponse(
                file_obj.file.open('rb'),
                content_type=file_obj.mime_type
            )
            response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
            return response
            
        except File.DoesNotExist:
            return Response(
                {'error': 'File not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )