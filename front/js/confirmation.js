document.addEventListener('DOMContentLoaded', function() {
   showOrder();
});

/**
 * @description Affiche le numéro de commande et le prix total de la commande
 */
function showOrder() {
    document.getElementById('orderId').innerText = getOrderID();
}

/**
 * @description Récupère le numéro de commande dans l'url
 * @returns {string} Le numéro de commande
 */
function getOrderID() {
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get('orderId');
    return orderID;
}