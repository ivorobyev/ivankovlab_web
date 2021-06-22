from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import psycopg2
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.shortcuts import render, get_object_or_404, get_list_or_404, redirect
from mysql.connector import connect, Error
import hashlib

def connect_db():
    return psycopg2.connect("dbname='datasets_db' user='d_user' host='89.223.29.224' port = 5432 password='w~%_bS5v]%B6%U8#'")

def d_index(request):    
    return render(request, "datasets.html",{})

def ds_index(request):    
    return render(request, "dataset.html",{})

def p_index(request):
    return render(request, "predictors.html", {})

@csrf_exempt
def get_mutations(request):
    CONFIG={'host':'89.223.29.224', 
            'port': 3306, 
            'user':'d_user', 
            'password':'w~%_bS5v]%B6%U8#',
            'database':'datasets_db'}

    try:
        with connect(host=CONFIG['host'],user=CONFIG['user'],password=CONFIG['password'], database=CONFIG['database']) as connection:
            mut_query='''SELECT short_protein_name, seq, uniprot_id, 
                                  pdb_list, mutation, tmdbid, variation, 
                                  temp, ph, method, conditions, m.doi, 
                                  dpm.predictors, GROUP_CONCAT(DISTINCT d.dataset_name SEPARATOR ';') AS datasets 
                           FROM mutations_datasets md 
                           INNER JOIN mutations m ON md.record_id = m.record_id  
                           INNER JOIN proteins p ON m.protein_id = p.protein_id 
                           INNER JOIN datasets d ON md.dataset_id = d.dataset_id
                           INNER JOIN (SELECT dataset_id, 
                                              GROUP_CONCAT(DISTINCT pr.predictor_name SEPARATOR ';') AS predictors 
                                       FROM datasets_predictors dp
                                       INNER JOIN predictors pr ON dp.predictor_id = pr.predictor_id 
                                       GROUP BY dataset_id)dpm
                           ON md.dataset_id  = dpm.dataset_id
                           GROUP BY short_protein_name, seq, uniprot_id, 
                                    pdb_list, mutation, tmdbid, 
                                    variation, temp, ph, 
                                    method, conditions, doi, dpm.predictors'''
            with connection.cursor() as crsr:
                muts=[]
                crsr.execute(mut_query)
                for row in crsr.fetchall():
                    muts.append(row)
                connection.commit()
    except Error as e:
        connection.close()
        print(e)

    return JsonResponse(muts, safe=False)

@csrf_exempt
def get_predictor_data(request):
    chs=request.POST.get('choice')
    CONFIG={'host':'89.223.29.224', 
            'port': 3306, 
            'user':'d_user', 
            'password':'w~%_bS5v]%B6%U8#',
            'database':'datasets_db'}

    try:
        with connect(host=CONFIG['host'], user=CONFIG['user'], password=CONFIG['password'], database=CONFIG['database']) as connection:
            mut_query='''
                        SELECT DISTINCT p.predictor_name,
                            p.doi,
                            GROUP_CONCAT(DISTINCT d.dataset_name SEPARATOR ';') AS datasets 
                        FROM datasets_predictors dp
                        LEFT JOIN datasets d ON dp.dataset_id  = d.dataset_id 
                        LEFT JOIN predictors p ON dp.predictor_id = p.predictor_id 
                        WHERE p.predictor_name LIKE '%'''+chs+'''%'
                        GROUP BY p.predictor_name, p.doi 
                       '''
            with connection.cursor() as crsr:
                muts=[]
                crsr.execute(mut_query)
                for row in crsr.fetchall():
                    muts.append(row)
                connection.commit()
    except Error as e:
        connection.close()
        print(e)

    return JsonResponse(muts, safe = False)

@csrf_exempt
def get_dataset(request):
    chs=request.POST.get('choice')
    CONFIG={'host':'89.223.29.224', 
            'port': 3306, 
            'user':'d_user', 
            'password':'w~%_bS5v]%B6%U8#',
            'database':'datasets_db'}

    try:
        with connect(host=CONFIG['host'],user=CONFIG['user'],password=CONFIG['password'], database=CONFIG['database']) as connection:
            mut_query='''SELECT DISTINCT short_protein_name, seq, uniprot_id, 
                            pdb_list, mutation, tmdbid, variation, 
                            temp, ph, method, conditions
                        FROM mutations_datasets md 
                        INNER JOIN mutations m ON md.record_id = m.record_id  
                        INNER JOIN proteins p ON m.protein_id = p.protein_id 
                        INNER JOIN datasets d ON md.dataset_id = d.dataset_id
                        WHERE d.dataset_name LIKE '%'''+chs+'''%' '''
            with connection.cursor() as crsr:
                muts=[]
                crsr.execute(mut_query)
                for row in crsr.fetchall():
                    muts.append(row)
                connection.commit()
    except Error as e:
        connection.close()
        print(e)

    return JsonResponse(muts, safe=False)



