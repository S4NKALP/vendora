from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem, Product, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, request):
        """Get or create cart for the authenticated user"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        return cart

    @action(detail=False, methods=['get'])
    def items(self, request):
        """Get all items in the cart"""
        cart = self.get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add an item to the cart"""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if product is in stock
        if product.stock < quantity:
            return Response({
                'error': f'Not enough stock available. Available: {product.stock}'
            }, status=status.HTTP_400_BAD_REQUEST)

        cart = self.get_cart(request)
        cart_item = cart.add_product(product, quantity)

        if cart_item:
            serializer = CartItemSerializer(cart_item, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove an item from the cart"""
        try:
            product_id = request.data.get('product_id')
            if not product_id:
                return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

            cart = self.get_cart(request)
            cart_item = CartItem.objects.filter(cart=cart, product=product).first()
            
            if cart_item:
                cart_item.delete()
                return Response({'message': 'Item removed from cart successfully'})
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        """Update the quantity of an item in the cart"""
        try:
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))

            if not product_id:
                return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            if quantity <= 0:
                return Response({'error': 'Quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

            # Check if product is in stock
            if product.stock < quantity:
                return Response({
                    'error': f'Not enough stock available. Available: {product.stock}'
                }, status=status.HTTP_400_BAD_REQUEST)

            cart = self.get_cart(request)
            try:
                cart_item = CartItem.objects.get(cart=cart, product=product)
                cart_item.quantity = quantity
                cart_item.save()
                serializer = CartItemSerializer(cart_item, context={'request': request})
                return Response(serializer.data)
            except CartItem.DoesNotExist:
                return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from the cart"""
        cart = self.get_cart(request)
        cart.clear()
        return Response({'message': 'Cart cleared'})

    @action(detail=False, methods=['delete'])
    def delete(self, request):
        """Delete the entire cart"""
        cart = self.get_cart(request)
        cart.delete()
        return Response({'message': 'Cart deleted'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Convert cart to order"""
        cart = self.get_cart(request)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock availability for all items
        for cart_item in cart.items.all():
            if cart_item.product.stock < cart_item.quantity:
                return Response({
                    'error': f'Not enough stock for {cart_item.product.name}. Available: {cart_item.product.stock}'
                }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Create order from cart
            order = Order.objects.create(
                user=request.user,
                status='Pending',
                shipping_address=request.user.address or '',
                total_price=cart.get_total()
            )

            # Add cart items to order
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )

                # Update product stock
                product = cart_item.product
                product.stock -= cart_item.quantity
                product.save()

            # Clear the cart
            cart.clear()

        return Response({
            'message': 'Order created successfully',
            'order_id': order.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def merge(self, request):
        """Merge another cart into the current cart"""
        other_cart_id = request.data.get('cart_id')
        
        if not other_cart_id:
            return Response({'error': 'Cart ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_cart = Cart.objects.get(id=other_cart_id)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

        if other_cart.user != request.user:
            return Response({'error': 'Cannot merge carts from different users'}, 
                          status=status.HTTP_403_FORBIDDEN)

        current_cart = self.get_cart(request)
        
        with transaction.atomic():
            for cart_item in other_cart.items.all():
                current_cart.add_product(cart_item.product, cart_item.quantity)
            
            # Delete the other cart
            other_cart.delete()

        return Response({'message': 'Carts merged successfully'})