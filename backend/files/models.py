from django.db import models
from django.conf import settings
import os

class Folder(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_folders')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='shared_folders')
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['name', 'owner', 'parent_folder']
    
    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"

class File(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.size:
            self.size = self.file.size
        if not self.mime_type:
            import mimetypes
            self.mime_type = mimetypes.guess_type(self.file.name)[0] or 'application/octet-stream'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Share(models.Model):
    SHARE_TYPES = [
        ('FOLDER', 'Folder'),
        ('FILE', 'File'),
    ]
    
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True)
    file = models.ForeignKey(File, on_delete=models.CASCADE, null=True, blank=True)
    shared_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shares_made')
    shared_with = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shares_received')
    share_type = models.CharField(max_length=10, choices=SHARE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ['folder', 'shared_with'],
            ['file', 'shared_with'],
        ]
    
    def __str__(self):
        if self.folder:
            return f"Folder '{self.folder.name}' shared with {self.shared_with.username}"
        return f"File '{self.file.name}' shared with {self.shared_with.username}"