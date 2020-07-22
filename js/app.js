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

Product.productArray = []; // list of all products
var imageUlId = 'productImages';
var concurrentImageSetting = 3;
var maxVotesAllowed = 25; // default to 25
var totalVotesUsed = 0;

var queuedProducts = []; // list of products waiting for display
var displayedProducts = []; // list of products currently on display
var postDisplayProducts = []; // list of already viewed products
var previousDisplayReference = []; // list of the last displayedProducts

var productListEl = document.getElementById(imageUlId);



// Functions

function Product(name, src) {

  this.name = name;
  this.imageSrc = src;
  this.voteTally = 0;
  this.timesDisplayed = 0;
  this.imgNode = document.createElement('img');
  this.liNode = document.createElement('li');

  Product.productArray.push(this);
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
  previousDisplayReference = displayedProducts;
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
  while (displayedProducts.length < concurrentImageSetting) {
    moveQueuedProductToDisplay();
    // reference for how to check if value is in an array without looping https://stackoverflow.com/questions/237104/how-do-i-check-if-an-array-includes-a-value-in-javascript

    // reference for accessing end of array https://stackoverflow.com/questions/3216013/get-the-last-item-in-an-array
    // checks if the last product added was displayed last round and moves it back into the queue if so
    if (previousDisplayReference.includes(displayedProducts[displayedProducts.length - 1])) {
      queuedProducts.push(displayedProducts.pop());
    }
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
  for (var i = 0; i < Product.productArray.length; i++) {
    var singleResultLi = document.createElement('li');
    singleResultLi.textContent = Product.productArray[i].name + ' had ' + Product.productArray[i].voteTally + ' votes and was shown ' + Product.productArray[i].timesDisplayed + ' times';
    voteResultsEl.appendChild(singleResultLi);
  }
}

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
      productListEl.style.display = 'none';
      displayFinalTally();
      renderTallyChart();
    }
  }
}


function renderTallyChart() {
  document.getElementById('tallyChart').style.display = 'block';

  var productLabels = [];
  for (var i = 0; i < Product.productArray.length; i++) {
    productLabels.push(Product.productArray[i].name);
  }

  var productDisplays = [];
  for (i = 0; i < Product.productArray.length; i++) {
    productDisplays.push(Product.productArray[i].timesDisplayed);
  }

  var productVotes = [];
  for (i = 0; i < Product.productArray.length; i++) {
    productVotes.push(Product.productArray[i].voteTally);
  }

  // using modulo to repeat over array https://stackoverflow.com/questions/59691890/chart-js-repeating-colors
  var backgroundPalette = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
  ];

  var bgColors = [];
  for (i = 0; i < Product.productArray.length; i++) {
    bgColors.push(backgroundPalette[i % backgroundPalette.length]);
  }

  var borderPalette = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ];

  var bgBorders = [];
  for (i = 0; i < Product.productArray.length; i++) {
    bgBorders.push(borderPalette[i % borderPalette.length]);
  }

  var ctx = document.getElementById('tallyChart').getContext('2d');
  var myChart = new Chart(ctx, { // eslint-disable-line
    type: 'bar',
    data: {
      labels: productLabels,
      datasets: [{
        label: 'Total Votes',
        data: productVotes,
        backgroundColor: bgColors,
        borderColor: bgBorders,
        borderWidth: 1
      }, {
        // Marchael helped me figure this part out
        type: 'line',
        label: 'Total Displays',
        data: productDisplays,
        // backgroundColor: bgColors,
        // borderColor: bgBorders,
        // borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

// Function Calls

new Product('bag', 'img/bag.jpg');
new Product('banana', 'img/banana.jpg');
new Product('bathroom', 'img/bathroom.jpg');
new Product('boots', 'img/boots.jpg');
new Product('breakfast', 'img/breakfast.jpg');
new Product('bubblegum', 'img/bubblegum.jpg');
new Product('chair', 'img/chair.jpg');
new Product('cthulhu', 'img/cthulhu.jpg');
new Product('dog-duck', 'img/dog-duck.jpg');
new Product('dragon', 'img/dragon.jpg');
new Product('pen', 'img/pen.jpg');
new Product('pet-sweep', 'img/pet-sweep.jpg');
new Product('scissors', 'img/scissors.jpg');
new Product('shark', 'img/shark.jpg');
new Product('sweep', 'img/sweep.png');
new Product('tauntaun', 'img/tauntaun.jpg');
new Product('unicorn', 'img/unicorn.jpg');
new Product('usb', 'img/usb.gif');
new Product('water-can', 'img/water-can.jpg');
new Product('wine-glass', 'img/wine-glass.jpg');

refreshDisplayedProducts();

productListEl.addEventListener('click', logVotingEvent);

