from django.conf import settings
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.http import HttpResponseForbidden, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from django.http import FileResponse, HttpResponseForbidden
from django.views.decorators.http import require_GET
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
import os
from .models import User, Category, Product, Rating, Order, OrderItem, Favorite
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer, ProductDetailSerializer,
    RatingSerializer, OrderSerializer, OrderItemSerializer, FavoriteSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # If user_id query param is provided, filter by that
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return User.objects.filter(id=user_id)
        
        # If no specific user_id is requested, and user is staff, show all
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return User.objects.all()
            
        # For anonymous or non-staff users requesting the list endpoint, return empty queryset
        if self.action == 'list':
            return User.objects.none()
            
        # For other actions like retrieve, let Django's permission system handle it
        return User.objects.all()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        category = self.get_object()
        products = Product.objects.filter(category=category)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['name', 'price', 'created_at']
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        # Still require authentication for rating
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        product = self.get_object()
        rating_value = request.data.get('rating')
        comment = request.data.get('comment', '')
        
        if not rating_value:
            return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update or create rating
        rating, created = Rating.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={'rating': rating_value, 'comment': comment}
        )
        
        serializer = RatingSerializer(rating)
        return Response(serializer.data)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        # Still require authentication for creating ratings
        if not self.request.user.is_authenticated:
            raise PermissionDenied('Authentication required to create ratings')
        serializer.save(user=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return Order.objects.filter(user_id=user_id)
            
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Order.objects.all()
            return Order.objects.filter(user=self.request.user)
            
        # For anonymous users, return empty queryset
        return Order.objects.none()
    
    def perform_create(self, serializer):
        # For creating orders, require authentication
        if not self.request.user.is_authenticated:
            raise PermissionDenied('Authentication required to create orders')
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Check if order belongs to current user or user is admin
        if self.request.user.is_authenticated and (order.user.id == request.user.id or request.user.is_staff):
            # Check if order can be canceled
            if order.status not in ['Pending', 'Shipped']:
                return Response({'error': 'Cannot cancel order in current status'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            order.status = 'Cancelled'
            order.save()
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return OrderItem.objects.filter(order__user_id=user_id)
            
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return OrderItem.objects.all()
            return OrderItem.objects.filter(order__user=self.request.user)
            
        # For anonymous users, return empty queryset
        return OrderItem.objects.none()

def get_csrf_token(request):
    """
    This view sets the CSRF cookie and returns the token in the response.
    The client can then use this token for subsequent requests.
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
@require_GET
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def serve_protected_media(request, path):
    """
    Serve media files with authentication check.
    The path parameter should be the relative path within MEDIA_ROOT.
    """
    # Construct the full path
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # Basic security check to prevent directory traversal
    if not os.path.abspath(file_path).startswith(os.path.abspath(settings.MEDIA_ROOT)):
        return HttpResponseForbidden('Invalid path')
    
    # Check if file exists
    if not os.path.exists(file_path):
        return HttpResponseForbidden('File not found')
    
    # Serve the file
    return FileResponse(open(file_path, 'rb'))

class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all favorites for the current user"""
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle favorite status for a product"""
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if favorite exists
        favorite = Favorite.objects.filter(user=request.user, product=product).first()
        
        if favorite:
            # Remove from favorites
            favorite.delete()
            return Response({'message': 'Product removed from favorites'})
        else:
            # Add to favorites
            Favorite.objects.create(user=request.user, product=product)
            return Response({'message': 'Product added to favorites'})

    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if a product is favorited"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        is_favorited = Favorite.objects.filter(user=request.user, product=product).exists()
        return Response({'is_favorited': is_favorited})