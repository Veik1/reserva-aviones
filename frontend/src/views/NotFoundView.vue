<template>
    <div class="not-found-view">
      <h1>404 - Página no encontrada</h1>
      <p>¡Ups! La página que buscas no existe.</p>
      <router-link to="/" class="button">Ir a Inicio</router-link>
    </div>
  </template>
  
  <script setup>
  // No specific script logic needed for a simple 404 page
  </script>
  
  <style scoped>
  .not-found-view {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh; /* Take up significant vertical space */
    text-align: center;
    padding: 20px;
  }
  
  h1 {
    font-size: 3em;
    color: #e74c3c; /* Red color for emphasis */
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1.2em;
    color: #555;
    margin-bottom: 30px;
  }
  
  .button {
    display: inline-block;
    padding: 12px 25px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    text-decoration: none;
    font-size: 1em;
    transition: background-color 0.2s ease;
  }
  
  .button:hover {
    background-color: #2980b9;
  }
  </style>