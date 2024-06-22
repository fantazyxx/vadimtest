import firebase_admin
from firebase_admin import credentials, firestore

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)

# Получение ссылки на Firestore
db = firestore.client()

def merge_collections():
    # Извлечение всех документов из новой коллекции `devices`
    devices_ref = db.collection('devices')
    devices = devices_ref.stream()

    for device in devices:
        device_data = device.to_dict()

        # Преобразование полей для соответствия коллекции `Devices`
        transformed_data = {
            'factory_serial_number': device_data.get('SN', ''),
            'model': device_data.get('model', ''),
            'region': device_data.get('region', ''),
            'type': device_data.get('type', '')
        }

        # Добавление или обновление документа в коллекции `Devices`
        db.collection('Devices').document(device.id).set(transformed_data)

        print(f"Merged device with ID: {device.id}")

    print("All devices have been merged successfully.")

# Запуск функции слияния коллекций
merge_collections()
