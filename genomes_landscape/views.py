from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import psycopg2
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict

def g_index(request):    
    return render(request, "gl.html",{})

def g_inner(request):    
    return render(request, "gl_inner.html",{})

def connect_db():
    return psycopg2.connect("dbname='experiments' user='postgreadmin' host='89.223.29.224' port = 5432 password='iliamilton355113'")

@csrf_exempt
def get_experiments(resp):
    conn = connect_db()

    cursor = conn.cursor()
    cursor.execute('''
                   SELECT exp_id, 
                          exp_name, 
                          parent_name,
                          title,
                          paper,
                          year,
                          journal,
                          volume,
                          pages,
                          doi,
                          pmid,
                          name,
                          full_name,
                          tax_id,
                          organism                
                   FROM experiments ORDER BY parent_name, exp_name
                   ''')

    exps = cursor.fetchall()
    exps_dict  = defaultdict(list)
    for ex in exps:
        exps_dict[ex[2]].append((ex[0], ex[1], ex[3], 
                                 ex[4], ex[5], ex[6], 
                                 ex[7], ex[8], ex[9], 
                                 ex[10], ex[11], ex[12], ex[13], ex[14]))

    cursor.close()
    conn.close()
    return JsonResponse(exps_dict, safe = False)

@csrf_exempt
def get_fitness_distribution(request):
    exp_id = request.POST.get('choice')

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select fitness,
						   cont_fitness,
                           phenotype_wt
                    from fitness_distribution
                    where exp_id_ = '''+exp_id+'''
                    order by fitness
                    ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def get_experiment_landscape(request):
    exp_id = request.POST.get('choice')

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    with points as (
                        select pos,
                               fit
                        from (
                            select generate_series(min(pos::numeric), max(pos::numeric)) as pos
                            from (
                            select distinct substring(unnest(string_to_array(genotype, ':')) from '[0-9]+') as pos
                            from genotypes
                            where exp_id = '''+exp_id+'''
                            ) as positions
                        ) as all_pos
                        cross join ( 
                            select DISTINCT round(phenotype::numeric, 1) as fit
                            from genotypes
                            where exp_id = '''+exp_id+'''
                        ) as all_fit
                    )
                    select points.pos,
                        fit,
                        cont_fitness
                    from points
                    left join (
                        SELECT * FROM landscapes WHERE exp_id = '''+exp_id+'''
                    ) AS landscapes
                    on points.pos = landscapes.pos and points.fit = landscapes.fitness
                    ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def single_mutants_fitness(request):
    exp_id = request.POST.get('choice')
    fitness = request.POST.get('fitness')
    fitness_query = "" if fitness is None else "and round(phenotype::numeric, 1) = {0}".format(fitness)
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                        with all_letters as (
                        select distinct substring(unnest(string_to_array(genotype, ':')) from '[0-9]+')::numeric as pos,
                            letter
                        from genotypes
                        cross join (
                            select unnest(array['A','R','N','D','C','E','Q','G','H','I','L','K','M','F','P','S','T','W','Y','V']) as letter
                        ) as lt
                        where exp_id = '''+exp_id+''' and array_length(string_to_array(genotype, ':'), 1) = 1
                        order by pos
                        )
                        select pos,
                            all_letters.letter,
                            avg_phenotype,
                            (select phenotype  from experiments where exp_id = '''+exp_id+''') 
                        from all_letters 
                        left join (
                            select substring(unnest(string_to_array(genotype, ':')) from '[0-9]+')::numeric as mutation,
                                                        right(unnest(string_to_array(genotype, ':')),1) as letter,
                                                        avg(phenotype) as avg_phenotype
                            from genotypes
                            where exp_id = '''+exp_id+'''
                            and array_length(string_to_array(genotype, ':'), 1) = 1
                            {0}
                            group by mutation, letter
                        ) as hm
                        on all_letters.pos = hm.mutation and all_letters.letter = hm.letter
                        ORDER BY pos
                    '''.format(fitness_query))

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def max_fitness(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                        select substring(unnest(string_to_array(genotype, ':')) from '[0-9]+')::numeric as mutation, 
                               right(unnest(string_to_array(genotype, ':')),1) as letter,
                               max(phenotype) as max_phenotype
                        from genotypes
                        where exp_id = '''+exp_id+'''
                        group by mutation, letter
                        order by mutation
                    ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def download_dataset(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select genotype,
                           phenotype
                    from genotypes
                    where exp_id = '''+exp_id+'''
                    order by substring((string_to_array(genotype, ':'))[1] from '[0-9]+')::numeric,
                            right((string_to_array(genotype, ':'))[1],1)
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def average_fitness(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                        select substring(unnest(string_to_array(genotype, ':')) from '[0-9]+')::numeric as mutation, 
                               right(unnest(string_to_array(genotype, ':')),1) as letter,
                               avg(phenotype) as avg_phenotype
                        from genotypes
                        where exp_id = '''+exp_id+'''
                        group by mutation, letter
                        order by mutation
                    ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def get_mutation_distribution(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select mutations_count,
                           number_of_mutations
                    from mutation_distribution
                    where exp_id = '''+exp_id+'''
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def get_experiment_summary(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                        select genotype,
                            len,
                            phenotype,
                            phenotype_name,
                            paper,
                            pss,
                            pdb,
                            full_name,
                            tax_id,
                            year,
                            title,
                            uniprot
                        from experiments_summary
                        where exp_id_ = '''+exp_id+'''
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

@csrf_exempt
def mutations_violin(request):
    exp_id = request.POST.get('choice')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('''
                    select DISTINCT array_length(string_to_array(genotype, ':'), 1) as len,
                        phenotype
                    from genotypes
                    where exp_id = '''+exp_id+'''
                        ''')

    exps = cursor.fetchall()
    cursor.close()
    conn.close()
    return JsonResponse(exps, safe = False)

