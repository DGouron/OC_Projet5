const params = new URLSearchParams(window.location.search);


const addItemInformations = (item) => {
    const itemImageAnchor = document.getElementsByClassName('item__img')[0];
        itemImageAnchor.appendChild(constructItemImage(item.imageUrl, item.altTxt));
    constructItemTitle(item.name);
    constructItemPrice(item.price);
    constructItemDescription(item.description);
    constructItemColors(item.colors);
}

fetch('http://localhost:3000/api/products/' + params.get('id'))
.then(response => response.json())
.then(data => {
    addItemInformations(data);
});


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