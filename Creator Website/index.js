// Resources Used
// https://stackoverflow.com/questions/30319227/finding-coordinates-of-center-of-rectangle-svg
// https://groups.google.com/g/d3-js/c/PYuJ6RIsBdc
// https://www.softouch.on.ca/svg/rotate1.html
// https://stackoverflow.com/questions/9281199/adding-text-to-svg-document-in-javascript
// https://codepen.io/remi-grumeau/pen/AwdRyM

// Lock Screen Scroll
// Just for now
document.getElementsByTagName('body')[0].style.overflow = 'hidden';

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

// Initialization function
function init() {
  for(let i = 0; i < 5; i++){
    let blankArray = []
    for(let j = 0; j < 5; j++){
      blankArray.push([])
    }
    iconList.push(blankArray)
  }   
}

function mouseOverGridSquare(item) {
  let gridPos = item.parentElement.id.split("").slice(1).map(element => parseInt(element));
  if(isCenter(gridPos)) return;
  item.style.fill="#ffc"
  let pos = getCenter(item)
  createIconAt(movementIcons[currentIcon], pos, gridPos);
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
    iconList[gridPos[0]][gridPos[1]].push(iconElement)
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
    currentIcon = movementIcons.length-1
  }

  if(currentGridSquare) {
    let gridPos = currentGridSquare.parentElement.id.split("").slice(1).map(element => parseInt(element));
    
    if(iconElement){
      iconElement.remove()
    }
    let pos = getCenter(currentGridSquare)
    createIconAt(movementIcons[currentIcon], pos, gridPos);
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
function createIconAt(icon, pos, gridPos) {
  iconElement = document.getElementById(icon).cloneNode(true);
  let width = 42;
  if(isFullSize(icon))
    width = 185;
  let cx = pos.x - (width/2);
  let cy = pos.y - (width/2);
  iconElement.setAttribute("x", cx);
  iconElement.setAttribute("y", cy);
  iconElement.setAttribute("width", width);
  iconElement.setAttribute("height", width);
  iconElement.setAttribute("id", "");
  iconElement.setAttribute("icon", icon);
  if(isSlide(icon)) {
    iconElement.setAttribute("transform", rotateIcon(gridPos, cx, cy, width, width))
  }
  svg.appendChild(iconElement);
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
      break;
    case "3,1":
      return "45"
      break;
    case "3,2":
      return "90"
      break;
    case "3,3":
      return "135"
      break;
    case "2,3":
      return "180"
    break;
    case "1,3":
      return "225"
      break;
    case "1,2":
      return "270"
      break;
    case "1,1":
      return "315"
      break;
  }
  return "0"
}

// Remove all of the elements from view at the current grid location
// removeFromList removes them from existance entirely
function removeElement(x,y, newIcon, removeFromList = false) {
  for(let i = 0; i < iconList[x][y].length; i++) {
    if(isFullSize(iconList[x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[x][y][i].remove();
      if(removeFromList)
        iconList[x][y].splice(i,1);
    } else if(!isFullSize(iconList[x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[x][y][i].remove();
      if(removeFromList)
        iconList[x][y].splice(i,1);
    }
  }
}

// Restores all elements into view at the current grid location
function restoreElements(x,y) {
  for(let i = 0; i < iconList[x][y].length; i++) {
    iconList[x][y][i].remove();
    svg.appendChild(iconList[x][y][i])
  }
}

// Restores all elements into view at the current grid location
// only elements that are of the opposite icon type of that given.
// Used for when using scrolling to show icons
function restoreOppositeType(x,y,newIcon) {
  for(let i = 0; i < iconList[x][y].length; i++) {
    if(isFullSize(iconList[x][y][i].getAttribute("icon")) && !isFullSize(newIcon)) {
      iconList[x][y][i].remove();
      svg.appendChild(iconList[x][y][i])
    } else if(!isFullSize(iconList[x][y][i].getAttribute("icon")) && isFullSize(newIcon)) {
      iconList[x][y][i].remove();
      svg.appendChild(iconList[x][y][i])

    }
  }
}

function createTextAt(text, pos) {
  let svgNS = "http://www.w3.org/2000/svg";
  let newText = document.createElementNS(svgNS,"text");
  newText.setAttribute("font-size","100");
  newText.innerHTML = text
  let cx = pos.x
  let cy = pos.y
  newText.setAttribute("x",cx);
  newText.setAttribute("y",cy);
  svg.appendChild(newText);
  let bbox = newText.getBBox()
  cx -= bbox.width/2
  cy += bbox.height/4
  newText.setAttribute("x",cx);
  newText.setAttribute("y",cy);

}

function createPieceName(text) {
  let namePos = getCenter(nameLocation);
  createTextAt(text, namePos);
}

function createPieceAbilityText(text) {
  let iconPos = getCenter(pieceIconLocation);
  let namePos = getCenter(nameLocation);
  iconPos.y = namePos.y + 140;
  createTextAt(text, iconPos);
}

function createPieceIcon(piece) {
  let iconPos = getCenter(pieceIconLocation);
  let pieceIconElement = document.getElementById(piece).cloneNode(true);
  console.log(iconPos)
  let width = 375;
  let cx = iconPos.x - (width/2) + 15;
  let cy = iconPos.y;
  pieceIconElement.setAttribute("x", cx);
  pieceIconElement.setAttribute("y", -100);
  pieceIconElement.setAttribute("width", width);
  pieceIconElement.setAttribute("id", "");
  svg.appendChild(pieceIconElement);
}

init()

createPieceName("DUKE")
createPieceAbilityText("III")
createPieceIcon("dukeIcon")
