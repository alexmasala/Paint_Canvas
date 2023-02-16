//canvas
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth-60;
canvas.height = 400;

var canvasx = canvas.offsetLeft;
var canvasy = canvas.offsetTop;
var ultimul_mousex = ultimul_mousey = 0;
var mousex = mousey = 0;

//returneaza contextul canvas
let context = canvas.getContext("2d");
let start_background_culoare = "white";
//acum deseneaza
context.clearRect(0, 0, window.innerWidth,window.innerHeight);
context.fillStyle = start_background_culoare;
context.fillRect(0,0,window.innerWidth,window.innerHeight);

let desen_culoare = "black";
context.lineWidth = 5;
context.lineCap = "round";
context.lineJoin = "round";
let se_deseneaza = false;

var start_drag_location;
var snapshot;

let restaureaza_array = [];
let index = -1;

function schimba_grosimea(event) {
    context.lineWidth = this.value;
    event.stopPropagation();
}

//stocheaza datele imaginilor desenate anterior pentru a le restabili dupa ce se adauga desene noi
let ImageDataSalvata;

//salveaza imaginea din canvas
function SalveazaImagineCanvas(){
    
    ImageDataSalvata = context.getImageData(0,0,canvas.width,canvas.height);
}
 
//schimba culoarea dreptunghiului pe care se deseneaza
function schimba_culoare_background() {
    let color = document.getElementById('colorInputColor').value;
    //document.body.style.backgroundColor = color;
    context.clearRect(0, 0, window.innerWidth,window.innerHeight);
    context.fillStyle = color;
    context.fillRect(0,0,window.innerWidth,window.innerHeight);
    document.getElementById('colorInputText').value = color;
  }

//schimba culoarea fiecarui element
function schimba_culoare_element(element) {
    desen_culoare = element.style.background;
    context.strokeStyle = desen_culoare;
    context.restore();
}

//functia poate fi utilizata pentru a initializa intreaga pagina web
function init() {
        var lineWidth = document.getElementById("lineWidth");
        context.lineWidth = lineWidth.value;
    
        canvas.addEventListener('mousedown', start, false);
        canvas.addEventListener('mousemove', draw, false);
        canvas.addEventListener('mouseup', stop, false);
        lineWidth.addEventListener("input", schimba_grosimea, false);
    }

//functie care obtine coordonatele mouse-ului atunci cand se face click pe canvas
function getCoordonateCanvas(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left, y = event.clientY - canvas.getBoundingClientRect().top;
    return {x: x, y: y};
}

//retine un obiect de tip ImageData care conține datele dreptunghiului de la canvasul specificat
function takeSnapshot() {
    snapshot = context.getImageData(0,0, canvas.width, canvas.height);
}

//pune datelele de la obiectul ImageData dat pe canvas
function restoreSnapshot() {
    context.putImageData(snapshot, 0,0);
}

//functie care deseneaza instrumentul de tip linie
function deseneaza_linie(position) {
    context.beginPath();
    context.moveTo(start_drag_location.x, start_drag_location.y);
    context.lineTo(position.x,position.y);
    context.stroke();
}

//functie care deseneaza instrumentul de tip elipsa
function deseneaza_elipsa(position) {
    context.save();
    context.beginPath();
    //scalare dinamica
    var dimensiunex = 1*((start_drag_location.x - position.x)/2);
    var dimensiuney = 1*((start_drag_location.y - position.y)/2);
    context.scale(dimensiunex,dimensiuney);
    //creeaza elipsa
    var centerx = (position.x/dimensiunex)+1;
    var centery = (position.y/dimensiuney)+1;
    context.arc(centerx, centery, 1, 0, 2*Math.PI);
    //restaureaza si deseneaza
    context.restore();
    context.stroke();
}

//functie care deseneaza instrumentul de tip dreptunghi 
function deseneaza_dreptunghi(){
      context.save();
      context.beginPath();
      var width = mousex-ultimul_mousex;
      var height = mousey-ultimul_mousey;
      context.rect(ultimul_mousex,ultimul_mousey,width,height);
      context.restore();
      context.stroke();
}

//functie care verifica care instrument va fi folosit cand se da click, si apeleaza metoda corespunzatoare
function deseneaza_figuri(position) {
    var shape = document.querySelector('input[type="radio"][name="shape"]:checked').value;
    if (shape === "line") {
        deseneaza_linie(position);
    }
    if (shape === "elipse") {
        deseneaza_elipsa(position);
    }

    if (shape === "rectangle") {
        deseneaza_dreptunghi();
    }
    else
    return 0;
}

//evenimentul mousedown
function start(event) {
    se_deseneaza = true;
    
    //dreptunghi
    ultimul_mousex = parseInt(event.clientX-canvasx);
    ultimul_mousey = parseInt(event.clientY-canvasy);
    
    start_drag_location = getCoordonateCanvas(event);
    takeSnapshot();
    
    event.preventDefault();

    //salveaza imaginea curenta din canvas
    SalveazaImagineCanvas();
}

//evenimentul mousemove
function draw(event) {

    //dreptunghi
    mousex = parseInt(event.clientX-canvasx);
	mousey = parseInt(event.clientY-canvasy);

    var position;
    if ( se_deseneaza === true) {
        restoreSnapshot();
        position = getCoordonateCanvas(event);
        deseneaza_figuri(position);
    }
}

//evenimentul mouseup
function stop(event) {
    se_deseneaza = false;
    restoreSnapshot();
    var position = getCoordonateCanvas(event);
    deseneaza_figuri(position);
    context.closePath();
    event.preventDefault();

    if( event.type != 'mouseout' ) {
        restaureaza_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
        index += 1;
    }

    console.log(restaureaza_array);
}

//stergerea canvasului
function sterge_canvas() {
    context.fillStyle = start_background_culoare;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);

    let restaureaza_array = [];
    let index = -1;
}

//sterge ultimul instrument
function undo_ultimul() {
    if( index <= 0 ) {
        sterge_canvas();
    }
    else {
        index -= 1;
        restaureaza_array.pop();
        context.putImageData(restaureaza_array[index], 0, 0);
    }
}

//salveaza imaginea in directorul de descarcare implicit 
function SalveazaImagine(){
    //se obtine o referinta catre element
    var imageFile = document.getElementById("img-file");
    imageFile.setAttribute('download', 'image.png');
    //face referinta la imaginea din canvas pentru descarcare
    imageFile.setAttribute('href', canvas.toDataURL());
}

//functia init incepe la incarcarea ferestrei
window.addEventListener('load', init, false);