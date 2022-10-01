/**
 * Fetch the data from the API
 */
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('cart') !== null && localStorage.getItem('cart') !== '[]'){
        createCartElement(getLocalCart());
        calculateTotalQuantity();
        bindFormModifications();
    }else{
        displayEmptyCart();
    }
});
/**
 * @description Remove the form and the title and display the empty cart message
 */
function displayEmptyCart(){
    document.querySelector('.cart').remove();
    const container = document.querySelector('.cartAndFormContainer');
    container.children[0].remove();
    const messageView = document.createElement('h1');
    messageView.textContent = 'Votre panier est vide';
    container.appendChild(messageView);
}
/**
 * @description Get all objects from the cart
 * @returns array of objects
 */
function getLocalCart() {
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
    itemBlock.setAttribute('id', getUniqueID(localItem));

    itemBlock.appendChild(constructItemImage(itemDataFromAPI.imageUrl, itemDataFromAPI.altTxt));
    itemBlock.appendChild(constructItemContent(itemDataFromAPI, localItem));
    cartListAnchor.appendChild(itemBlock);
    displayTotalPrice();
}

/**
 * @description Get the item from the API by its ID
 * @param {string} id
 */
 async function getItemFromID(id) {

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
        const data = await response.json();
        return data;
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
        itemPrice.textContent = itemDataFromAPI.price + '€';
        itemPrice.classList.add('item__price');

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
    const itemQuantityContainer = document.createElement('div');
        itemQuantityContainer.classList.add('cart__item__content__settings__quantity');
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
    itemQuantityContainer.appendChild(itemQuantityLabel);
    itemQuantityContainer.appendChild(itemQuantityInput);

    itemQuantityInput.addEventListener('change', (event) => {
        const itemQuantityFromInput = event.target.value;

        if(itemQuantityFromInput > 100){
            updateQuantityByAmount(100, getItemIdentificationFromElement(itemQuantityContainer));
            itemQuantityInput.value = 100;
            displayTotalPrice();
            return itemQuantityContainer;
        }

        updateQuantityByAmount(event.target.value, getItemIdentificationFromElement(itemQuantityContainer));
    });

    return itemQuantityContainer;
}

/**
 * @description Update the quantity of the item
 * @param {html element} event 
 * @param {object} itemIdentification 
 */
function updateQuantityByAmount(amount, itemIdentification){
    let cart = getLocalCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart[itemIndex].quantity = amount.toString();
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

    let cart = getLocalCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartView = document.getElementById('cart__items');
    const itemToDelete = document.getElementById(getUniqueID(itemIdentification));
    cartView.removeChild(itemToDelete);
    alert("L'item a bien été supprimé du panier");
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
 * 
 * @returns unique ID for cart item
 */
function getUniqueID(item){
    return '_' + item.id+ '_' + item.color;
}

/**
 * @description Refresh the cart view
 */
function refreshCartView(){
    displayTotalPrice();
    calculateTotalQuantity();
}

/**
 * @description Display the total price of the cart
 */
function displayTotalPrice(){
    const totalPriceView = document.getElementById('totalPrice');
    const totalPrice = calculateTotalPrice();
    totalPriceView.textContent = totalPrice !== 0 ? totalPrice  + '€': displayEmptyCart();
}

/**
 * @description Calculate the total price of the cart
 * @returns total price of the cart
 */
function calculateTotalPrice(){
    const allPriceText = document.getElementsByClassName('item__price');
    let totalPrice = 0;
    for (let i = 0; i < allPriceText.length; i++) {
        const price = parseInt(allPriceText[i].textContent);
        const quantity = parseInt(allPriceText[i].closest('article').querySelector('input').value); // get the quantity of the item from the input select
        totalPrice += price * quantity;
    }
    return totalPrice;
}

/**
 * @description Calculate the total quantity of the cart
 */
function calculateTotalQuantity(){
    const cart = getLocalCart();
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
    emailInput.addEventListener('blur', () => {
        isValid('email', emailInput.value);
    });
}

/**
 * @description Handle first name input
 */
 function handleFirstNameInput(){
    const firstNameInput = document.getElementById('firstName');
    firstNameInput.addEventListener('blur', () => {
        isValid('firstname', firstNameInput.value);
    });
}
/**
 * @description Handle last name input
 */
function handleLastNameInput(){
    const lastNameInput = document.getElementById('lastName');
    lastNameInput.addEventListener('blur', () => {
        isValid('lastname', lastNameInput.value);
    });
}
/**
 * @description Handle events from address input
 */
function handleAddressInput(){
    const addressInput = document.getElementById('address');
    addressInput.addEventListener('blur', () => {
        isValid('address', addressInput.value);
    });
}

function handleCityInput(){
    const cityInput = document.getElementById('city');
    cityInput.addEventListener('blur', () => {
        isValid('city', cityInput.value);
    });
}
function isValid(type, value){
    let bIsValid = false;
    switch(type){
        case 'email':
            bIsValid = validateEmail(value);
            bIsValid ? emailSuccess() : emailError();
            return bIsValid;
        case 'firstname':
            bIsValid = validateName(value);
            bIsValid ? firstNameSuccess() : firstNameError();
            return bIsValid;
        case 'lastname':
            bIsValid = validateName(value);
            bIsValid ? lastNameSuccess() : lastNameError();
            return bIsValid;
        case 'address':
            bIsValid = validateAddress(value);
            bIsValid ? addressSuccess() : addressError();
            return bIsValid;
        case 'city':
            bIsValid = validateName(value);
            bIsValid ? citySuccess() : cityError();
            return bIsValid;
        default:
            return bIsValid;
    }
}
/**
 * @description check if the email is valid
 * @param {HTML element} anchor 
 * @returns bool
 */
function validateEmail(email){
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
function validateAddress(address){
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

    if(isValid('email', emailInput.value) && isValid('firstname', firstNameInput.value) && isValid('lastname', lastNameInput.value) 
        && isValid('address', addressInput.value) && isValid('city', cityInput.value)){

        if(preventEmptyValue(firstNameInput.value) && preventEmptyValue(lastNameInput.value) && preventEmptyValue(addressInput.value) && preventEmptyValue(cityInput.value)){
            const contact = {
                firstName: firstNameInput.value,
                lastName: lastNameInput.value,
                address: addressInput.value,
                city: cityInput.value,
                email: emailInput.value
            }
    
            const products = getLocalCart().map((item) => item.id);
            const order = {
                contact,
                products
            }
            sendOrder(order);
        }
    }
}
/**
 * @description Send the order to the server
 * @param {array of object} order 
 */
async function sendOrder(order){
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
function preventEmptyValue(value){
    let bIsValid = true;
        value === '' ? bIsValid = false : bIsValid = true;
        value === null ? bIsValid = false : bIsValid = true;
        typeof value === undefined ? bIsValid = false : bIsValid = true;
    return bIsValid
}