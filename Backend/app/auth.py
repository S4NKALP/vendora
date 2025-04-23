# In your_app_name/auth.py
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.db import transaction
from .models import Order, Product, User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class CustomAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Signal is dispatched automatically by Django's auth system
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })

class LogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Allow logout by token or user_id
        user_id = request.data.get('user_id')
        token_key = request.data.get('token')
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                try:
                    user.auth_token.delete()
                except Token.DoesNotExist:
                    pass
                return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        elif token_key:
            try:
                token = Token.objects.get(key=token_key)
                token.delete()
                return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
            except Token.DoesNotExist:
                return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        elif request.user.is_authenticated:
            # Delete the token to logout the current user
            request.user.auth_token.delete()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Authentication credentials not provided."}, 
                           status=status.HTTP_400_BAD_REQUEST)

@receiver(user_logged_in)
def sync_cart_on_login(sender, request, user, **kwargs):
    """Sync session cart to user's cart when they log in"""
    if not hasattr(request, 'session') or not request.session.get('cart'):
        return
        
    cart = request.session.get('cart', {})
    if not cart:
        return
        
    with transaction.atomic():
        # Get or create a pending order
        pending_order, created = Order.objects.get_or_create(
            user=user,
            status='Pending',
            defaults={
                'shipping_address': user.address or ''
            }
        )
        
        # Add session cart items to the user's order
        for product_id, item_data in cart.items():
            try:
                product = Product.objects.get(id=product_id)
                quantity = item_data.get('quantity', 1)
                pending_order.add_product(product, quantity)
            except Product.DoesNotExist:
                continue
                
        # Clear the session cart
        request.session['cart'] = {}
        request.session.modified = True