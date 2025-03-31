# Trabajo de Campo 2025
### Grupo **"Testigos del Bitcoin"**

### Integrantes:
```
• Facundo Mentoro
• Eduardo Arizza
• Gonzalo Arizza
• Sandra Romero
• Martín Alejandro Lamas
```

## Requisitos
• [Node.js](https://nodejs.org/en/download)

• [PostgreSQL](https://www.postgresql.org/download/)

• npm

## Tecnologías que se utilizaron:
```
• Backend: Node.js, Express, Sequelize, PostgreSQL
• Frontend: Vue.js, HTML5, CSS3
• Herramientas: Nodemon, Morgan
```

## Guía de Instalación:

### Opción 1 - Clonación de Repositorio (HTTPS).  

Desde la terminal Git Bash ir al directorio donde se desea clonar el proyecto. Escribir el siguiente comando para clonar el repositorio

```git clone https://github.com/Veik1/reserva-aviones.git```

### Opción 2 - Descarga de Repositorio.

Desde el botón <**Code**> elegir la opción Download ZIP para descargar el repositorio. Descomprimirlo en el directorio donde se va a desplegar el proyecto.

Una vez que se tenga el proyecto en el directorio deseado, en el Símbolo de Sistema (CMD) ir hasta el proyecto y abrir VSCode (code .)

## Instalación de Dependencias e Inicio del Proyecto
Se deberá crear las bases de datos

En Linux:
```
sudo -u postgres createdb reserva_aviones_dev
sudo -u postgres createdb reserva_aviones_test
sudo -u postgres createdb reserva_aviones_prod
```

En Windows (powershell):

```
Nos logueamos:
psql -U postgres

y luego creamos las databases:
CREATE DATABASE reserva_aviones_dev;
CREATE DATABASE reserva_aviones_test;
CREATE DATABASE reserva_aviones_prod;
```

En la terminal de VSCode, correr el siguiente comando para instalar todas las dependencias necesarias para iniciar correctamente el proyecto

    npm install

Luego que se instalen todas las dependencias, para iniciar el servidor del proyecto correr el siguiente comando:

    npm run dev:full


## 🧪 Uso y Pruebas en Postman

Para probar la API, puedes importar la colección de Postman disponible en el repositorio. Asegúrate de que el servidor esté corriendo correctamente.

### ✅ Endpoints de la API

#### **1. Crear un vuelo**
**POST** `/api/vuelos`

**Body:**
```json
{
  "numero_vuelo": "AA123",
  "origen": "Buenos Aires",
  "destino": "Madrid",
  "fecha": "2025-03-30T12:00:00Z"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "numero_vuelo": "AA123",
  "origen": "Buenos Aires",
  "destino": "Madrid",
  "fecha": "2025-03-30T12:00:00Z",
  "createdAt": "2025-03-29T12:00:00Z",
  "updatedAt": "2025-03-29T12:00:00Z"
}
```

---

#### **2. Obtener todos los vuelos**
**GET** `/api/vuelos`

**Respuesta:**
```json
[
  {
    "id": 1,
    "numero_vuelo": "AA123",
    "origen": "Buenos Aires",
    "destino": "Madrid",
    "fecha": "2025-03-30T12:00:00Z",
    "createdAt": "2025-03-29T12:00:00Z",
    "updatedAt": "2025-03-29T12:00:00Z"
  }
]
```

---

#### **3. Obtener un vuelo por ID**
**GET** `/api/vuelos/:id`

**Respuesta:**
```json
{
  "id": 1,
  "numero_vuelo": "AA123",
  "origen": "Buenos Aires",
  "destino": "Madrid",
  "fecha": "2025-03-30T12:00:00Z",
  "createdAt": "2025-03-29T12:00:00Z",
  "updatedAt": "2025-03-29T12:00:00Z"
}
```

---

#### **4. Actualizar un vuelo**
**PUT** `/api/vuelos/:id`

**Body:**
```json
{
  "numero_vuelo": "AA124",
  "origen": "Buenos Aires",
  "destino": "Barcelona",
  "fecha": "2025-04-01T12:00:00Z"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "numero_vuelo": "AA124",
  "origen": "Buenos Aires",
  "destino": "Barcelona",
  "fecha": "2025-04-01T12:00:00Z",
  "createdAt": "2025-03-29T12:00:00Z",
  "updatedAt": "2025-03-30T12:00:00Z"
}
```

---

#### **5. Eliminar un vuelo**
**DELETE** `/api/vuelos/:id`

**Respuesta:**
```json
{
  "message": "Vuelo eliminado correctamente"
}
```

---

#### **6. Crear una reserva**
**POST** `/api/reservas`

**Body:**
```json
{
  "id_persona": 1,
  "id_vuelo": 1,
  "asiento": "12A"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "id_persona": 1,
  "id_vuelo": 1,
  "asiento": "12A",
  "createdAt": "2025-03-29T12:00:00Z",
  "updatedAt": "2025-03-29T12:00:00Z"
}
```

---

#### **7. Obtener todas las reservas**
**GET** `/api/reservas`

**Respuesta:**
```json
[
  {
    "id": 1,
    "id_persona": 1,
    "id_vuelo": 1,
    "asiento": "12A",
    "createdAt": "2025-03-29T12:00:00Z",
    "updatedAt": "2025-03-29T12:00:00Z"
  }
]
```

---

#### **8. Eliminar una reserva**
**DELETE** `/api/reservas/:id`

**Respuesta:**
```json
{
  "message": "Reserva eliminada correctamente"
}
```

---

### ✅ Resultados Esperados
Los resultados de las pruebas deben coincidir con los ejemplos proporcionados en la documentación de la API.

---