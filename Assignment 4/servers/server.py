from flask import Blueprint
from flask import Flask, render_template
import json
import csv
from collections import OrderedDict
import pandas

api = Blueprint('api', __name__)

@api.route('/getCsv/<id>', methods=['GET'])
def getData(id):
    print("Hello",id)
    csvFile = ['data/iris.csv','data/winequality-red.csv','data/winequality-white.csv']
    data_df = pandas.read_csv(csvFile[int(id)])
    fieldnames = (data_df.columns)
    data = []
    with open(csvFile[int(id)]) as csvF:
        csvReader = csv.DictReader(csvF, fieldnames)
        for rows in csvReader:
            entry = OrderedDict()
            for field in fieldnames:
                entry[field] = rows[field]
            data.append(entry)
    data = json.dumps(data)
    return (data)