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
// https://cjav.dev/posts/svg-to-png-with-js/
// https://stackoverflow.com/questions/48105468/including-fonts-when-converting-svg-to-png
// https://alligatr.co.uk/blog/render-an-svg-using-external-fonts-to-a-canvas/
// https://bobbyhadz.com/blog/javascript-round-number-down-to-nearest-ten

// TODO:
// Add piece deletion
// Add rest of class icons
// Add custom SVG icon support
// Add some more variable control in the web version such as for controlling the spacing in the render
// Better scroll control when selecting movement icon
// Allow movement icon to be selected using a dropdown similar to the class icon that also reacts to the scroll selection
// Allow selection of legacy render
// Add multiple pages for renders when all of the pieces cannot fit on one
// Revamp UI

// Variable that keeps track all of the current pieces created
// An array of arrays, each array contains two arrays, both are 2D arrays
// the first one representing the starting side and the second representing the non starting side
// Each element of the 2D arrays are arrays that can have one or two elements themselves
let iconList = [];

// Reference to the current icon element
// Used drawing and removing the current icon when the mouse hovers and exits a grid square
let iconElement = null;

// Stores the current grid square SVG element the mouse is over
// Used for drawing a new icon when changing the current icon with the scroll wheel
let currentGridSquare = null;

// Current selected icon, correlates to the indexes of movementIcons
let currentIcon = 0;

// List of available icons where each index is the id of an SVG element
const movementIcons = [
  "move",
  "slide",
  "jump",
  "jumpSlide",
  "command",
  "strike",
  "defense",
  "dread",
  "fullFormation",
  "hammer",
  "shieldDefense",
  "smash",
  "clear",
];

// List of available fonts
const availableFonts = new Map();
availableFonts.set("dukeFont", "Pieces of Eight");
availableFonts.set("arthurFont", "Xenippa");
availableFonts.set("musketeersFont", "Lucida Blackletter");
availableFonts.set("conanFont", "hiroshige-std-black");
availableFonts.set("jarlFont", "Comic Runes");
availableFonts.set("centurionFont", "CCElektrakution W01 Light");

// Default the font to Pieces of Eight
let currentFont = "dukeFont";

// Indicated if the current piece is on the starting side or not
let isStartSide = true;

// Keeps track of if the piece has different piece icons on each side such as the Oracle
let hasDifferentPieceIcons = false;

// Keeps track of if the piece has different starting locations
let hasDifferentStartLocations = false;

// Get the SVG element for the entire template
let svg = document.getElementById("svg");
// When the mouse is over the template and the user scrolls, call mouseOnScroll()
svg.addEventListener("wheel", mouseOnScroll);

// Get the SVG element for where the piece name goes
let nameLocation = document.getElementById("Piece-Name");

// Get the SVG element for where the piece icon goes
let pieceIconLocation = document.getElementById("Piece-Icon");

// Get the SVG element for where the player marker is
let playerMarkerLocation = document.getElementById("Starting-Side");

// Get the SVG element for the outer border used to indicate when a
// piece has a special ability
let outerBorderLocation = document.getElementById("Outer-Border");

// Get element for
let importFileLocation = document.getElementById("importPiecesInput");

// ID number of current piece being worked on
// Used so that multiple pieces can be worked on at a given time
let currentPiece = 0;

// Current version of the exporter that creates the exported JSON files
// this isn't needed currently though I want to future proof everything just in case
// This will be used for when new features to the EXPORTER are added such as
// allowing for custom icons that need to be stored in the json file
// this is different from the site version which handles the actual rendering and creating
// of the SVG files
let exporterVersion = 2;

// Current version of the site
let siteVersion = 1.0;

// Will only start incrementing them after the "official release"

// Add event listeners for processing new name,
// ability, piece icon, opposite icon side and start position inputs
let nameInput = document.getElementById("nameInput");
nameInput.addEventListener("change", changeName);
let abilityInput = document.getElementById("abilityInput");
abilityInput.addEventListener("change", changeAbility);
let pieceIconInput = document.getElementById("pieceIconInput");
let oppositeIconSideInput = document.getElementById("oppositeIconSideInput");
oppositeIconSideInput.addEventListener("change", toggleOppositePieceSide);
let oppositeStartSideInput = document.getElementById("oppositeStartSideInput");
oppositeStartSideInput.addEventListener("change", toggleOppositeStartLocation);
let amountInput = document.getElementById("amountInput");
amountInput.addEventListener("change", changeAmount);
let xInput = document.getElementById("xInput");
xInput.addEventListener("change", changeStartPosition);
let yInput = document.getElementById("yInput");
yInput.addEventListener("change", changeStartPosition);
let svgInput = document.getElementById("svgInput");
let pngInput = document.getElementById("pngInput");
let xLineInput1 = document.getElementById("xLineInput1");
let yLineInput1 = document.getElementById("yLineInput1");
let xLineInput2 = document.getElementById("xLineInput2");
let yLineInput2 = document.getElementById("yLineInput2");
let fontInput = document.getElementById("fontInput");

// Get elements for the display of the current piece index and total piece number
let currentPieceNumberElement = document.getElementById("currentPieceNumber");
let totalPieceNumberElement = document.getElementById("totalPieceNumber");

// Get elements for the width and height when generation the grid svg
let widthInput = document.getElementById("widthInput");
let heightInput = document.getElementById("heightInput");

// Get element for the styles appended onto the SVG before it is exported
let exportStyle = document.getElementById("exportStyles");

// Should use the legacy version of the cut line generator
let isLegacyCutLines = false;

class GamePiece {
  constructor(x = 2, y = 2, x2 = 2, y2 = 2, append = true) {
    this.grid = [];
    // Create the two grids for the start and non start sides
    for (let i = 0; i < 2; i++) {
      let blankParentArray = [];
      for (let j = 0; j < 5; j++) {
        let blankArray = [];
        for (let k = 0; k < 5; k++) {
          blankArray.push([]);
        }
        blankParentArray.push(blankArray);
      }
      this.grid.push(blankParentArray);
    }

    // Store the name
    this.name = "";
    // Store the ability number
    this.ability = "";
    // Store the position of the start location
    // 2,2 is the default and should be ignored unless it is different
    this.startPos = [
      [x, y],
      [x2, y2],
    ];
    // Store the grid locations of connecting lines
    this.connections = [[], []];

    // Storage for the elements that make up the piece
    this.storage = {};
    // Store the piece icons
    // Second one is for if the piece has a different one for each side
    this.storage.icons = ["", ""];
    // Store the current starting icon
    this.storage.start = createStartIconsAt(x, y, x2, y2, append);
    // Store the line objects of connecting lines
    this.storage.connections = [[], []];

    // Store the number of pieces in the set
    this.count = 1;
  }
}

// Initialization function
function init() {
  createNewPieceIndex();
  clearInputs();
}

// Handle the user mousing over a grid square
function mouseOverGridSquare(item) {
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id
    .split("")
    .slice(1)
    .map((element) => parseInt(element));
  // If the selected item is the player position, return
  if (isCenter(gridPos)) return;
  item.style.fill = "#ffc";
  // Get the center of the given item
  let pos = getCenter(item);
  // If the selected icon is not the clear command, draw the selected icon
  // else, remove the icon on the given square
  if (movementIcons[currentIcon] !== "clear") {
    iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
    currentGridSquare = item;
    removeElement(
      gridPos[0],
      gridPos[1],
      iconElement.getAttribute("icon"),
      false
    );
  } else {
    removeElement(gridPos[0], gridPos[1]);
  }
}

// Handle the mouse leaving a grid square
function mouseOutGridSquare(item) {
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id
    .split("")
    .slice(1)
    .map((element) => parseInt(element));
  // If the selected item is the player position, return
  if (isCenter(gridPos)) return;
  item.style.fill = "#fff";
  // Remove the current icon if it exists
  if (iconElement) {
    iconElement.remove();
  }
  // Restore icon to its original state
  currentGridSquare = null;
  restoreElements(gridPos[0], gridPos[1]);
}

// Handle clicking a grid square
function clickGridSquare(item) {
  // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
  let gridPos = item.parentElement.id
    .split("")
    .slice(1)
    .map((element) => parseInt(element));
  // If the selected item is the player position, return
  if (isCenter(gridPos)) return;
  item.style.fill = "#ff0";
  // If an icon is selected, append it to the current position else remove it
  if (iconElement) {
    removeElement(
      gridPos[0],
      gridPos[1],
      iconElement.getAttribute("icon"),
      true
    );
    iconList[currentPiece].grid[+isStartSide][gridPos[0]][gridPos[1]].push(
      iconElement
    );
    iconElement = null;
  } else {
    removeElement(gridPos[0], gridPos[1], "clear", true);
  }
  // If the selected icon is the clear command, delete the icons at the given position
  if (movementIcons[currentIcon] === "clear") {
    deleteAtPosition(gridPos[0], gridPos[1]);
  }
}

// Handle the user scrolling when the mouse is over the template
function mouseOnScroll(event) {
  // If the mouse wheel is scrolling up, increment the current icon
  // If it is scrolling down, decrement it
  if (event.deltaY > 0) {
    currentIcon--;
  } else if (event.deltaY < 0) {
    currentIcon++;
  }

  // If the current icon number goes out of bounds, wrap it around to the other side
  if (currentIcon >= movementIcons.length) {
    currentIcon = 0;
  }
  if (currentIcon < 0) {
    currentIcon = movementIcons.length - 1;
  }

  // If the mouse is over a grid square, change the icon that is currently drawn there
  if (currentGridSquare) {
    // Turn the item's id into an array of two numbers representing the coordinates of the grid spaces
    let gridPos = currentGridSquare.parentElement.id
      .split("")
      .slice(1)
      .map((element) => parseInt(element));

    // Remove any existing icons
    if (iconElement) {
      iconElement.remove();
    }

    // Draw new icon at the center of the current square
    let pos = getCenter(currentGridSquare);
    iconElement = createIconAt(movementIcons[currentIcon], pos, gridPos);
    removeElement(gridPos[0], gridPos[1]);
    restoreOppositeType(gridPos[0], gridPos[1], movementIcons[currentIcon]);
  }
}

// Returns if the given grid position is the center of the grid
function isCenter(gridPos) {
  return (
    gridPos[0] === iconList[currentPiece].startPos[+isStartSide][0] &&
    gridPos[1] === iconList[currentPiece].startPos[+isStartSide][1]
  );
}

// Returns the x,y position of the center of the given SVG element
function getCenter(item) {
  let bbox = item.getBBox();
  let ctm = item.getTransformToElement(item.nearestViewportElement);
  let cx = bbox.x + bbox.width / 2;
  let cy = bbox.y + bbox.height / 2;
  let pt = item.nearestViewportElement.createSVGPoint();
  pt.x = cx;
  pt.y = cy;
  return pt.matrixTransform(ctm);
}

// Creates the given icon at the given position (pos)
// gridPos is the current position of the icon on the grid
function createIconAt(
  icon,
  pos,
  gridPos,
  append = true,
  iconScaleFactor = scaleFactor(icon)
) {
  // If the given icon is the clear command, return
  if (icon === "clear") return;
  newIconElement = document.getElementById(icon).cloneNode(true);
  svg.appendChild(newIconElement);
  let bbox = newIconElement.getBBox();
  let width = bbox.width * iconScaleFactor;
  let height = bbox.height * iconScaleFactor;
  let cx = pos.x - width / 2;
  let cy = pos.y - height / 2;
  if (isSlide(icon)) {
    newIconElement.setAttribute(
      "transform",
      rotateIcon(gridPos, cx, cy, width, height, iconScaleFactor)
    );
  }
  newIconElement.setAttribute("x", cx);
  newIconElement.setAttribute("y", cy);
  newIconElement.setAttribute("width", width);
  newIconElement.setAttribute("height", height);
  newIconElement.setAttribute("id", "");
  newIconElement.setAttribute("icon", icon);
  newIconElement.setAttribute("visibility", "visible");
  if (!append) newIconElement.remove();
  return newIconElement;
}

// Create a start icons at the two given positions
// x and y are for the start side
// x2 and y2 are for the non start side
function createStartIconsAt(x, y, x2, y2, append = true) {
  return [
    createIconAt(
      "NonStartSide",
      getCenter(document.getElementById("X" + x2 + y2)),
      [x, y],
      !isStartSide && append,
      1
    ),
    createIconAt(
      "StartSide",
      getCenter(document.getElementById("X" + x + y)),
      [x, y],
      isStartSide && append,
      1
    ),
  ];
}

// Returns if the icon given is one that needs to be rotated
function isSlide(icon) {
  return icon === "slide" || icon === "jumpSlide" || icon === "nonJumpSlide";
}

// Returns if the icon given is one that is full sized
function isFullSize(icon) {
  return (
    icon === "command" || icon === "singleFormation" || icon === "fullFormation"
  );
}

// Return transform attribute for rotating an icon
function rotateIcon(gridPos, cx, cy, width, height, iconScaleFactor = 1) {
  return (
    "rotate(" +
    getRotateDegrees(gridPos) +
    " " +
    (cx + width / 2) +
    " " +
    (cy + height / 2) +
    ")" +
    " translate(" +
    "0" +
    " " +
    getYTranslation(gridPos, height) +
    ")"
  );
}

// Returns transformation attribute for scaling an icon
function scaleIcon(icon) {
  return "scale(" + scaleFactor(icon) + ")";
}

// Returns how much to scale a certain icon by
function scaleFactor(icon) {
  if (icon === "fullFormation") return 5;
  if (icon === "singleFormation") return 5.5;
  if (isFullSize(icon)) return 4;
  return 3;
}

// Calculate the angle in which to rotate the current movement
// icon by depending on the start position of the piece
function getAngle(x, y) {
  return roundDownToNearest45(
    Math.abs(
      (Math.atan2(
        y - iconList[currentPiece].startPos[+isStartSide][1],
        x - iconList[currentPiece].startPos[+isStartSide][0]
      ) *
        180) /
        Math.PI -
        180
    )
  );
}

// Round the given number down to the nearest multiple of 45
// This is used when calculating the angle in which to rotate
// a movement icon by
function roundDownToNearest45(num) {
  return Math.floor(num / 45) * 45;
}

// Find the rotation degree based on the grid position
function getRotateDegrees(gridPos) {
  return getAngle(gridPos[1], gridPos[0]);
}

// Find how much to translate along the Y axis based on the grid position
// Used for fixing issues regarding the position when translated
function getYTranslation(gridPos, height) {
  return getAngle(gridPos[1], gridPos[0]) % 90 === 0 ? 0 : -1 * (height / 6);
}

// Remove all of the elements from view at the current grid location
// removeFromList removes them from existence entirely
function removeElement(x, y, newIcon, removeFromList = false) {
  for (
    let i = 0;
    i < iconList[currentPiece].grid[+isStartSide][x][y].length;
    i++
  ) {
    if (
      isFullSize(
        iconList[currentPiece].grid[+isStartSide][x][y][i].getAttribute("icon")
      ) &&
      isFullSize(newIcon)
    ) {
      iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
      if (removeFromList)
        iconList[currentPiece].grid[+isStartSide][x][y].splice(i, 1);
    } else if (
      !isFullSize(
        iconList[currentPiece].grid[+isStartSide][x][y][i].getAttribute("icon")
      ) &&
      !isFullSize(newIcon)
    ) {
      iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
      if (removeFromList)
        iconList[currentPiece].grid[+isStartSide][x][y].splice(i, 1);
    }
  }
}

// Restores all elements into view at the current grid location
function restoreElements(x, y) {
  for (
    let i = 0;
    i < iconList[currentPiece].grid[+isStartSide][x][y].length;
    i++
  ) {
    iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
    svg.appendChild(iconList[currentPiece].grid[+isStartSide][x][y][i]);
  }
}

// Restores all elements into view at the current grid location
// only elements that are of the opposite icon type of that given.
// Used for when using scrolling to show icons
function restoreOppositeType(x, y, newIcon) {
  for (
    let i = 0;
    i < iconList[currentPiece].grid[+isStartSide][x][y].length;
    i++
  ) {
    if (
      isFullSize(
        iconList[currentPiece].grid[+isStartSide][x][y][i].getAttribute("icon")
      ) &&
      !isFullSize(newIcon)
    ) {
      iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece].grid[+isStartSide][x][y][i]);
    } else if (
      !isFullSize(
        iconList[currentPiece].grid[+isStartSide][x][y][i].getAttribute("icon")
      ) &&
      isFullSize(newIcon)
    ) {
      iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
      svg.appendChild(iconList[currentPiece].grid[+isStartSide][x][y][i]);
    }
  }
}

// Creates a text element at the position given of the font size given
function createTextAt(
  text,
  pos,
  fontSize,
  fontFamily = "Pieces of Eight",
  append = true
) {
  let svgNS = "http://www.w3.org/2000/svg";
  let newText = document.createElementNS(svgNS, "text");
  newText.setAttribute("font-size", fontSize);
  newText.setAttribute("font-family", fontFamily);
  newText.setAttribute("text", text);
  newText.appendChild(document.createTextNode(text));
  svg.appendChild(newText);
  let bbox = newText.getBBox();
  let cx = pos.x - bbox.width / 2;
  let cy = pos.y + bbox.height / 4;
  newText.setAttribute("x", cx);
  newText.setAttribute("y", cy);
  if (!append) newText.remove();
  return newText;
}

// Create a text element of the given piece name
function createPieceName(text, append = true) {
  let fontSize = 265;
  if (iconList[currentPiece].name) iconList[currentPiece].name.remove();
  if (text.length >= 8) fontSize = 245;
  if (text.length >= 10) fontSize = 215;
  let namePos = getCenter(nameLocation);
  return createTextAt(
    text,
    namePos,
    fontSize,
    availableFonts.get(currentFont),
    append
  );
}

// Create a text element of the given ability number
function createPieceAbilityText(text, append = true) {
  // If no text is input, return
  if (text === "") return;
  if (iconList[currentPiece].ability) iconList[currentPiece].ability.remove();
  let iconPos = getCenter(pieceIconLocation);
  let namePos = getCenter(nameLocation);
  iconPos.y = namePos.y + 140;
  outerBorderLocation.setAttribute(
    "visibility",
    text !== "" ? "visible" : "hidden"
  );
  return createTextAt(text, iconPos, 100, "Pieces of Eight", append);
}

// Create the piece icon of the given piece name
function createPieceIcon(piece, append = true) {
  if (piece === "") return;
  let iconPos = getCenter(pieceIconLocation);
  let pieceIconElement = document.getElementById(piece).cloneNode(true);
  svg.appendChild(pieceIconElement);
  let bbox = pieceIconElement.getBBox();
  let scale = 10;
  let width = bbox.width * scale;
  let height = bbox.height * scale;
  let cx = iconPos.x - width / 2;
  let cy = iconPos.y - height / 2;
  pieceIconElement.setAttribute("x", cx);
  pieceIconElement.setAttribute("y", cy);
  pieceIconElement.setAttribute("width", width);
  pieceIconElement.setAttribute("height", height);
  pieceIconElement.setAttribute("id", "");
  pieceIconElement.setAttribute("text", piece);
  if (!append) pieceIconElement.remove(pieceIconElement.getBBox());
  return pieceIconElement;
}

// Create a new index in iconList for a new piece to be placed in
function createNewPieceIndex(x = 2, y = 2, x2 = 2, y2 = 2, append = true) {
  iconList.push(new GamePiece(x, y, x2, y2, append));
  displayListLength();
}

// Clear all of the icons for the current piece and side from view
function clearBoard() {
  for (let i = 0; i < iconList[currentPiece].grid[+isStartSide].length; i++) {
    for (
      let j = 0;
      j < iconList[currentPiece].grid[+isStartSide][i].length;
      j++
    ) {
      for (
        let k = 0;
        k < iconList[currentPiece].grid[+isStartSide][i][j].length;
        k++
      ) {
        iconList[currentPiece].grid[+isStartSide][i][j][k].remove();
      }
    }
  }
  // Remove connection lines
  for (
    let i = 0;
    i < iconList[currentPiece].connections[+isStartSide].length;
    i++
  ) {
    iconList[currentPiece].connections[+isStartSide][i].remove();
  }
}

// Redraw all of the icons for the current piece and side from view
function drawBoard() {
  // Draw connection lines
  for (
    let i = 0;
    i < iconList[currentPiece].connections[+isStartSide].length;
    i++
  ) {
    svg.appendChild(iconList[currentPiece].connections[+isStartSide][i]);
  }
  for (let i = 0; i < iconList[currentPiece].grid[+isStartSide].length; i++) {
    for (
      let j = 0;
      j < iconList[currentPiece].grid[+isStartSide][i].length;
      j++
    ) {
      for (
        let k = 0;
        k < iconList[currentPiece].grid[+isStartSide][i][j].length;
        k++
      ) {
        svg.appendChild(iconList[currentPiece].grid[+isStartSide][i][j][k]);
      }
    }
  }
}

// Clears all elements that are not on the grid (name, ability icon)
function clearNonBoard() {
  if (iconList[currentPiece].name) iconList[currentPiece].name.remove();
  if (iconList[currentPiece].ability) iconList[currentPiece].ability.remove();
  if (
    iconList[currentPiece].storage.icons[
      +(!isStartSide && hasDifferentPieceIcons)
    ]
  )
    iconList[currentPiece].storage.icons[
      +(!isStartSide && hasDifferentPieceIcons)
    ].remove();
  if (iconList[currentPiece].storage.start[+isStartSide])
    iconList[currentPiece].storage.start[+isStartSide].remove();
}

// Draw all elements that are not on the grid (name, ability icon)
function drawNonBoard() {
  if (iconList[currentPiece].name) svg.appendChild(iconList[currentPiece].name);
  if (iconList[currentPiece].ability) {
    svg.appendChild(iconList[currentPiece].ability);
    outerBorderLocation.setAttribute(
      "visibility",
      iconList[currentPiece].ability.getAttribute("text") !== ""
        ? "visible"
        : "hidden"
    );
  } else {
    outerBorderLocation.setAttribute("visibility", "hidden");
  }
  if (
    iconList[currentPiece].storage.icons[
      +(!isStartSide && hasDifferentPieceIcons)
    ]
  )
    svg.appendChild(
      iconList[currentPiece].storage.icons[
        +(!isStartSide && hasDifferentPieceIcons)
      ]
    );
  if (iconList[currentPiece].storage.start[+isStartSide])
    svg.appendChild(iconList[currentPiece].storage.start[+isStartSide]);
}

// Delete all icons at position x,y in movement grid
function deleteAtPosition(x, y) {
  for (
    let i = 0;
    i < iconList[currentPiece].grid[+isStartSide][x][y].length;
    i++
  ) {
    if (iconList[currentPiece].grid[+isStartSide][x][y][i])
      iconList[currentPiece].grid[+isStartSide][x][y][i].remove();
  }
  iconList[currentPiece].grid[+isStartSide][x][y] = [];
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
    backwardPiece();
    iconList = iconList.splice(indexToDelete, indexToDelete);
  }
  displayListLength();
}

// Easy macro for switching the side of the current piece
function switchSides() {
  // Clear all of the drawn svgs from the board
  clearBoard();
  clearNonBoard();
  // Flip what current side is shown
  isStartSide = !isStartSide;
  // Redraw the board
  drawNonBoard();
  drawBoard();
  clearInputs();
}

// Move forward one piece in the piece array
function forwardPiece() {
  // Clear all of the drawn svgs from the board
  clearBoard();
  clearNonBoard();
  // Move forwards a piece and reset the what side is shown
  currentPiece++;
  if (currentPiece >= iconList.length) currentPiece = 0;
  isStartSide = true;
  // Redraw the board and update the rest of the UI
  drawNonBoard();
  drawBoard();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  hasDifferentStartLocations = pieceHasDifferentStartPositions();
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
  if (currentPiece < 0) currentPiece = iconList.length - 1;
  isStartSide = true;
  // Redraw the board and update the rest of the UI
  drawNonBoard();
  drawBoard();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  hasDifferentStartLocations = pieceHasDifferentStartPositions();
  clearInputs();
  displayListLength();
}

// Clear the input fields and fill with the information of the new piece if there is any information present
function clearInputs() {
  pieceIconInput.value = "";
  oppositeIconSideInput.checked = hasDifferentPieceIcons;
  oppositeStartSideInput.checked = hasDifferentStartLocations;
  nameInput.value = iconList[currentPiece].name
    ? iconList[currentPiece].name.getAttribute("text")
    : "";
  abilityInput.value = iconList[currentPiece].ability
    ? romanToInt(iconList[currentPiece].ability.getAttribute("text"))
    : "";
  amountInput.value = iconList[currentPiece].count
    ? iconList[currentPiece].count
    : 1;
  xInput.value = iconList[currentPiece].startPos[+isStartSide][0]
    ? iconList[currentPiece].startPos[+isStartSide][0]
    : 2;
  yInput.value = iconList[currentPiece].startPos[+isStartSide][1]
    ? iconList[currentPiece].startPos[+isStartSide][1]
    : 2;
}

// Check if the current piece has different icons
function pieceHasDifferentIcons() {
  if (
    iconList[currentPiece].storage.icons[1] &&
    iconList[currentPiece].storage.icons[0]
  ) {
    return (
      iconList[currentPiece].storage.icons[1].getAttribute("text") !==
      iconList[currentPiece].storage.icons[0].getAttribute("text")
    );
  }
  return false;
}

// Check if the current piece has different starting positions
function pieceHasDifferentStartPositions() {
  return (
    iconList[currentPiece].startPos[0][0] !==
      iconList[currentPiece].startPos[1][0] ||
    iconList[currentPiece].startPos[0][1] !==
      iconList[currentPiece].startPos[1][1]
  );
}

// Process keyboard inputs
function keyboardShortcuts(e) {
  switch (e.code) {
    case "KeyZ":
      backwardPiece();
      break;
    case "KeyX":
      forwardPiece();
      break;
    case "KeyN":
      createNewPiece();
      break;
    case "KeyS":
      switchSides();
      break;
    case "KeyE":
      exportPieces();
      break;
  }
}

// Export all of the pieces and download it as a JSON file
function exportPieces() {
  let object = {};
  object.options = {};
  object.options.exporterVersion = exporterVersion;
  object.options.font = currentFont;

  object.pieces = [];
  for (let i = 0; i < iconList.length; i++) {
    let pieceObject = {};
    let iconArray = [];
    for (let j = 0; j < 2; j++) {
      let sideArray = [];
      for (let x = 0; x < iconList[i].grid[j].length; x++) {
        let xArray = [];
        for (let y = 0; y < iconList[i].grid[j][x].length; y++) {
          let yArray = [];
          for (let k = 0; k < iconList[i].grid[j][x][y].length; k++) {
            yArray.push(iconList[i].grid[j][x][y][k].getAttribute("icon"));
          }
          xArray.push(yArray);
        }
        sideArray.push(xArray);
      }
      iconArray.push(sideArray);
    }
    pieceObject.grid = {};
    pieceObject.grid.startSide = iconArray[1];
    pieceObject.grid.startNonSide = iconArray[0];
    pieceObject.name = iconList[i].name
      ? iconList[i].name.getAttribute("text")
      : "";
    pieceObject.ability = iconList[i].ability
      ? romanToInt(iconList[i].ability.getAttribute("text"))
      : "";
    pieceObject.icon = iconList[i].storage.icons[0]
      ? iconList[i].storage.icons[0].getAttribute("text")
      : "";
    pieceObject.altIcon = iconList[i].storage.icons[1]
      ? iconList[i].storage.icons[1].getAttribute("text")
      : "";
    pieceObject.amount = iconList[i].count ? iconList[i].count : 1;
    pieceObject.startPosition = iconList[i].startPos;
    pieceObject.connections = iconList[i].connections;
    object.pieces.push(pieceObject);
  }
  downloadJSON(object);
}

// Downloads given data as a json file, used for exporter
function downloadJSON(content) {
  let a = document.createElement("a");
  let file = new Blob([JSON.stringify(content)], { type: "text/plain" });
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
    setImportedData(result);
    hasDifferentPieceIcons = pieceHasDifferentIcons();
    hasDifferentStartLocations = pieceHasDifferentStartPositions();
    clearInputs();
  };
  fr.readAsText(element.files.item(0));
}

// Uses imported JSON object to set the correct variables
function setImportedData(data) {
  clearNonBoard();
  clearBoard();
  if (data.options.font && availableFonts.get(data.options.font))
    currentFont = data.options.font;
  iconList = [];
  for (let i = 0; i < data.pieces.length; i++) {
    let startPos = [
      [2, 2],
      [2, 2],
    ];
    if (data.options.exporterVersion === 1) {
      startPos = data.pieces[i].startPosition
        ? [data.pieces[i].startPosition, data.pieces[i].startPosition]
        : [
            [2, 2],
            [2, 2],
          ];
    } else {
      startPos = data.pieces[i].startPosition
        ? data.pieces[i].startPosition
        : [
            [2, 2],
            [2, 2],
          ];
    }
    createNewPieceIndex(
      startPos[1][0],
      startPos[1][1],
      startPos[0][0],
      startPos[0][1],
      false
    );
    for (let j = 0; j < data.pieces[i].grid.startSide.length; j++) {
      for (let k = 0; k < data.pieces[i].grid.startSide[j].length; k++) {
        let gridPos = [j, k];
        let gridSquareElement = document.getElementById(
          "X" + gridPos[0] + gridPos[1]
        );
        let gridSquareCenter = getCenter(gridSquareElement);
        for (let l = 0; l < data.pieces[i].grid.startSide[j][k].length; l++) {
          iconList[i].grid[1][gridPos[0]][gridPos[1]].push(
            createIconAt(
              data.pieces[i].grid.startSide[j][k][l],
              gridSquareCenter,
              gridPos,
              false
            )
          );
        }
        for (
          let l = 0;
          l < data.pieces[i].grid.startNonSide[j][k].length;
          l++
        ) {
          iconList[i].grid[0][gridPos[0]][gridPos[1]].push(
            createIconAt(
              data.pieces[i].grid.startNonSide[j][k][l],
              gridSquareCenter,
              gridPos,
              false
            )
          );
        }
      }
    }
    iconList[i].name = createPieceName(data.pieces[i].name, false);
    iconList[i].ability = createPieceAbilityText(
      romanize(data.pieces[i].ability),
      false
    );
    iconList[i].storage.icons[0] = createPieceIcon(data.pieces[i].icon, false);
    iconList[i].storage.icons[1] = createPieceIcon(
      data.pieces[i].altIcon,
      false
    );
    iconList[i].count = data.pieces[i].amount;
    iconList[i].startPos = startPos;
    iconList[i].storage.start = createStartIconsAt(
      startPos[1][0],
      startPos[1][1],
      startPos[0][0],
      startPos[0][1],
      false
    );
    if (data.pieces[i].connections)
      iconList[i].connections = data.pieces[i].connections;
    iconList[i].storage.connections = [[], []];
    for (let j = 0; j < iconList[i].connections.length; j++) {
      for (let k = 0; k < iconList[i].connections[j].length; k++) {
        let x1 = iconList[i].connections[j][k][0][0];
        let y1 = iconList[i].connections[j][k][0][1];
        let x2 = iconList[i].connections[j][k][1][0];
        let y2 = iconList[i].connections[j][k][1][1];
        let center1 = getCenter(document.getElementById("X" + x1 + y1));
        let center2 = getCenter(document.getElementById("X" + x2 + y2));
        let line = createLine(
          center1.x,
          center1.y,
          center2.x,
          center2.y,
          "rgb(35, 31, 32)",
          "20"
        );
        iconList[i].storage.connections[j].push(line);
      }
    }
  }
  drawBoard();
  drawNonBoard();
}

// Turns number value into roman numerals, used for ability numbers
function romanize(num) {
  if (isNaN(num)) return NaN;
  let digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
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

// Translate roman numeral string into the current integer value
function romanToInt(s) {
  let accumulator = 0;
  for (let i = 0; i < s.length; i++) {
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
  iconList[currentPiece].name = createPieceName(e.target.value);
}

// Change the ability of the current piece
function changeAbility(e) {
  // If the input is outside of the desired range, return
  if (e.target.value < 0 || e.target.value > 100) return;
  iconList[currentPiece].ability = createPieceAbilityText(
    romanize(e.target.value),
    true
  );
}

// Change the amount of pieces that appear in the set
function changeAmount(e) {
  // If the input is outside of the desired range, return
  if (e.target.value < 0) return;
  iconList[currentPiece].count = parseInt(e.target.value);
}

// Change the piece icon of the current piece
function changePieceIcon() {
  if (iconList[currentPiece].storage.icons[0])
    iconList[currentPiece].storage.icons[0].remove();
  if (iconList[currentPiece].storage.icons[1])
    iconList[currentPiece].storage.icons[1].remove();
  iconList[currentPiece].storage.icons[
    +(!isStartSide && hasDifferentPieceIcons)
  ] = createPieceIcon(pieceIconInput.value);
}

// Toggle if the non start side of the piece has a different icon from the start side
function toggleOppositePieceSide() {
  hasDifferentPieceIcons = oppositeIconSideInput.checked;
}

function toggleOppositeStartLocation() {
  hasDifferentStartLocations = oppositeStartSideInput.checked;
}

// Change the position of the start piece location
function changeStartPosition() {
  let x = parseInt(xInput.value);
  let y = parseInt(yInput.value);
  // If outside the range of the board, return
  if (x < 0 || x > 4 || y < 0 || y > 4) return;
  // Remove the drawn start position icons
  iconList[currentPiece].storage.start[0].remove();
  iconList[currentPiece].storage.start[1].remove();
  // Create a new icon at given location and append
  if (hasDifferentStartLocations) {
    iconList[currentPiece].startPos[+isStartSide] = [x, y];
  } else {
    iconList[currentPiece].startPos = [
      [x, y],
      [x, y],
    ];
  }
  x1 = iconList[currentPiece].startPos[1][0];
  y1 = iconList[currentPiece].startPos[1][1];
  x2 = iconList[currentPiece].startPos[0][0];
  y2 = iconList[currentPiece].startPos[0][1];
  iconList[currentPiece].storage.start = createStartIconsAt(x1, y1, x2, y2);
  svg.appendChild(iconList[currentPiece].storage.start[+isStartSide]);
}

// Export the current list of pieces as a grid
// WARNING: THE WIDTH AND HEIGHT ARE ALL TOPSY TURVY AND MESSED UP
// WARNING WARNING, IF MESSED WITH IT WILL BE CONFUSING
function exportPiecesAsGrid(
  drawCuts = true,
  drawPieces = true,
  lineColor = "blue"
) {
  // Get the width and height of the rendered grid
  let width = parseInt(widthInput.value);
  let height = parseInt(heightInput.value);
  // If the user has put in a number that is too small (done through typing in a number less than zero) exit the function
  if (width < 1 || height < 1) return;
  // Used for scaling render up to higher resolutions
  let scale = 1;
  // Size of the pieces in the svg
  let pieceSize = 200 * scale;
  // Spacing between the individual piece
  let spacing = 20 * scale;
  // Offset so that the grid can be fully drawn on the svg
  let offset = 10 * scale;
  // Distance between the piece and the cut lines box
  let lineDistance = 5;
  // Keep track of how many times the current piece has been used in the render
  // Used for pieces that appear multiple times
  let repeatPiece = 0;
  // Calculate and set the width and height of the canvas so that all of the pieces will fit in view
  // Add + 1 to the width and height just to make sure that nothing is cut off
  // This won't affect anything when laser cutting
  let canvasWidth = (pieceSize + spacing + offset) * (height + 1);
  let canvasHeight = (pieceSize + spacing + offset) * (width + 1);
  let startSideCanvas = document.getElementById("startSideCanvas");
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas");
  // Keep track of the index so that generation can be cut off early
  let index = 0;
  // Store the value of i and j so that they can be used in calculations later
  let i = 0;
  let j = 0;
  for (i = 0; i < width; i++) {
    if (isLegacyCutLines && drawCuts) {
      // Creates horizontal lines that extended across the entire canvas
      let heightSpacing = (pieceSize + spacing) * i - spacing / 2 + offset;
      let canvasHeightSpacing =
        (pieceSize + spacing) * height - spacing / 2 + offset;
      startSideCanvas.append(
        createLine(
          offset / 2,
          heightSpacing,
          canvasHeightSpacing,
          heightSpacing
        )
      );
      nonStartSideCanvas.append(
        createLine(
          offset / 2,
          heightSpacing,
          canvasHeightSpacing,
          heightSpacing
        )
      );
    }
    for (j = 0; j < height; j++) {
      // If there are no more pieces to render, exit the loop
      if (index >= iconList.length) {
        break;
      }
      if (drawPieces) {
        // Clone the current piece and add the start and non start side to the two different renders
        let svgStartSideClone = svg.cloneNode(true);
        startSideCanvas.append(svgStartSideClone);
        // Calculate the transformation of the current piece and apply to both sides
        let translation =
          "translate(" +
          ((spacing + pieceSize) * j + offset) +
          " " +
          ((spacing + pieceSize) * i + offset) +
          ")";
        svgStartSideClone.setAttribute("transform", translation);
        svgStartSideClone.setAttribute("width", pieceSize);
        svgStartSideClone.setAttribute("height", pieceSize);
        switchSides();
        let svgNonStartSideClone = svg.cloneNode(true);
        nonStartSideCanvas.append(svgNonStartSideClone);
        svgNonStartSideClone.setAttribute("transform", translation);
        svgNonStartSideClone.setAttribute("width", pieceSize);
        svgNonStartSideClone.setAttribute("height", pieceSize);
        switchSides();
      }
      // Increment the amount of times the piece has been seen in the current render
      // If it has been used the correct number of times, move onto the next piece
      repeatPiece++;
      if (repeatPiece >= iconList[currentPiece].count) {
        repeatPiece = 0;
        index++;
        forwardPiece();
      }
      if (isLegacyCutLines && drawCuts) {
        // Creates vertical lines that extended across the entire canvas
        let widthSpacing = (pieceSize + spacing) * j - spacing / 2 + offset;
        let canvasWidthSpacing =
          (pieceSize + spacing) * width - spacing / 2 + offset;
        startSideCanvas.append(
          createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing)
        );
        nonStartSideCanvas.append(
          createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing)
        );
      } else if (drawCuts) {
        // Just for ease
        let x = j;
        let y = i;
        // Creates a box around the current piece for cutting
        // Allows for having a clean cut, while also leaving a hole
        // Constructed using four separate lines though might be possible with a square element
        let tlX = (spacing + pieceSize) * x + offset - lineDistance;
        let trX = (spacing + pieceSize) * x + pieceSize + offset + lineDistance;
        let tlY = (spacing + pieceSize) * y + offset - lineDistance;
        let trY = (spacing + pieceSize) * y + pieceSize + offset + lineDistance;

        // Square
        startSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor));
        nonStartSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor));
      }
    }
  }
  if (isLegacyCutLines && drawCuts) {
    // Create extra lines at the end of the vertical and horizontals of the grids that are missed during normal generation
    // Create extra vertical line at the very right of the canvas that extends the entire height
    let widthSpacing = (pieceSize + spacing) * j - spacing / 2 + offset;
    let canvasWidthSpacing =
      (pieceSize + spacing) * width - spacing / 2 + offset;
    startSideCanvas.append(
      createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing)
    );
    nonStartSideCanvas.append(
      createLine(widthSpacing, offset / 2, widthSpacing, canvasWidthSpacing)
    );
    // Create extra horizontal line at the bottom of the canvas that extends the entire width
    let heightSpacing = (pieceSize + spacing) * i - spacing / 2 + offset;
    let canvasHeightSpacing =
      (pieceSize + spacing) * height - spacing / 2 + offset;
    startSideCanvas.append(
      createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing)
    );
    nonStartSideCanvas.append(
      createLine(offset / 2, heightSpacing, canvasHeightSpacing, heightSpacing)
    );
  }
  // Reset canvas height to fit the amount of pieces generated
  canvasHeight = (pieceSize + spacing + offset) * i;
  startSideCanvas.setAttribute("width", canvasWidth);
  startSideCanvas.setAttribute("height", canvasHeight);
  nonStartSideCanvas.setAttribute("width", canvasWidth);
  nonStartSideCanvas.setAttribute("height", canvasHeight);
}

// Draw a line between the two points given
// Used for when adding the cut lines
function createLine(
  x1,
  y1,
  x2,
  y2,
  color = "rgb(35, 31, 32)",
  strokeWidth = "1"
) {
  let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  newLine.setAttribute("x1", x1);
  newLine.setAttribute("y1", y1);
  newLine.setAttribute("x2", x2);
  newLine.setAttribute("y2", y2);
  newLine.setAttribute("stroke", color);
  newLine.setAttribute("stroke-width", strokeWidth);
  return newLine;
}

// Draw a rectangle around the given points
// Used for when adding the cut lines
function createRect(x1, y1, x2, y2, color = "blue", strokeWidth = "1") {
  let newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let height = y2 - y1;
  let width = x2 - x1;
  newRect.setAttribute("x", x1);
  newRect.setAttribute("y", y1);
  newRect.setAttribute("width", width);
  newRect.setAttribute("height", height);
  newRect.setAttribute("stroke", color);
  newRect.setAttribute("fill", "transparent");
  newRect.setAttribute("stroke-width", strokeWidth);
  return newRect;
}

// Save SVG to a file of the given name
// Credit to senz on stackoverflow
function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let svgData = svgEl.outerHTML;
  let preface = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n';
  let svgBlob = new Blob([preface, svgData], {
    type: "image/svg+xml;charset=utf-8,base64",
  });
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Convert SVG to PNG and download to file of the given name
function savePng(svgEl, name) {
  let svgText = new XMLSerializer().serializeToString(svgEl);
  let bbox = svgEl.getBBox();
  let canvas = document.createElement("canvas");
  canvas.width = bbox.width + 20; // + 20 only there to prevent cut off
  canvas.height = bbox.height + 20;
  let ctx = canvas.getContext("2d");
  let img = new Image();
  let svgBlob = new Blob([svgText], {
    type: "image/svg+xml;base64,charset=utf-8",
  }); // The base64 is needed for font to show up in the png
  let url = URL.createObjectURL(svgBlob);
  img.src = url;
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    let png = canvas.toDataURL("image/png");
    let pngContainer = document.getElementById("pngContainer");
    pngContainer.setAttribute("src", png);
    let imgURI = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = imgURI;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
}

// Download the starting side grid render as an svg
function downloadStartSideRender(
  drawCuts = true,
  drawPieces = true,
  filename = "startside",
  lineColor = "blue"
) {
  // Get the start side render canvas, remove all of the children, append the style and the render and save
  let startSideCanvas = document.getElementById("startSideCanvas");
  removeAllChildNodes(startSideCanvas);
  startSideCanvas.append(exportStyle);
  exportPiecesAsGrid(drawCuts, drawPieces, lineColor);
  if (svgInput.checked) {
    saveSvg(startSideCanvas, filename + ".svg");
  } else if (pngInput.checked) {
    savePng(startSideCanvas, filename + ".png");
  }
}

// Download the non starting side grid render as an svg
function downloadNonStartSideRender(
  drawCuts = true,
  drawPieces = true,
  filename = "nonStartside",
  lineColor = "blue"
) {
  // Get the non start side render canvas, remove all of the children, append the style and the render and save
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas");
  removeAllChildNodes(nonStartSideCanvas);
  nonStartSideCanvas.append(exportStyle);
  exportPiecesAsGrid(drawCuts, drawPieces, lineColor);
  if (svgInput.checked) {
    saveSvg(nonStartSideCanvas, filename + ".svg");
  } else if (pngInput.checked) {
    savePng(nonStartSideCanvas, filename + ".png");
  }
}

// Remove all children node of the given element
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

// Add a line connecting two different movement icons
function addLineConnector() {
  let x1 = parseInt(xLineInput1.value);
  let y1 = parseInt(yLineInput1.value);
  let x2 = parseInt(xLineInput2.value);
  let y2 = parseInt(yLineInput2.value);
  // If outside the range of the board or not defined, return
  if (
    !x1 ||
    !y1 ||
    x1 < 0 ||
    x1 > 4 ||
    y1 < 0 ||
    y1 > 4 ||
    !x2 ||
    !y2 ||
    x2 < 0 ||
    x2 > 4 ||
    y2 < 0 ||
    y2 > 4 ||
    (x1 === x2 && y1 === y2) ||
    connectionExists(x1, y1, x2, y2)
  )
    return;
  iconList[currentPiece].startPos[+isStartSide].push([
    [x1, y1],
    [x2, y2],
  ]);
  let center1 = getCenter(document.getElementById("X" + x1 + y1));
  let center2 = getCenter(document.getElementById("X" + x2 + y2));
  let line = createLine(
    center1.x,
    center1.y,
    center2.x,
    center2.y,
    "rgb(35, 31, 32)",
    "20"
  );
  iconList[currentPiece].connections[+isStartSide].push(line);
  clearBoard();
  drawBoard();
}

// Checks if a line connection already exists in the current piece
// Used to make sure no duplicate lines are placed onto the board
function connectionExists(x1, y1, x2, y2) {
  const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (
    let i = 0;
    i < iconList[currentPiece].startPos[+isStartSide].length;
    i++
  ) {
    if (
      (equals(iconList[currentPiece].startPos[+isStartSide][i][0], [x1, y1]) &&
        equals(iconList[currentPiece].startPos[+isStartSide][i][1], [
          x2,
          y2,
        ])) ||
      (equals(iconList[currentPiece].startPos[+isStartSide][i][1], [x1, y1]) &&
        equals(iconList[currentPiece].startPos[+isStartSide][i][0], [x2, y2]))
    )
      return true;
  }
  return false;
}

function changeFont() {
  currentFont = fontInput.value;
  iconList[currentPiece].name = createPieceName(nameInput.value);
}

init();
