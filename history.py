import json
import os

# Функция для создания файла с информацией о проекте
def create_project_file(project_name):
    project_info = {
        "project_name": project_name,
        "description": "",
        "structure": {},
        "functions": {},
        "interactions": [],
        "credentials": {},
        "changes": []
    }

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для обновления описания проекта
def update_description(project_name, description):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["description"] = description

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для добавления структуры проекта
def update_structure(project_name, structure):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["structure"] = structure

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для добавления функций проекта
def add_function(project_name, function_name, function_description):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["functions"][function_name] = function_description

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для добавления взаимодействий с проектом
def add_interaction(project_name, interaction):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["interactions"].append(interaction)

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для добавления учетных данных
def add_credentials(project_name, credentials):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["credentials"] = credentials

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Функция для добавления изменений
def add_change(project_name, change):
    with open(f"{project_name}.json", "r") as file:
        project_info = json.load(file)

    project_info["changes"].append(change)

    with open(f"{project_name}.json", "w") as file:
        json.dump(project_info, file, indent=4)

# Пример использования
create_project_file("RepairManagementSystem")
update_description("RepairManagementSystem", "A system for managing repair records.")
update_structure("RepairManagementSystem", {"public": ["index.html", "app.js", "styles.css"], "src": ["firebase-config.json", "utils.js"]})
add_function("RepairManagementSystem", "loadPreviousRepairs", "Fetches and displays previous repairs for a device.")
add_interaction("RepairManagementSystem", "Updated loadPreviousRepairs function to fetch repairs by device ID.")
add_credentials("RepairManagementSystem", {"firebase": {"apiKey": "your-api-key", "authDomain": "your-auth-domain"}})
add_change("RepairManagementSystem", {"date": "2024-06-28", "change": "Updated loadPreviousRepairs function to handle new API endpoint."})

print("Project file created and updated successfully.")
