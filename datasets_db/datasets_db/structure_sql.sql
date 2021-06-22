CREATE TABLE Proteins
(
  protein_id VARCHAR NOT NULL,
  short_protein_name VARCHAR NOT NULL,
  sequence VARCHAR NOT NULL,
  uniprot_id VARCHAR NOT NULL,
  pdb_list VARCHAR NOT NULL,
  mutation VARCHAR NOT NULL,
  region VARCHAR NOT NULL,
  PRIMARY KEY (protein_id)
);

CREATE TABLE publications
(
  doi VARCHAR NOT NULL,
  publication_name VARCHAR NOT NULL,
  PRIMARY KEY (doi)
);

CREATE TABLE _Mutations
(
  record_id VARCHAR NOT NULL,
  variation VARCHAR NOT NULL,
  conditions VARCHAR NOT NULL,
  protein_id VARCHAR NOT NULL,
  doi VARCHAR NOT NULL,
  PRIMARY KEY (record_id),
  FOREIGN KEY (protein_id) REFERENCES Proteins(protein_id),
  FOREIGN KEY (doi) REFERENCES publications(doi)
);

CREATE TABLE Datasets
(
  dataset_id VARCHAR NOT NULL,
  dataset_name VARCHAR NOT NULL,
  declared_size VARCHAR NOT NULL,
  doi VARCHAR NOT NULL,
  PRIMARY KEY (dataset_id),
  FOREIGN KEY (doi) REFERENCES publications(doi)
);

CREATE TABLE predictors
(
  Predictor_id VARCHAR NOT NULL,
  Predictor_name VARCHAR NOT NULL,
  doi VARCHAR NOT NULL,
  PRIMARY KEY (Predictor_id),
  FOREIGN KEY (doi) REFERENCES publications(doi)
);

CREATE TABLE mutations_datasets
(
  count INT NOT NULL,
  record_id VARCHAR NOT NULL,
  dataset_id VARCHAR NOT NULL,
  FOREIGN KEY (record_id) REFERENCES _Mutations(record_id),
  FOREIGN KEY (dataset_id) REFERENCES Datasets(dataset_id)
);

CREATE TABLE Datasets_predictors
(
  using_type VARCHAR NOT NULL,
  dataset_id VARCHAR NOT NULL,
  Predictor_id VARCHAR NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES Datasets(dataset_id),
  FOREIGN KEY (Predictor_id) REFERENCES predictors(Predictor_id)
);
