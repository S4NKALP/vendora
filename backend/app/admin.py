from django.contrib import admin
from .models import User, Category, Product, Rating, Order, OrderItem, Cart, CartItem, PrivacyPolicy, FAQ, Contact, Slider, Coupon
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "gender",
        "is_staff",
        "created_at",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    list_filter = ("is_staff", "is_active", "created_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Personal Info",
            {
                "fields": (
                    "username",
                    "first_name",
                    "last_name",
                    "gender",
                    "email",
                    "password",
                )
            },
        ),
        ("Customer Details", {"fields": ("phone", "address")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Dates", {"fields": ("created_at", "updated_at", "last_login")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "phone",
                    "address",
                    "gender",
                ),
            },
        ),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "updated_at")


class RatingInline(admin.TabularInline):
    model = Rating
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "color",
        "size",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "description")
    list_filter = ("category", "created_at")
    readonly_fields = ("created_at", "updated_at")
    inlines = [RatingInline]


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "rating", "created_at")
    search_fields = ("user__username", "product__name", "comment")
    list_filter = ("rating", "created_at")
    readonly_fields = ("created_at", "updated_at")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("get_subtotal",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_price", "status", "created_at")
    search_fields = ("user__username", "shipping_address")
    list_filter = ("status", "created_at")
    readonly_fields = ("created_at", "updated_at", "total_price")
    inlines = [OrderItemInline]
    list_editable = ("status",)


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price", "get_subtotal")
    list_filter = ("order__status",)
    search_fields = ("order__id", "product__name")
    readonly_fields = ("get_subtotal",)

    def get_subtotal(self, obj):
        return obj.get_subtotal()

    get_subtotal.short_description = "Subtotal"


admin.site.register(OrderItem, OrderItemAdmin)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "get_total", "created_at", "updated_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["user__username", "user__email"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [CartItemInline]

    def get_total(self, obj):
        return obj.get_total()

    get_total.short_description = "Total"

    def get_subtotal(self, obj):
        return obj.get_subtotal()

    get_subtotal.short_description = "Subtotal"


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ('title', 'last_updated', 'is_active')
    list_filter = ('is_active', 'last_updated')
    search_fields = ('title', 'content')
    readonly_fields = ('last_updated',)
    fieldsets = (
        ('Policy Information', {
            'fields': ('title', 'content', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        }),
    )


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('question', 'answer')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('FAQ Information', {
            'fields': ('question', 'answer', 'category', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('contact_type', 'title', 'value', 'is_active', 'created_at')
    list_filter = ('contact_type', 'is_active', 'created_at')
    search_fields = ('title', 'value')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Contact Information', {
            'fields': ('contact_type', 'title', 'value', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'category')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Slider Information', {
            'fields': ('title', 'description', 'image', 'category', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'min_purchase', 'is_active', 'start_date', 'end_date')
    list_filter = ('is_active', 'discount_type')
    search_fields = ('code',)
    ordering = ('-created_at',)
