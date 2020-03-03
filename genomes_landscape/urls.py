from django.urls import path
from django.conf.urls import url
from genomes_landscape import views

urlpatterns = [
    path(r'', views.g_index, name='genomes_landscape'),
    path('exp_list/', views.get_experiments, name='get_experiments_list'),
    path('fit_distribution/', views.get_fitness_distribution, name='get_fitness_distribution'),
    path('get_experiment_landscape/', views.get_experiment_landscape, name='get__experiment_landscape'),
    path('single_mutants_fitness/', views.single_mutants_fitness, name='single_mutants_fitness'),
    path('max_fitness/', views.max_fitness, name='max_fitness'),
    path('average_fitness/', views.average_fitness, name='average_fitness'),
    path('get_mutation_distribution/', views.get_mutation_distribution, name='get_mutation_distribution'),
    path('get_experiment_summary/', views.get_experiment_summary, name='get_experiment_summary'),
    path('mutations_violin/', views.mutations_violin, name='mutations_violin'),
    path('download_dataset/', views.download_dataset, name='download_dataset'),
]