const cardObjectDefinitions = [
    { id: 1, imagePath: '/images/card-KingHearts.png' },
    { id: 2, imagePath: '/images/card-JackClubs.png' },
    { id: 3, imagePath: '/images/card-QueenDiamonds.png' },
    { id: 4, imagePath: '/images/card-AceSpades.png' },
    
]

const cardBackImgPath = '/images/card-back-blue.png'

const cardContainerElem = document.querySelector('.card-container')

function createCard(cardItem) {
    // create a div elements that make up a card 
    const cardElem = createElement('div')
    const cardInnerElem = createElement('div')
    const cardFrontElem = createElement('div')
    const cardBackElem = createElement('div')


    // create a  front and back images for a card
    const cardFrontImg = createElement('img')
    const cardBackImg = createElement('img')

    // add class and id to card elements
    addClassToElement(cardElem, 'card')
    addIdToElement(cardElem, cardItem.id)

    // add class to inner card elements
    addClassToElement(cardInnerElem, 'card-inner')

    // add class to front card elemment
    addClassToElement(cardBackElem, 'card-front')

    //add src attribute and appropriate value to img element -back of card
    addSrcToImageElem(cardBackElem, cardBackImgPath)

    // add src attributes and appropriate value to img element - front of card
    addSrcToImageElem(cardFrontElem, cardItem.imagePath)

    // assign class to back image element of back of card
    addClassToElement(cardBackElem, 'card-img')

    //add front image element as child element to back card element
    addChildElement(cardFrontElem, cardFrontImg)

    // add back image element as child element to back card element
    addChildElement(cardBackElem, cardBackImg);

    // add front card element as child element to inner card to inner card element
    addChildElement(cardInnerElem, cardFrontElem)

    // add back card element as child element to inner to inner card element
    addChildElement(cardInnerElem, cardBackElem)

    // add inner card element as child element to card element
    addChildElement(cardElem, cardInnerElem)

    // 
}

function createElement(elemType) {
    return document.createElement(elemType)
}

function addClassToElement(elem, className) {
    elem.classList.add(className)
}

function addIdToElement(elem, id) {
    elem.id = id
}

function addSrcToImageElem(imgElem, src) {
    imgElem.src =src
}

function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}