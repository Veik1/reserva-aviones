// Opciones predeterminadas más completas si no se especifican otras
const defaultDateOptions = {
    year: 'numeric',
    month: 'long', // Puedes cambiar a 'long' si prefieres meses completos por defecto
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Usar formato 24h por defecto
};

// Añade 'locale' como parámetro, con 'es-ES' como valor predeterminado
export const formatDate = (dateString, options = defaultDateOptions, locale = 'es-ES') => {
    if (!dateString) return 'N/A';
    try {
         // Usa el parámetro 'locale' aquí
         return new Intl.DateTimeFormat(locale, options).format(new Date(dateString));
    } catch (e) {
        console.error("Error al formatear la fecha:", dateString, e);
        return dateString; // Fallback
    }
};

export const formatBookingStatus = (status) => {
    if (!status) return '';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'confirmed') return 'Confirmado';
    if (lowerStatus === 'pending') return 'Pendiente';
    if (lowerStatus === 'canceled') return 'Cancelado';
    return status; // Devuelve el original si no coincide
};


/**
 * Formatea un número de tarjeta en formato XXXX-XXXX-XXXX-XXXX.
 * Solo permite hasta 16 dígitos.
 */
export const formatCardNumber = (rawValue) => {
  const digits = rawValue.replace(/\D/g, "").slice(0, 16); // solo números, máx 16
  return digits.match(/.{1,4}/g)?.join("-") ?? "";
};

export const formatExpiry = (value) => {
  const numeric = value.replace(/\D/g, '').slice(0, 4);
  if (numeric.length >= 3) {
    return `${numeric.slice(0, 2)}/${numeric.slice(2)}`;
  }
  return numeric;
};





  