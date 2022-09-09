/**
 * Fetch the data from the API
 */
document.addEventListener('DOMContentLoaded', () => {
  createCartElement(getCart());
  displayTotalPrice();
  calculateTotalQuantity();
});

function getCart() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return cart;
}
function getTotalPrice() {
    const totalPrice = JSON.parse(localStorage.getItem('totalPrice'));
    return totalPrice;
}
function createCartElement(cart){
    const cartList = document.getElementById('cart__items');
    for (const item of cart) {
        constructItem(item, cartList);
    }
}

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
 * Get the item from the API by its ID
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
 * Construct the image of the item
 * @param {string} imageUrl 
 * @param {string} altTxt 
 * @returns 
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
 * Construct the content of the item
 * @param {object} itemDataFromAPI 
 * @param {object} localItem 
 * @returns 
 */
function constructItemContent(itemDataFromAPI, localItem) {
    const itemContentAnchor = document.createElement('div');
        itemContentAnchor.classList.add('cart__item__content');
    itemContentAnchor.appendChild(constructItemDescription(itemDataFromAPI, localItem));
    itemContentAnchor.appendChild(constructItemSettings(localItem));
    
    return itemContentAnchor;
}

/**
 * Construct the description of the item
 * @param {object} itemDataFromAPI 
 * @param {object} localItem 
 * @returns 
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
 * @returns 
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
 * @returns 
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

function updateQuantity(event, itemIdentification){
    const newQuantity = event.target.value;
    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart[itemIndex].quantity = newQuantity.toString();
    localStorage.setItem('cart', JSON.stringify(cart));

    displayTotalPrice();
    calculateTotalQuantity();
}

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

function deleteItemByID(itemIdentification){
    console.log("delete item " + itemIdentification.id + " " + itemIdentification.color);

    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemIdentification.id && item.color === itemIdentification.color);
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));

    refreshCartView();
}

function getItemIdentificationFromElement(element){
    const itemID = element.closest('article').getAttribute('data-id');
    const itemColor = element.closest('article').getAttribute('data-color');

    const itemIdentification = {
        id: itemID,
        color: itemColor
    }

    return itemIdentification;
}

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

function displayTotalPrice(){
    const totalPrice = getTotalPrice();
    const cartTotal = document.getElementById('totalPrice');
    console.log(totalPrice);
    cartTotal.textContent = Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 3 }).format(totalPrice);
}

function calculateTotalQuantity(){
    const cart = getCart();
    let totalArticles = 0;
    cart.forEach((item) => {
        totalArticles += parseInt(item.quantity);
    });

    const cartTotal = document.getElementById('totalQuantity');
    cartTotal.textContent = totalArticles;
}