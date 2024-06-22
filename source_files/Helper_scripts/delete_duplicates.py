import pandas as pd

# Загрузка Excel файла
file_path = "D:/firestore-setup/deep2240.xls"
df = pd.read_excel(file_path)

# Поиск и удаление дубликатов на основе столбца 'ID'
df_cleaned = df.drop_duplicates(subset=['ID'], keep=False)

# Сохранение очищенных данных обратно в Excel
output_path = "D:/firestore-setup/cleaned_deep2240.xls"
df_cleaned.to_excel(output_path, index=False)

print("Дубликаты успешно удалены. Очищенный файл сохранен по адресу:", output_path)
