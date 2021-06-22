from django.urls import path
from django.conf.urls import url
from datasets_db import views

urlpatterns = [
    path(r'', views.d_index, name='datasets_welcome'),
    path('get_mutations/', views.get_mutations, name='get_mutations'),
    path('predictor/', views.p_index, name='predictor_page'),
    path('predictor/get_predictor_data/', views.get_predictor_data, name='get_predictor_data'),
    path('dataset/', views.ds_index, name='dataset_page'),
    path('dataset/get_dataset/', views.get_dataset, name='get_dataset')
]