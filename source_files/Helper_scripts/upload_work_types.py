import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Загрузка данных из файла CSV с кодировкой utf-8 и разделителем ';'
data = pd.read_csv('docash2241.csv', encoding='utf-8', delimiter=';')

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)

# Получение ссылки на Firestore
db = firestore.client()

# Функция для загрузки данных
def upload_work_types(collection_name, csv_file):
    data = pd.read_csv(csv_file, encoding='utf-8', delimiter=';')
    for index, row in data.iterrows():
        work_type = row['WorkType']
        work_data = {
            'price': str(int(row['Price']))
        }
        db.collection(collection_name).document(work_type).set(work_data)
        print(f"Updated work type {work_type} in {collection_name}")

# Обновление данных
upload_work_types('WorkTypes_docash2241', 'docash2241.csv')
