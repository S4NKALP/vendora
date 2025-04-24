from rest_framework import serializers
from .models import (
    User,
    Category,
    Product,
    Rating,
    Order,
    OrderItem,
    CartItem,
    Cart,
    Favorite,
    PrivacyPolicy,
    FAQ,
    Contact,
    Slider,
    Coupon,
    Notification
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "gender",
            "email",
            "password",
            "phone",
            "address",
            "profile_picture",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            'gender': {'required': False},
            'phone': {'required': False},
            'address': {'required': False},
        }

    def create(self, validated_data):
        # Use the create_user method instead of direct creation
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            address=validated_data.get("address", ""),
            gender=validated_data.get("gender", ""),
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "image", "created_at"]
        read_only_fields = ["id", "created_at"]


class RatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Rating
        fields = [
            "id",
            "product",
            "user",
            "username",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "username"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")
    average_rating = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image",
            "image_url",
            "category",
            "stock",
            "color",
            "size",
            "category_name",
            "average_rating",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category_name", "average_rating", "image_url"]

    def get_average_rating(self, obj):
        try:
            return float(obj.average_rating) if obj.average_rating is not None else 0.0
        except (TypeError, AttributeError):
            return 0.0

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductDetailSerializer(ProductSerializer):
    ratings = RatingSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ["ratings"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    product_image = serializers.ImageField(source="product.image", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "quantity",
            "price",
            "subtotal",
        ]
        read_only_fields = ["id", "product_name", "product_image", "subtotal"]

    def get_subtotal(self, obj):
        return obj.get_subtotal()


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["product", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.get_full_name")
    order_items = OrderItemSerializer(many=True, read_only=True)
    items = OrderItemCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "user_name",
            "total_price",
            "status",
            "shipping_address",
            "created_at",
            "order_items",
            "items",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "user_name",
            "total_price",
            "order_items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = Order.objects.create(**validated_data)

        # Create order items if provided
        for item_data in items_data:
            product = item_data.get("product")
            quantity = item_data.get("quantity", 1)
            order.add_product(product, quantity)

        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

        # Update the order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Add new items if provided
        for item_data in items_data:
            product = item_data.get("product")
            quantity = item_data.get("quantity", 1)
            instance.add_product(product, quantity)

        return instance


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
            "subtotal",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_subtotal(self, obj):
        try:
            return float(obj.product.price * obj.quantity)
        except (AttributeError, TypeError):
            return 0.0

    def get_product_price(self, obj):
        try:
            return float(obj.product.price)
        except (AttributeError, TypeError):
            return 0.0

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get("request")
            if request is not None:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "total", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

    def get_total(self, obj):
        return obj.get_total()


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "product", "created_at"]
        read_only_fields = ["id", "created_at"]


class PrivacyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'title', 'content', 'last_updated']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'contact_type', 'title', 'value', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SliderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = ('id', 'title', 'description', 'image', 'image_url', 'category', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image_url)
        return None


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_purchase', 
                 'max_discount', 'is_active', 'start_date', 'end_date']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'message', 'read', 'created_at', 'order', 'coupon']
        read_only_fields = ['created_at']


