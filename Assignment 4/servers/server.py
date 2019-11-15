from flask import Blueprint
from flask import Flask, render_template
import json
import csv
from collections import OrderedDict
import pandas

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