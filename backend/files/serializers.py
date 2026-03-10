from rest_framework import serializers
from .models import Folder, File, Share
from users.serializers import UserSerializer

class FolderSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    participants_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = ('id', 'name', 'owner', 'owner_username', 'participants', 
                 'participants_count', 'parent_folder', 'files_count', 
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at', 'participants')
        # Make participants read-only since it should be managed through the share system
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    
    def get_files_count(self, obj):
        return obj.files.count()

class FileSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ('id', 'name', 'file', 'file_url', 'folder', 'uploaded_by', 
                 'uploaded_by_username', 'size', 'mime_type', 'created_at', 
                 'updated_at')
        read_only_fields = ('id', 'uploaded_by', 'size', 'mime_type', 
                           'created_at', 'updated_at')
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            # Fallback if no request context
            return obj.file.url
        return None

class ShareSerializer(serializers.ModelSerializer):
    shared_by_username = serializers.ReadOnlyField(source='shared_by.username')
    shared_with_username = serializers.ReadOnlyField(source='shared_with.username')
    folder_name = serializers.ReadOnlyField(source='folder.name', default=None)
    file_name = serializers.ReadOnlyField(source='file.name', default=None)
    
    class Meta:
        model = Share
        fields = ('id', 'folder', 'folder_name', 'file', 'file_name', 
                 'shared_by', 'shared_by_username', 'shared_with', 
                 'shared_with_username', 'share_type', 'created_at')
        read_only_fields = ('id', 'shared_by', 'created_at')