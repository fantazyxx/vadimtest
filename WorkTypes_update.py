import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase-config.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

collections = ['WorkTypes_banknota1ku']

def update_price_field_type(collection_name):
    docs = db.collection(collection_name).stream()
    for doc in docs:
        doc_ref = db.collection(collection_name).document(doc.id)
        data = doc.to_dict()
        if 'price' in data and isinstance(data['price'], str):
            try:
                price_number = float(data['price'].replace(',', ''))
                doc_ref.update({'price': price_number})
                print(f'Updated field "price" to number in document {doc.id} in {collection_name}')
            except ValueError:
                print(f'Could not convert price to number for document {doc.id} in {collection_name}')

for collection in collections:
    update_price_field_type(collection)

print('Update complete.')
