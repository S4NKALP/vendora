from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.db.models.signals import post_save
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.validators import MinValueValidator, MaxValueValidator
import logging

logger = logging.getLogger(__name__)


GENDER_CHOICES = (("Male", "Male"), ("Female", "Female"), ("Other", "Other"))


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default="Male", blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["username"]

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    @property
    def image_url(self):
        if self.image:
            return f"/media/{self.image.name}"
        return None


class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    category = models.ForeignKey(
        Category, related_name="products", on_delete=models.CASCADE
    )
    size = models.CharField(max_length=10, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]

    @property
    def image_url(self):
        if self.image:
            return f"/media/{self.image.name}"
        return None

    def update_average_rating(self):
        avg_rating = self.ratings.aggregate(avg_rating=models.Avg("rating"))[
            "avg_rating"
        ]
        self.average_rating = avg_rating or 0
        self.save()


class Rating(models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(
        Product, related_name="ratings", on_delete=models.CASCADE
    )
    user = models.ForeignKey(User, related_name="ratings", on_delete=models.CASCADE)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("product", "user")
        verbose_name = "Rating"
        verbose_name_plural = "Ratings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating}"


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, related_name="orders", on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        default="Pending",
        choices=[
            ("Pending", "Pending"),
            ("Shipped", "Shipped"),
            ("Delivered", "Delivered"),
            ("Cancelled", "Cancelled"),
        ],
    )
    shipping_address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

    def update_total(self):
        """Automatically calculate total price from order items"""
        order_items = self.order_items.all()
        if not order_items.exists():
            self.total_price = 0
        else:
            self.total_price = sum(item.get_subtotal() for item in order_items)
        self.save()

    def add_product(self, product, quantity=1):
        """Add a product to the order"""
        if product is None:
            return None

        if quantity is None or quantity <= 0:
            quantity = 1

        order_item, created = OrderItem.objects.get_or_create(
            order=self,
            product=product,
            defaults={
                "quantity": quantity,
                "price": product.price if product.price else 0,
            },
        )

        if not created:
            order_item.quantity += quantity
            order_item.save()

        self.update_total()
        return order_item

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, related_name="order_items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, related_name="order_items", on_delete=models.CASCADE
    )
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def get_subtotal(self):
        """Calculate the subtotal for this item"""
        if self.price is None or self.quantity is None:
            return 0
        return self.price * self.quantity

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

    def save(self, *args, **kwargs):
        # Ensure price is set correctly if it's none or a new order item
        if self.price is None or (not self.pk and not self.price):
            self.price = (
                self.product.price if self.product and self.product.price else 0
            )

        # Ensure quantity is never None
        if self.quantity is None:
            self.quantity = 1

        super().save(*args, **kwargs)
        # Update the order total when an item is saved
        if self.order:
            self.order.update_total()

    def delete(self, *args, **kwargs):
        order = self.order
        super().delete(*args, **kwargs)
        # Update the order total when an item is deleted
        if order:
            order.update_total()

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
        ordering = ["order"]


@receiver(post_save, sender=Order)
def update_order_status(sender, instance, created, **kwargs):
    """When an order status changes to Delivered, update product stock"""
    if not created and instance.status == "Delivered":
        for item in instance.order_items.all():
            product = item.product
            # Only update stock if we haven't already updated it
            if product.stock >= item.quantity:
                product.stock -= item.quantity
                product.save()
            else:
                # Log error if stock is insufficient
                logger.error(f"Insufficient stock for product {product.name} when delivering order {instance.id}")


class Cart(models.Model):
    user = models.OneToOneField(User, related_name="cart", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    def get_total(self):
        """Calculate total price of all items in cart"""
        return sum(item.get_subtotal() for item in self.items.all())

    def add_product(self, product, quantity=1):
        """Add a product to the cart"""
        if quantity <= 0:
            return None

        cart_item, created = CartItem.objects.get_or_create(
            cart=self, product=product, defaults={"quantity": quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return cart_item

    def remove_product(self, product):
        """Remove a product from the cart"""
        try:
            cart_item = CartItem.objects.get(cart=self, product=product)
            cart_item.delete()
            return True
        except CartItem.DoesNotExist:
            return False

    def clear(self):
        """Remove all items from the cart"""
        self.items.all().delete()

    class Meta:
        verbose_name = "Cart"
        verbose_name_plural = "Carts"
        ordering = ["-updated_at"]


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, related_name="cart_items", on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart}"

    def get_subtotal(self):
        """Calculate the subtotal for this item"""
        return self.product.price * self.quantity

    class Meta:
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        ordering = ["-updated_at"]
        unique_together = ["cart", "product"]


@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    """Create a cart for new users"""
    if created:
        Cart.objects.create(user=instance)


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="favorites"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "product"]

    def __str__(self):
        return f"{self.user.username}'s favorite: {self.product.name}"


class PrivacyPolicy(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Privacy Policies"


class FAQ(models.Model):
    CATEGORY_CHOICES = (
        ('All', 'All'),
        ('Services', 'Services'),
        ('General', 'General'),
        ('Account', 'Account')
    )
    
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question

    class Meta:
        verbose_name_plural = "FAQs"
        ordering = ['-created_at']


class Contact(models.Model):
    CONTACT_TYPES = [
        ('customer_service', 'Customer Service'),
        ('whatsapp', 'WhatsApp'),
        ('website', 'Website'),
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('twitter', 'Twitter'),
    ]

    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES)
    title = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['contact_type']

    def __str__(self):
        return f"{self.get_contact_type_display()} - {self.title}"


class Slider(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='sliders/', blank=True, null=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, help_text="Category to show when clicking the 'Show Now' button")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

    @property
    def image_url(self):
        if self.image:
            return f"/media/{self.image.name}"
        return None


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=10,
        choices=[
            ('percentage', 'Percentage'),
            ('fixed', 'Fixed Amount')
        ],
        default='percentage'
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '$'}"

    class Meta:
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"
        ordering = ['-created_at']

    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

    def calculate_discount(self, total_amount):
        if not self.is_valid() or total_amount < self.min_purchase:
            return 0

        if self.discount_type == 'percentage':
            discount = (total_amount * self.discount_value) / 100
            if self.max_discount:
                discount = min(discount, self.max_discount)
            return discount
        else:
            return self.discount_value


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_placed', 'Order Placed'),
        ('order_shipped', 'Order Shipped'),
        ('order_delivered', 'Order Delivered'),
        ('order_cancelled', 'Order Cancelled'),
        ('coupon', 'Coupon'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.user.username}"


@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    """Create notifications when orders are created or updated"""
    if created:
        # Create notification for new order
        Notification.objects.create(
            user=instance.user,
            type='order_placed',
            message=f'Your order #{instance.id} has been placed successfully',
            order=instance
        )
    else:
        # Create notifications for order status changes
        if instance.status == 'Shipped':
            Notification.objects.create(
                user=instance.user,
                type='order_shipped',
                message=f'Your order #{instance.id} has been shipped',
                order=instance
            )
        elif instance.status == 'Delivered':
            Notification.objects.create(
                user=instance.user,
                type='order_delivered',
                message=f'Your order #{instance.id} has been delivered',
                order=instance
            )
        elif instance.status == 'Cancelled':
            Notification.objects.create(
                user=instance.user,
                type='order_cancelled',
                message=f'Your order #{instance.id} has been cancelled',
                order=instance
            )


@receiver(post_save, sender=Coupon)
def create_coupon_notification(sender, instance, created, **kwargs):
    """Create notifications when new coupons are created"""
    if created and instance.is_active:
        # Get all active users
        users = User.objects.filter(is_active=True)
        # Create notifications for all users
        for user in users:
            Notification.objects.create(
                user=user,
                type='coupon',
                message=f'New coupon code {instance.code} available! Get {instance.discount_value}{"%" if instance.discount_type == "percentage" else "$"} off',
                coupon=instance
            )
