import pandas as pd
import os

# Определим путь к рабочему столу пользователя
desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')

# Загрузка CSV файла с указанием разделителя
file_path = "D:/firestore-setup/deep2240.csv"
df = pd.read_csv(file_path, header=None, delimiter=';')

# Вывод текущих названий столбцов и первых строк данных
print("Текущие названия столбцов:", df.columns.tolist())
print("Первые несколько строк данных:\n", df.head())

# Присваиваем названия столбцам, включая дополнительный столбец
df.columns = ['ID', 'Name', 'Model', 'Code', 'Extra']

# Вывод названий столбцов и первых строк данных после присвоения имен
print("Названия столбцов после присвоения имен:", df.columns.tolist())
print("Первые несколько строк данных после присвоения имен:\n", df.head())

# Удаление столбца 'Extra'
df = df.drop(columns=['Extra'])

# Удаление строк с пустыми значениями в столбце 'ID'
df = df.dropna(subset=['ID'])

# Поиск и удаление дубликатов на основе столбца 'ID'
df_cleaned = df.drop_duplicates(subset=['ID'], keep='first')

# Сохранение очищенных данных обратно в CSV с указанием кодировки UTF-8 на рабочий стол
output_path = os.path.join(desktop, "cleaned_deep2240.csv")
df_cleaned.to_csv(output_path, index=False, encoding='utf-8-sig')

print("Дубликаты успешно удалены. Очищенный файл сохранен по адресу:", output_path)
