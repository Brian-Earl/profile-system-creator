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
// https://alvarotrigo.com/blog/prevent-scroll-on-scrollable-element-js/
// https://stackoverflow.com/questions/5891552/more-usage-of-gettransformtoelement
// https://www.freecodecamp.org/news/how-to-reverse-a-string-in-javascript-in-3-different-ways-75e4763c68cb/
// https://bobbyhadz.com/blog/javascript-split-string-only-on-first-instance-of-character
// https://www.oreilly.com/library/view/svg-text-layout/9781491933817/ch04.html
// https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space

// TODO:
// Add multiple pages for renders when all of the pieces cannot fit on one
// Add custom SVG icon support
// Revamp UI
// Redo Icons (look at Start Side Icon Affinity File)
// Store what peices (if any) a piece should replace such as how Arthur replaces the Duke

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

// Keeps track of if the user can scroll the screen
let canScroll = true;

// List of available icons where each index is the id of an SVG element
const movementIcons = [
  // "testIcon",
  "move",
  "jump",
  "slide",
  "jumpSlide",
  "hammer",
  "strike",
  "defense",
  "shieldDefense",
  "dread",
  "smash",
  "nonCaptureMove",
  "nonCaptureJump",
  "nonCaptureSlide",
  "nonCaptureJumpSlide",
  "command",
  "singleFormation",
  "fullFormation",
  "clear",
];

// List of available fonts
const availableFonts = new Map();
availableFonts.set("dukeFont", "Pieces of Eight");
availableFonts.set("arthurFont", "Xenippa");
availableFonts.set("musketeersFont", "Lucida Blackletter");
availableFonts.set("conanFont", "Hiroshige LT Medium");
availableFonts.set("jarlFont", "Comic Runes");
availableFonts.set("centurionFont", "Xtra");
availableFonts.set("robinHoodFont", "Goudy Old Style");

// Default the font to Pieces of Eight
let currentFont = "dukeFont";

// Indicated if the current piece is on the starting side or not
let isStartSide = true;

// Keeps track of if each side of the piece has a different name
let hasDifferentNames = false;

// Keeps track of if the piece has different piece icons on each side such as the Oracle
let hasDifferentPieceIcons = false;

// Keeps track of if the piece has different starting locations
let hasDifferentStartLocations = false;

// Keeps track of if both the pieces sides are start sides
let hasBothStartSides = false;

// Keeps track of which side the ability should be shown on
let showAbilitySide = 'both';

// Get the SVG element for the entire template
let svg = document.getElementById("svg");
// When the mouse is over the template and the user scrolls, call mouseOnScroll()
svg.addEventListener("wheel", mouseOnScroll);

// Get elements for the grid and single icon border
let gridElement = document.getElementById("Grid");
let pieceGraphicsBorderElement = document.getElementById("Piece-Graphics");
let singleIconBorderElement = document.getElementById("SingleIconBorder");

// Get the SVG element for where the piece name goes
let nameLocation = document.getElementById("Piece-Name");

// Get the SVG element for where the piece icon goes
let pieceIconLocation = document.getElementById("Piece-Icon");
let singleIconLocation = document.getElementById("Inner-Border");

// Get the SVG element for where the player marker is
let playerMarkerLocation = document.getElementById("Starting-Side");

// Get the SVG element for the outer border used to indicate when a
// piece has a special ability
let outerBorderLocation = document.getElementById("Outer-Border");

// Get element for importing JSONs for pieces
let importFileLocation = document.getElementById("importPiecesInput");

// ID number of current piece being worked on
// Used so that multiple pieces can be worked on at a given time
let currentPiece = 0;

// Store the color black used for the pieces 
let blackColor = "rgb(35, 31, 32)";

// How much to scale down pieces by is they have abilities 
const scaleDownFactor = (100.8 / 104.5);

// Current version of the exporter that creates the exported JSON files
// this isn't needed currently though I want to future proof everything just in case
// This will be used for when new features to the EXPORTER are added such as
// allowing for custom icons that need to be stored in the json file
// this is different from the site version which handles the actual rendering and creating
// of the SVG files
let exporterVersion = 6;

// Current version of the site
// Will only start incrementing them after the "official release"
let siteVersion = 1.0;

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
let bothStartSideInput = document.getElementById("bothStartSideInput");
bothStartSideInput.addEventListener("change", toggleBothStartLocation);
let oppositeNameSideInput = document.getElementById("oppositeNameSideInput");
oppositeNameSideInput.addEventListener("change", toggleOppositeName);
let amountInput = document.getElementById("amountInput");
amountInput.addEventListener("change", changeAmount);
let xInput = document.getElementById("xInput");
xInput.addEventListener("change", changeStartPosition);
let yInput = document.getElementById("yInput");
yInput.addEventListener("change", changeStartPosition);
let svgInput = document.getElementById("svgInput");
let pngInput = document.getElementById("pngInput");
let renderScaleInput = document.getElementById("renderScaleInput");
renderScaleInput.addEventListener("change", handleRenderScale);
let cutLineWidthInput = document.getElementById("cutLineWidthInput");
cutLineWidthInput.addEventListener("change", handleCutLineWidth);
let xLineInput1 = document.getElementById("xLineInput1");
let yLineInput1 = document.getElementById("yLineInput1");
let xLineInput2 = document.getElementById("xLineInput2");
let yLineInput2 = document.getElementById("yLineInput2");
let fontInput = document.getElementById("fontInput");
let normalTypeInput = document.getElementById("normalTypeInput");
normalTypeInput.addEventListener("change", changePieceType);
let singleIconTypeInput = document.getElementById("singleIconTypeInput");
singleIconTypeInput.addEventListener("change", changePieceType);
let bothSideAbiltyInput = document.getElementById("bothSideAbiltyInput");
bothSideAbiltyInput.addEventListener("change", changeAbilitySide);
let startSideAbiltyInput = document.getElementById("startSideAbiltyInput");
startSideAbiltyInput.addEventListener("change", changeAbilitySide);
let nonStartSideAbiltyInput = document.getElementById("nonStartSideAbiltyInput");
nonStartSideAbiltyInput.addEventListener("change", changeAbilitySide);

// Get elements for the display of the current piece index and total piece number
let currentPieceNumberElement = document.getElementById("currentPieceNumber");
let totalPieceNumberElement = document.getElementById("totalPieceNumber");
let currentSideNumber = document.getElementById("currentSideNumber");

// Get elements for the width and height when generation the grid svg
let widthInput = document.getElementById("widthInput");
let heightInput = document.getElementById("heightInput");
let spacingInput = document.getElementById("spacingInput");

// Get element for the styles appended onto the SVG before it is exported
let exportStyle = document.getElementById("exportStyles");

class GamePiece {
  constructor(x = 2, y = 2, x2 = 2, y2 = 2, type = "normal", append = true, bothStartSides = false) {

    // Keep track of what type the current piece
    // It can either be "normal" or "singleIcon"
    this.type = type;

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

    // Store the name and alt name
    this.name = "";
    this.altName = "";
    // Store the ability number
    this.ability = "";
    this.abilitySide = "both";
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
    this.storage.start = createStartIconsAt(x, y, x2, y2, append, bothStartSides);
    // Store the line objects of connecting lines
    this.storage.connections = [[], []];
    // Store if both sides are start positions
    this.bothStartSides = bothStartSides;

    // Store the number of pieces in the set
    this.count = 1;
  }
}

// Initialization function
function init() {
  createNewPieceIndex();
  clearInputs();
  initInputs();
}

// Handle the user mousing over a grid square
function mouseOverGridSquare(item) {
  // Disable scrolling
  disableScroll()
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
  // Reenable scrolling
  enableScroll()
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
  let ctm = getTransformToElement(item, item.nearestViewportElement)
  //let ctm = item.getTransformToElement(item.nearestViewportElement);
  let cx = bbox.x + bbox.width / 2;
  let cy = bbox.y + bbox.height / 2;
  let pt = item.nearestViewportElement.createSVGPoint();
  pt.x = cx;
  pt.y = cy;
  return pt.matrixTransform(ctm);
}

// Replacement for getTransformToElement() as it throws errors in other browsers
// It seems that the function is depricated or something and I can hardly find
// anything on it besides posts from over 10 years ago
function getTransformToElement(fromElement, toElement) {
  return toElement.getScreenCTM().inverse().multiply(fromElement.getScreenCTM())
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
  if (isRotate(icon)) {
    newIconElement.setAttribute(
      "transform",
      rotateIcon(gridPos, cx, cy, width, height, isNintyDegrees(icon, getCurrentName()), isSideways(icon, getCurrentName()))
    );
  }
  newIconElement.setAttribute("x", cx);
  newIconElement.setAttribute("y", cy);
  newIconElement.setAttribute("width", width);
  newIconElement.setAttribute("height", height);
  newIconElement.setAttribute("id", "");
  newIconElement.setAttribute("icon", icon);
  newIconElement.setAttribute("visibility", "visible");
  // Add this styling so that movement icons will ignore mouse events
  // If not set then the icons are placed in front of the mouse, canceling the mouse
  // event of the grid square, making the icon disappear and requiring the user to move their
  // mouse into a particular location to prevent this issue.
  newIconElement.style.pointerEvents = "none";
  if (!append) newIconElement.remove();
  return newIconElement;
}

// Create a start icons at the two given positions
// x and y are for the start side
// x2 and y2 are for the non start side
function createStartIconsAt(x, y, x2, y2, append = true, bothStartSides = false) {
  return [
    createIconAt(
      (!bothStartSides ? "NonStartSide" : "StartSide"),
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
function isRotate(icon) {
  return icon === "slide" ||
    icon === "jumpSlide" ||
    icon === "nonCaptureSlide" ||
    icon === "nonCaptureJumpSlide" ||
    icon === "smash";
}

// Returns if an icon should only be rotated by 90 degrees
function isNintyDegrees(icon, name) {
  return icon === "smash" || 
  (icon === "nonCaptureSlide" && (name === "Legionnaire" || name === "Centurion"))
}

// Returns if an icon should prefer being pointed upwards or sideways
function isSideways(icon, name) {
  return (icon === "nonCaptureSlide" && (name === "Legionnaire" || name === "Centurion"))
}

// Return the name of the current piece
function getCurrentName() {
  return iconList[currentPiece].name[0].getAttribute("text");
}

// Returns if the icon given is one that is full sized
// This is used for determining which "slot" a icon should take up
// so that multiple icons can be placed on the same grid location
// such as a command and a slide or a singe formation and a non capture jump
function isFullSize(icon) {
  return icon === "command" ||
    icon === "singleFormation" ||
    icon === "fullFormation"
}

// Return transform attribute for rotating an icon
function rotateIcon(gridPos, cx, cy, width, height, nintyDegrees = false, preferSideways = false) {
  return (
    "rotate(" +
    getRotateDegrees(gridPos, nintyDegrees, preferSideways) +
    " " +
    (cx + width / 2) +
    " " +
    (cy + height / 2) +
    ")" +
    " translate(" +
    "0" +
    " " +
    getYTranslation(gridPos, height, nintyDegrees) +
    ")"
  );
}

// Returns transformation attribute for scaling an icon
function scaleIcon(icon) {
  return "scale(" + scaleFactor(icon) + ")";
}

// Returns how much to scale a certain icon by
function scaleFactor(icon) {
  if (icon === "move") return 1.05;
  if (icon === "nonCaptureMove") return 1.05;
  if (icon === "jump") return 1.1;
  if (icon === "nonCaptureJump") return 1.15;
  if (icon === "slide") return 0.95;
  if (icon === "nonCaptureSlide") return 0.95;
  if (icon === "nonCaptureJumpSlide") return 1.25;
  if (icon === "jumpSlide") return 1.15;
  if (icon === "strike") return 1.1;
  if (icon === "hammer") return 1.1;
  if (icon === "defense") return 0.95;
  if (icon === "shieldDefense") return 0.95;
  if (icon === "singleFormation") return 0.95;
  if (icon === "fullFormation") return 1.1;
  return 1;
}

// Calculate the angle in which to rotate the current movement
// icon by depending on the start position of the piece
function getAngle(x, y, nintyDegrees = false, preferSideways = false) {
  return !nintyDegrees ? roundDownToNearest45(
    Math.abs(
      (Math.atan2(
        y - iconList[currentPiece].startPos[+isStartSide][1],
        x - iconList[currentPiece].startPos[+isStartSide][0]
      ) *
        180) /
      Math.PI -
      180
    )
  ) : roundDownToNearest90(
      Math.abs(
        (Math.atan2(
          y - iconList[currentPiece].startPos[+isStartSide][1],
          x - iconList[currentPiece].startPos[+isStartSide][0]
        ) *
          180) /
        Math.PI -
        180
      ),
      preferSideways
    )
}

// Round the given number down to the nearest multiple of 45
// This is used when calculating the angle in which to rotate
// a movement icon by
function roundDownToNearest45(num) {
  return Math.floor(num / 45) * 45;
}

// Round the given number down to the nearest multiple of 90
// This is used when calculating the angle in which to rotate
// a movement icon by
function roundDownToNearest90(num, preferSideways = false) {
  if (num < 90 && num > 0)
    return !preferSideways ? 0 : 90;
  if (num < 270 && num > 180)
    return !preferSideways ? 180: 270;
  if (preferSideways && num < 180 && num > 90)
    return 90;
  if (preferSideways && num > 270)
    return 270;
  return Math.ceil(num / 90) * 90;
}

// Find the rotation degree based on the grid position
function getRotateDegrees(gridPos, nintyDegrees = false, preferSideways = false) {
  return getAngle(gridPos[1], gridPos[0], nintyDegrees, preferSideways);
}

// Find how much to translate along the Y axis based on the grid position
// Used for fixing issues regarding the position when translated
function getYTranslation(gridPos, height, nintyDegrees = false) {
  return getAngle(gridPos[1], gridPos[0]) % 90 === 0 || nintyDegrees ? 0 : -1 * (height / 6);
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
  textList,
  text,
  pos,
  heightJig,
  fontSize,
  fontFamily = "Pieces of Eight",
  append = true,
  altFontSize = 0
) {
  let newTexts = []
  textList.forEach((elem, index) => {
    let svgNS = "http://www.w3.org/2000/svg";
    let newText = document.createElementNS(svgNS, "text");
    newText.setAttribute("font-size", fontSize);
    newText.setAttribute("font-family", fontFamily);
    newText.setAttribute("font-weight", getFontWeight())
    newText.setAttribute("text", text);
    newText.setAttribute("fill", "currentColor");
    newText.setAttribute("text-anchor", "middle");
    newText.setAttribute("dominant-baseline", "middle")
    let cy = (heightJig * 2) / 3;
    // If there are multiple lines of text, change height accordingly
    if (textList.length > 1) {
      if (index === 0)
        cy = heightJig * -1;
      else {
        cy = heightJig * 2;
        if (currentFont === "conanFont")
          cy = heightJig * 2.5
        newText.setAttribute("font-size", altFontSize);
      }
    } else {
      if (currentFont === "jarlFont" || currentFont === "centurionFont")
        cy = 0
    }
    newText.setAttribute("x", pos.x);
    newText.setAttribute("y", pos.y + cy);
    newText.appendChild(document.createTextNode(elem));
    svg.appendChild(newText);
    if (!append) newText.remove();
    newTexts.push(newText);
  });
  return newTexts;
}

// Create a text element of the given piece name
function createPieceName(text, append = true, isImport = false, isSingleIcon = false) {
  let namePos = getCenter(nameLocation);
  if (!isImport) {
    if (iconList[currentPiece].name) iconList[currentPiece].name.forEach(elem => elem.remove());
    if (iconList[currentPiece].altName) iconList[currentPiece].altName.forEach(elem => elem.remove());
    if ((iconList[currentPiece].type && iconList[currentPiece].type === "singleIcon")) namePos.x = getCenter(singleIconLocation).x;
  } else {
    if (isSingleIcon) namePos.x = getCenter(singleIconLocation).x;
  }
  let processedText = processText(text);
  let fontSize = getFontSize(processedText[0].length, hasWhiteSpace(text), isAllCaps(processedText[0]));
  return createTextAt(
    processedText,
    text,
    namePos,
    nameLocation.getBBox().height / 2,
    fontSize,
    availableFonts.get(currentFont),
    append,
    processedText.length > 1 ? getFontSize(processedText[1].length, true, isAllCaps(processedText[1])) : fontSize
  );
}

// Create a text element of the given ability number
function createPieceAbilityText(text, append = true) {
  // If no text is input, return
  if (text === "") return;
  if (iconList[currentPiece].ability) iconList[currentPiece].ability.remove();
  let iconPos = getCenter(pieceIconLocation);
  let namePos = getCenter(nameLocation);
  iconPos.y = namePos.y + (nameLocation.getBBox().height * 1.25); // Used to be + 115
  outerBorderLocation.setAttribute(
    "visibility",
    text !== "" ? "visible" : "hidden"
  );
  let font = availableFonts.get("dukeFont");
  if (currentFont === "jarlFont")
    font = availableFonts.get("jarlFont");
  if (currentFont === "centurionFont")
    font = availableFonts.get("centurionFont");
  return createTextAt(
    [text],
    text,
    iconPos,
    0,
    100,
    font,
    append)[0];
}

// Create the piece icon of the given piece name
function createPieceIcon(piece, append = true, type = "normal") {
  if (piece === "") return;
  let heightAdjust = 2;
  let iconPos = getCenter(pieceIconLocation);
  let scale = 10;
  if (type === "singleIcon") {
    iconPos = getCenter(singleIconLocation)
  }
  let pieceIconElement = document.getElementById(piece).cloneNode(true);
  svg.appendChild(pieceIconElement);
  let bbox = pieceIconElement.getBBox();
  let width = bbox.width * scale;
  let height = bbox.height * scale;
  let cx = iconPos.x - width / 2;
  let cy = iconPos.y - height / heightAdjust;
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
  iconList.push(new GamePiece(x, y, x2, y2, "normal", append));
  displayListLength();
}

// Clear all of the icons for the current piece and side from view
function clearBoard() {
  if (iconList[currentPiece].type === "normal") {
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
      i < iconList[currentPiece].storage.connections[+isStartSide].length;
      i++
    ) {
      iconList[currentPiece].storage.connections[+isStartSide][i].remove();
    }
  }
}

// Redraw all of the icons for the current piece and side from view
function drawBoard() {
  if (iconList[currentPiece].type === "normal") {
    // Draw connection lines
    for (
      let i = 0;
      i < iconList[currentPiece].storage.connections[+isStartSide].length;
      i++
    ) {
      svg.appendChild(iconList[currentPiece].storage.connections[+isStartSide][i]);
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
}

// Clears all elements that are not on the grid (name, ability icon)
function clearNonBoard() {
  if (iconList[currentPiece].type === "normal") {
    if (iconList[currentPiece].ability) {
      iconList[currentPiece].ability.remove();
      outerBorderLocation.setAttribute("visibility", "hidden")
    }
    if (iconList[currentPiece].storage.start[+isStartSide])
      iconList[currentPiece].storage.start[+isStartSide].remove();
  }
  if (hasDifferentNames && iconList[currentPiece].altName) {
    iconList[currentPiece].altName.forEach(elem => elem.remove());
  }
  if (iconList[currentPiece].name) {
    iconList[currentPiece].name.forEach(elem => elem.remove());
  }
  if (
    iconList[currentPiece].storage.icons[
    +(!isStartSide && hasDifferentPieceIcons)
    ]
  )
    iconList[currentPiece].storage.icons[
      +(!isStartSide && hasDifferentPieceIcons)
    ].remove();
}

// Draw all elements that are not on the grid (name, ability icon)
function drawNonBoard() {
  if (iconList[currentPiece].type === "normal") {
    if (iconList[currentPiece].ability) {
      if ((isStartSide &&
        (iconList[currentPiece].abilitySide === "both"
          || iconList[currentPiece].abilitySide === "start")) ||
        (!isStartSide &&
          (iconList[currentPiece].abilitySide === "both"
            || iconList[currentPiece].abilitySide === "nonStart"))) {
        svg.appendChild(iconList[currentPiece].ability);
        outerBorderLocation.setAttribute(
          "visibility",
          iconList[currentPiece].ability.getAttribute("text") !== ""
            ? "visible"
            : "hidden"
        );
      }
    } else {
      outerBorderLocation.setAttribute("visibility", "hidden");
    }
    if (iconList[currentPiece].storage.start[+isStartSide])
      svg.appendChild(iconList[currentPiece].storage.start[+isStartSide]);
  }
  if (hasDifferentNames && !isStartSide && iconList[currentPiece].altName) {
    iconList[currentPiece].altName.forEach(elem => svg.appendChild(elem));
  } else if (((hasDifferentNames && isStartSide) || !hasDifferentNames) && iconList[currentPiece].name) {
    iconList[currentPiece].name.forEach(elem => svg.appendChild(elem));
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

// Display which side the piece is currently on
// it will display either a "1" or a "2"
// This is so you can tell what side you are on when a piece
// has a starting space on both sides
function displaySideNumber() {
  currentSideNumber.innerHTML = !isStartSide + 1
}

// Easy macro to create a new piece index and increment the current piece
function createNewPiece() {
  clearBoard();
  clearNonBoard();
  createNewPieceIndex(x = 2, y = 2, x2 = 2, y2 = 2, append = false);
  currentPiece = iconList.length - 2;
  forwardPiece();
}

// Delete the current piece
function deletePiece() {
  clearBoard();
  clearNonBoard();
  if (iconList.length <= 1) {
    iconList = [];
    createNewPieceIndex();
  } else {
    iconList.splice(currentPiece, 1);
    if (currentPiece >= iconList.length)
      currentPiece--;
  }
  isStartSide = true;
  if (iconList[currentPiece].type === "normal")
    normalGamePiece();
  else if (iconList[currentPiece].type === "singleIcon")
    singleIconPiece();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  hasDifferentStartLocations = pieceHasDifferentStartPositions();
  hasDifferentNames = pieceHasDifferentNames();
  hasBothStartSides = iconList[currentPiece].bothStartSides;
  clearInputs();
  drawNonBoard();
  drawBoard();
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
  displaySideNumber()
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
  if (iconList[currentPiece].type === "normal")
    normalGamePiece();
  else if (iconList[currentPiece].type === "singleIcon")
    singleIconPiece();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  hasDifferentStartLocations = pieceHasDifferentStartPositions();
  hasDifferentNames = pieceHasDifferentNames();
  hasBothStartSides = iconList[currentPiece].bothStartSides;
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
  if (iconList[currentPiece].type === "normal")
    normalGamePiece();
  else if (iconList[currentPiece].type === "singleIcon")
    singleIconPiece();
  hasDifferentPieceIcons = pieceHasDifferentIcons();
  hasDifferentStartLocations = pieceHasDifferentStartPositions();
  hasDifferentNames = pieceHasDifferentNames();
  hasBothStartSides = iconList[currentPiece].bothStartSides;
  clearInputs();
  displayListLength();
}

// Clear the input fields and fill with the information of the new piece if there is any information present
function clearInputs() {
  pieceIconInput.value = "";
  oppositeIconSideInput.checked = hasDifferentPieceIcons;
  oppositeStartSideInput.checked = hasDifferentStartLocations;
  oppositeNameSideInput.checked = hasDifferentNames;
  bothStartSideInput.checked = hasBothStartSides
  if (hasDifferentNames) {
    if (isStartSide) {
      nameInput.value = iconList[currentPiece].name
        ? iconList[currentPiece].name[0].getAttribute("text")
        : "";
    } else {
      nameInput.value = iconList[currentPiece].altName
        ? iconList[currentPiece].altName[0].getAttribute("text")
        : "";
    }
  } else {
    nameInput.value = iconList[currentPiece].name
      ? iconList[currentPiece].name[0].getAttribute("text")
      : "";
  }
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
  normalTypeInput.checked = iconList[currentPiece].type === "normal";
  singleIconTypeInput.checked = iconList[currentPiece].type === "singleIcon"
  bothSideAbiltyInput.checked = iconList[currentPiece].abilitySide === "both";
  startSideAbiltyInput.checked = iconList[currentPiece].abilitySide === "start";
  nonStartSideAbiltyInput.checked = iconList[currentPiece].abilitySide === "nonStart";
}

// Reset input fields only to be set on init
function initInputs() {
  fontInput.value = "dukeFont"
  normalTypeInput.checked = true;
  widthInput.value = 1;
  heightInput.value = 1;
  renderScaleInput.value = 1;
  spacingInput.value = 20;
  cutLineWidthInput.value = 1;
  xLineInput1.value = "";
  yLineInput1.value = "";
  xLineInput2.value = "";
  yLineInput2.value = "";
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

// Check if the piece has different names on each side
function pieceHasDifferentNames() {
  return (iconList[currentPiece].altName !== "" &&
    iconList[currentPiece].altName !== iconList[currentPiece].name)
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
    if (iconList[i].type === "normal") {
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

      pieceObject.ability = iconList[i].ability
        ? romanToInt(iconList[i].ability.getAttribute("text"))
        : "";

      pieceObject.abilitySide = iconList[i].abilitySide;

      pieceObject.startPosition = iconList[i].startPos;
      pieceObject.connections = iconList[i].connections;
    }
    pieceObject.name = iconList[i].name
      ? iconList[i].name[0].getAttribute("text")
      : "";
    pieceObject.altName = iconList[i].altName
      ? iconList[i].altName[0].getAttribute("text")
      : "";
    pieceObject.icon = iconList[i].storage.icons[0]
      ? iconList[i].storage.icons[0].getAttribute("text")
      : "";
    pieceObject.altIcon = iconList[i].storage.icons[1]
      ? iconList[i].storage.icons[1].getAttribute("text")
      : "";
    pieceObject.amount = iconList[i].count ? iconList[i].count : 1;
    pieceObject.type = iconList[i].type ? iconList[i].type : "normal";
    pieceObject.bothStartSides = iconList[i].bothStartSides
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
    hasDifferentNames = pieceHasDifferentNames();
    clearInputs();
  };
  fr.readAsText(element.files.item(0));
}

// Uses imported JSON object to set the correct variables
function setImportedData(data) {
  normalGamePiece()
  clearNonBoard();
  clearBoard();
  currentPiece = 0;
  singleIconBorderElement.setAttribute("visibility", "visable");
  if (data.options.font && availableFonts.get(data.options.font))
    currentFont = data.options.font;
  // By default, set the imported pieces to be arranged as one since line across
  heightInput.value = 1;
  widthInput.value = getNumberOfPieces(data.pieces)
  iconList = [];
  for (let i = 0; i < data.pieces.length; i++) {
    currentPiece = i;
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

    if (data.options.exporterVersion < 3)
      data.pieces[i].type = "normal"

    iconList[i].storage.icons[0] = createPieceIcon(data.pieces[i].icon, false, data.pieces[i].type);
    iconList[i].storage.icons[1] = createPieceIcon(
      data.pieces[i].altIcon,
      false,
      data.pieces[i].type
    );
    if (data.options.exporterVersion < 6)
      data.pieces[i].bothStartSides = false;
    iconList[i].bothStartSides = data.pieces[i].bothStartSides 
    iconList[i].count = data.pieces[i].amount;
    iconList[i].type = data.pieces[i].type;
    iconList[i].name = createPieceName(data.pieces[i].name, false, true, data.pieces[i].type === "singleIcon");
    if (data.options.exporterVersion >= 4 && data.pieces[i].altName !== "") {
      iconList[i].altName = createPieceName(data.pieces[i].altName, false, true, data.pieces[i].type === "singleIcon");
    }
    if (data.pieces[i].type === "normal") {
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

      iconList[i].ability = createPieceAbilityText(
        romanize(data.pieces[i].ability),
        false
      );

      if (data.options.exporterVersion >= 5)
        iconList[i].abilitySide = data.pieces[i].abilitySide;

      iconList[i].startPos = startPos;
      iconList[i].storage.start = createStartIconsAt(
        startPos[1][0],
        startPos[1][1],
        startPos[0][0],
        startPos[0][1],
        false,
        iconList[i].bothStartSides
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
            "20"
          );
          iconList[i].storage.connections[j].push(line);
        }
      }
    }
  }
  if (iconList[currentPiece].type === "singleIcon")
    singleIconPiece()
  currentPiece = 0;
  displayListLength()
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
  if (hasDifferentNames && !isStartSide) iconList[currentPiece].altName = createPieceName(e.target.value);
  else if ((hasDifferentNames && isStartSide) || !hasDifferentNames) iconList[currentPiece].name = createPieceName(e.target.value);
}

// Change the ability of the current piece
function changeAbility(e) {
  clearNonBoard();
  if (e.target.value === "") {
    iconList[currentPiece].ability.remove();
    outerBorderLocation.setAttribute("visibility", "hidden");
    return
  }
  // If the input is outside of the desired range, return
  if (e.target.value < 0 || e.target.value > 100) return;
  iconList[currentPiece].ability = createPieceAbilityText(
    romanize(e.target.value),
    false
  );
  drawNonBoard();
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
  ] = createPieceIcon(pieceIconInput.value, true, iconList[currentPiece].type);
}

// Toggle if the non start side of the piece has a different icon from the start side
function toggleOppositePieceSide() {
  hasDifferentPieceIcons = oppositeIconSideInput.checked;
}

// Toggle if the non start side has a different start location
function toggleOppositeStartLocation() {
  hasDifferentStartLocations = oppositeStartSideInput.checked;
}

// Toggle if the non start side has a different start location
function toggleBothStartLocation() {
  hasBothStartSides = bothStartSideInput.checked
  iconList[currentPiece].bothStartSides = hasBothStartSides
  changeStartPosition()
}

// Toggle if the non start side has a different name
function toggleOppositeName() {
  hasDifferentNames = oppositeNameSideInput.checked;
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
  iconList[currentPiece].storage.start = createStartIconsAt(x1, y1, x2, y2, false, hasBothStartSides);
  svg.appendChild(iconList[currentPiece].storage.start[+isStartSide]);
}

// Reset the current piece back to the first
function setToFirstPiece() {
  clearBoard();
  clearNonBoard();
  currentPiece = 0;
  drawBoard();
  drawNonBoard()
}

// Export the current list of pieces as a grid
function exportPiecesAsGrid(
  drawCuts = true,
  drawPieces = true,
  lineColor = "red",
  exportType = "svg"
) {
  if (!isStartSide) switchSides();
  // Get the width and height of the rendered grid
  setToFirstPiece()
  let width = parseInt(widthInput.value);
  let height = parseInt(heightInput.value);
  // If the user has put in a number that is too small (done through typing in a number less than zero) exit the function
  if (width < 1 || height < 1) return;
  // Used for scaling render up to higher resolutions
  let scale = exportType !== "svg" ? getRenderScale() : 1;
  // Size of the pieces in the svg
  let pieceSize = 200 * scale;
  // Spacing between the individual piece
  // Reccomended to not use a number <= 10
  // Try out 15 next time
  let spacing = spacingInput.value * scale;
  // Distance between the piece and the cut lines box
  let lineDistance = 0.5 * scale;
  // Stroke width of the cut lines
  let strokeWidth = getCutLineWidth() * scale;
  // Offset so that the grid can be fully drawn on the svg
  let offset = (lineDistance + (strokeWidth/2) + 5);
  // Keep track of how many times the current piece has been used in the render
  // Used for pieces that appear multiple times
  let repeatPiece = 0;
  // Calculate and set the width and height of the canvas so that all of the pieces will fit in view
  // Add + 1 to the width and height just to make sure that nothing is cut off
  // This won't affect anything when laser cutting
  let canvasWidth = (pieceSize + spacing + offset) * (width + 1);
  let canvasHeight = (pieceSize + spacing + offset) * (height + 1);
  let startSideCanvas = document.getElementById("startSideCanvas");
  startSideCanvas.innerHTML = "";
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas");
  nonStartSideCanvas.innerHTML = "";
  // Keep track of the index so that generation can be cut off early
  let index = 0;
  // Store the value of i and j so that they can be used in calculations later
  let i = 0;
  let j = 0;
  for (i = 0; i < height; i++) {
    for (j = 0; j < width; j++) {
      // If there are no more pieces to render, exit the loop
      if (index >= iconList.length) {
        break;
      }
      if (drawPieces) {
        if (iconList[currentPiece].type === "singleIcon")
          singleIconPiece()
        else if (iconList[currentPiece].type === "normal")
          normalGamePiece()
        let scaleStartDownBy = iconList[currentPiece].ability &&
          iconList[currentPiece].ability.getAttribute("text") !== "" &&
          (iconList[currentPiece].abilitySide === "both" || iconList[currentPiece].abilitySide === "start")
          ? scaleDownFactor
          : 1

        let scaleNonStartDownBy = iconList[currentPiece].ability &&
          iconList[currentPiece].ability.getAttribute("text") !== "" &&
          (iconList[currentPiece].abilitySide === "both" || iconList[currentPiece].abilitySide === "nonStart")
          ? scaleDownFactor
          : 1

        // Calculate the transformation of the current piece and apply to both sides
        // Setting the x and y should be used instead of translation as viewing the SVG 
        // in some browsers (all but firefox) will not place the icons in the correct location 
        let startX = ((spacing + pieceSize) * j + offset) + (((spacing + pieceSize) * (1 - scaleStartDownBy)) / 2);
        let startY = ((spacing + pieceSize) * i + offset) + (((spacing + pieceSize) * (1 - scaleStartDownBy)) / 2);
        let nonStartX = ((spacing + pieceSize) * j + offset) + (((spacing + pieceSize) * (1 - scaleNonStartDownBy)) / 2);
        let nonStartY = ((spacing + pieceSize) * i + offset) + (((spacing + pieceSize) * (1 - scaleNonStartDownBy)) / 2);

        // Clone the current piece and add the start and non start side to the two different renders
        let svgStartSideClone = svg.cloneNode(true);
        startSideCanvas.append(svgStartSideClone);
        svgStartSideClone.setAttribute("width", pieceSize * scaleStartDownBy);
        svgStartSideClone.setAttribute("height", pieceSize * scaleStartDownBy);
        svgStartSideClone.setAttribute("x", startX);
        svgStartSideClone.setAttribute("y", startY);
        removeMouseEvents(svgStartSideClone);
        removeHiddenElements(svgStartSideClone);
        switchSides();
        let svgNonStartSideClone = svg.cloneNode(true);
        nonStartSideCanvas.append(svgNonStartSideClone);
        svgNonStartSideClone.setAttribute("width", pieceSize * scaleNonStartDownBy);
        svgNonStartSideClone.setAttribute("height", pieceSize * scaleNonStartDownBy);
        svgNonStartSideClone.setAttribute("x", nonStartX);
        svgNonStartSideClone.setAttribute("y", nonStartY);
        removeMouseEvents(svgNonStartSideClone);
        removeHiddenElements(svgNonStartSideClone);
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

      if (drawCuts) {
        // Just for ease
        let x = j;
        let y = i;
        // Creates a box around the current piece for cutting
        // Allows for having a clean cut, while also leaving a hole
        // Constructed using four separate lines though might be possible with a square element
        // Adjust the line distance by half of the stroke width so that the distance will remain
        // the same as the width of the line changes
        let tlX = (spacing + pieceSize) * x + offset - (lineDistance + (strokeWidth / 2));
        let trX = (spacing + pieceSize) * x + pieceSize + offset + (lineDistance + (strokeWidth / 2));
        let tlY = (spacing + pieceSize) * y + offset - (lineDistance + (strokeWidth / 2));
        let trY = (spacing + pieceSize) * y + pieceSize + offset + (lineDistance + (strokeWidth / 2));
        // Square
        startSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor, strokeWidth));
        nonStartSideCanvas.append(createRect(tlX, tlY, trX, trY, lineColor, strokeWidth));
      }
    }
  }
  // Reset canvas height to fit the amount of pieces generated
  canvasHeight = (pieceSize + spacing + offset) * i;
  startSideCanvas.setAttribute("width", canvasWidth);
  startSideCanvas.setAttribute("height", canvasHeight);
  nonStartSideCanvas.setAttribute("width", canvasWidth);
  nonStartSideCanvas.setAttribute("height", canvasHeight);
  // Add styling for fonts
  // Export style needs to be cloned as if it isnt then the styling
  // will only be applied to the second element that it is appended to
  // (nonStartSideCanvas in this case). This is because if you append it without cloning
  // then you are really just moving the single element from one place to the other. You need
  // to clone it so that each will have their own style element 
  startSideCanvas.append(exportStyle.cloneNode(true));
  nonStartSideCanvas.append(exportStyle.cloneNode(true));
}

// Draw a line between the two points given
// Used for when adding the cut lines
function createLine(
  x1,
  y1,
  x2,
  y2,
  strokeWidth = "1"
) {
  let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  newLine.setAttribute("x1", x1);
  newLine.setAttribute("y1", y1);
  newLine.setAttribute("x2", x2);
  newLine.setAttribute("y2", y2);
  newLine.setAttribute("stroke", "currentColor");
  newLine.setAttribute("stroke-width", strokeWidth);
  return newLine;
}

// Draw a rectangle around the given points
// Used for when adding the cut lines
function createRect(x1, y1, x2, y2, color = "red", strokeWidth = 1) {
  let newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let height = y2 - y1;
  let width = x2 - x1;
  newRect.setAttribute("x", x1);
  newRect.setAttribute("y", y1);
  newRect.setAttribute("width", width);
  newRect.setAttribute("height", height);
  newRect.setAttribute("stroke", color);
  newRect.setAttribute("fill", "none");
  newRect.setAttribute("fill-rule", "nonzero");
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
// Now deprecated as it has been decided to use saveSvgAsPng.js as it is easier
// to use, specifically because it saves fonts to the png which this function
// struggles to do. I will keep this function here for now as I see no harm in it 
function savePng(svgEl, name) {
  let svgText = new XMLSerializer().serializeToString(svgEl);
  let bbox = svgEl.getBBox();
  let canvas = document.createElement("canvas");
  canvas.width = bbox.width + 20; // + 20 only there to prevent cut off
  canvas.height = bbox.height + 20;
  let ctx = canvas.getContext("2d");
  let img = new Image();
  let svgBlob = new Blob([svgText], {
    type: "image/svg+xml;charset=utf-8,base64,",
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

// Download the starting side grid render
function downloadStartSideRender(
  drawCuts = true,
  drawPieces = true,
  filename = "startside",
  lineColor = "red"
) {
  setGridColor("blue");
  // Get the start side render canvas, remove all of the children, append the style and the render and save
  let startSideCanvas = document.getElementById("startSideCanvas");
  removeAllChildNodes(startSideCanvas);
  if (svgInput.checked) {
    exportPiecesAsGrid(drawCuts, drawPieces, lineColor, "svg");
    saveSvg(startSideCanvas, filename + ".svg");
  } else if (pngInput.checked) {
    exportPiecesAsGrid(drawCuts, drawPieces, lineColor, "png");
    saveSvgAsPng(startSideCanvas, filename + ".svg");
  }
  setGridColor(blackColor);
}

// Download the non starting side grid render
function downloadNonStartSideRender(
  drawCuts = true,
  drawPieces = true,
  filename = "nonStartside",
  lineColor = "red"
) {
  setGridColor("blue");
  // Get the non start side render canvas, remove all of the children, append the style and the render and save
  let nonStartSideCanvas = document.getElementById("nonStartSideCanvas");
  removeAllChildNodes(nonStartSideCanvas);
  if (svgInput.checked) {
    exportPiecesAsGrid(drawCuts, drawPieces, lineColor, "svg");
    saveSvg(nonStartSideCanvas, filename + ".svg");
  } else if (pngInput.checked) {
    exportPiecesAsGrid(drawCuts, drawPieces, lineColor, "png");
    saveSvgAsPng(nonStartSideCanvas, filename + ".png");
  }
  setGridColor(blackColor);
}

// Download render of both sides
function downloadBothSidesRender(
  drawCuts = true,
  drawPieces = true,
  startSidefilename = "startside",
  nonStartSideFileName = "nonStartside",
  lineColor = "red"
) {
  setGridColor("blue");
  downloadStartSideRender(drawCuts, drawPieces, startSidefilename, lineColor);
  downloadNonStartSideRender(drawCuts, drawPieces, nonStartSideFileName, lineColor);
  setGridColor(blackColor);
}

// Render a preview of the downloadable image
function renderPreview() {
  setGridColor("blue");
  exportPiecesAsGrid();
  setGridColor(blackColor);
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
    isNaN(x1) ||
    isNaN(y1) ||
    x1 < 0 ||
    x1 > 4 ||
    y1 < 0 ||
    y1 > 4 ||
    isNaN(x2) ||
    isNaN(y2) ||
    x2 < 0 ||
    x2 > 4 ||
    y2 < 0 ||
    y2 > 4 ||
    (x1 === x2 && y1 === y2) ||
    connectionExists(x1, y1, x2, y2)
  )
    return;
  iconList[currentPiece].connections[+isStartSide].push([
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
    "20"
  );
  iconList[currentPiece].storage.connections[+isStartSide].push(line);
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

// Change font to the inputted value
function changeFont() {
  clearNonBoard();
  currentFont = fontInput.value;
  iconList[currentPiece].name = createPieceName(nameInput.value);
  if (iconList[currentPiece].ability) {
    let abilityText = iconList[currentPiece].ability.getAttribute("text");
    iconList[currentPiece].ability = createPieceAbilityText(abilityText);
  }
  drawNonBoard();
}

// Disables Scrolling
function disableScroll() {
  if (canScroll) {
    canScroll = false;
    document.querySelector('.scrollable').addEventListener('wheel', preventScroll);
  }
}

// Enables Scrolling
function enableScroll() {
  if (!canScroll) {
    canScroll = true;
    document.querySelector('.scrollable').removeEventListener('wheel', preventScroll);
  }
}

// Prevent the screen from scrolling
function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

// Make sure that the scale never falls to or below zero
function handleRenderScale(e) {
  let value = e.target.value
  if (value <= 0)
    renderScaleInput.value = 1;
}

// Make sure that cut line width never falls to or below zero
function handleCutLineWidth(e) {
  let value = e.target.value
  if (value <= 0)
    cutLineWidthInput.value = 1;
}

// Get the amount of scaling that should be applied to the render
function getRenderScale() {
  return parseInt(renderScaleInput.value)
}

// Get the width of the cut lines
function getCutLineWidth() {
  return parseFloat(cutLineWidthInput.value)
}

// Return the correct font size depending on the 
// current font and the length of the text
function getFontSize(length = 1, hasSpace = false, isAllCaps = false) {
  if (currentFont === "dukeFont") {
    if (iconList[currentPiece].type === "normal") {
      if (length >= 3 && hasSpace) return 200;
      if (length >= 10) return 215;
      if (length >= 8) return 245;
    }
    return 265;
  } else if (currentFont === "musketeersFont") {
    if (length >= 9) return 185;
    return 200;
  } else if (currentFont === "robinHoodFont") {
    return 170;
  } else if (currentFont === "conanFont") {
    if (length >= 13 && isAllCaps)
      return 90;
    else if (length >= 10)
      return 130;
  } else if(currentFont === "centurionFont") {
    if(length >= 12)
      return 180;
  }
  return 200;
}

// Get the weight that should be used for the current font
function getFontWeight() {
  if (currentFont === "conanFont")
    return "bold"
  return "normal"
}

// Process text and create the appropriate elements to add to the image
// if the text has a space and is above a certain lenth then split the 
// text into two different lines, otherwise use the normal method 
// for creating an element
function processText(text) {
  if (currentFont === "dukeFont") {
    if (hasNewLine(text) && splitAtFirstOccurance(text, "\\n").length > 1) {
      return splitAtFirstOccurance(text, "\\n");
    } else if (text.length > 10 && hasWhiteSpace(text)) {
      return splitAtLastSpace(text)
    }
  }
  else if (currentFont === "conanFont") {
    if (hasNewLine(text) && splitAtFirstOccurance(text, "\\n").length > 1) {
      return splitAtFirstOccurance(text, "\\n")
    }
  }
  return [text]
}

// Splits text at the last space
function splitAtLastSpace(text) {
  return splitAtFirstOccurance(reverseString(text), " ")
    .reverse()
    .map(value => {
      return reverseString(value)
    });
}

// Splits text only at the first occurance of a character
function splitAtFirstOccurance(text, split) {
  return [first, ...rest] = text.split(split)
}

// Reverse the given string
function reverseString(str) {
  let splitString = str.split("");
  let reverseArray = splitString.reverse();
  let joinArray = reverseArray.join("");
  return joinArray;
}

// Checks if the given text has a whitespace in it
function hasWhiteSpace(text) {
  return /\s/g.test(text);
}

// Checks if the given text has a whitespace in it
function hasNewLine(text) {
  return /[\s\S]/g.test(text);
}

// Set the color of the grid and all its children
// Used so that grid isnt required to be black and can be set to other colors
// for better customization and for laser cutting
function setGridColor(color) {
  svg.style.color = color;
}

// Set up the board for a single icon piece
function singleIconPiece() {
  clearBoard();
  clearNonBoard();
  gridElement.setAttribute("visibility", "hidden");
  pieceGraphicsBorderElement.setAttribute("visibility", "hidden");
  singleIconBorderElement.setAttribute("visibility", "visable");
  iconList[currentPiece].type = "singleIcon"
  drawBoard();
  drawNonBoard();
}

// Set up the board for a normal game piece
function normalGamePiece() {
  clearBoard();
  clearNonBoard();
  gridElement.setAttribute("visibility", "visable");
  pieceGraphicsBorderElement.setAttribute("visibility", "visable");
  singleIconBorderElement.setAttribute("visibility", "hidden");
  iconList[currentPiece].type = "normal"
  drawBoard();
  drawNonBoard();
}

// Handle changing piece type
function changePieceType(e) {
  let nonStartIconName = "";
  if (iconList[currentPiece].storage.icons[0]) {
    nonStartIconName = iconList[currentPiece].storage.icons[0].getAttribute("text")
    iconList[currentPiece].storage.icons[0].remove()
  }
  let startIconName = "";
  if (iconList[currentPiece].storage.icons[1]) {
    startIconName = iconList[currentPiece].storage.icons[1].getAttribute("text")
    iconList[currentPiece].storage.icons[1].remove()
  }

  let name = ""
  if (iconList[currentPiece].name) {
    name = iconList[currentPiece].name[0]
      ? iconList[currentPiece].name[0].getAttribute("text")
      : "";
    iconList[currentPiece].name.forEach(elem => elem.remove());
  }
  iconList[currentPiece].storage.icons[0] = createPieceIcon(nonStartIconName, isStartSide, e.target.value);
  iconList[currentPiece].storage.icons[1] = createPieceIcon(startIconName, !isStartSide, e.target.value);

  if (e.target.value === "normal") {
    normalGamePiece();
  }
  else if (e.target.value === "singleIcon") {
    singleIconPiece();
  }

  iconList[currentPiece].name = createPieceName(name);
}

// Handle chaning what side the ability is shown on
function changeAbilitySide(e) {
  iconList[currentPiece].abilitySide = e.target.value;
  clearNonBoard();
  drawNonBoard();
}

// Check if a string is in all caps
function isAllCaps(text) {
  return text === text.toUpperCase()
}

// Get the total number of pieces in a set,
// Used on importing a new set of pieces
function getNumberOfPieces(pieces) {
  let count = 0
  pieces.forEach(elem => {
    count += elem.amount;
  })
  return count;
}

// Remove mouse click events from the given grid element
// This will reduce file size as well as remove errors when using the SVG elsewhere
// From my tests, doing this saves over 10% in file size
function removeMouseEvents(elem) {
  Array.from(elem.getElementById("Grid").children).forEach(child => {
    Array.from(child.children).forEach(square => {
      square.firstElementChild.removeAttribute("onmouseover")
      square.firstElementChild.removeAttribute("onmouseout")
      square.firstElementChild.removeAttribute("onclick")
    })
  })
}

// Remove hidden elements from the given grid element to reduce file size
function removeHiddenElements(elem) {
  console.log(elem)
  let outerBorder = elem.getElementById("Outer-Border");
  if(outerBorder.getAttribute("visibility") === "hidden")
    outerBorder.remove()
  let singleIconBorders = elem.getElementById("SingleIconBorder");
  let singleIconInner = singleIconBorders.children.namedItem("Inner-Border")
  let singleIconOuter = singleIconBorders.children.namedItem("Outer-Border")
  if(singleIconInner.getAttribute("visibility") === "hidden" 
  && singleIconOuter.getAttribute("visibility") === "hidden")
    singleIconBorders.remove()
  else {
    if(singleIconInner.getAttribute("visibility") === "hidden")
      singleIconInner.remove()
    if(singleIconOuter.getAttribute("visibility") === "hidden")
      singleIconOuter.remove()
  }
}

init();