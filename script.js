var scene = new THREE.Scene();
const width = 500;
const height = width; // square matrices only for now
const planeSize = 10;
var initial_X = -width / 2 + planeSize / 2;
var initial_Y = height / 2 - planeSize / 2;
const camera = new THREE.OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  -500,
  1000
);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const CONVOLUTION_MATRIX = [
  [-0.371, 0.5, -0.983],
  [0.395, 0.559, 0.242],
  [-0.661, 0.246, -0.042],
];

var grid = [];
var UUIDArray = [];
camera.position.z = 10;
initGrid();
makeGrid();
var render = function () {
  requestAnimationFrame(render);

  updateGrid();
  makeGrid();

  renderer.render(scene, camera);
  removePlanes();
};

render();

function updateGrid() {
  const temp = convolutionDirect(grid, CONVOLUTION_MATRIX);
  const tempArray = [];
  while (temp.length) tempArray.push(temp.splice(0, 50));
  grid = tempArray;
}

function initGrid() {
  for (let i = 0; i < width / planeSize; i++) {
    grid[i] = [];
    for (let j = 0; j < width / planeSize; j++) {
      grid[i][j] = getRandomInt(100) / 100;
    }
  }
}

function makeGrid() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      let number = Math.round(grid[i][j] * 255); //converts decimal value of range(0,1) from grid to integer of range(0, 255)

      let color = rgbToHex(0, 0, number);
      addPlane(i, j, color);
    }
  }
}

function addPlane(x, y, cubeColor) {
  let geometry = new THREE.PlaneGeometry(planeSize, planeSize);
  let material = new THREE.MeshBasicMaterial({ color: cubeColor });
  let plane = new THREE.Mesh(geometry, material);
  plane.position.set(initial_X + planeSize * y, initial_Y - planeSize * x, 0);
  UUIDArray.push(plane.id);
  scene.add(plane);
}

function removePlanes() {
  UUIDArray.map((i) => {
    const object = scene.getObjectById(i);
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
  });
  UUIDArray = [];
  renderer.renderLists.dispose();
}

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

function dotProduct(a) {
  var result = 0;
  for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++) {
      result += CONVOLUTION_MATRIX[i][j] * a[i][j];
    }
  }
  return result;
}

function matrix2Array(input) {
  let inputData = input;
  let nRows, nCols;
  if (typeof input[0] !== "number") {
    nRows = input.length;
    nCols = input[0].length;
    inputData = new Array(nRows * nCols);
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        inputData[i * nCols + j] = input[i][j];
      }
    }
  } else {
    let tmp = Math.sqrt(input.length);
    if (Number.isInteger(tmp)) {
      nRows = tmp;
      nCols = tmp;
    }
  }

  return { data: inputData, rows: nRows, cols: nCols };
}

function convolutionDirect(input, kernel, opt) {
  let tmp = matrix2Array(input);
  let inputData = tmp.data;
  let options = Object.assign(
    { normalize: false, divisor: 1, rows: tmp.rows, cols: tmp.cols },
    opt
  );

  let nRows, nCols;
  if (options.rows && options.cols) {
    nRows = options.rows;
    nCols = options.cols;
  } else {
    throw new Error(`Invalid number of rows or columns ${nRows} ${nCols}`);
  }

  let divisor = options.divisor;
  let kHeight = kernel.length;
  let kWidth = kernel[0].length;
  let index, sum, kVal, row, col;
  if (options.normalize) {
    divisor = 0;
    for (let i = 0; i < kHeight; i++) {
      for (let j = 0; j < kWidth; j++) divisor += kernel[i][j];
    }
  }
  if (divisor === 0) {
    throw new RangeError("convolution: The divisor is equal to zero");
  }

  let output = new Array(nRows * nCols);

  let hHeight = Math.floor(kHeight / 2);
  let hWidth = Math.floor(kWidth / 2);

  for (let y = 0; y < nRows; y++) {
    for (let x = 0; x < nCols; x++) {
      sum = 0;
      for (let j = 0; j < kHeight; j++) {
        for (let i = 0; i < kWidth; i++) {
          kVal = kernel[kHeight - j - 1][kWidth - i - 1];
          row = (y + j - hHeight + nRows) % nRows;
          col = (x + i - hWidth + nCols) % nCols;
          index = row * nCols + col;
          sum += inputData[index] * kVal;
        }
      }
      index = y * nCols + x;
      let result = Number((sum / divisor).toFixed(3));
      if (result < 0 || result > 1 || result == NaN) {
        result = 0;
      }
      output[index] = result;
    }
  }
  return output;
}
