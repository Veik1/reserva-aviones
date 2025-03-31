<template>
    <li>
      {{ vuelo.numero_vuelo }} - {{ vuelo.origen }} a {{ vuelo.destino }} ({{ vuelo.fecha }})
    </li>
  </template>
  
  <script>
  export default {
    props: {
      vuelo: Object,
    },
  };
  </script>