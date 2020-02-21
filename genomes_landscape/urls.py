from django.urls import path
from django.conf.urls import url
from genomes_landscape import views

urlpatterns = [
    path(r'', views.g_index, name='genomes_landscape'),
    path('exp_list/', views.get_experiments, name='get_experiments_list'),
    path('fit_distribution/', views.get_fitness_distribution, name='get_fitness_distribution'),
    path('get__experiment_landscape/', views.get__experiment_landscape, name='get__experiment_landscape'),
    path('download_dataset/', views.download_dataset, name='download_dataset'),
]