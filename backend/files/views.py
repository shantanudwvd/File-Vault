from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Q
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta
from .models import File, compute_file_hash
from .serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        queryset = File.objects.all()

        # Search by filename
        filename = self.request.query_params.get('filename', None)
        if filename:
            queryset = queryset.filter(original_filename__icontains=filename)

        # Filter by file type
        file_type = self.request.query_params.get('file_type', None)
        if file_type:
            queryset = queryset.filter(file_type__icontains=file_type)

        # Filter by size range
        min_size = self.request.query_params.get('min_size', None)
        max_size = self.request.query_params.get('max_size', None)

        if min_size:
            try:
                min_size = int(min_size)
                queryset = queryset.filter(size__gte=min_size)
            except ValueError:
                pass

        if max_size:
            try:
                max_size = int(max_size)
                queryset = queryset.filter(size__lte=max_size)
            except ValueError:
                pass

        # Filter by upload date
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)

        if date_from:
            try:
                date_from = parse_date(date_from)
                if date_from:
                    queryset = queryset.filter(uploaded_at__date__gte=date_from)
            except Exception:
                pass

        if date_to:
            try:
                date_to = parse_date(date_to)
                if date_to:
                    # Add one day to include the end date
                    date_to = date_to + timedelta(days=1)
                    queryset = queryset.filter(uploaded_at__date__lt=date_to)
            except Exception:
                pass

        return queryset

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

    @action(detail=False, methods=['get'])
    def file_types(self, request):
        """
        Return a list of all file types in the system for filtering.
        """
        file_types = File.objects.values_list('file_type', flat=True).distinct()
        return Response(list(file_types))