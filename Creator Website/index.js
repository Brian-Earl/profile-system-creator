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
// https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
// https://www.javascripttutorial.net/dom/manipulating/remove-all-child-nodes/

// TODO:
// Add piece deletion
// Add rest of movement icons 
// Add rest of class icons
// Add custom SVG icon support
// Add some more variable control in the web version such as for controlling the spacing in the render
// Better scroll control when selecting movement icon
// Allow movement icon to be selected using a dropdown similar to the class icon that also reacts to the scroll selection
// Allow selection of legacty render
// Linting for consistency across file

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

// Add event listeners for processing new name, 
// ability, piece icon, opposite icon side and start position inputs
let nameInput = document.getElementById("nameInput");
nameInput.addEventListener('change', changeName);
let abilityInput = document.getElementById("abilityInput");
abilityInput.addEventListener('change', changeAbility);
let pieceIconInput = document.getElementById("pieceIconInput");
let oppositeIconSideInput = document.getElementById("oppositeIconSideInput");
oppositeIconSideInput.addEventListener('change', toggleOppositePieceSide);
let amountInput = document.getElementById("amountInput");
amountInput.addEventListener('change', changeAmount);
let xInput = document.getElementById("xInput");
xInput.addEventListener('change', changeStartPosition);
let yInput = document.getElementById("yInput");
yInput.addEventListener('change', changeStartPosition);

// Get elements for the display of the current piece index and total piece number
let currentPieceNumberElement = document.getElementById("currentPieceNumber");
let totalPieceNumberElement = document.getElementById("totalPieceNumber");

// Get elements for the width and height when generation the grid svg
let widthInput = document.getElementById("widthInput");
let heightInput = document.getElementById("heightInput");

// Get element for the styles appended onto the SVG before it is exported
let exportStyle = document.getElementById("exportStyles")

// Should use the legacy version of the cut line generator
let isLegacyCutLines = false

// Initialization function
function init() {
  createNewPieceIndex();
  clearInputs();
}

// Handle the user mousing over a grid square
function mouseOverGridSquare(item) {
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  // If the selected item is the player position, return 
  if (isCenter(gridPos)) return;
  item.style.fill = "#ffc";
  // Get the center of the given item
  let pos = getCenter(item)
  // If the selected icon is not the clear command, draw the selected icon
  // else, remove the icon on the given square
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
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  // If the selected item is the player position, return 
  if (isCenter(gridPos)) return;
  item.style.fill = "#fff"
  // Remove the current icon if it exists
  if (iconElement) {
    iconElement.remove();
  }
  // Restore icon to its original state
  currentGridSquare = null;
  restoreElements(gridPos[0], gridPos[1])
}

// Handle clicking a grid square
function clickGridSquare(item) {
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  // If the selected item is the player position, return 
  if (isCenter(gridPos)) return;
  item.style.fill = "#ff0";
  // If an icon is selected, append it to the current position else remove it 
  if (iconElement) {
    removeElement(gridPos[0], gridPos[1], iconElement.getAttribute("icon"), true)
    iconList[currentPiece][+ isStartSide][gridPos[0]][gridPos[1]].push(iconElement)
    iconElement = null;
  } else {
    removeElement(gridPos[0], gridPos[1], "clear", true)
  }
  // If the selected icon is the clear command, delete the icons at the given position
  if (movementIcons[currentIcon] === "clear") {
    deleteAtPosition(gridPos[0], gridPos[1])
  }
}

// Handle the user scrolling when the mouse is over the template
function mouseOnScroll(event) {
  // If the mouse wheel is scrolling up, increment the current icon
  // If it is scrolling down, decrement it
  if (event.deltaY > 0) {
    currentIcon--
  } else if (event.deltaY < 0) {
    currentIcon++
  }

  // If the current icon number goes out of bounds, wrap it around to the other side
  if (currentIcon >= movementIcons.length) {
    currentIcon = 0
  }
  if (currentIcon < 0) {
    currentIcon = movementIcons.length - 1;
  }

  // If the mouse is over a grid square, change the icon that is currently drawn there 
  if (currentGridSquare) {

    // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
    let gridPos = currentGridSquare.parentElement.id.split("").slice(1).map(element => parseInt(element));

    // Remove any existing icons 
    if (iconElement) {
      iconElement.remove()
    }

    // Draw new icon at the center of the current square 
    let pos = getCenter(currentGridSquare)
    iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
    removeElement(gridPos[0], gridPos[1])
    restoreOppositeType(gridPos[0], gridPos[1], movementIcons[currentIcon])
  }
}

// Returns if the given grid position is the center of the grid
function isCenter(gridPos) {
  return (gridPos[0] === iconList[currentPiece][2][4][0]) && (gridPos[1] === iconList[currentPiece][2][4][1]);
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
function createIconAt(icon, pos, gridPos, append = true, iconScaleFactor = scaleFactor(icon)) {
  // If the given icon is the clear command, return 
  if (icon === "clear") return;
  newIconElement = document.getElementById(icon).cloneNode(true);
  svg.appendChild(newIconElement);
  let bbox = newIconElement.getBBox();
  let width = bbox.width * iconScaleFactor;
  let height = bbox.height * iconScaleFactor;
  let cx = pos.x - (width / 2);
  let cy = pos.y - (height / 2);
  if (isSlide(icon)) {
    newIconElement.setAttribute("transform",
      rotateIcon(gridPos, cx, cy, width, height, iconScaleFactor));
  }
  newIconElement.setAttribute("x", cx);
  newIconElement.setAttribute("y", cy);
  newIconElement.setAttribute("width", width);
  newIconElement.setAttribute("height", height);
  newIconElement.setAttribute("id", "");
  newIconElement.setAttribute("icon", icon);
  newIconElement.setAttribute("visibility", "visible")
  if (!append)
    newIconElement.remove();
  return newIconElement;
}

function createStartIconsAt(x, y, append = true) {
  return [
    createIconAt("NonStartSide", getCenter(document.getElementById("X" + x + y)), [x, y], (!isStartSide && append), 1),
    createIconAt("StartSide", getCenter(document.getElementById("X" + x + y)), [x, y], (isStartSide && append), 1)
  ]
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
  return "rotate(" + getRotateDegrees(gridPos) + " " + (cx + (width / 2))
    + " " + (cy + (height / 2)) + ")"
    + " translate(" + "0" + " " + getYTranslation(gridPos, height) + ")";
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

// Find how much to translate along the Y axis based on the grid position
// Used for fixing issues regarding the postion when translated
function getYTranslation(gridPos, height) {
  switch (gridPos.join()) {
    case "2,1":
    case "2,0":
    case "3,2":
    case "4,2":
    case "2,3":
    case "2,4":
    case "1,2":
    case "0,2":
      return "0"
    case "3,1":
    case "4,0":
    case "3,3":
    case "4,4":
    case "1,3":
    case "0,4":
    case "1,1":
    case "0,0":
      return "" + (-1 * (height / 6)); // Also try (height / 4)
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
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i]);
    } else if (!isFullSize(iconList[currentPiece][+ isStartSide][x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[currentPiece][+ isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece][+ isStartSide][x][y][i]);
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
  // If no text is input, return
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
function createNewPieceIndex(x = 2, y = 2, append = true) {
  let masterArray = []
  // Create the two grids for the start and non start sides
  for (let i = 0; i < 2; i++) {
    let blankParentArray = []
    for (let j = 0; j < 5; j++) {
      let blankArray = []
      for (let k = 0; k < 5; k++) {
        blankArray.push([])
      }
      blankParentArray.push(blankArray);
    }
    masterArray.push(blankParentArray);
  }
  let infoArray = [];
  // Store the name and ability number
  // First is name and second is ability number 
  for (let i = 0; i < 2; i++) {
    infoArray.push("");
  }
  // Store the piece icons
  // Second one is for if the piece has a different one for each side
  infoArray.push(["", ""]);
  // Store the number of pieces in the set
  infoArray.push(1);
  // Store the position of the start location 
  // 2,2 is the default and should be ignored unless it is different
  infoArray.push([x, y]);
  infoArray.push(createStartIconsAt(x, y, append));

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
    iconList[currentPiece][2][0].remove();
  if (iconList[currentPiece][2][1])
    iconList[currentPiece][2][1].remove();
  if (iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)])
    iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)].remove();
  if (iconList[currentPiece][2][5][+ isStartSide])
    iconList[currentPiece][2][5][+ isStartSide].remove()
}

// Draw all elements that are not on the grid (name, ability icon)
function drawNonBoard() {
  if (iconList[currentPiece][2][0])
    svg.appendChild(iconList[currentPiece][2][0]);
  if (iconList[currentPiece][2][1]) {
    svg.appendChild(iconList[currentPiece][2][1]);
    outerBorderLocation.setAttribute("visibility", iconList[currentPiece][2][1].getAttribute("text") !== "" ? "visable" : "hidden");
  } else {
    outerBorderLocation.setAttribute("visibility", "hidden");
  }
  if (iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)])
    svg.appendChild(iconList[currentPiece][2][2][+ (!isStartSide && hasDifferentPieceIcons)]);
  if (iconList[currentPiece][2][5][+ isStartSide])
    svg.appendChild(iconList[currentPiece][2][5][+ isStartSide])
}

// Delete all icons at position x,y in movement grid
function deleteAtPosition(x, y) {
  console.log(iconList[currentPiece][+ isStartSide][x][y])
  for (let i = 0; i < iconList[currentPiece][+ isStartSide][x][y].length; i++) {
    if (iconList[currentPiece][+ isStartSide][x][y][i])
      iconList[currentPiece][+ isStartSide][x][y][i].remove()
  }
  iconList[currentPiece][+ isStartSide][x][y] = []
}

// Display the current piece shown and the total amount of pieces
function displayListLength() {
  currentPieceNumberElement.innerHTML = currentPiece + 1;
  totalPieceNumberElement.innerHTML = iconList.length;
}

// Easy macro to create a new piece index and increment the current piece
function createNewPiece() {
  createNewPieceIndex();
  forwardPiece();
}

// Delete the current piece
// WARNING: DOES NOT WORK - WIP
function deletePiece() {
  if (iconList.length <= 1) {
    clearBoard();
    clearNonBoard();
    iconList = [];
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
  // Clear all of the drawn svgs from the board 
  clearBoard()
  clearNonBoard();
  // Flip what current side is shown
  isStartSide = !isStartSide;
  // Redraw the board
  drawNonBoard();
  drawBoard();
}

// Move forward one piece in the piece array 
function forwardPiece() {
  // Clear all of the drawn svgs from the board 
  clearBoard();
  clearNonBoard();
  // Move forewards a piece and reset the what side is shown
  currentPiece++;
  if (currentPiece >= iconList.length)
    currentPiece = 0;
  isStartSide = true;
  // Redraw the board and update the rest of the UI
  drawNonBoard();
  drawBoard();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  clearInputs();
  displayListLength();
}

// Move backwards one piece in the piece array 
function backwardPiece() {
  // Clear all of the drawn svgs from the board 
  clearBoard();
  clearNonBoard();
  // Move backwards a piece and reset the what side is shown
  currentPiece--;
  if (currentPiece < 0)
    currentPiece = iconList.length - 1;
  isStartSide = true;
  drawNonBoard();
  drawBoard();
  // Redraw the board and update the rest of the UI
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  clearInputs();
  displayListLength();
}

// Clear the input fields and fill with the information of the new piece if there is any information present
function clearInputs() {
  pieceIconInput.value = ""
  oppositeIconSideInput.checked = hasDifferentPieceIcons;
  nameInput.value = iconList[currentPiece][2][0] ? iconList[currentPiece][2][0].getAttribute("text") : ""
  abilityInput.value = iconList[currentPiece][2][1] ? romanToInt(iconList[currentPiece][2][1].getAttribute("text")) : ""
  amountInput.value = iconList[currentPiece][2][3] ? iconList[currentPiece][2][3] : 1
  xInput.value = iconList[currentPiece][2][4][0]
  yInput.value = iconList[currentPiece][2][4][1]
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
    pieceObject.startPosition = iconList[i][2][4]
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
  clearNonBoard();
  clearBoard();
  iconList = [];
  for (let i = 0; i < data.pieces.length; i++) {
    let startPos = data.pieces[i].startPosition ? data.pieces[i].startPosition : [2, 2]
    createNewPieceIndex(startPos[0], startPos[1], false);
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
    iconList[i][2][4] = startPos;
    iconList[i][2][5] = createStartIconsAt(startPos[0], startPos[1], false);
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
   // If the input is outside of the desired range, return
  if (e.target.value < 0 || e.target.value > 100) return;
  iconList[currentPiece][2][1] = createPieceAbilityText(romanize(e.target.value), true);
}

// Change the amount of pieces that appear in the set
function changeAmount(e) {
  // If the input is outside of the desired range, return
  if (e.target.value < 0) return;
  iconList[currentPiece][2][3] = parseInt(e.target.value);
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

// Change the position of the start piece location
function changeStartPosition() {
  let x = parseInt(xInput.value);
  let y = parseInt(yInput.value);
  // If outside the range of the board, return 
  if (x < 0 || x > 4 || y < 0 || y > 4) return;
  // Remove the drawn start position icons
  iconList[currentPiece][2][5][0].remove();
  iconList[currentPiece][2][5][1].remove();
  // Create a new icon at given location and append
  iconList[currentPiece][2][5] = createStartIconsAt(x, y);
  iconList[currentPiece][2][4] = [x, y];
  svg.appendChild(iconList[currentPiece][2][5][+ isStartSide])
}

// Export the current list of pieces as a grid
// WARNING: THE WIDTH AND HEIGHT ARE ALL TOPSY TERVEY AND MESSED UP
// WARNING WARNING, IF MESSED WITH IT WILL BE CONFUSING
function exportPiecesAsGrid(drawCuts = true, drawPieces = true, lineColor = "blue") {
  // Get the width and height of the rendered grid
  let width = parseInt(widthInput.value)
  let height = parseInt(heightInput.value)
  // If the user has put in a number that is too small (done through typing in a number less than zero) exit the function
  if (width < 1 || height < 1) return;
  // Size of the pieces in the svg
  let pieceSize = 200
  // Spacing between the individual peices
  let spacing = 20;
  // Offset so that the grid can be fully drawn on the svg
  let offset = 10;
  // Distance between the piece and the cut lines box
  let lineDistance = 5;
  // Keep track of how many times the current piece has been used in the render 
  // Used for pieces that appear multiple times
  let repeatPeice = 0;
  // Calculate and set the width and height of the canvas so that all of the pieces will fit in view
  // Add + 1 to the width and height just to make sure that nothing is cut off
  // This won't affect anything when laser cutting
  let canvasWidth = (pieceSize + spacing + offset) * (height + 1);
  let canvasHeight = (pieceSize + spacing + offset) * (width + 1);
  let startSideCanvas = document.getElementById("startSideCanvas")
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas")
  // Keep track of the index so that generation can be cut off early 
  let index = 0;
  // Store the value of i and j so that they can be used in calculations later
  let i = 0
  let j = 0
  for (i = 0; i < width; i++) {
    if (isLegacyCutLines && drawCuts) {
      // Creates horizontal lines that extended across the entire canvas
      let heightSpacing = ((pieceSize + spacing) * i) - (spacing / 2) + offset;
      let canvasHeightSpacing = ((pieceSize + spacing) * height) - (spacing / 2) + offset
      startSideCanvas.append(createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing))
      nonStartSideCanvas.append(createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing))
    }
    for (j = 0; j < height; j++) {
      // If there are no more pieces to render, exit the loop
      if (index >= iconList.length) {
        break
      }
      if (drawPieces) {
        // Clone the current piece and add the start and non start side to the two different renders
        let svgStartSideClone = svg.cloneNode(true)
        startSideCanvas.append(svgStartSideClone)
        // Calcuate the transformation of the current piece and apply to both sides
        let translation = "translate(" + (((spacing + pieceSize) * j) + offset) + " " + (((spacing + pieceSize) * i) + offset) + ")"
        svgStartSideClone.setAttribute("transform", translation)
        svgStartSideClone.setAttribute("width", pieceSize)
        svgStartSideClone.setAttribute("height", pieceSize)
        switchSides()
        let svgNonStartSideClone = svg.cloneNode(true)
        nonStartSideCanvas.append(svgNonStartSideClone)
        svgNonStartSideClone.setAttribute("transform", translation)
        svgNonStartSideClone.setAttribute("width", pieceSize)
        svgNonStartSideClone.setAttribute("height", pieceSize)
        switchSides()
      }
      // Increment the amount of times the piece has been seen in the current render
      // If it has been used the correct number of times, move onto the next piece
      repeatPeice++
      if (repeatPeice >= iconList[currentPiece][2][3]) {
        repeatPeice = 0
        index++
        forwardPiece()
      }
      if (isLegacyCutLines && drawCuts) {
        // Creates vertical lines that extrended across the entire canvas
        let widthSpacing = ((pieceSize + spacing) * j) - (spacing / 2) + offset;
        let canvasWidthSpacing = ((pieceSize + spacing) * width) - (spacing / 2) + offset
        startSideCanvas.append(createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing))
        nonStartSideCanvas.append(createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing))
      } else if (drawCuts) {
        // Just for ease
        let x = j
        let y = i
        // Creates a box around the current piece for cutting
        // Allows for having a clean cut, while also leaving a hole
        // Constructed using four seperate lines though might be possible with a square element
        let tlX = ((spacing + pieceSize) * x) + offset - lineDistance
        let trX = ((spacing + pieceSize) * x) + pieceSize + offset + lineDistance
        let tlY = ((spacing + pieceSize) * y) + offset - lineDistance
        let trY = ((spacing + pieceSize) * y) + pieceSize + offset + lineDistance

        // Sqaure
        startSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor))
        nonStartSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor))
      }
    }
  }
  if (isLegacyCutLines && drawCuts) {
    // Create extra lines at the end of the vertical and horizontals of the grids that are missed during normal generation
    // Create extra vertical line at the very right of the canvas that extends the entire height
    let widthSpacing = ((pieceSize + spacing) * j) - (spacing / 2) + offset;
    let canvasWidthSpacing = ((pieceSize + spacing) * width) - (spacing / 2) + offset
    startSideCanvas.append(createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing))
    nonStartSideCanvas.append(createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing))
    // Create extra horizontal line at the bottom of the canvas that extends the entire width
    let heightSpacing = ((pieceSize + spacing) * i) - (spacing / 2) + offset;
    let canvasHeightSpacing = ((pieceSize + spacing) * height) - (spacing / 2) + offset
    startSideCanvas.append(createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing))
    nonStartSideCanvas.append(createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing))
  }
  // Reset canvas height to fit the amount of pieces generated
  canvasHeight = (pieceSize + spacing + offset) * (i);
  startSideCanvas.setAttribute("width", canvasWidth)
  startSideCanvas.setAttribute("height", canvasHeight)
  nonStartSideCanvas.setAttribute("width", canvasWidth)
  nonStartSideCanvas.setAttribute("height", canvasHeight)
}

// Draw a line between the two points given
// Used for when adding the cut lines 
function createLine(x1, y1, x2, y2, color="black") {
  let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine.setAttribute('x1', x1);
  newLine.setAttribute('y1', y1);
  newLine.setAttribute('x2', x2);
  newLine.setAttribute('y2', y2);
  newLine.setAttribute("stroke", color)
  return newLine
}

// Draw a rectangle around the given points
// Used for when adding the cut lines 
function createRect(x1, y1, x2, y2, color="blue") {
  let newRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  let height = y2 - y1
  let width = x2 - x1
  newRect.setAttribute('x', x1);
  newRect.setAttribute('y', y1);
  newRect.setAttribute('width', width);
  newRect.setAttribute('height', height);
  newRect.setAttribute("stroke", color)
  newRect.setAttribute("fill", "transparent")
  return newRect
}

// Save SVG to a file of the given name
// Credit to senz on stackoverflow
function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Download the starting side grid render as an svg
function downloadStartSideRender(drawCuts = true, drawPieces = true, lineColor = "blue") {
  // Get the start side render canvas, remove all of the children, append the style and the render and save
  let startSideCanvas = document.getElementById("startSideCanvas")
  removeAllChildNodes(startSideCanvas)
  startSideCanvas.append(exportStyle)
  exportPiecesAsGrid(drawCuts, drawPieces, lineColor)
  saveSvg(document.getElementById("startSideCanvas"), "startside.svg")
}

// Download the non starting side grid render as an svg
function downloadNonStartSideRender(drawCuts = true, drawPieces = true, lineColor = "blue") {
  // Get the non start side render canvas, remove all of the children, append the style and the render and save
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas")
  removeAllChildNodes(nonStartSideCanvas)
  nonStartSideCanvas.append(exportStyle)
  exportPiecesAsGrid(drawCuts, drawPieces, lineColor)
  saveSvg(document.getElementById("nonStartSideCanvas"), "nonstartside.svg")
}

// Remove all children node of the given element
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

init()