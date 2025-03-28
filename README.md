# TP - Laboratorio de Programación y Lenguajes 2024
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
```
• Node.js (ver. 18 o superior)
• PostgreSQL (ver. 15 o superior)
• npm (ver. 9 o superior)
```

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

Desde el boton <**Code**> elegir la opción Download ZIP para descargar el repositorio. Descomprimirlo en el directorio donde se va a desplegar el proyecto.

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


## Uso y Pruebas en Postman


## Los resultados de las pruebas deben ser los siguientes: 
