<template>
  <div :class="['alert', `alert-${type}`]" v-if="message">
    {{ message }}
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'success', 'error', 'warning', 'info'
    default: 'info',
  },
});
</script>

<style scoped>
.alert {
  padding: 10px 15px;
  margin-bottom: 15px;
  border: 1px solid transparent;
  border-radius: 4px;
}
.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}
.alert-error {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
}
.alert-info {
  color: #0c5460;
  background-color: #d1ecf1;
  border-color: #bee5eb;
}
</style>
