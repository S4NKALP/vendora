<div align="center">
  <h1>Vendora</h1>
  <p>A modern e-commerce platform built with React Native and Django REST Framework</p>
<figure>
  <img src= "assets/img.png" alt="keycodex Demo" width="100px" height="100px">
  <br/>
  <figcaption>vendora</figcaption>
</figure>
</div>

## Project Overview

This full-stack e-commerce application offers:

- Product browsing by categories
- User authentication and account management
- Shopping cart functionality
- Order processing
- Product ratings and reviews
- Responsive design for mobile and web

## Tech Stack

### Frontend

- React Native (Expo)
- TypeScript
- TailwindCSS/NativeWind for styling
- React Navigation for routing
- Axios for API calls

### Backend

- Django
- Django REST Framework
- SQLite (development)
- JWT Authentication

## Project Structure

The project is organized into two main directories:

- `/frontend` - React Native Expo application
- `/backend` - Django REST API

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Run migrations:

   ```
   python manage.py migrate
   ```

4. Start the server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. Follow the Expo instructions to run on your device or emulator

## Features

- Product catalog with categories
- User registration and authentication
- Shopping cart management
- Order processing and history
- Product search and filtering
- Product ratings and reviews

## API Endpoints

Detailed API documentation can be found in the respective README files within the frontend and backend directories.
