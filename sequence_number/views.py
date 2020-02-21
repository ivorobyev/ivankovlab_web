from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from itertools import product
import math
from Bio import SeqIO
from multiprocessing import Pool
from io import StringIO
import json

def s_index(request):
    return render(request, "sn.html",{})

def format(x): 
    if x > 99999:
        help_power = max(0, int(math.log10(x) - 7))
        small_x = x // (10 ** help_power)
        add_power = int(math.log10(x)) - help_power
        m = small_x / (10 ** add_power)
        power = math.log10(x)
        return f"{m}e{help_power + add_power}"
    else: 
        return str(x)

def get_codon_table(table_number):

    with open('sequence_number/static/translation_tables.txt', 'r') as f:
        s = f.read().partition('==== Table '+str(table_number)+' ====')[2].partition('=================')[0]

    codon_table = {}
    for a in s.split('\n'):
        codones_string = a.split(' ')
        codones_string = ' '.join(codones_string).split()
        for ch in range(len(codones_string)):
            if codones_string[ch].isupper() and (len(codones_string[ch]) == 3):
                if ch+3 in range(len(codones_string)):
                    if codones_string[ch+3] == 'i':
                        codon_table[codones_string[ch]] = (codones_string[ch+1], 
                                                           codones_string[ch+2], 
                                                           codones_string[ch+3])
                        ch += 2
                    else:
                        codon_table[codones_string[ch]] = (codones_string[ch+1], 
                                                           codones_string[ch+2])
                        ch += 1
                else:
                    codon_table[codones_string[ch]] = (codones_string[ch+1], 
                                                       codones_string[ch+2])
    return codon_table

def translate(seq, codon_table): 
    seq = seq.replace('U', 'T')
    protein = ''
    if len(seq)%3 == 0: 
        for i in range(0, len(seq), 3): 
            codon = seq[i:i + 3] 
            protein+= codon_table[codon][0]
    else:
        print('Number of nucleotides does not divide into three')
    return protein

def get_codon_variations(codon, codon_table):
    codon = codon.replace('U', 'T')
    
    codons_all = []
    for c in product('ACGT', repeat = 3):
        codons_all.append(''.join(c))
    
    variations_raw = []
    for ex in codons_all:
        diff = lambda l1,l2: len([x for ind, x in enumerate(l1) if l1[ind] != l2[ind]])
        variations_raw.append([ex,diff(codon, ex)])
       
    variations_sorted = sorted(variations_raw, key=lambda x:x[1])
    
    variations = []
    for var in variations_sorted:
        amino_acid_m = translate(var[0], codon_table) 
        if (amino_acid_m not in [i[0] for i in variations]):
            variations.append([amino_acid_m, var[1]])
    
    variations_count = {
        0 : [i[1] for i in variations].count(0),
        1 : [i[1] for i in variations].count(1),
        2 : [i[1] for i in variations].count(2),
        3 : [i[1] for i in variations].count(3)
    }
    return variations_count

def get_sequence_number(sequence, mutate_first_codon, max_nmut, codon_table):
    a = 0
    implement = {}
    implement[(0,0)] = 1
    mutations = 0
    current_codon = 1
    length = len(translate(sequence, codon_table))

    while a <= len(sequence)-3:
        max_mutations = 0 if current_codon == 1 and not mutate_first_codon else 3
        prev_mutations = mutations
        mutations = mutations + max_mutations if mutations < max_nmut else max_nmut
        current_codon_variations = get_codon_variations(sequence[a:a+3], codon_table)

        nmut = 0
        while nmut <= mutations:
            extra_m = 0
            implement[(nmut, current_codon)] = 0
            while extra_m <= max_mutations:
                prev_nmut = nmut - extra_m
                if (prev_nmut < 0) or (prev_nmut > prev_mutations):
                    extra_m += 1
                    continue
                implement[(nmut, current_codon)] += implement[(prev_nmut, current_codon - 1)] * current_codon_variations[extra_m]
                extra_m += 1
            nmut += 1

        current_codon += 1
        a += 3

    integral = 0
    integral_dict = {}
    nmut = 0
    while nmut <= mutations:
        integral += implement[(nmut, length)]
        integral_dict[(nmut, length)] = integral
        nmut += 1

    max_nmut = max(implement.keys())[0] if max_nmut >= max(implement.keys())[0] else max_nmut
    seq_table = list(map(lambda x: '{0} {1} {2} '.format(x, 
                                           format(implement[(x,length)]),
                                           format(integral_dict[(x,length)])), 
                                           [a for a in range(0,max_nmut+1)]))

    return ','.join(seq_table).replace(',', '')

def check_sequence(sequence, codon_table):
    symbols = 'ATGCU'
    for a in sequence:
        if a.upper() not in symbols:
            return 'ERROR: wrong sequence format'
    
    if len(sequence)%3 != 0:
        return 'ERROR: number of nucleotides doesn\'t divied into 3'

    if(len(sequence)) >= 5000:
        return 'ERROR: sequence too big max number is 5000'
    
    message = ''
    stop_codons_list = [key for key, value in codon_table.items() if value[0] == '*']
    existing_stop_codons = ''
    for codon in stop_codons_list:
        if codon in sequence:
            existing_stop_codons += codon +' '
    message = 'WARNING: sequence consists stop codons ' + existing_stop_codons if existing_stop_codons != '' else ''

    return message.strip()

def get_numbers(params):
    sequence, seq_name, codon_table, max_nmut, mutate_first_codon = params
    check = check_sequence(sequence, codon_table)
    if check.find('ERROR') == -1:
            res = (seq_name, get_sequence_number(sequence, 
                                                 mutate_first_codon, 
                                                 max_nmut, 
                                                 codon_table), check)
    else:
        res = (seq_name, 'none', check)
    
    return res

def calculate(request):
    file_ = request.FILES['seq'].read() if 'seq' in request.FILES.keys() else ''
    seq_row = request.POST.get('seq_text').upper()
    max_nmut = int(request.POST.get('max_mutations'))
    mutate_first_codon = int(request.POST.get('mutate'))
    codon_table = get_codon_table(request.POST.get('codon_table'))

    if file_ != '':
        records = {}
        for record in SeqIO.parse(StringIO(file_.decode('utf-8')), "fasta"):
            records[record.id] = str(record.seq).upper()

        pool = Pool(3)
        res = pool.map(get_numbers, 
                    [(records[a], a, codon_table, max_nmut, mutate_first_codon)  for a in records])
        pool.close()
        pool.join()
    elif seq_row[0] == '>':
        records = {}
        for record in SeqIO.parse(StringIO(seq_row), "fasta"):
            records[record.id] = str(record.seq).upper()

        pool = Pool(3)
        res = pool.map(get_numbers, 
                    [(records[a], a, codon_table, max_nmut, mutate_first_codon)  for a in records])
        pool.close()
        pool.join()
    else:
        res = [get_numbers((seq_row, 'sequence', codon_table, max_nmut, mutate_first_codon))]

    return JsonResponse(res, safe = False)