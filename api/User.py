from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy
from database.DataBaseManagement import *

class API:
    def __init__(self):
        app = Flask(__name__)
        self.api = Api(app)
        self.database_connection= DataBaseManagement()

    def addResources(self):
        self.api.add_resource(User, '/dbproj/user')


class User(Resource):
    def get(self):
        cursor = self.database_connection.connection.cursor()
        cursor.execute('select * from users;')
        for row in cursor:
            print("ID: ", row[0])
            print("Nome: ", row[1])
            print("Email: ", row[2])
            print("Pass: ", row[3])
        return {'yeah':'puoop'}

    def post(self):
        user_data = request.json
        user_data['userid']= 1
        self.database_connection.insertUserQuery(user_data)
        return {"userID": user_data['userid']}