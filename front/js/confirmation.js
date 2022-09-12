document.addEventListener('DOMContentLoaded', function() {
   showOrder();
});

function showOrder() {
    document.getElementById('orderId').innerText = getOrderID();
}

function getOrderID() {
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get('orderId');
    return orderID;
}