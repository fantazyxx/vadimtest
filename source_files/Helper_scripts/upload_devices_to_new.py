import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Загрузка данных из файла CSV с кодировкой utf-8 и разделителем ';'
data = pd.read_csv('scancoin.csv', encoding='utf-8', delimiter=';')

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)

# Получение ссылки на Firestore
db = firestore.client()

# Функция для загрузки данных
def upload_devices(data):
    for index, row in data.iterrows():
        device_data = {
            'type': row['type'],
            'model': row['model'],
            'factory_serial_number': row['SN'],
            'region': row['region']
        }
        # Используем id как идентификатор документа
        db.collection('Devices').document(row['id']).set(device_data)
        print(f"Uploaded device with ID: {row['id']}")

# Загрузка данных
upload_devices(data)
