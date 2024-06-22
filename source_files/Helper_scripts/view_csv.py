import pandas as pd

# Загрузка данных из файла CSV с явным указанием кодировки cp1251 и разделителя
data = pd.read_csv('Наименование работ.csv', encoding='cp1251', delimiter=';')

# Вывод первых нескольких строк данных и заголовков столбцов
print(data.head())
print(data.columns)

