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

#### **1. Autenticación (/api/auth)**
**POST** `/api/auth/register` Registra un nuevo usuario.

**Cuerpo de la petición (JSON):**
```json
{
    "name": "Nombre del Usuario",
    "email": "correo@ejemplo.com",
    "password": "contraseña"
}
```

**Respuesta: Respuesta: Devuelve información del usuario creado y, posiblemente, un token de autenticación.**

#### **2. Inicio de seción (/api/login)**
**POST** `/api/auth/login` Inicia sesión de un usuario existente y obtiene un token JWT.

**Cuerpo de la petición (JSON):**

```json
{
    "email": "correo@ejemplo.com",
    "password": "contraseña"
}
```

---

#### **3. Vuelos (/api/flights)**
**POST** `/api/flights` Crea un nuevo vuelo (requiere autenticación y rol de administrador).

**Cuerpo de la petición (JSON):**

```json
{
    "flight_number": "Número de vuelo",
    "origin": "Ciudad de origen",
    "destination": "Ciudad de destino",
    "departure_time": "Fecha y hora de salida (ISO 8601)",
    "arrival_time": "Fecha y hora de llegada (ISO 8601)",
    "seats_available": 124,
    "price": 100
}
```
**Respuesta: Devuelve la información del vuelo creado**

---

#### **4. Obtener una lista de todos los vuelos**
**GET** `/api/flights` Obtiene una lista de todos los vuelos disponibles.

**Respuesta: Respuesta: Un array de objetos con la información de cada vuelo.**
```json
[
    {
        "id": "bc14d119-ae45-4925-99a1-d1af13a10910",
        "flight_number": "AA102",
        "origin": "Nueva York",
        "destination": "Los Ángeles",
        "departure_time": "2025-04-18T19:30:31.051Z",
        "arrival_time": "2025-04-18T22:30:31.051Z",
        "seats_available": 150,
        "price": "350.75",
        "createdAt": "2025-04-17T19:30:31.051Z",
        "updatedAt": "2025-04-17T19:30:31.051Z"
    },
    {
        "id": "8906ccb9-30bc-4000-a191-cc7b000b0a93",
        "flight_number": "BB203",
        "origin": "Miami",
        "destination": "Chicago",
        "departure_time": "2025-04-19T19:30:31.051Z",
        "arrival_time": "2025-04-20T00:18:31.051Z",
        "seats_available": 120,
        "price": "280.20",
        "createdAt": "2025-04-17T19:30:31.051Z",
        "updatedAt": "2025-04-17T19:30:31.051Z"
    }
]
```

---

#### **5. Obtener un vuelo especifico por su ID**
**GET** `/api/flights/:id`

**Body:**
```json
{
    "id": "65e390ca-aac2-4908-bd88-b79c4a442292",
    "flight_number": "AAA-442",
    "origin": "Buenos Aires",
    "destination": "Córdoba",
    "departure_time": "2025-04-15T10:00:00.000Z",
    "arrival_time": "2025-04-15T11:30:00.000Z",
    "seats_available": 120,
    "price": "150.50",
    "createdAt": "2025-04-17T21:00:50.422Z",
    "updatedAt": "2025-04-17T21:00:50.422Z"
}

```

---

#### **6. Actulizar la información de un vuelo existente**
**PUT** `/api/flights/:id` Actualiza la información de un vuelo existente por su ID (requiere autenticación y rol de administrador).

**Respuesta: Parámetro de la URL: id (UUID del vuelo). Cuerpo de la petición (JSON): (Puede contener cualquier campo del objeto vuelo a actualizar). **
```json
{
	"seats_available": Nuevo número de asientos disponibles,
	"price": Nuevo precio del vuelo
	// ... otros campos a actualizar
}
```

---

#### **7. Eliminar un vuelo por su ID**
**DELETE** `/api/flights/:id` Elimina un vuelo por su ID (requiere autenticación y rol de administrador).
o	**Respuesta: Parámetro de la URL: id (UUID del vuelo).
o	Respuesta: Un mensaje indicando si el vuelo fue eliminado exitosamente.


#### **8. Reservas (/api/bookings)**
**POST** `/api/bookings` Crea una nueva reserva

**Cuerpo de la petición (JSON):**

```json
{
    "flight_id": "7684ceba-f69c-496b-97f2-41c1261efe62",
    "seat": "33T",
    "booking_code": "ABC-333",
    "total_price": 100.99
}
```
**Respuesta: Devuelve la información de la reserva creada**

---

#### **9. Obtener una lista de todas las reservas**
**GET** `/api/bookings` Obtiene una lista de todas las reservas disponibles.

**Respuesta: Respuesta: Un array de objetos con la información de cada reserva.**
```json
[
    {
        "id": "addf8cde-e4af-4379-9610-403f94dbafb5",
        "booking_code": "BOOK-12345",
        "flight_id": "8906ccb9-30bc-4000-a191-cc7b000b0a93",
        "user_id": "af120ed4-00fa-43c4-9d7e-01456da4ac20",
        "seat": "15B",
        "total_price": "150.50",
        "status": "confirmed",
        "passenger_name": "Usuario 1",
        "passenger_last_name": "Prueba",
        "passenger_email": "usuario1@example.com",
        "createdAt": "2025-04-17T19:34:09.233Z",
        "updatedAt": "2025-04-17T19:34:09.233Z",
        "user": {
            "id": "af120ed4-00fa-43c4-9d7e-01456da4ac20",
            "name": "Usuario 1",
            "email": "usuario1@example.com"
        },
        "flight": {
            "id": "8906ccb9-30bc-4000-a191-cc7b000b0a93",
            "flight_number": "BB203",
            "origin": "Miami",
            "destination": "Chicago"
        }
    },
    {
        "id": "1d623a5d-1cb7-432b-ae21-6ac3df673cc4",
        "booking_code": "BOOK-67890",
        "flight_id": "bc14d119-ae45-4925-99a1-d1af13a10910",
        "user_id": "4e8368f1-0b21-4cb1-986f-def09560cf90",
        "seat": "22C",
        "total_price": "280.20",
        "status": "pending",
        "passenger_name": "Usuario 2",
        "passenger_last_name": "Prueba",
        "passenger_email": "usuario2@example.com",
        "createdAt": "2025-04-17T19:34:09.233Z",
        "updatedAt": "2025-04-17T19:34:09.233Z",
        "user": {
            "id": "4e8368f1-0b21-4cb1-986f-def09560cf90",
            "name": "Usuario 2",
            "email": "usuario2@example.com"
        },
        "flight": {
            "id": "bc14d119-ae45-4925-99a1-d1af13a10910",
            "flight_number": "AA102",
            "origin": "Nueva York",
            "destination": "Los Ángeles"
        }
    }
]

```

---

#### **10. Obtener una reserva especifica por su ID**
**GET** `/api/bookings/:id`

**Body:**
```json
 {
        "id": "addf8cde-e4af-4379-9610-403f94dbafb5",
        "booking_code": "BOOK-12345",
        "flight_id": "8906ccb9-30bc-4000-a191-cc7b000b0a93",
        "user_id": "af120ed4-00fa-43c4-9d7e-01456da4ac20",
        "seat": "15B",
        "total_price": "150.50",
        "status": "confirmed",
        "passenger_name": "Usuario 1",
        "passenger_last_name": "Prueba",
        "passenger_email": "usuario1@example.com",
        "createdAt": "2025-04-17T19:34:09.233Z",
        "updatedAt": "2025-04-17T19:34:09.233Z",
        "user": {
            "id": "af120ed4-00fa-43c4-9d7e-01456da4ac20",
            "name": "Usuario 1",
            "email": "usuario1@example.com"
        },
        "flight": {
            "id": "8906ccb9-30bc-4000-a191-cc7b000b0a93",
            "flight_number": "BB203",
            "origin": "Miami",
            "destination": "Chicago"
        }

```

---

#### **11. Actulizar la información de un vuelo existente**
**PUT** `/api/flights/:id` Actualiza la información de un vuelo existente por su ID (requiere autenticación y rol de administrador).

**Respuesta: Parámetro de la URL: id (UUID del vuelo). Cuerpo de la petición (JSON): (Puede contener cualquier campo del objeto reserva a actualizar). **
```json
{
    "seat": "22C",
    "total_price": "100.50",
    "status": "confirmed"
}

```

---

#### **12. Eliminar una reserva por su ID**
**DELETE** `/api/flights/:id` Elimina una reserva por su ID (requiere autenticación y rol de administrador).
o	**Respuesta: Parámetro de la URL: id (UUID de la reserva).
o	Respuesta: Un mensaje indicando si la reserva fue eliminada exitosamente.


---

### ✅ Resultados Esperados
Los resultados de las pruebas deben coincidir con los ejemplos proporcionados en la documentación de la API.

---