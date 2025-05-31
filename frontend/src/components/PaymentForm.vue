<template>
  <form @submit.prevent="handlePayment">
    <div>
      <label for="cardNumber">Número de tarjeta</label>
      <input
        id="cardNumber"
        v-model="cardNumber"
        maxlength="19"
        inputmode="numeric"
        placeholder="1234 5678 9012 3456"
        required
      />
    </div>
    <div>
      <label for="expiry">Vencimiento (MM/YY)</label>
      <input
        id="expiry"
        v-model="expiry"
        maxlength="5"
        placeholder="MM/YY"
        required
      />
    </div>
    <div>
      <label for="cvv">CVV</label>
      <input
        id="cvv"
        v-model="cvv"
        maxlength="4"
        inputmode="numeric"
        placeholder="123"
        required
      />
    </div>
    <button type="submit">Pagar</button>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['payment-success']);

const cardNumber = ref('');
const expiry = ref('');
const cvv = ref('');
const error = ref('');

function handlePayment() {
  error.value = '';
  // Solo números, 16 dígitos (permitir espacios)
  if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(cardNumber.value.replace(/ +/g, ''))) {
    error.value = 'Número de tarjeta inválido. Deben ser 16 dígitos.';
    return;
  }
  // MM/YY formato
  if (!/^\d{2}\/\d{2}$/.test(expiry.value)) {
    error.value = 'Formato de vencimiento inválido. Usa MM/YY.';
    return;
  }
  // Fecha no pasada
  const [mm, yy] = expiry.value.split('/').map(Number);
  if (mm < 1 || mm > 12) {
    error.value = 'Mes de vencimiento inválido.';
    return;
  }
  const now = new Date();
  const expDate = new Date(2000 + yy, mm);
  if (expDate < now) {
    error.value = 'La tarjeta está vencida.';
    return;
  }
  // CVV 3 o 4 dígitos
  if (!/^\d{3,4}$/.test(cvv.value)) {
    error.value = 'CVV inválido.';
    return;
  }
  emit('payment-success', {
    card_number: cardNumber.value.replace(/\s+/g, ''),
    expiry: expiry.value,
    cvv: cvv.value
  });
}
</script>

<style scoped>
.error {
  color: #e74c3c;
  margin-top: 10px;
}
form > div {
  margin-bottom: 10px;
}
input {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}
button {
  padding: 8px 18px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #217dbb;
}
</style>