const params = new URLSearchParams(window.location.search);
const productID = params.get('id');


const addItemInformations = (item) => {
    const itemImageAnchor = document.getElementsByClassName('item__img')[0];
        itemImageAnchor.appendChild(constructItemImage(item.imageUrl, item.altTxt));
    window.document.title = item.name;
    constructItemTitle(item.name);
    constructItemPrice(item.price);
    constructItemDescription(item.description);
    constructItemColors(item.colors);
}

fetch('http://localhost:3000/api/products/' + productID)
.then(response => response.json())
.then(data => {
    addItemInformations(data);
    bindAddToCartButton();
})
.catch(error => console.log(error));


function constructItemImage(imageLink, alternativeText) {
    const image = document.createElement('img');
        image.src = imageLink;
        image.alt = alternativeText;
    return image;
}

function constructItemTitle(title) {
    const anchor = document.getElementById('title');
        anchor.textContent = title;
}

function constructItemPrice(price){
    const anchor = document.getElementById('price');
        anchor.textContent = price;
}

function constructItemDescription(description){
    const anchor = document.getElementById('description');
        anchor.textContent = description;
}

function constructItemColors(colors){
    const anchor = document.getElementById('colors');
    colors.map(color => {
        const newColorOption = document.createElement('option');
            newColorOption.value = color;
            newColorOption.textContent = color;
        anchor.appendChild(newColorOption);
    });
}

function bindAddToCartButton() {
    const button = document.getElementById('addToCart');
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const quantity = document.getElementById('quantity').value;
        const color = document.getElementById('colors').value;
        const item = {
            id: productID,
            quantity: quantity,
            color: color
        }
        addToCart(item);
    });
}

function addToCart(item) {
    confirmAddToCart(item);
}

function confirmAddToCart(item) {
    const confirmation = document.getElementById('addToCartConfirmation');
    confirmation.classList.remove('hidden');
    const isMultiple = item.quantity > 1 ? 's' : ''; 
    confirmation.textContent =  item.quantity + ' produit' + isMultiple +  ' ajouté' +  isMultiple +' au panier !';

    setTimeout(() => {
        confirmation.classList.add('hidden');
    }, 3000);
}