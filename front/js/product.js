

/**
 * Fetch the data from the API
 */
 document.addEventListener('DOMContentLoaded', () => {
    getItem();
});

const addItemInformations = (item) => {
    const itemImageAnchor = document.getElementsByClassName('item__img')[0];
        itemImageAnchor.appendChild(constructItemImage(item.imageUrl, item.altTxt));
    window.document.title = item.name;
    constructItemTitle(item.name);
    constructItemPrice(item.price);
    constructItemDescription(item.description);
    constructItemColors(item.colors);
}

/**
 * Get the item from the API
 */
async function getItem() {
    const params = new URLSearchParams(window.location.search);
    const productID = params.get('id');

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productID}`);
        const data = await response.json();
        addItemInformations(data);
        bindAddToCartButton(productID);
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

/**
 * Generate an image from an item
 * @param {string} imageLink 
 * @param {string} alternativeText 
 * @returns 
 */
function constructItemImage(imageLink, alternativeText) {
    const image = document.createElement('img');
        image.src = imageLink;
        image.alt = alternativeText;
    return image;
}

/**
 * Generate a title from an item
 * @param {string} title 
 */
function constructItemTitle(title) {
    const anchor = document.getElementById('title');
        anchor.textContent = title;
}

/**
 * Generate a price from an item
 * @param {number} price 
 */
function constructItemPrice(price){
    const anchor = document.getElementById('price');
        anchor.textContent = price;
}

/**
 * Generate a description from an item
 * @param {string} description 
 */
function constructItemDescription(description){
    const anchor = document.getElementById('description');
        anchor.textContent = description;
}

/**
 * Generate select from colors of an item
 * @param {array} colors 
 */
function constructItemColors(colors){
    const anchor = document.getElementById('colors');
    colors.map(color => {
        const newColorOption = document.createElement('option');
            newColorOption.value = color;
            newColorOption.textContent = color;
        anchor.appendChild(newColorOption);
    });
}

/**
 * Bind the add to cart button
 */
function bindAddToCartButton(productID) {
    const button = document.getElementById('addToCart');
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const quantity = document.getElementById('quantity').value;
        if(quantity > 0) {
            const color = document.getElementById('colors').value;
            const item = {
                id: productID,
                quantity: quantity,
                color: color
            }
            addToCart(item);
        }
    });
}

function addToCart(item) {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    let cart = localStorage.getItem('cart');
    cart = JSON.parse(cart);

    if(getIndexOfItem(item, cart) !== -1) {        //Ajouter la quantité
        const indexOfItem = getIndexOfItem(item, cart);
        const newQuantity = parseInt(cart[indexOfItem].quantity) + parseInt(item.quantity);
        cart[indexOfItem].quantity = newQuantity.toString();
        localStorage.setItem('cart', JSON.stringify(cart));
    }else{
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    confirmAddToCart(item);
}

/**
 * Return index of an item in the cart whit the same id and color
 * @param {object} item 
 * @returns 
 */
function getIndexOfItem(item, cart) {
    let index = -1;
    for (let index = 0; index < cart.length; index++) {
        const element = cart[index];
        if(element.id === item.id && element.color === item.color){
            return index;
        }
    }

    return index;
}

/**
 * Confirm the add to cart event to the crawler
 * @param {object} item 
 */
function confirmAddToCart(item) {
    const confirmation = document.getElementById('addToCartConfirmation');
    confirmation.classList.remove('hidden');
    const isMultiple = item.quantity > 1 ? 's' : ''; 
    confirmation.textContent =  item.quantity + ' produit' + isMultiple +  ' ajouté' +  isMultiple +' au panier !';

    setTimeout(() => {
        confirmation.classList.add('hidden');
    }, 3000);
}