import psycopg2, uuid

class DataBaseManagement:

    def __init__(self):
        self.connection=connect_db()

    def connect_db(self):
        connection = psycopg2.connect(user = "dbproj",
            password = "dbproj",
            host = "127.0.0.1",
            port = "5432",
            database = "dbproj")
        return connection

    def getSimpleQuery(self, what, table_id,  argument, something_id):
        cursor = connection.cursor()
        cursor.execute('select '+what+' from '+table_id+' where '+argument+'='+something_id+';')
        return cursor

    def insertUserQuery(self, user_data:dict):
        cursor = connection.cursor()
        cursor.execute('insert into users (userid, username, email, password) values ('+str(user_data['userid'])+', \''+user_data['username']+'\', \''+user_data['email']+'\', \''+user_data['password']+'\');')
        connection.commit()
        cursor.close()
        return cursor
