/**
 * Fetch the data from the API
 */
document.addEventListener('DOMContentLoaded', () => {
  createCartElement(getCart());
  displayTotalPrice();
  calculateTotalQuantity();
  bindFormModifications();
});

/**
 * @description Get all objects from the cart
 * @returns array of objects
 */
function getCart() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return cart;
}

/**
 * @description Read the cart and create the HTML elements
 * @param {array} cart 
 */
function createCartElement(cart){
    const cartList = document.getElementById('cart__items');
    for (const item of cart) {
        constructItem(item, cartList);
    }
}

/**
 * @description Retrieve data from the API and construct the item
 * @param {object} item 
 * @param {element} cartListAnchor 
 */
async function constructItem(item, cartListAnchor){
    const localItem = item;
    const itemDataFromAPI = await getItemFromID(localItem.id);
    const itemBlock = document.createElement('article');
    itemBlock.classList.add('cart__item');
    itemBlock.setAttribute('data-id', localItem.id);
    itemBlock.setAttribute('data-color', localItem.color);

    itemBlock.appendChild(constructItemImage(itemDataFromAPI.imageUrl, itemDataFromAPI.altTxt));
    itemBlock.appendChild(constructItemContent(itemDataFromAPI, localItem));
    cartListAnchor.appendChild(itemBlock);
}

/**
 * @description Get the item from the API by its ID
 * @param {string} id
 */
 async function getItemFromID(id) {

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
        const data = await response.json();
        return(data);
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

/**
 * @description Construct the image of the item
 * @param {string} imageUrl 
 * @param {string} altTxt 
 * @returns  HTML element
 */
function constructItemImage(imageUrl, altTxt) {
    const itemImageAnchor = document.createElement('div');
        itemImageAnchor.classList.add('cart__item__img');
    const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = altTxt;
    itemImageAnchor.appendChild(image);
    return itemImageAnchor;
}

/**
 * @description Construct the content of the item
 * @param {object} itemDataFromAPI 
 * @param {object} localItem 
 * @returns  HTML element
 */
function constructItemContent(itemDataFromAPI, localItem) {
    const itemContentAnchor = document.createElement('div');
        itemContentAnchor.classList.add('cart__item__content');
    itemContentAnchor.appendChild(constructItemDescription(itemDataFromAPI, localItem));
    itemContentAnchor.appendChild(constructItemSettings(localItem));
    
    return itemContentAnchor;
}

/**
 * @description Construct the description of the item
 * @param {object} itemDataFromAPI 
 * @param {object} localItem 
 * @returns HTML element
 */
function constructItemDescription(itemDataFromAPI, localItem){
    const itemDescriptionBlock = document.createElement('div');
        itemDescriptionBlock.classList.add('cart__item__content__description');
    const itemTitle = document.createElement('h2');
        itemTitle.textContent = itemDataFromAPI.name;
    const itemColor = document.createElement('p');
        itemColor.textContent = localItem.color;
    const itemPrice = document.createElement('p');
        itemPrice.textContent = Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 3 }).format(itemDataFromAPI.price) + '€';

    itemDescriptionBlock.appendChild(itemTitle);
    itemDescriptionBlock.appendChild(itemColor);
    itemDescriptionBlock.appendChild(itemPrice);

    return itemDescriptionBlock;
}

/**
 * Construct the settings of the item
 * @param {object} localItem 
 * @returns  HTML element
 */
function constructItemSettings(localItem){
    const itemSettingsBlock = document.createElement('div');
        itemSettingsBlock.classList.add('cart__item__content__settings');
    itemSettingsBlock.appendChild(constructSettingQuantity(localItem));
    itemSettingsBlock.appendChild(constructItemDeleteButton());

    return itemSettingsBlock;
}

/**
 * Construct the quantity of the item
 * @param {object} localItem 
 * @returns HTML element
 */
function constructSettingQuantity(localItem){
    const itemQuantity = document.createElement('div');
        itemQuantity.classList.add('cart__item__content__settings__quantity');
    const itemQuantityLabel = document.createElement('label');
        itemQuantityLabel.setAttribute('for', 'itemQuantity');
        itemQuantityLabel.textContent = 'Qté :';
    const itemQuantityInput = document.createElement('input');
        itemQuantityInput.setAttribute('type', 'number');
        itemQuantityInput.setAttribute('name', 'itemQuantity');
        itemQuantityInput.setAttribute('id', 'itemQuantity');
        itemQuantityInput.setAttribute('min', '1');
        itemQuantityInput.setAttribute('max', '100');
        itemQuantityInput.setAttribute('value', parseInt(localItem.quantity));
    itemQuantity.appendChild(itemQuantityLabel);
    itemQuantity.appendChild(itemQuantityInput);

    itemQuantityInput.addEventListener('change', (event) => {
        updateQuantity(event, getItemIdentificationFromElement(itemQuantity));
    });

    return itemQuantity;
}

/**
 * @description Update the quantity of the item
 * @param {html element} event 
 * @param {object} itemIdentification 
 */
function updateQuantity(event, itemIdentification){
    const newQuantity = event.target.value;
    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart[itemIndex].quantity = newQuantity.toString();
    localStorage.setItem('cart', JSON.stringify(cart));

    displayTotalPrice();
    calculateTotalQuantity();
}

/**
 * @description Construct the delete button of the item
 * @returns HTML element
 */
function constructItemDeleteButton(){
    const itemDeleteButton = document.createElement('div');
        itemDeleteButton.classList.add('cart__item__content__settings__delete');
    const itemDeleteButtonText = document.createElement('p');
        itemDeleteButtonText.classList.add('deleteItem');
        itemDeleteButtonText.textContent = 'Supprimer';
    itemDeleteButton.appendChild(itemDeleteButtonText);

    
    itemDeleteButton.addEventListener('click', () => {
        deleteItemByID(getItemIdentificationFromElement(itemDeleteButton));
    });

    return itemDeleteButton;
}

/**
 * @description Delete the item from the cart
 * @param {object} itemIdentification 
 */
function deleteItemByID(itemIdentification){
    console.log("delete item " + itemIdentification.id + " " + itemIdentification.color);

    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));

    refreshCartView();
}

/**
 * @description Get the identification of the item from the HTML element
 * @param {html element} element 
 * @returns object
 */
function getItemIdentificationFromElement(element){
    const itemID = element.closest('article').getAttribute('data-id');
    const itemColor = element.closest('article').getAttribute('data-color');

    const itemIdentification = {
        id: itemID,
        color: itemColor
    }

    return itemIdentification;
}

/**
 * @description Refresh the cart view
 */
function refreshCartView(){
    const cartListAnchor = document.getElementById('cart__items');
    const cartListChildren = cartListAnchor.children;
    for (let i = cartListChildren.length - 1; i >= 0; i--) {
        cartListChildren[i].remove();
    };

    createCartElement(getCart());
    displayTotalPrice();
    calculateTotalQuantity();
}

/**
 * @description Display the total price of the cart
 */
function displayTotalPrice(){
    const totalPrice = document.getElementById('totalPrice');
    totalPrice.textContent = Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 3 }).format(calculateTotalPrice());
}

/**
 * @description Calculate the total price of the cart
 * @returns total price of the cart
 */
function calculateTotalPrice(){
    let cart = getCart();
    let totalPrice = 0;
    cart.forEach((item) => {
        totalPrice += parseInt(item.quantity) * item.price;
    });
    return totalPrice;
}

/**
 * @description Calculate the total quantity of the cart
 */
function calculateTotalQuantity(){
    const cart = getCart();
    let totalArticles = 0;
    cart.forEach((item) => {
        totalArticles += parseInt(item.quantity);
    });

    const cartTotal = document.getElementById('totalQuantity');
    cartTotal.textContent = totalArticles;
}

/**
 * @description bind the event to the form
 */
function bindFormModifications(){
    handleEmailInput();
    handleFirstNameInput();
    handleLastNameInput();
    handleAddressInput();
    handleCityInput();

    const orderButton = document.getElementById('order');
    orderButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleOrderClick();
    });
}

function handleEmailInput(){
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('change', () => {
        validateEmail(emailInput) ? emailSuccess() : emailError();
    });
    emailInput.addEventListener('blur', () => {
        validateEmail(emailInput) ? emailSuccess() : emailError();
    });
}

/**
 * @description Handle first name input
 */
 function handleFirstNameInput(){
    const firstNameInput = document.getElementById('firstName');
    firstNameInput.addEventListener('change', () => {
        validateName(firstNameInput.value) ? firstNameSuccess() : firstNameError();
    });
    firstNameInput.addEventListener('blur', () => {
        validateName(firstNameInput.value) ? firstNameSuccess() : firstNameError();
    });
}

/**
 * @description Handle last name input
 */
function handleLastNameInput(){
    const lastNameInput = document.getElementById('lastName');
    lastNameInput.addEventListener('change', () => {
        validateName(lastNameInput.value) ? lastNameSuccess() : lastNameError();
    });
    lastNameInput.addEventListener('blur', () => {
        validateName(lastNameInput.value) ? lastNameSuccess() : lastNameError();
    });
}

/**
 * @description Handle events from address input
 */
function handleAddressInput(){
    const addressInput = document.getElementById('address');
    addressInput.addEventListener('change', () => {
        validateAddress(addressInput) ? addressSuccess() : addressError();
    });
    addressInput.addEventListener('blur', () => {
        validateAddress(addressInput) ? addressSuccess() : addressError();
    });
}

function handleCityInput(){
    const cityInput = document.getElementById('city');
    cityInput.addEventListener('change', () => {
        validateName(cityInput.value) ? citySuccess() : cityError();
    });
    cityInput.addEventListener('blur', () => {
        validateName(cityInput.value) ? citySuccess() : cityError();
    });
}

/**
 * @description check if the email is valid
 * @param {HTML element} anchor 
 * @returns bool
 */
function validateEmail(anchor){
    const email = anchor.value;
    const emailIsValid = email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
    return emailIsValid;
}

/**
 * @description Display the error message for the email
 */
function emailError(){
    const emailErrorMsg = document.getElementById('emailErrorMsg');
    emailErrorMsg.textContent = 'Veuillez entrer une adresse email valide';
}

/**
 * @description Display the success message for the email
 */
function emailSuccess(){
    const emailErrorMsg = document.getElementById('emailErrorMsg');
    emailErrorMsg.textContent = '';
}

/**
 * @description check if the name is valid
 * @param {string} nameToCheck 
 * @returns bool
 */
function validateName(nameToCheck){
    const nameIsValid = nameToCheck.match(/^[a-zA-Z]+$/g);
    return nameIsValid;
}

/**
 * @description Display the error message for the first name
 */
function firstNameError(){
    const firstNameErrorMsg = document.getElementById('firstNameErrorMsg');
    firstNameErrorMsg.textContent = 'Veuillez entrer un prénom valide';
}

/**
 * @description Display the success message for the first name
 */
function firstNameSuccess(){
    const firstNameErrorMsg = document.getElementById('firstNameErrorMsg');
    firstNameErrorMsg.textContent = '';
}

/**
 * @description Display the error message for the last name
 */
function lastNameError(){
    const lastNameErrorMsg = document.getElementById('lastNameErrorMsg');
    lastNameErrorMsg.textContent = 'Veuillez entrer un nom valide';
}

/**
 *  @description Display the success message for the last name
 */
function lastNameSuccess(){
    const lastNameErrorMsg = document.getElementById('lastNameErrorMsg');
    lastNameErrorMsg.textContent = '';
}

/**
 * @description check if the address is valid
 * @param {HTML element} anchor 
 * @returns bool
 */
function validateAddress(anchor){
    const address = anchor.value;
    const addressIsValid = address.match(/^[a-zA-Z0-9\s,'-]*$/g) && address.length > 5; //No weird character, juste letters, numbers and spaces
    return addressIsValid;
}

/**
 * @description Display the error message for the address
 */
function addressError(){
    const addressErrorMsg = document.getElementById('addressErrorMsg');
    addressErrorMsg.textContent = 'Veuillez entrer une adresse valide';
}

/**
 * @description Display the success message for the address
 */
function addressSuccess(){
    const addressErrorMsg = document.getElementById('addressErrorMsg');
    addressErrorMsg.textContent = '';
}

/**
 * @description Display the error message for the city
 */
function cityError(){
    const cityErrorMsg = document.getElementById('cityErrorMsg');
    cityErrorMsg.textContent = 'Veuillez entrer une ville valide';
}

/**
 * @description Display the success message for the city
 */
function citySuccess(){
    const cityErrorMsg = document.getElementById('cityErrorMsg');
    cityErrorMsg.textContent = '';
}

/**
 * @description Handle the click on the order button
 */
function handleOrderClick(){
    const emailInput = document.getElementById('email');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');

    validateEmail(emailInput) ? emailSuccess() : emailError();
    validateName(firstNameInput.value) ? firstNameSuccess() : firstNameError();
    validateName(lastNameInput.value) ? lastNameSuccess() : lastNameError();
    validateAddress(addressInput) ? addressSuccess() : addressError();
    validateName(cityInput.value) ? citySuccess() : cityError();

        if(emailIsValid && firstNameIsValid && lastNameIsValid && addressIsValid && cityIsValid){
            const contact = {
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                address: addressInput.value,
                city: cityInput.value,
                email: emailInput.value
            }
            const products = getCart().map((item) => item.id);
            const order = {
                contact,
                products
            }
            sendOrder(order);
        }
}

/**
 * @description Send the order to the server
 * @param {array of object} order 
 */
async function sendOrder(order){
    console.log(order);
    try{
        const response = await fetch('http://localhost:3000/api/products/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });
        const data = await response.json();
        deleteCart();
        window.location.href = `confirmation.html?orderId=${data.orderId}`;
    }
    catch(error){
        console.log(error);
    }
}

function deleteCart(){
    localStorage.removeItem('cart');
}