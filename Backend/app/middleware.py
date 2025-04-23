class AnonymousCartMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Initialize cart for anonymous users
        if not request.user.is_authenticated and 'cart' not in request.session:
            request.session['cart'] = {}
        
        response = self.get_response(request)
        return response