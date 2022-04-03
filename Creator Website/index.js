// Resources Used
// https://stackoverflow.com/questions/30319227/finding-coordinates-of-center-of-rectangle-svg
// https://groups.google.com/g/d3-js/c/PYuJ6RIsBdc
// https://www.softouch.on.ca/svg/rotate1.html
// https://stackoverflow.com/questions/9281199/adding-text-to-svg-document-in-javascript
// https://codepen.io/remi-grumeau/pen/AwdRyM
// https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript
// https://medium.com/swlh/how-to-build-a-roman-numeral-to-integer-function-in-javascript-8298657a26f7
// https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
// https://stackoverflow.com/questions/33780271/export-a-json-object-to-a-text-file

// Lock Screen Scroll
// Just for now
//document.getElementsByTagName('body')[0].style.overflow = 'hidden';

// Variable that keeps track all of the current pieces created
// An array of arrays, each array contains two arrays, both are 2D arrays
// the first one representing the starting side and the second representing the non starting side
// Each element of the 2D arrays are arrays that can have one or two elements themsevles
let iconList = []

// Reference to the current icon element
// Used drawing and removing the current icon when the mouse hovers and exits a grid square
let iconElement = null; 

// Stores the current grid square SVG element the mouse is over
// Used for drawing a new icon when chaning the current icon with the scroll wheel
let currentGridSqure = null;

// Current selected icon, correlates to the indexes of movementIcons
let currentIcon = 0;

// List of available icons where each index is the id of an SVG element
const movementIcons = ["move", "slide", "jump", "jumpSlide", "command"]

// Indicated if the current piece is on the starting side or not
let isStartSide = true;

// Get SVG elements for the starting and non starting side icons
let startSideIcon = document.getElementById("Starting-Side");
let nonStartSideIcon = document.getElementById("Non-Starting-Side");

// Get the SVG element for the entire template
let svg = document.getElementById("svg");
// When the mouse is over the template and the user scrolls, call mouseOnScroll()
svg.addEventListener('wheel', mouseOnScroll);

// Get the SVG element for where the piece name goes
let nameLocation = document.getElementById("Piece-Name");

// Get the SVG element for where the piece icon goes
let pieceIconLocation = document.getElementById("Piece-Icon")

// Get the SVG element for where the player marker is
let playerMarkerLocation = document.getElementById("Starting-Side")

// Get the SVG element for the outer border used to indicate when a
// piece has a special ability
let outerBorderLocation = document.getElementById("Outer-Border");

// Get element for 
let importFileLocation = document.getElementById("importPiececsInput");

// ID number of current piece being worked on
// Used so that multiple pieces can be worked on at a given time
let currentPiece = 0;

// Add event listener for key down that call the keyboard shortcut function
//svg.addEventListener('keydown', keyboardShortcuts);

// Current version of the exporter, isn't needed currently
// though I want to future proof everything just in case 
let exporterVersion = 1;

// Add event listeners for processing new name and ability inputs
let nameInput = document.getElementById("nameInput");
nameInput.addEventListener('change', changeName);
let abilityInput = document.getElementById("abilityInput");
abilityInput.addEventListener('change', changeAbility);

// Initialization function
function init() {
  createNewPieceIndex()
}

function mouseOverGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if(isCenter(gridPos)) return;
  item.style.fill="#ffc"
  let pos = getCenter(item)
  iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
  currentGridSquare = item;
  removeElement(gridPos[0], gridPos[1], iconElement.getAttribute("icon"), false)
}

function mouseOutGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if(isCenter(gridPos)) return;
  item.style.fill="#fff"
  if(iconElement) {
    iconElement.remove();
  }
  currentGridSquare = null;
  restoreElements(gridPos[0], gridPos[1])
}

function clickGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if(isCenter(gridPos)) return;
  item.style.fill="#ff0";
  if(iconElement){
    removeElement(gridPos[0], gridPos[1], iconElement.getAttribute("icon"), true)
    iconList[currentPiece][+ isStartSide][gridPos[0]][gridPos[1]].push(iconElement)
    iconElement = null
  }
}

function mouseOnScroll(event) {
  if(event.deltaY > 0) {
    currentIcon--
  } else if (event.deltaY < 0) {
    currentIcon++
  }
  if(currentIcon >= movementIcons.length) {
    currentIcon = 0
  }
  if(currentIcon < 0) {
    currentIcon = movementIcons.length - 1;
  }

  if(currentGridSquare) {
    let gridPos = currentGridSquare.parentElement.id.split("").slice(1).map(element => parseInt(element));
    
    if(iconElement){
      iconElement.remove()
    }
    let pos = getCenter(currentGridSquare)
    iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
    removeElement(gridPos[0], gridPos[1])
    restoreOppositeType(gridPos[0], gridPos[1], movementIcons[currentIcon])
    
  }
  
}

// Returns if the given grid position is the center of the grid
function isCenter(gridPos) {
  return  (gridPos[0] === 2) && (gridPos[1] === 2);
}

// Returns the x,y position of the center of the given SVG element
function getCenter(item) {
  let bbox = item.getBBox();
  let ctm = item.getTransformToElement(item.nearestViewportElement)
  let cx = bbox.x + (bbox.width/2);
  let cy = bbox.y + (bbox.height/2);
  let pt = item.nearestViewportElement.createSVGPoint();
  pt.x = cx;
  pt.y = cy;
  return pt.matrixTransform(ctm);
}

// Creates the given icon at the given position (pos)
// gridPos is the current position of the icon on the grid
function createIconAt(icon, pos, gridPos, append=true) {
  newIconElement = document.getElementById(icon).cloneNode(true);
  let width = 125;
  if(isFullSize(icon))
    width = 185;
  let cx = pos.x - (width/2);
  let cy = pos.y - (width/2);
  newIconElement.setAttribute("x", cx);
  newIconElement.setAttribute("y", cy);
  newIconElement.setAttribute("width", width);
  newIconElement.setAttribute("height", width);
  newIconElement.setAttribute("id", "");
  newIconElement.setAttribute("icon", icon);
  if(isSlide(icon)) {
    newIconElement.setAttribute("transform", rotateIcon(gridPos, cx, cy, width, width))
  }
  if(append)
    svg.appendChild(newIconElement);
  return newIconElement;
}

// Returns if the icon given is one that needs to be rotated 
function isSlide(icon) {
  return icon === "slide" || icon === "jumpSlide" || icon === "nonJumpSlide"
}

// Returns if the icon given is one that is full sized
function isFullSize(icon) {
  return icon === "command"
}

// Return transform attribute for rotating an icon
function rotateIcon(gridPos, cx, cy, width, height) {
  return "rotate(" + getRotateDegrees(gridPos) +" " + (cx + (width/2)) + " " + (cy + (height/2)) + ")";
}

// Find the rotation degree based on the grid position
function getRotateDegrees(gridPos) {
  switch(gridPos.join()) {
    case "2,1":
      return "0"
    case "3,1":
      return "45"
    case "3,2":
      return "90"
    case "3,3":
      return "135"
    case "2,3":
      return "180"
    case "1,3":
      return "225"
    case "1,2":
      return "270"
    case "1,1":
      return "315"
  }
  return "0"
}

// Remove all of the elements from view at the current grid location
// removeFromList removes them from existance entirely
function removeElement(x,y, newIcon, removeFromList = false) {
  for(let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    if(isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      if(removeFromList)
        iconList[currentPiece][+ isStartSide][x][y].splice(i,1);
    } else if(!isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      if(removeFromList)
        iconList[currentPiece][+ isStartSide][x][y].splice(i,1);
    }
  }
}

// Restores all elements into view at the current grid location
function restoreElements(x,y) {
  for(let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    iconList[currentPiece][+ isStartSide][x][y][i].remove();
    svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
  }
}

// Restores all elements into view at the current grid location
// only elements that are of the opposite icon type of that given.
// Used for when using scrolling to show icons
function restoreOppositeType(x,y,newIcon) {
  for(let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    if(isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
    } else if(!isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
    }
  }
}

// Creates a text element at the position given of the font size given
function createTextAt(text, pos, fontSize) {
  let svgNS = "http://www.w3.org/2000/svg";
  let newText = document.createElementNS(svgNS,"text");
  newText.setAttribute("font-size",fontSize);
  newText.innerHTML = text
  let cx = pos.x
  let cy = pos.y
  newText.setAttribute("x",cx);
  newText.setAttribute("y",cy);
  newText.setAttribute("font-family", "Pieces of Eight")
  newText.setAttribute("text", text)
  svg.appendChild(newText);
  let bbox = newText.getBBox()
  cx -= bbox.width/2
  cy += bbox.height/4
  newText.setAttribute("x",cx);
  newText.setAttribute("y",cy);
  return newText;
}

// Create a text element of the given piece name
function createPieceName(text) {
  if(iconList[currentPiece][2][0])
    iconList[currentPiece][2][0].remove()
  let namePos = getCenter(nameLocation);
  iconList[currentPiece][2][0] = createTextAt(text, namePos, 270);
}

// Create a text element of the given ability number
function createPieceAbilityText(text) {
  if(iconList[currentPiece][2][1])
    iconList[currentPiece][2][1].remove()
  let iconPos = getCenter(pieceIconLocation);
  let namePos = getCenter(nameLocation);
  iconPos.y = namePos.y + 140;
  iconList[currentPiece][2][1] = createTextAt(text, iconPos, 100);
  outerBorderLocation.setAttribute("visibility", text !== "" ? "visable" : "hidden")
}

// Create the piece icon of the given piece name
function createPieceIcon(piece) {
  let iconPos = getCenter(pieceIconLocation);
  let pieceIconElement = document.getElementById(piece).cloneNode(true);
  let width = 370;
  let cx = iconPos.x - (width/2) + 15;
  let cy = iconPos.y;
  pieceIconElement.setAttribute("x", cx);
  pieceIconElement.setAttribute("y", -100);
  pieceIconElement.setAttribute("width", width);
  pieceIconElement.setAttribute("id", "");
  svg.appendChild(pieceIconElement);
}

// Create a new index in iconList for a new piece to be placed in
function createNewPieceIndex() {
  let masterArray = []
  for(let i = 0; i < 2; i++) {
    let blankParentArray = []
    for(let j = 0; j < 5; j++){
      let blankArray = []
      for(let k = 0; k < 5; k++){
        blankArray.push([])
      }
      blankParentArray.push(blankArray)
    } 
    masterArray.push(blankParentArray)
  } 
  let infoArray = [];
  for(let i = 0; i < 3; i++) {
    infoArray.push("");
  }
  masterArray.push(infoArray);
  iconList.push(masterArray); 
}

// Clear all of the icons for the current piece and side from view
function clearBoard() {
  for(let i = 0; i < iconList[currentPiece][+ isStartSide].length; i++) {
    for(let j = 0; j < iconList[currentPiece][+ isStartSide][i].length; j++){
      for(let k = 0; k < iconList[currentPiece][+ isStartSide][i][j].length; k++) {
        iconList[currentPiece][+ isStartSide][i][j][k].remove();
      }
    }
  }
}

// Redraw all of the icons for the current piece and side from view
function drawBoard() {
  for(let i = 0; i < iconList[currentPiece][+ isStartSide].length; i++) {
    for(let j = 0; j < iconList[currentPiece][+ isStartSide][i].length; j++){
      for(let k = 0; k < iconList[currentPiece][+ isStartSide][i][j].length; k++) {
        svg.appendChild(iconList[currentPiece][+ isStartSide][i][j][k]);
      }
    }
  }
}

// Clears all elements that are not on the grid (name, ability icon)
function clearNonBoard() {
  if(iconList[currentPiece][2][0])
    iconList[currentPiece][2][0].remove()
  if(iconList[currentPiece][2][1])
    iconList[currentPiece][2][1].remove()
}

// Draw all elements that are not on the grid (name, ability icon)
function drawNonBoard() {
  if(iconList[currentPiece][2][0])
    svg.appendChild(iconList[currentPiece][2][0])
  if(iconList[currentPiece][2][1]){
    svg.appendChild(iconList[currentPiece][2][1])
    outerBorderLocation.setAttribute("visibility", iconList[currentPiece][2][1].getAttribute("text") !== "" ? "visable" : "hidden")
  } else {
    outerBorderLocation.setAttribute("visibility", "hidden");
  }
}

// Easy macro to create a new piece index and increment the current piece
function createNewPiece() {
  createNewPieceIndex();
  forwardPiece();
}

// Easy macro for switching the side of the current piece
function switchSides() {
  clearBoard()
  isStartSide = !isStartSide;
  showStartSideIcons()
  drawBoard();
}

// Easy macro for changing the visability of the start and non start side icons
function showStartSideIcons() {
  startSideIcon.setAttribute("visibility", isStartSide ? "visable" : "hidden")
  nonStartSideIcon.setAttribute("visibility", !isStartSide ? "visable" : "hidden")
}

// Move forward one piece in the piece array 
function forwardPiece() {
  clearBoard();
  clearNonBoard()
  currentPiece++;
  if(currentPiece >= iconList.length)
    currentPiece = 0;
  isStartSide = true;
  showStartSideIcons()
  drawNonBoard()
  drawBoard();
  clearInputs();
}

// Move backwards one piece in the piece array 
function backwardPiece() {
  clearBoard();
  clearNonBoard()
  currentPiece--;
  if(currentPiece < 0)
    currentPiece = iconList.length - 1;
  isStartSide = true;
  showStartSideIcons();
  drawNonBoard();
  drawBoard();
  clearInputs();
}

function clearInputs() {
  nameInput.value = iconList[currentPiece][2][0] ? iconList[currentPiece][2][0].getAttribute("text") : ""
  abilityInput.value = iconList[currentPiece][2][1] ? romanToInt(iconList[currentPiece][2][1].getAttribute("text")) : ""
}

// Process keyboard inputs 
function keyboardShortcuts(e) {
  switch(e.code){
    case "KeyZ":
      backwardPiece()
      break;
    case "KeyX":
      forwardPiece()
      break;
    case "KeyN":
      createNewPiece()
      break;
    case "KeyS":
      switchSides()
      break;
    case "KeyE":
      exportPieces()
      break;
  }
}

function exportPieces() {
  let object = {}
  object.options = {}
  object.options.exporterVersion = exporterVersion;
  
  object.pieces = []
  for(let i = 0; i < iconList.length; i++) {
    let pieceObject = {};
    let iconArray = [];
    for(let j = 0; j < 2; j++) {
      let sideArray = [];
      for(let x = 0; x < iconList[i][j].length; x++) {
        let xArray = [];
        for(let y = 0; y < iconList[i][j][x].length; y++) {
          let yArray = [];
          for(let k = 0; k < iconList[i][j][x][y].length; k++) {
            yArray.push(iconList[i][j][x][y][k].getAttribute("icon"))
          }
          xArray.push(yArray);
        }
        sideArray.push(xArray);
      }
      iconArray.push(sideArray);
    }
    pieceObject.grid = {}
    pieceObject.grid.startSide = iconArray[1];
    pieceObject.grid.startNonSide = iconArray[0];
    pieceObject.name = iconList[i][2][0] ? iconList[i][2][0].getAttribute("text") : "";
    pieceObject.ability = iconList[i][2][1] ? romanToInt(iconList[i][2][1].getAttribute("text")) : "";
    pieceObject.icon = iconList[i][2][2] ? iconList[i][2][2].getAttribute("text") : "";
    object.pieces.push(pieceObject);
  }
  downloadJSON(object);
}

// Downloads given data as a json file, used for exporter 
function downloadJSON(content) {
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(content)], {type: 'text/plain'});
  a.href = URL.createObjectURL(file);
  a.download = "exportedDuke.json";
  a.click();
}

// Takes in a json file and formats it into a valid object
function importPieces(element) {
  if (element.files.length <= 0)  return;
  let fr = new FileReader();
  fr.onload = function (e) {
    let result = JSON.parse(e.target.result);
    setImportedData(result)
  }
  fr.readAsText(element.files.item(0));
}

// Uses imported JSON object to set the correct variables 
function setImportedData(data) {
  clearBoard();
  iconList = [];
  for(let i = 0; i < data.pieces.length; i++) {
    createNewPieceIndex();
    for(let j = 0; j < data.pieces[i].grid.startSide.length; j++) {
      for(let k = 0; k < data.pieces[i].grid.startSide[j].length; k++) {
        let gridPos = [j,k]
        let gridSquareElement = document.getElementById("X" + gridPos[0] + gridPos[1]);
        console.log(gridSquareElement);
        let gridSquareCenter = getCenter(gridSquareElement)
        for(let l = 0; l < data.pieces[i].grid.startSide[j][k].length; l++){
          iconList[i][1][gridPos[0]][gridPos[1]].push(createIconAt(data.pieces[i].grid.startSide[j][k][l],gridSquareCenter, gridPos, false))
        }
        for(let l = 0; l < data.pieces[i].grid.startNonSide[j][k].length; l++){
          iconList[i][0][gridPos[0]][gridPos[1]].push(createIconAt(data.pieces[i].grid.startNonSide[j][k][l],gridSquareCenter, gridPos, false))
        }
        iconList[i][2][0] = data.pieces.name;
        iconList[i][2][1] = data.pieces.ability;
        iconList[i][2][2] = data.pieces.icon;
      }
    }
  }
  drawBoard();
  drawNonBoard();
}

// Turns number value into roman numerals, used for ability numbers
function romanize (num) {
  if (isNaN(num))
      return NaN;
  var digits = String(+num).split(""),
      key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
             "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
             "","I","II","III","IV","V","VI","VII","VIII","IX"],
      roman = "",
      i = 3;
  while (i--)
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}

// Turn roman numeral string back to a number value
const romanHash = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function romanToInt(s) {
  let accumulator = 0;for (let i = 0; i < s.length; i++) {
    if (s[i] === "I" && s[i + 1] === "V") {
      accumulator += 4;
      i++;
    } else if (s[i] === "I" && s[i + 1] === "X") {
      accumulator += 9;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "L") {
      accumulator += 40;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "C") {
      accumulator += 90;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "D") {
      accumulator += 400;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "M") {
      accumulator += 900;
      i++;
    } else {
      accumulator += romanHash[s[i]];
    }
  }
  return accumulator;
}

// Change the name of the current piece
function changeName(e) {
  createPieceName(e.target.value);
}

// Change the ability of the current piece
function changeAbility(e) {
  if(e.target.value < 0 || e.target.value > 100) return;
  createPieceAbilityText(romanize(e.target.value));
}

init()
createPieceIcon("dukeIcon")