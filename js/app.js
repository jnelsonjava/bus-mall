'use strict';

/*
The client wants images to display and viewers to be able to vote on their favorite. And the client as a user wants some control over adjusting that display. Plus the client needs metrics, some to display to the visitor who is voting, and I would expect the client needs some specifically for their own purposes.

To start, this needs a few basic steps to get images up and running:

1. Construct objects for each of the products and their images. This object can store things like total votes, total times displayed, and the <img> node itself can be held as a property.

2. There needs to be a way to add and remove images from the <ul> for display. Options would be to actually add and remove them. Another would be to add all image objects as they are instantiated and set their style.display = 'none'. I'm sure that would work but it might be sloppy considering it would end up with a lot of "dead" html. Regardless, a function built to add/remove could always be reworked to adjust display instead.

3. There needs to be an event listener checking for clicks which triggers:
  - logging votes for product images
  - changing images visible for the next vote

That's enough to get started, be liberal with variables for the time being so it's easier to add features later.
*/

// Global Variables

var productArray = []; // list of all products
var imageUlId = 'productImages';
var productDisplayAmountSetting = 3;
// !!!!!!!!!!!! Don't forget to set maxVotesallowed back to 25 !!!!!!!!!!!!
var maxVotesAllowed = 4; // default to 25
var totalVotesUsed = 0;

var queuedProducts = []; // list of products waiting for display
var displayedProducts = []; // list of products currently on display
var postDisplayProducts = []; // list of already viewed products



// Functions

function Product(name, src) {

  this.name = name;
  this.imageSrc = src;
  this.voteTally = 0;
  this.timesDisplayed = 0;
  this.imgNode = document.createElement('img');
  this.liNode = document.createElement('li');

  productArray.push(this);
  queuedProducts.push(this);

  this.fillNodesWithContent();
}

Product.prototype.fillNodesWithContent = function() {
  this.imgNode.src = this.imageSrc;
  this.liNode.appendChild(this.imgNode);
};

Product.prototype.addImgNodeToList = function() {
  var ulEl = document.getElementById(imageUlId);
  ulEl.appendChild(this.liNode);
};

Product.prototype.removeNodeFromList = function() {
  // removing element from its parent https://catalin.red/removing-an-element-with-plain-javascript-remove-method/
  var parentEl = this.liNode.parentNode;
  parentEl.removeChild(this.liNode);
};

Product.prototype.incrementVotetally = function() {
  this.voteTally++;
};

Product.prototype.incrementTimesDisplayed = function() {
  this.timesDisplayed++;
};





function refillProductQueue() {
  for (var i = 0; i < postDisplayProducts.length; i++) {
    queuedProducts.push(postDisplayProducts[i]);
  }
  postDisplayProducts = [];
}

function emptyDisplay() {
  for (var i = 0; i < displayedProducts.length; i++) {
    displayedProducts[i].removeNodeFromList();
    postDisplayProducts.push(displayedProducts[i]);
  }
  displayedProducts = [];
}

function generateRandomIndex(upperBound) {
  // referencing for Math.random() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  var randIndex = Math.floor(Math.random() * upperBound);
  return randIndex;
}

function moveQueuedProductToDisplay() {
  // if queue is empty then refill it from the previously viewed products
  if (queuedProducts.length === 0) {
    refillProductQueue();
  }
  // splice out a random index from the queue and drop it in the display set
  // https://love2dev.com/blog/javascript-remove-from-array/
  var randIndex = generateRandomIndex(queuedProducts.length);
  displayedProducts.push(queuedProducts.splice(randIndex, 1)[0]);
}

function generateNewDisplay() {
  // fill the display array until it has reached its max set amount
  while (displayedProducts.length < productDisplayAmountSetting) {
    moveQueuedProductToDisplay();
  }
  // add the new display to the page
  for (var i = 0; i < displayedProducts.length; i++) {
    displayedProducts[i].addImgNodeToList();
  }
}

function refreshDisplayedProducts() {
  emptyDisplay();
  generateNewDisplay();
}

function displayFinalTally() {
  var voteResultsEl = document.getElementById('voteResults');
  for (var i = 0; i < productArray.length; i++) {
    var singleResultLi = document.createElement('li');
    singleResultLi.textContent = productArray[i].name + ' had ' + productArray[i].voteTally + ' votes and was shown ' + productArray[i].timesDisplayed + 'times';
    voteResultsEl.appendChild(singleResultLi);
  }
}


// Function Calls

new Product('unicorn', 'img/unicorn.jpg');
new Product('shark', 'img/shark.jpg');
new Product('tauntaun', 'img/tauntaun.jpg');
new Product('bag', 'img/bag.jpg');
new Product('cthulhu', 'img/cthulhu.jpg');
new Product('pen', 'img/pen.jpg');




refreshDisplayedProducts();




var productListEl = document.getElementById(imageUlId);
productListEl.addEventListener('click', logVotingEvent);

function logVotingEvent(event) {
  if (event.target.tagName === 'IMG') {
    for (var i = 0; i < displayedProducts.length; i++) {
      // increment the total display amounts for each of the current Product instances
      displayedProducts[i].incrementTimesDisplayed();
      // increment voteTally only for the Product that was directly clicked
      if (event.target.getAttribute('src') === displayedProducts[i].imageSrc) {
        displayedProducts[i].incrementVotetally();
      }
    }
    refreshDisplayedProducts();

    totalVotesUsed++;
    if (totalVotesUsed === maxVotesAllowed) {
      productListEl.removeEventListener('click', logVotingEvent);
      displayFinalTally();
    }
  }
}


// productArray[0].removeNodeFromList();
// productArray[0].addImgNodeToList();






























































