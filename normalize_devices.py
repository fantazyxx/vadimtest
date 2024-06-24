import firebase_admin
from firebase_admin import credentials, firestore

# Инициализация Firebase
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Словарь для замены моделей
replace_dict = {
    "DoCash 2241": "docash2241",
    "DEEP-2240": "deep2240",
    "Deep 2241": "deep2241",
    "VAMA BP-2": "vamabp2",
    "УНА 001-03": "una_001",
    "ScanCoin SC-350": "scancoin_sc350",
    "ScanCoin SC-313": "scancoin_sc313",
    "ScanCoin SC-303": "scancoin_sc303"
}

def normalize_device_models():
    devices_ref = db.collection('Devices')
    devices = devices_ref.stream()

    for device in devices:
        device_data = device.to_dict()
        model = device_data.get('model')
        
        if model in replace_dict:
            new_model = replace_dict[model]
            devices_ref.document(device.id).update({'model': new_model})
            print(f"Updated device {device.id}: {model} -> {new_model}")
        else:
            print(f"No update needed for device {device.id}: {model}")

if __name__ == "__main__":
    normalize_device_models()
