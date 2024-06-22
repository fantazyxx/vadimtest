import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Загрузка данных из файла CSV
data = pd.read_csv('Упаковщики 1.csv')

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)

# Получение ссылки на Firestore
db = firestore.client()

# Функция для загрузки данных
def upload_devices(data):
    for index, row in data.iterrows():
        device_data = {
            'model': row['Модель'],
            'type': row['Тип'],
            'factory_serial_number': row['Заводской номер'],
            'region': row['Регион']
        }
        # Используем системный номер как идентификатор документа
        db.collection('Devices').document(row['Системный номер']).set(device_data)
        print(f"Uploaded device with system number {row['Системный номер']}")

# Загрузка данных
upload_devices(data)
