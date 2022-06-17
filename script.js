// import { rgbToHex } from 'utils.js'

    var scene = new THREE.Scene();
    const width = 500;
    const height = width; // square matrices only for now
    const planeSize = 10;
    var initial_X = -width/2+(planeSize/2)
    var initial_Y = height/2-(planeSize/2)
    const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -500, 1000 );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    const CONVOLUTION_MATRIX = [[0.565, -0.716, 0.565],[-0.716, 0.627, -0.716],[0.565,-0.716, 0.565]]

    var grid = new Array(width/planeSize)
    var UUIDArray = new Array();
    camera.position.z = 10;
    initGrid()
    var render = function () {
        requestAnimationFrame( render);
        initGrid()
        makeGrid()
        renderer.render(scene, camera);
        
        removePlanes()
    };

    render();


function updateGrid(){
    for (i = 1; i < grid.length-1; i++) {
        for (j = 1; j < grid.length-1; j++) {
            a = grid[i-1][j-1]
            b = grid[i-1][j]
            c = grid[i-1][j+1]
            d = grid[i][j-1]
            me = grid[i][j]
            e = grid[i][j+1]
            f = grid[i+1][j-1]
            g = grid[i+1][j]
            h = grid[i+1][j+1]

            hood = [[a, b, c],[d, me, e],[f, g, h]];
            result = Math.sin(dotProduct(hood).toFixed); 

            if (result > 1){
                 result = 0
             }else{
                result = Math.max(0, result) // return 0 if result negative, else return result
            }
            grid[i][j] = result
        }
        
    }
}

function initGrid(){
    for (i = 0; i < width/planeSize; i++){
        grid[i] = [];
        for (j = 0; j < height/planeSize; j++){
          grid[i][j] = getRandomInt(100)/100
        }
      }
}

function makeGrid(){
  for (i = 0; i < width/planeSize; i++){
    for (j = 0; j < height/planeSize; j++){
        
      var number = Math.round(grid[i][j] * 255) //converts decimal value of range(0,1) from grid to integer of range(0, 255)
      var color = rgbToHex(0,0, number)
      
      addPlane(i, j, color)
  }
}
}

function addPlane(x, y, cubeColor){
  const geometry = new THREE.PlaneGeometry( planeSize, planeSize);
  var material = new THREE.MeshBasicMaterial( { color: cubeColor } );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(initial_X+planeSize*y, initial_Y-planeSize*x, 0)
  plane.uuid = x;
  UUIDArray.push(plane.uuid);
  scene.add(plane);
}

function removePlanes( ) {
  UUIDArray.map( ( i ) => {
    const object = scene.getObjectByProperty('uuid', i ); 
    object.geometry.dispose(); 
    object.material.dispose(); 
    scene.remove( object ); 
} );
};



// HELPER FUNCTIONS

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function dotProduct(a){
    var result = 0;
    for (i=0; i < 3; i++){
        for (j=0; j < 3; j++){
            result += CONVOLUTION_MATRIX[i][j] * a[i][j]
        }
    }
    return result
}