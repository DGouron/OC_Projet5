
const addNewItem = (item, parentRef) => {
    parentRef.appendChild(constructItemLink(item));
};

fetch('http://localhost:3000/api/products')
.then(response => response.json())
.then(data => {
    const itemsList = document.getElementById('items');
    data.map(item => {
        addNewItem(item, itemsList);
    });
});

function constructItemLink(item) {
    const link = document.createElement('a');
    link.href = `./product.html?id=${item._id}`;
    link.appendChild(constructItemArticle(item));
    return link;
}

function constructItemArticle(item) {
    const article = document.createElement('article');
        article.appendChild(constructItemImage(item.imageUrl, item.altTxt));
        article.appendChild(constructItemName(item.name));
        article.appendChild(constructItemDescription(item.description));
    return article;
}

function constructItemImage(imageLink, alternativeText) {
    const image = document.createElement('img');
        image.src = imageLink;
        image.alt = alternativeText;
    return image;
}

function constructItemName(itemName) {
    const name = document.createElement('h3');
        name.textContent = itemName;
        name.classList.add('productName');
    return name;
}

function constructItemDescription(itemDescription) {
    const description = document.createElement('p');
        description.textContent = itemDescription;
        description.classList.add('productDescription');
    return description;
}
