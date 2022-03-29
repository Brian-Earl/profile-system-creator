//https://stackoverflow.com/questions/30319227/finding-coordinates-of-center-of-rectangle-svg

let testSVG = '<svg width="100%" height="100%" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><g transform="matrix(0,-4.16667,-4.16667,0,20.8333,0)"><path d="M-5,-5C-7.761,-5 -10,-2.761 -10,0C-10,2.761 -7.761,5 -5,5C-2.238,5 0,2.761 0,0C0,-2.761 -2.238,-5 -5,-5" style="fill:rgb(35,31,32);fill-rule:nonzero;"/></g></svg>';

function mouseOverGridSquare(item) {
  if(isCenter(item)) return;
  item.style.fill="#ffc"
}

function mouseOutGridSquare(item) {
  if(isCenter(item)) return;
  item.style.fill="#fff"
}

function clickGridSquare(item) {
  item.style.fill="#ff0";
  idArray = item.parentElement.id.split("").slice(1).map(element => parseInt(element))
  console.log(idArray)
  var pos = getCenter(item)
  console.log(pos)
  //pos.x += (3 * 2* idArray[0])
  //pos.y += (3 * 2* idArray[1]);
  console.log(pos)
  createCircleAt(pos);

}

function isCenter(item) {
  return  (item.parentElement.id === "X22") && (item.parentElement.parentElement.id === "Y2");
}

function sizeDownWidth(width1, width2) {
  return 
}

function getCenter(item) {
    var bbox = item.getBBox();
  console.log(bbox)
  console.log(item.parentElement.parentElement.parentElement.getBBox())
  var ctm = item.getCTM()
  console.log(ctm)
  var cx = bbox.x + bbox.width/2;
  var cy = bbox.y + bbox.height/2;
    var pt = document.getElementById("svg").createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    return pt.matrixTransform(ctm);
}

function createRectAt(pos) {
  var svg = document.getElementById("svg");
  var rect = document.createElementNS(svg.namespaceURI, "rect");
  rect.setAttribute("x", "50%");
  rect.setAttribute("y", "50%");
  rect.setAttribute("width", 10);
  rect.setAttribute("height", 10);
  rect.setAttribute("fill", "green");
  svg.appendChild(rect);
}

function createCircleAt(pos) {
  var svg = document.getElementById("svg");
  var rect = document.getElementById("circle").cloneNode(true)
  var bbox = document.getElementById("Starting-Side").getBBox()
  var cx = ((bbox.x + 45 + bbox.width/2) + pos.x) / 2;
  var cy = ((bbox.y + 45 + bbox.height/2) + pos.y) / 2;
  console.log(bbox)
  rect.setAttribute("x", cx);
  rect.setAttribute("y", cy);
  rect.setAttribute("width", 50);
  rect.setAttribute("height", 50);
  svg.appendChild(rect);
}
