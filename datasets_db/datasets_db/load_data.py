from mysql.connector import connect, Error
import pandas as pd
import hashlib

CONFIG = {'host':'89.223.29.224', 
          'port': 3306, 
          'user':'d_user', 
          'password':'w~%_bS5v]%B6%U8#',
          'database':'datasets_db'}

def make_insert_query_prots(data):
    insert_query  = """
                INSERT IGNORE INTO proteins (protein_id, short_protein_name, seq,
                                      uniprot_id, pdb_list, mutation)
                VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}');
                """.format(data[0], data[1], data[2], data[3], data[4], data[5])

    return insert_query

def make_insert_query_mut(data):
    insert_query  = """
                INSERT IGNORE INTO mutations (record_id, tmdbid, variation, temp, ph, method,
                                      conditions, doi, protein_id)
                VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}');
                """.format(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8])

    return insert_query

def make_insert_query_datasets(data):
    insert_query = """
                INSERT IGNORE INTO datasets (dataset_id, dataset_name)
                VALUES ('{0}', '{1}');
                """.format(data[0], data[1])

    return insert_query

def make_insert_query_datasets_mut(data):
    insert_query = """
                INSERT IGNORE INTO mutations_datasets (m_d_id, record_id, dataset_id)
                VALUES ('{0}', '{1}', '{2}');
                """.format(data[0], data[1], data[2])

    return insert_query

def make_insert_query_predictors(data):
    insert_query = """
                INSERT IGNORE INTO predictors (predictor_id, predictor_name, doi)
                VALUES ('{0}', '{1}', '{2}');
                """.format(data[0], data[1], data[2])

    return insert_query

def make_insert_query_predictors_datasets(data):
    insert_query = """
                INSERT IGNORE INTO datasets_predictors (d_p_id,  dataset_id, predictor_id)
                VALUES ('{0}', '{1}', '{2}');
                """.format(data[0], data[1], data[2])

    return insert_query

mutations_df = pd.read_csv('mutations (GENERATED VIEW).csv', sep =',')
predictors_df = pd.read_csv('predictors.csv')

mutations = []
proteins = []
datasets = []
dataset_mut = []
predictors = []
predictors_ds = []
for i, row in mutations_df.iterrows():
    prot_id = hashlib.md5(row.sequence.encode('utf-8')).hexdigest()
    proteins.append([prot_id, row.protein_name, row.sequence, row.uniprot, row.pdb_list, row.mutant])

    mut_id= row.variation + str(row.conditions) + row.doi + row.sequence
    mut_id = hashlib.md5(mut_id.encode('utf-8')).hexdigest()
    mutations.append([mut_id, row.TMDBid, row.variation, row.T, row.pH, row.method, row.conditions, row.doi, prot_id])
    print(row.T[0])
    for dt in row.datasets.split(','):
        dt = dt.strip()
        dt_id = hashlib.md5(dt.encode('utf-8')).hexdigest()
        datasets.append([dt_id, dt])
        dt_mut_id = dt_id + mut_id
        dt_mut_id = hashlib.md5(dt_mut_id.encode('utf-8')).hexdigest()
        dataset_mut.append([dt_mut_id, mut_id, dt_id])
        for pr in row.predictors.split(','):
            pr = pr.strip()
            pr_id = hashlib.md5(pr.encode('utf-8')).hexdigest()
            pr_doi = predictors_df['doi'].loc[predictors_df.predictor==pr].values[0]
            predictors.append([pr_id, pr, pr_doi])
            d_p_id = dt_id+pr_id
            d_p_id = hashlib.md5(d_p_id.encode('utf-8')).hexdigest()
            predictors_ds.append([d_p_id, dt_id, pr_id])
try: 
    with connect(host=CONFIG['host'],user=CONFIG['user'],password=CONFIG['password'],database=CONFIG['database']) as connection:
        with connection.cursor() as crsr:
            for a in zip(proteins, mutations):
                crsr.execute(make_insert_query_prots(a[0]))
                crsr.execute(make_insert_query_mut(a[1]))
            for a in datasets:
                crsr.execute(make_insert_query_datasets(a))
            for a in dataset_mut:
                crsr.execute(make_insert_query_datasets_mut(a))
            for a in predictors:
                crsr.execute(make_insert_query_predictors(a))
            for a in predictors_ds:
                crsr.execute(make_insert_query_predictors_datasets(a))
            connection.commit()
            print(mutations) 

except Error as e:
    connection.close()
    print(e)

finally:
    connection.close()