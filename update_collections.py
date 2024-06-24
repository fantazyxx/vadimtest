import firebase_admin
from firebase_admin import credentials, firestore

# Инициализация Firebase
cred = credentials.Certificate('firebase-config.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def rename_collection(old_name, new_name):
    old_collection = db.collection(old_name)
    new_collection = db.collection(new_name)
    
    docs = old_collection.stream()
    
    for doc in docs:
        new_collection.document(doc.id).set(doc.to_dict())
        old_collection.document(doc.id).delete()
        
    print(f"Renamed {old_name} to {new_name}")

def copy_collection(source_name, target_name):
    source_collection = db.collection(source_name)
    target_collection = db.collection(target_name)
    
    docs = source_collection.stream()
    
    for doc in docs:
        target_collection.document(doc.id).set(doc.to_dict())
        
    print(f"Copied {source_name} to {target_name}")

if __name__ == "__main__":
    # Переименование коллекций
    rename_collection('WorkTypes', 'WorkTypes_una_001')
    rename_collection('WorkTypes_scancoin', 'WorkTypes_scancoin_sc350')
    
    # Копирование коллекций
    copy_collection('WorkTypes_scancoin_sc350', 'WorkTypes_scancoin_sc313')
    copy_collection('WorkTypes_scancoin_sc350', 'WorkTypes_scancoin_sc303')
