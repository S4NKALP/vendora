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