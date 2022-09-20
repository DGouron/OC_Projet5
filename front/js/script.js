
/**
 * Add a new item to the DOM
 * @param {object} item 
 * @param {element} parentRef 
 */
const addNewItem = (item, parentRef) => {
    parentRef.appendChild(constructItemLink(item));
};

/**
 * Fetch the data from the API
 */
document.addEventListener('DOMContentLoaded', () => {
    getItems();
});

/**
 * Get all items from the API
 */
async function getItems(){
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if(!response.ok){//lever une erreur ici
            throw new Error('Erreur HTTP: ' + response.status);
        }

        const data = await response.json();

        const itemsList = document.getElementById('items');

        for (const item of data) {
            addNewItem(item, itemsList);
        }

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

/**
 * Generate a link from an item
 * @param {object} item 
 * @returns HTML Element
 */
function constructItemLink(item) {
    const link = document.createElement('a');
    link.href = `./product.html?id=${item._id}`;
    link.appendChild(constructItemArticle(item));
    return link;
}

/**
 * Generate an article from an item
 * @param {object} item 
 * @returns HTML Element
 */
function constructItemArticle(item) {
    const article = document.createElement('article');
        article.appendChild(constructItemImage(item.imageUrl, item.altTxt));
        article.appendChild(constructItemName(item.name));
        article.appendChild(constructItemDescription(item.description));
    return article;
}

/**
 *  Generate an image from an item
 * @param {string} imageLink 
 * @param {string} alternativeText 
 * @returns HTML Element
 */
function constructItemImage(imageLink, alternativeText) {
    const image = document.createElement('img');
        image.src = imageLink;
        image.alt = alternativeText;
    return image;
}

/**
 * Generate a name from an item
 * @param {string} itemName 
 * @returns 
 */
function constructItemName(itemName) {
    const name = document.createElement('h3');
        name.textContent = itemName;
        name.classList.add('productName');
    return name;
}

/**
 * Generate a description from an item
 * @param {string} itemDescription 
 * @returns 
 */
function constructItemDescription(itemDescription) {
    const description = document.createElement('p');
        description.textContent = itemDescription;
        description.classList.add('productDescription');
    return description;
}
