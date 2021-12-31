let currentEntryIndex = 0; 
let currentTool = 0;
let currentEntry = {}

let data = {
}

$(document).ready(function () {
    newEntry()

    $("td").click(function(event){ 
        toCords(event.target.id)
    })
});

function newEntry() {
    console.log("HEY EVERYBODY")
}

function toCords(cordsText) {
    console.log(cordsText)
    cordsText = cordsText.split(/\s+/);
    console.log(cordsText[0][0])
}