from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    storage_saved = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size',
                  'content_hash', 'is_duplicate', 'reference_file', 'uploaded_at',
                  'storage_saved']
        read_only_fields = ['id', 'content_hash', 'is_duplicate', 'reference_file',
                            'uploaded_at', 'storage_saved']

    def get_storage_saved(self, obj):
        """
        Calculate storage saved if this is a duplicate file.
        Returns the size of the file if it's a duplicate (since we're not storing it again).
        """
        if obj.is_duplicate:
            return obj.size
        return 0