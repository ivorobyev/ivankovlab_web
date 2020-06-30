from django.urls import path
from django.conf.urls import url
from genomes_landscape import views

urlpatterns = [
    path('landscapes_list', views.g_index, name='genomes_landscape'),
    path(r'', views.g_welcome, name='genomes_landscape_welcome'),
    path('inner/', views.g_inner, name='genomes_landscape_inner'),
    path('exp_list/', views.get_experiments, name='get_experiments_list'),
    path('inner/fit_distribution/', views.get_fitness_distribution, name='get_fitness_distribution'),
    path('inner/get_experiment_landscape/', views.get_experiment_landscape, name='get__experiment_landscape'),
    path('inner/single_mutants_fitness/', views.single_mutants_fitness, name='single_mutants_fitness'),
    path('inner/max_fitness/', views.max_fitness, name='max_fitness'),
    path('inner/average_fitness/', views.average_fitness, name='average_fitness'),
    path('inner/get_mutation_distribution/', views.get_mutation_distribution, name='get_mutation_distribution'),
    path('inner/get_experiment_summary/', views.get_experiment_summary, name='get_experiment_summary'),
    path('inner/mutations_violin/', views.mutations_violin, name='mutations_violin'),
    path('inner/download_dataset/', views.download_dataset, name='download_dataset'),
]