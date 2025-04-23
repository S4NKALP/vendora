from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admin can do anything
        if request.user.is_staff:
            return True
            
        # Instance must have an attribute named `user`.
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        # If object is a User, check if it's the current user
        if hasattr(obj, 'username'):
            return obj == request.user
            
        return False