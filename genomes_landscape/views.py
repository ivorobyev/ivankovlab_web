from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import psycopg2
from django.views.decorators.csrf import csrf_exempt

def g_index(request):    
    return render(request, "gl.html",{})

def connect_db():
    return psycopg2.connect("dbname='experiments' user='postgreadmin' host='89.223.29.224' port = 5432 password='ivankovlabdb355113'")

@csrf_exempt
def get_experiments(resp):
    conn = connect_db()

    cursor = conn.cursor()
    cursor.execute('''
                    SELECT exp_id, exp_name FROM experiments
                    ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def get_fitness_distribution(request):
    exp_id = request.POST.get('choice')

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select round(phenotype::numeric, 1) as fitness,
                           count(*) as cont_fitness
                    from genotypes
                    where exp_id = '''+exp_id+'''
                    group by fitness
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def get__experiment_landscape(request):
    exp_id = request.POST.get('choice')

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select unnest(string_to_array(genotype, ':')) as mutation,
                           round(phenotype::numeric, 1) as fitness,
                           count(*) as cont_fitness
                    from genotypes
                    where exp_id = '''+exp_id+'''
                    group by mutation, fitness
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def download_dataset(request):
    exp_id = request.POST.get('exp_id')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select genotype,
                           phenotype,
                           error
                    from genotypes
                    where exp_id = '''+exp_id+'''
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)


