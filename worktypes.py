import firebase_admin
from firebase_admin import credentials, firestore

# Инициализация Firebase
cred = credentials.Certificate('./firebase-config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Названия коллекций
collections = ['WorkTypes_banknota1ku']

def update_work_types(collection_name):
    collection_ref = db.collection(collection_name)
    docs = collection_ref.stream()

    for doc in docs:
        data = doc.to_dict()
        work_type = doc.id
        new_work_type = work_type.lower()

        # Удаление старого документа
        collection_ref.document(work_type).delete()

        # Добавление нового документа с обновленным именем
        new_data = {'price': data['price']}
        collection_ref.document(new_work_type).set(new_data)
        print(f'Updated {work_type} to {new_work_type} in {collection_name}')

for collection in collections:
    update_work_types(collection)
