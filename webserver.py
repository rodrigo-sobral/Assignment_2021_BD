from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy
import psycopg2
import uuid

app = Flask(__name__)
api = Api(app)

if __name__ == "__main__": 
    app.run(debug=True, port=8080)
