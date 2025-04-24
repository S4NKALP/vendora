from django.conf import settings
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
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
from .models import User, Category, Product, Rating, Order, OrderItem, Favorite, PrivacyPolicy, FAQ, Contact, Slider, Coupon, Notification
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer, ProductDetailSerializer,
    RatingSerializer, OrderSerializer, OrderItemSerializer, FavoriteSerializer, PrivacyPolicySerializer,
    FAQSerializer, ContactSerializer, SliderSerializer, CouponSerializer, NotificationSerializer
)
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

# Add RegisterView class for user registration
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create auth token for the new user
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['post'])
    def update_profile_picture(self, request):
        """Update the current user's profile picture"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No profile picture provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = request.user
            # Save the new profile picture
            user.profile_picture = request.FILES['profile_picture']
            user.save()
            
            # Return the updated user data
            serializer = self.get_serializer(user)
            response_data = serializer.data
            
            # Add the profile picture URL to the response
            if user.profile_picture:
                response_data['profile_picture'] = request.build_absolute_uri(user.profile_picture.url)
            
            return Response(response_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def update_profile(self, request):
        """Update the current user's profile details"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = request.user
            # Update user details
            user.username = request.data.get('username', user.username)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.phone = request.data.get('phone', user.phone)
            user.email = request.data.get('email', user.email)
            user.gender = request.data.get('gender', user.gender)
            user.address = request.data.get('address', user.address)
            user.save()
            
            # Return the updated user data
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user and return token"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, _ = Token.objects.get_or_create(user=user)
        serializer = self.get_serializer(user)
        
        return Response({
            'token': token.key,
            'user': serializer.data
        })

    @action(detail=False, methods=['get'])
    def gender_options(self, request):
        """Get available gender options"""
        options = [
            {'value': 'Male', 'label': 'Male'},
            {'value': 'Female', 'label': 'Female'},
            {'value': 'Other', 'label': 'Other'}
        ]
        return Response(options)

    @action(detail=False, methods=['post'])
    def update_password(self, request):
        """Update the current user's password"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({'error': 'Both current and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = request.user
            # Verify current password
            if not user.check_password(current_password):
                return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def delete_account(self, request):
        """Delete the current user's account"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        password = request.data.get('password')
        
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = request.user
            # Verify password
            if not user.check_password(password):
                return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Delete the user
            user.delete()
            
            return Response({'message': 'Account deleted successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
        try:
            # Validate that pk is a valid integer
            try:
                category_id = int(pk)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid category ID. Please provide a valid integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the category
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                return Response(
                    {"error": f"Category with ID {category_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get products with related category
            products = Product.objects.filter(category=category).select_related('category')
            
            # Serialize the products
            serializer = ProductSerializer(products, many=True, context={'request': request})
            
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in products action: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": f"An error occurred while fetching products: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
    
    def update(self, request, *args, **kwargs):
        """Override update to handle status changes and stock management"""
        instance = self.get_object()
        new_status = request.data.get('status')
        
        # Check if status is being updated
        if new_status and new_status != instance.status:
            # Validate status transition
            valid_transitions = {
                'Pending': ['Shipped', 'Cancelled'],
                'Shipped': ['Delivered', 'Cancelled'],
                'Delivered': [],  # No transitions allowed from Delivered
                'Cancelled': []   # No transitions allowed from Cancelled
            }
            
            if new_status not in valid_transitions.get(instance.status, []):
                return Response({
                    'error': f'Cannot transition from {instance.status} to {new_status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check stock availability for Shipped status
            if new_status == 'Shipped':
                for item in instance.order_items.all():
                    if item.product.stock < item.quantity:
                        return Response({
                            'error': f'Not enough stock for {item.product.name}. Available: {item.product.stock}'
                        }, status=status.HTTP_400_BAD_REQUEST)
        
        # Proceed with update
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Check if order belongs to current user or user is admin
        if self.request.user.is_authenticated and (order.user.id == request.user.id or request.user.is_staff):
            # Check if order can be canceled
            if order.status not in ['Pending', 'Shipped']:
                return Response({'error': 'Cannot cancel order in current status'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Update order status
            order.status = 'Cancelled'
            order.save()
            
            # Notification will be created automatically via signal
            
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Mark an order as shipped"""
        order = self.get_object()
        
        # Check if user is staff
        if not request.user.is_staff:
            return Response({'error': 'Only staff can ship orders'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Check if order can be shipped
        if order.status != 'Pending':
            return Response({'error': 'Can only ship pending orders'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock availability
        for item in order.order_items.all():
            if item.product.stock < item.quantity:
                return Response({
                    'error': f'Not enough stock for {item.product.name}. Available: {item.product.stock}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status
        order.status = 'Shipped'
        order.save()
        
        # Notification will be created automatically via signal
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """Mark an order as delivered"""
        order = self.get_object()
        
        # Check if user is staff
        if not request.user.is_staff:
            return Response({'error': 'Only staff can mark orders as delivered'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Check if order can be delivered
        if order.status != 'Shipped':
            return Response({'error': 'Can only deliver shipped orders'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update order status
        order.status = 'Delivered'
        order.save()
        
        # Notification will be created automatically via signal
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)


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
    Return CSRF token for the frontend to use in subsequent requests
    """
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

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

        # Return updated favorites list
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

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

class PrivacyPolicyViewSet(viewsets.ModelViewSet):
    queryset = PrivacyPolicy.objects.filter(is_active=True)
    serializer_class = PrivacyPolicySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return PrivacyPolicy.objects.filter(is_active=True).order_by('-last_updated')

class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category = self.request.query_params.get('category', None)
        if category and category != 'All':
            return FAQ.objects.filter(category=category, is_active=True)
        return FAQ.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available FAQ categories"""
        categories = FAQ.CATEGORY_CHOICES
        return Response([{'value': value, 'label': label} for value, label in categories])

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.filter(is_active=True)
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Contact.objects.filter(is_active=True).order_by('contact_type')

class SliderViewSet(viewsets.ModelViewSet):
    queryset = Slider.objects.filter(is_active=True)
    serializer_class = SliderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Slider.objects.filter(is_active=True).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Coupon.objects.filter(is_active=True)
        code = self.request.query_params.get('code', None)
        if code:
            queryset = queryset.filter(code=code)
        return queryset

class ValidateCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        cart_total = request.data.get('cart_total', 0)

        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            if not coupon.is_valid():
                return Response({
                    'valid': False,
                    'message': 'Coupon has expired or is not yet active'
                }, status=400)

            if cart_total < coupon.min_purchase:
                return Response({
                    'valid': False,
                    'message': f'Minimum purchase amount of ${coupon.min_purchase} required'
                }, status=400)

            discount = coupon.calculate_discount(cart_total)
            return Response({
                'valid': True,
                'discount': discount,
                'coupon': CouponSerializer(coupon).data
            })

        except Coupon.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid coupon code'
            }, status=400)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['put'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        self.get_queryset().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)