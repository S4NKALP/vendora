"""
URL configuration for shoppingApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from shoppingApp.settings import MEDIA_ROOT, MEDIA_URL
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('app.urls')), 
    # path('', admin.site.urls),
] 

urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
urlpatterns.append(path('', admin.site.urls, name='admin'))