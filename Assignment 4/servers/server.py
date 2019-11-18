from flask import Blueprint
from flask import Flask, render_template, request
import json
import csv
from collections import OrderedDict
import pandas
import numpy as np
from sklearn.cluster import KMeans

api = Blueprint('api', __name__)

@api.route('/getCsv/<id>', methods=['GET'])
def getData(id):
    csvFile = ['data/iris.csv','data/winequality-red.csv','data/winequality-white.csv']
    data_df = pandas.read_csv(csvFile[int(id)])
    fieldnames = (data_df.columns)
    # print(tuple(fieldnames))
    dataFinal = {}
    data = []
    dataFinal['metadata'] = list(fieldnames)
    with open(csvFile[int(id)]) as csvF:
        csvReader = csv.DictReader(csvF, fieldnames)
        for rows in csvReader:
            entry = OrderedDict()
            for field in fieldnames:
                entry[field] = rows[field]
            data.append(entry)
    print(data[0])
    data = json.dumps(data[1:])
    dataFinal['data'] = data
    return (dataFinal)

@api.route('/getCorrMat', methods=['GET'])
def sendCorrMat():
    col = request.args.get('col')
    fname = request.args.get('file')
    print("hereeee",col)
    csvFile = ['data/iris.csv','data/winequality-red.csv','data/winequality-white.csv']
    data_df = pandas.read_csv(csvFile[int(fname)])
    fieldnames = (data_df.columns)
    
    if int(fname) == 0:
        data_df = data_df[data_df.iloc[:,-1]==col]
        data_df = data_df.drop(labels='Class', axis=1)
    else:
        data_df = data_df[data_df.iloc[:,-1]==int(col)]
        data_df = data_df.drop(labels='quality', axis=1)
    print(data_df)
    data_df = (data_df.corr())
    data_df = np.squeeze(np.asarray(data_df))
    finalData ={}
    corr_data = []
    for i in range(0,len(data_df)):
        data = []
        for j in range(0,len(data_df[i])):
            data.append([i,j,round(data_df[i][j],2)])
        corr_data.extend(data)
    finalData['metadata'] = (list(fieldnames))[:-1]
    finalData['data'] = corr_data
    return (finalData)

@api.route('/getClusterData', methods=['GET'])
def sendClusterData():
    clusternum = request.args.get('clstr')
    fname = request.args.get('file')

    csvFile = ['data/iris.csv','data/winequality-red.csv','data/winequality-white.csv']
    data_df = pandas.read_csv(csvFile[int(fname)])
    fieldnames = (data_df.columns)
    dataFinal = {}
    label = ""
    if int(fname) == 0:
        target = data_df['Class']
        data_df = data_df.drop(labels='Class', axis=1)
        label = 'Class'
    else:
        # data_df = data_df[data_df.iloc[:,-1]==int(col)]
        target = data_df['quality']
        data_df = data_df.drop(labels='quality', axis=1)
        label = 'quality'

    kmeans = KMeans(n_clusters=int(clusternum)).fit(data_df)
    centroids = kmeans.labels_
    data_df['target'] = target
    data_df[label] = centroids

    dataFinal['metadata'] = (list(fieldnames))
    dataFinal['data'] =  data_df.to_json(orient='records')
    return (dataFinal)