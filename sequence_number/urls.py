from django.urls import path
from django.conf.urls import url
from sequence_number import views

urlpatterns = [
    path(r'', views.s_index, name='s_index'),
    path('calc/', views.calculate, name='calculate')
]