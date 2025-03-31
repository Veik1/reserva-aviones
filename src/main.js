import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Si estás usando Vue Router
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css'; // Iconos de Vuetify

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');