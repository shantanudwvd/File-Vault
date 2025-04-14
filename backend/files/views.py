from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import File, compute_file_hash
from .serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Compute hash for the uploaded file
        content_hash = compute_file_hash(file_obj)

        # Check if a file with this hash already exists
        existing_file = File.objects.filter(content_hash=content_hash, is_duplicate=False).first()

        if existing_file:
            # This is a duplicate file
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size,
                'content_hash': content_hash,
                'is_duplicate': True,
                'reference_file': existing_file.id
            }

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        # This is a new unique file
        data = {
            'file': file_obj,
            'original_filename': file_obj.name,
            'file_type': file_obj.content_type,
            'size': file_obj.size,
            'content_hash': content_hash,
            'is_duplicate': False
        }

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def storage_stats(self, request):
        """
        Return statistics about storage efficiency achieved through deduplication.
        """
        total_files = File.objects.count()
        unique_files = File.objects.filter(is_duplicate=False).count()
        duplicate_files = File.objects.filter(is_duplicate=True).count()

        total_size = File.objects.aggregate(Sum('size'))['size__sum'] or 0
        actual_storage = File.objects.filter(is_duplicate=False).aggregate(Sum('size'))['size__sum'] or 0
        saved_storage = total_size - actual_storage

        efficiency_percentage = 0
        if total_size > 0:
            efficiency_percentage = (saved_storage / total_size) * 100

        return Response({
            'total_files': total_files,
            'unique_files': unique_files,
            'duplicate_files': duplicate_files,
            'total_size_bytes': total_size,
            'actual_storage_bytes': actual_storage,
            'saved_storage_bytes': saved_storage,
            'efficiency_percentage': round(efficiency_percentage, 2)
        })