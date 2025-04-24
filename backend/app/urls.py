from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .carts import CartViewSet
from .auth import CustomAuthToken, LogoutView
from .views import (
    UserViewSet, CategoryViewSet, ProductViewSet, RatingViewSet,
    OrderViewSet, OrderItemViewSet, get_csrf_token, serve_protected_media,
    FavoriteViewSet, PrivacyPolicyViewSet, FAQViewSet, ContactViewSet,
    SliderViewSet, CouponViewSet, ValidateCouponView, RegisterView,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'privacy-policies', PrivacyPolicyViewSet, basename='privacy-policy')
router.register(r'faqs', FAQViewSet, basename='faq')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'sliders', SliderViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    
    # Token authentication endpoints
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),
    path('token-auth/', CustomAuthToken.as_view(), name='token_auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('media/<path:path>', serve_protected_media, name='serve_protected_media'),
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
]