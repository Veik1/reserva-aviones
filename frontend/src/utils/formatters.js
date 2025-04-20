export const formatDate = (dateString, options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) => {
    if (!dateString) return 'N/A';
    try {
         return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Fallback
    }
};

// Add other formatters if needed
