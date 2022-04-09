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
// https://css-tricks.com/transforms-on-svg-elements/

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
let currentGridSquare = null;

// Current selected icon, correlates to the indexes of movementIcons
let currentIcon = 0;

// List of available icons where each index is the id of an SVG element
const movementIcons = ["move", "slide", "jump", "jumpSlide", "command", "strike", "clear"]

// Indicated if the current piece is on the starting side or not
let isStartSide = true;

// Keeps track of if the piece has different piece icons on each side such as the Oracle 
let hasDifferentPieceIcons = false;

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

// Current version of the exporter that creates the exported JSON files 
// this isn't needed currently though I want to future proof everything just in case 
// This will be used for when new features to the EXPORTER are added such as
// allowing for custom icons that need to be stored in the json file
// this is different from the site version which handles the actual rendering and creating
// of the SVG files 
let exporterVersion = 1;

// Current version of the site
let siteVersion = 1.0;

// Will only start incrementing them after the "official release"

// Add event listeners for processing new name, ability, piece icon and opposite icon side inputs
let nameInput = document.getElementById("nameInput");
nameInput.addEventListener('change', changeName);
let abilityInput = document.getElementById("abilityInput");
abilityInput.addEventListener('change', changeAbility);
let pieceIconInput = document.getElementById("pieceIconInput");
let oppositeIconSideInput = document.getElementById("oppositeIconSideInput");
oppositeIconSideInput.addEventListener('change', toggleOppositePieceSide);
let amountInput = document.getElementById("amountInput");
amountInput.addEventListener('change', changeAmount);

// Get elements for the display of the current piece index and total piece number
let currentPieceNumberElement = document.getElementById("currentPieceNumber");
let totalPieceNumberElement = document.getElementById("totalPieceNumber")

// Initialization function
function init() {
  createNewPieceIndex();
  clearInputs();
}

// Handle the user mousing over a grid square
function mouseOverGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if (isCenter(gridPos)) return;
  item.style.fill = "#ffc"
  let pos = getCenter(item)
  if (movementIcons[currentIcon] !== "clear") {
    iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
    currentGridSquare = item;
    removeElement(gridPos[0], gridPos[1], iconElement.getAttribute("icon"), false)
  } else {
    removeElement(gridPos[0], gridPos[1])
  }
}

// Handle the mouse leaving a grid square
function mouseOutGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if (isCenter(gridPos)) return;
  item.style.fill = "#fff"
  if (iconElement) {
    iconElement.remove();
  }
  currentGridSquare = null;
  restoreElements(gridPos[0], gridPos[1])
}

// Handle clicking a grid square
function clickGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if (isCenter(gridPos)) return;
  item.style.fill = "#ff0";
  if (iconElement) {
    removeElement(gridPos[0], gridPos[1], iconElement.getAttribute("icon"), true)
    iconList[currentPiece][+ isStartSide][gridPos[0]][gridPos[1]].push(iconElement)
    iconElement = null
  } else {
    removeElement(gridPos[0], gridPos[1], "clear", true)
  }
}

// Handle the user scrolling when the mouse is over the template
function mouseOnScroll(event) {
  if (event.deltaY > 0) {
    currentIcon--
  } else if (event.deltaY < 0) {
    currentIcon++
  }
  if (currentIcon >= movementIcons.length) {
    currentIcon = 0
  }
  if (currentIcon < 0) {
    currentIcon = movementIcons.length - 1;
  }

  if (currentGridSquare) {
    let gridPos = currentGridSquare.parentElement.id.split("").slice(1).map(element => parseInt(element));

    if (iconElement) {
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
  return (gridPos[0] === 2) && (gridPos[1] === 2);
}

// Returns the x,y position of the center of the given SVG element
function getCenter(item) {
  let bbox = item.getBBox();
  let ctm = item.getTransformToElement(item.nearestViewportElement)
  let cx = bbox.x + (bbox.width / 2);
  let cy = bbox.y + (bbox.height / 2);
  let pt = item.nearestViewportElement.createSVGPoint();
  pt.x = cx;
  pt.y = cy;
  return pt.matrixTransform(ctm);
}

// Creates the given icon at the given position (pos)
// gridPos is the current position of the icon on the grid
function createIconAt(icon, pos, gridPos, append = true) {
  if(icon === "clear") return;
  newIconElement = document.getElementById(icon).cloneNode(true);
  svg.appendChild(newIconElement);
  let bbox = newIconElement.getBBox();
  let iconScaleFactor = scaleFactor(icon);
  let width = bbox.width * iconScaleFactor
  let height = bbox.height * iconScaleFactor
  let cx = pos.x - (width / 2);
  let cy = pos.y - (height / 2);
  if (isSlide(icon)) {
    newIconElement.setAttribute("transform",
      rotateIcon(gridPos, cx, cy, width, height, iconScaleFactor))
  }
  newIconElement.setAttribute("x", cx);
  newIconElement.setAttribute("y", cy);
  newIconElement.setAttribute("width", width);
  newIconElement.setAttribute("height", height);
  newIconElement.setAttribute("id", "");
  newIconElement.setAttribute("icon", icon);
  if (!append)
    newIconElement.remove();
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
function rotateIcon(gridPos, cx, cy, width, height, iconScaleFactor = 1) {
  return "rotate(" + getRotateDegrees(gridPos) + ", " + (cx + (width / 2))
    + ", " + (cy + (height / 2)) + ")";
}

function scaleIcon(icon) {
  return "scale(" + scaleFactor(icon) + ")"
}

function scaleFactor(icon) {
  if (isFullSize(icon)) return 4;
  return 3;
}

// Find the rotation degree based on the grid position
function getRotateDegrees(gridPos) {
  switch (gridPos.join()) {
    case "2,1":
    case "2,0":
      return "0"
    case "3,1":
    case "4,0":
      return "45"
    case "3,2":
    case "4,2":
      return "90"
    case "3,3":
    case "4,4":
      return "135"
    case "2,3":
    case "2,4":
      return "180"
    case "1,3":
    case "0,4":
      return "225"
    case "1,2":
    case "0,2":
      return "270"
    case "1,1":
    case "0,0":
      return "315"
  }
  return "0"
}

// Remove all of the elements from view at the current grid location
// removeFromList removes them from existance entirely
function removeElement(x, y, newIcon, removeFromList = false) {
  for (let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    if (isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      if (removeFromList)
        iconList[currentPiece][+ isStartSide][x][y].splice(i, 1);
    } else if (!isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      if (removeFromList)
        iconList[currentPiece][+ isStartSide][x][y].splice(i, 1);
    }
  }
}

// Restores all elements into view at the current grid location
function restoreElements(x, y) {
  for (let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    iconList[currentPiece][+ isStartSide][x][y][i].remove();
    svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
  }
}

// Restores all elements into view at the current grid location
// only elements that are of the opposite icon type of that given.
// Used for when using scrolling to show icons
function restoreOppositeType(x, y, newIcon) {
  for (let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    if (isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
    } else if (!isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i])
    }
  }
}

// Creates a text element at the position given of the font size given
function createTextAt(text, pos, fontSize, append = true) {
  let svgNS = "http://www.w3.org/2000/svg";
  let newText = document.createElementNS(svgNS, "text");
  newText.setAttribute("font-size", fontSize);
  newText.setAttribute("font-family", "Pieces of Eight");
  newText.setAttribute("text", text);
  newText.appendChild(document.createTextNode(text));
  svg.appendChild(newText);
  let bbox = newText.getBBox();
  let cx = pos.x - (bbox.width / 2);
  let cy = pos.y + (bbox.height / 4);
  newText.setAttribute("x", cx);
  newText.setAttribute("y", cy);
  if (!append)
    newText.remove();
  return newText;
}

// Create a text element of the given piece name
function createPieceName(text, append = true) {
  let fontSize = 265;
  if (iconList[currentPiece][2][0])
    iconList[currentPiece][2][0].remove();
  if (text.length >= 8)
    fontSize = 245
  if (text.length >= 10)
    fontSize = 215
  let namePos = getCenter(nameLocation);
  return createTextAt(text, namePos, fontSize, append);
}

// Create a text element of the given ability number
function createPieceAbilityText(text, append = true) {
  if (text === "") return;
  if (iconList[currentPiece][2][1])
    iconList[currentPiece][2][1].remove()
  let iconPos = getCenter(pieceIconLocation);
  let namePos = getCenter(nameLocation);
  iconPos.y = namePos.y + 140;
  outerBorderLocation.setAttribute("visibility", text !== "" ? "visable" : "hidden");
  return createTextAt(text, iconPos, 100, append);
}

// Create the piece icon of the given piece name
function createPieceIcon(piece, append = true) {
  if (piece === "") return;
  let iconPos = getCenter(pieceIconLocation);
  let pieceIconElement = document.getElementById(piece).cloneNode(true);
  svg.appendChild(pieceIconElement);
  let bbox = pieceIconElement.getBBox();
  let width = bbox.width * 10;
  let height = bbox.height * 10;
  let cx = iconPos.x - (width / 2);
  let cy = iconPos.y - (height / 2);
  pieceIconElement.setAttribute("x", cx);
  pieceIconElement.setAttribute("y", cy);
  pieceIconElement.setAttribute("width", width);
  pieceIconElement.setAttribute("height", height);
  pieceIconElement.setAttribute("id", "");
  pieceIconElement.setAttribute("text", piece);
  if (!append)
    pieceIconElement.remove(pieceIconElement.getBBox())
  return pieceIconElement;
}

// Create a new index in iconList for a new piece to be placed in
function createNewPieceIndex() {
  let masterArray = []
  for (let i = 0; i < 2; i++) {
    let blankParentArray = []
    for (let j = 0; j < 5; j++) {
      let blankArray = []
      for (let k = 0; k < 5; k++) {
        blankArray.push([])
      }
      blankParentArray.push(blankArray)
    }
    masterArray.push(blankParentArray)
  }
  let infoArray = [];
  for (let i = 0; i < 2; i++) {
    infoArray.push("");
  }
  infoArray.push(["", ""])
  infoArray.push(1);
  masterArray.push(infoArray);
  iconList.push(masterArray);
  displayListLength();
}

// Clear all of the icons for the current piece and side from view
function clearBoard() {
  for (let i = 0; i < iconList[currentPiece][+ isStartSide].length; i++) {
    for (let j = 0; j < iconList[currentPiece][+ isStartSide][i].length; j++) {
      for (let k = 0; k < iconList[currentPiece][+ isStartSide][i][j].length; k++) {
        iconList[currentPiece][+ isStartSide][i][j][k].remove();
      }
    }
  }
}

// Redraw all of the icons for the current piece and side from view
function drawBoard() {
  for (let i = 0; i < iconList[currentPiece][+ isStartSide].length; i++) {
    for (let j = 0; j < iconList[currentPiece][+ isStartSide][i].length; j++) {
      for (let k = 0; k < iconList[currentPiece][+ isStartSide][i][j].length; k++) {
        svg.appendChild(iconList[currentPiece][+ isStartSide][i][j][k]);
      }
    }
  }
}

// Clears all elements that are not on the grid (name, ability icon)
function clearNonBoard() {
  if (iconList[currentPiece][2][0])
    iconList[currentPiece][2][0].remove()
  if (iconList[currentPiece][2][1])
    iconList[currentPiece][2][1].remove()
  if (iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)])
    iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)].remove()
}

// Draw all elements that are not on the grid (name, ability icon)
function drawNonBoard() {
  if (iconList[currentPiece][2][0])
    svg.appendChild(iconList[currentPiece][2][0])
  if (iconList[currentPiece][2][1]) {
    svg.appendChild(iconList[currentPiece][2][1])
    outerBorderLocation.setAttribute("visibility", iconList[currentPiece][2][1].getAttribute("text") !== "" ? "visable" : "hidden")
  } else {
    outerBorderLocation.setAttribute("visibility", "hidden");
  }
  if (iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)])
    svg.appendChild(iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)])
}

function displayListLength() {
  currentPieceNumberElement.innerHTML = currentPiece + 1;
  totalPieceNumberElement.innerHTML = iconList.length;
}

// Easy macro to create a new piece index and increment the current piece
function createNewPiece() {
  createNewPieceIndex();
  forwardPiece();
}

function deletePiece() {
  if (iconList.length <= 1) {
    clearBoard();
    clearNonBoard();
    iconList = []
    createNewPieceIndex();
  } else {
    let indexToDelete = currentPiece;
    backwardPiece()
    iconList = iconList.splice(indexToDelete, indexToDelete)
  }
  displayListLength();
}

// Easy macro for switching the side of the current piece
function switchSides() {
  clearBoard()
  clearNonBoard();
  isStartSide = !isStartSide;
  showStartSideIcons()
  drawNonBoard();
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
  clearNonBoard();
  currentPiece++;
  if (currentPiece >= iconList.length)
    currentPiece = 0;
  isStartSide = true;
  showStartSideIcons();
  drawNonBoard();
  drawBoard();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  clearInputs();
  displayListLength();
}

// Move backwards one piece in the piece array 
function backwardPiece() {
  clearBoard();
  clearNonBoard();
  currentPiece--;
  if (currentPiece < 0)
    currentPiece = iconList.length - 1;
  isStartSide = true;
  showStartSideIcons();
  drawNonBoard();
  drawBoard();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  clearInputs();
  displayListLength();
}

// Clear the input fields and fill with the information of the new piece if there
// is any information present
function clearInputs() {
  pieceIconInput.value = ""
  oppositeIconSideInput.checked = hasDifferentPieceIcons;
  nameInput.value = iconList[currentPiece][2][0] ? iconList[currentPiece][2][0].getAttribute("text") : ""
  abilityInput.value = iconList[currentPiece][2][1] ? romanToInt(iconList[currentPiece][2][1].getAttribute("text")) : ""
  amountInput.value = iconList[currentPiece][2][3] ? iconList[currentPiece][2][3] : 1
}

function pieceHasDifferentIcons() {
  if (iconList[currentPiece][2][2][1] && iconList[currentPiece][2][2][0]) {
    return (iconList[currentPiece][2][2][1].getAttribute("text") !== iconList[currentPiece][2][2][0].getAttribute("text"))
  }
  return false
}

// Process keyboard inputs 
function keyboardShortcuts(e) {
  switch (e.code) {
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

// Export all of the pieces and download it as a JSON file
function exportPieces() {
  let object = {}
  object.options = {}
  object.options.exporterVersion = exporterVersion;

  object.pieces = []
  for (let i = 0; i < iconList.length; i++) {
    let pieceObject = {};
    let iconArray = [];
    for (let j = 0; j < 2; j++) {
      let sideArray = [];
      for (let x = 0; x < iconList[i][j].length; x++) {
        let xArray = [];
        for (let y = 0; y < iconList[i][j][x].length; y++) {
          let yArray = [];
          for (let k = 0; k < iconList[i][j][x][y].length; k++) {
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
    pieceObject.icon = iconList[i][2][2][0] ? iconList[i][2][2][0].getAttribute("text") : "";
    pieceObject.altIcon = iconList[i][2][2][1] ? iconList[i][2][2][1].getAttribute("text") : "";
    pieceObject.amount = iconList[i][2][3] ? iconList[i][2][3] : 1;
    object.pieces.push(pieceObject);
  }
  downloadJSON(object);
}

// Downloads given data as a json file, used for exporter 
function downloadJSON(content) {
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(content)], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = "exportedDuke.json";
  a.click();
}

// Takes in a json file and formats it into a valid object
function importPieces(element) {
  if (element.files.length <= 0) return;
  let fr = new FileReader();
  fr.onload = function (e) {
    let result = JSON.parse(e.target.result);
    setImportedData(result)
    hasDifferentPieceIcons = pieceHasDifferentIcons();
    clearInputs();
  }
  fr.readAsText(element.files.item(0));
}

// Uses imported JSON object to set the correct variables 
function setImportedData(data) {
  clearBoard();
  iconList = [];
  for (let i = 0; i < data.pieces.length; i++) {
    createNewPieceIndex();
    for (let j = 0; j < data.pieces[i].grid.startSide.length; j++) {
      for (let k = 0; k < data.pieces[i].grid.startSide[j].length; k++) {
        let gridPos = [j, k]
        let gridSquareElement = document.getElementById("X" + gridPos[0] + gridPos[1]);
        let gridSquareCenter = getCenter(gridSquareElement)
        for (let l = 0; l < data.pieces[i].grid.startSide[j][k].length; l++) {
          iconList[i][1][gridPos[0]][gridPos[1]].push(createIconAt(data.pieces[i].grid.startSide[j][k][l], gridSquareCenter, gridPos, false))
        }
        for (let l = 0; l < data.pieces[i].grid.startNonSide[j][k].length; l++) {
          iconList[i][0][gridPos[0]][gridPos[1]].push(createIconAt(data.pieces[i].grid.startNonSide[j][k][l], gridSquareCenter, gridPos, false))
        }
      }
    }
    iconList[i][2][0] = createPieceName(data.pieces[i].name, false);
    iconList[i][2][1] = createPieceAbilityText(romanize(data.pieces[i].ability), false);
    iconList[i][2][2][0] = createPieceIcon(data.pieces[i].icon, false);
    iconList[i][2][2][1] = createPieceIcon(data.pieces[i].altIcon, false);
    iconList[i][2][3] = data.pieces[i].amount;
  }
  drawBoard();
  drawNonBoard();
}

// Turns number value into roman numerals, used for ability numbers
function romanize(num) {
  if (isNaN(num))
    return NaN;
  var digits = String(+num).split(""),
    key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
      "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
      "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
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

// Translate roman numeral string into the corrent integer value
function romanToInt(s) {
  let accumulator = 0; for (let i = 0; i < s.length; i++) {
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
  iconList[currentPiece][2][0] = createPieceName(e.target.value);
}

// Change the ability of the current piece
function changeAbility(e) {
  if (e.target.value < 0 || e.target.value > 100) return;
  iconList[currentPiece][2][1] = createPieceAbilityText(romanize(e.target.value), true);
}

// Change the amount of pieces that appear in the set
function changeAmount(e) {
  if (e.target.value < 0) return;
  iconList[currentPiece][2][3] = e.target.value;
}

// Change the piece icon of the current piece
function changePieceIcon() {
  if (iconList[currentPiece][2][2][0])
    iconList[currentPiece][2][2][0].remove()
  if (iconList[currentPiece][2][2][1])
    iconList[currentPiece][2][2][1].remove()
  iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)] = createPieceIcon(pieceIconInput.value)
}

// Toggle if the non start side of the piece has a different icon from the start side
function toggleOppositePieceSide() {
  hasDifferentPieceIcons = oppositeIconSideInput.checked
}

init()