'use strict';

// Global Variables

Product.productArray = [];
var imageUlId = 'productImages';
var concurrentImageSetting = 3;
var maxVotesAllowed = 25;
var totalVotesUsed = 0;

var queuedProducts = [];
var displayedProducts = [];
var postDisplayProducts = [];
var previousDisplayReference = [];

var productListEl = document.getElementById(imageUlId);



// Functions


function Product(name, src, voteTally, timesDisplayed) {

  this.name = name;
  this.imageSrc = src;
  this.voteTally = voteTally || 0;
  this.timesDisplayed = timesDisplayed || 0;
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
  var randIndex = Math.floor(Math.random() * upperBound);
  return randIndex;
}

function moveQueuedProductToDisplay() {
  if (queuedProducts.length === 0) {
    refillProductQueue();
  }
  var randIndex = generateRandomIndex(queuedProducts.length);
  displayedProducts.push(queuedProducts.splice(randIndex, 1)[0]);
}

function generateNewDisplay() {
  while (displayedProducts.length < concurrentImageSetting) {
    moveQueuedProductToDisplay();
    if (previousDisplayReference.includes(displayedProducts[displayedProducts.length - 1])) {
      queuedProducts.push(displayedProducts.pop());
    }
  }
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
    var trEl = document.createElement('tr');
    var rowData = [Product.productArray[i].name, Product.productArray[i].voteTally, Product.productArray[i].timesDisplayed];
    for (var j in rowData) {
      var singleResultLi = document.createElement('td');
      singleResultLi.textContent = rowData[j];
      trEl.appendChild(singleResultLi);

    }
    voteResultsEl.appendChild(trEl);
  }
}

function logVotingEvent(event) {
  if (event.target.tagName === 'IMG') {
    for (var i = 0; i < displayedProducts.length; i++) {
      displayedProducts[i].incrementTimesDisplayed();
      if (event.target.getAttribute('src') === displayedProducts[i].imageSrc) {
        displayedProducts[i].incrementVotetally();
      }
    }
    refreshDisplayedProducts();

    totalVotesUsed++;

    localStorage.setItem('listOfProducts', JSON.stringify(Product.productArray));
    localStorage.setItem('totalVotesUsed', totalVotesUsed);

    if (totalVotesUsed === maxVotesAllowed) {
      productListEl.removeEventListener('click', logVotingEvent);
      productListEl.style.display = 'none';
      displayFinalTally();
      renderTallyChart();
      console.log(document.getElementsByTagName('main'));
      document.getElementsByTagName('main')[0].style.backgroundColor = 'black';
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

  var backgroundPalette = [
    'rgba(255, 99, 132, 0.5)',
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)'
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
  var myChart = new Chart(ctx, {
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
        type: 'bar',
        label: 'Total Displays',
        data: productDisplays,
        backgroundColor: bgColors,
        borderColor: bgBorders,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          stacked: true
        }]
      }
    }
  });
}

// Function Calls

if (localStorage.getItem('listOfProducts')) {
  var listOfProducts = JSON.parse(localStorage.getItem('listOfProducts'));
  for (var i = 0; i < listOfProducts.length; i++) {
    new Product(
      listOfProducts[i].name,
      listOfProducts[i].imageSrc,
      listOfProducts[i].voteTally,
      listOfProducts[i].timesDisplayed
    );
  }
} else {
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
}

productListEl.addEventListener('click', logVotingEvent);

refreshDisplayedProducts();






























