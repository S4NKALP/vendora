The Backend has been made, on the django, with the following api urls 
While it consists of all the get, put, post, and delete.. 
#1 Categories 
/api/categories ( note it also has id filteration with categories/id( as integer)) 
`sample:


[
    {
        "id": 1,
        "name": "Jackets",
        "image": "http://127.0.0.1:9000/categories/cowsorus_SDhrdcM.png",
        "created_at": "2025-04-17T13:22:25.166148Z"
    }
]
`
if you need all the product within the list same category api/categories/id/products/

#2 products 
api/products 
/products/{id}/rate/` - Rate a product (authenticated users)

[
    {
        "id": 1,
        "name": "White Jacket",
        "description": "White Jacket",
        "price": "1400.00",
        "image": "http://127.0.0.1:9000/products/cowsorus_2Aa9x4P.png",
        "category": 1,
        "stock": 400,
        "color": "White",
        "size": "L",
        "category_name": "Jackets",
        "average_rating": 0,
        "created_at": "2025-04-17T13:24:08.869744Z"
    }
]
api/ratings (for both post and get)

[
    {
        "id": 1,
        "product": 1,
        "user": 2,
        "username": "nurpratap",
        "rating": 4,
        "comment": "This is good tho",
        "created_at": "2025-04-17T13:53:36.055166Z"
    }
]
api/orders
/orders/{id}/` - Retrieve, update and delete an order
[
    {
        "id": 1,
        "user": 2,
        "user_name": "Nur Pratap Karki",
        "total_price": "16800.00",
        "status": "Pending",
        "shipping_address": "Kohalpur",
        "created_at": "2025-04-17T13:24:40.322127Z",
        "order_items": [
            {
                "id": 1,
                "product": 1,
                "product_name": "White Jacket",
                "product_image": "http://127.0.0.1:9000/products/cowsorus_2Aa9x4P.png",
                "quantity": 12,
                "price": "1400.00",
                "subtotal": 16800.0
            }
        ]
    }
]
### Cart (Shopping Cart)
- `GET api/cart/items/` - View items in cart
- `POST api/cart/add_item/` - Add an item to the cart
- `POST api/cart/remove_item/` - Remove an item from the cart
- `POST api/cart/checkout/` - Complete the order with shipping details

### Authentication
- `api/auth/login/` - Login and obtain session auth
- `api/auth/logout/` - Logout

api/users/( signup )
api/users/id/( to get, update and delete the user )
sample :

[
    {
        "id": 1,
        "username": "admin",
        "first_name": "admin",
        "last_name": "admin",
        "email": "admin@admin.com",
        "phone": null,
        "address": "",
        "created_at": "2025-04-17T13:18:35.496122Z"
    },
    {
        "id": 2,
        "username": "nurpratap",
        "first_name": "Nur Pratap",
        "last_name": "Karki",
        "email": "nurpratap@gmail.com",
        "phone": null,
        "address": "",
        "created_at": "2025-04-17T13:19:53.037348Z"
    }
]

    ## Cart API

    The cart system uses a model-based approach with one-to-one relationship between User and Cart, and one-to-many relationship between Cart and Product through CartItem.

    ### Endpoints

    #### Get Cart Items
    ```
    GET /api/cart/items/
    ```
    Returns all items in the authenticated user's cart.

    Response:
    ```json
    {
        "id": 1,
        "user": 1,
        "items": [
            {
                "id": 1,
                "product": 1,
                "product_name": "Product Name",
                "product_price": "10.00",
                "quantity": 2,
                "subtotal": "20.00",
                "created_at": "2024-04-23T12:00:00Z",
                "updated_at": "2024-04-23T12:00:00Z"
            }
        ],
        "total": "20.00",
        "created_at": "2024-04-23T12:00:00Z",
        "updated_at": "2024-04-23T12:00:00Z"
    }
    ```

    #### Add Item to Cart
    ```
    POST /api/cart/add_item/
    ```
    Adds a product to the cart.

    Request:
    ```json
    {
        "product_id": 1,
        "quantity": 2
    }
    ```

    Response:
    ```json
    {
        "id": 1,
        "product": 1,
        "product_name": "Product Name",
        "product_price": "10.00",
        "quantity": 2,
        "subtotal": "20.00",
        "created_at": "2024-04-23T12:00:00Z",
        "updated_at": "2024-04-23T12:00:00Z"
    }
    ```

    #### Remove Item from Cart
    ```
    POST /api/cart/remove_item/
    ```
    Removes a product from the cart.

    Request:
    ```json
    {
        "product_id": 1
    }
    ```

    Response:
    ```json
    {
        "message": "Item removed from cart"
    }
    ```

    #### Update Item Quantity
    ```
    POST /api/cart/update_quantity/
    ```
    Updates the quantity of a product in the cart.

    Request:
    ```json
    {
        "product_id": 1,
        "quantity": 3
    }
    ```

    Response:
    ```json
    {
        "id": 1,
        "product": 1,
        "product_name": "Product Name",
        "product_price": "10.00",
        "quantity": 3,
        "subtotal": "30.00",
        "created_at": "2024-04-23T12:00:00Z",
        "updated_at": "2024-04-23T12:00:00Z"
    }
    ```

    #### Clear Cart
    ```
    POST /api/cart/clear/
    ```
    Removes all items from the cart.

    Response:
    ```json
    {
        "message": "Cart cleared"
    }
    ```

    #### Checkout
    ```
    POST /api/cart/checkout/
    ```
    Converts the cart to an order.

    Response:
    ```json
    {
        "message": "Order created successfully",
        "order_id": 1
    }
    ```

    #### Delete Cart
    ```
    DELETE /api/cart/delete/
    ```
    Deletes the entire cart and all its items.

    Response:
    ```json
    {
        "message": "Cart deleted"
    }
    ```

    #### Merge Carts
    ```
    POST /api/cart/merge/
    ```
    Merges another cart into the current cart. Useful when a user has multiple carts (e.g., from different devices).

    Request:
    ```json
    {
        "cart_id": 2
    }
    ```

    Response:
    ```json
    {
        "message": "Carts merged successfully"
    }
    ```

    ### Authentication
    All cart endpoints require authentication. Users must be logged in to access their cart.

    ### Additional Features

    #### Stock Management
    - The cart system automatically checks product stock availability when:
    - Adding items to cart
    - Updating item quantities
    - Checking out
    - If there's insufficient stock, the operation will fail with a 400 Bad Request error

    #### Transaction Safety
    - Cart operations that modify multiple records (like checkout and merge) use database transactions
    - This ensures data consistency even if an error occurs during the operation

    #### Error Responses
    - 400 Bad Request: Invalid input data or insufficient stock
    - 401 Unauthorized: User not authenticated
    - 403 Forbidden: Attempting to merge carts from different users
    - 404 Not Found: Product, cart, or cart item not found 