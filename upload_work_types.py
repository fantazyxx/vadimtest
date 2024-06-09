import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Загрузка данных из файла CSV с кодировкой cp1251 и разделителем
data = pd.read_csv('Наименование работ.csv', encoding='cp1251', delimiter=';')

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)

# Получение ссылки на Firestore
db = firestore.client()

# Функция для загрузки данных
def upload_work_types(data):
    for index, row in data.iterrows():
        work_data = {
            'cost': row['Стоимость работ']
        }
        # Используем тип работы как идентификатор документа
        db.collection('WorkTypes').document(row['Тип работ']).set(work_data)
        print(f"Uploaded work type {row['Тип работ']}")

# Загрузка данных
upload_work_types(data)





