import firebase_admin
from firebase_admin import credentials, firestore

# Инициализация Firebase Admin SDK
cred = credentials.Certificate('./firebase-config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def update_work_type():
    work_types_collection = db.collection('WorkTypes_una_001')
    repair_type_to_update = "заміна механізму петлеутворення, подачі і затягування"
    new_repair_type = "заміна механізму петлеутворення подачі і затягування"

    # Поиск и обновление записи в коллекции WorkTypes_una_001
    doc_ref = work_types_collection.document(repair_type_to_update)
    doc = doc_ref.get()

    if doc.exists:
        # Создание нового документа с обновленным именем
        work_types_collection.document(new_repair_type).set(doc.to_dict())
        # Удаление старого документа
        doc_ref.delete()
        print("Запись в WorkTypes_una_001 обновлена.")

def update_repairs_collection():
    repairs_collection = db.collection('Repairs')
    repair_type_to_update = "петлеутворення,"
    new_repair_type = "петлеутворення"

    # Обновление всех документов в коллекции Repairs
    repairs_docs = repairs_collection.stream()
    for doc in repairs_docs:
        repair_data = doc.to_dict()
        if 'repair_type' in repair_data:
            repair_types = repair_data['repair_type']
            if repair_type_to_update in repair_types:
                updated_repair_types = repair_types.replace(repair_type_to_update, new_repair_type)
                try:
                    repairs_collection.document(doc.id).update({'repair_type': updated_repair_types})
                    print(f"Документ {doc.id} обновлен с repair_type: {updated_repair_types}")
                except Exception as e:
                    print(f"Ошибка при обновлении документа {doc.id}: {e}")
            else:
                print(f"Документ {doc.id} не требует обновления.")
        else:
            print(f"Документ {doc.id} не содержит поле repair_type.")

    print("Обновление коллекции Repairs завершено.")

if __name__ == "__main__":
    update_work_type()
    update_repairs_collection()
