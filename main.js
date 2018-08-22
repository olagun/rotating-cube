"use strict";

// CONSTANTS
const SIZE = 200;
const POINT_RADIUS = 5;
const ORTHO_PROJECTION = [[1, 0, 0], [0, 1, 0], [0, 0, 0]];

// Init a 2D context.
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// Use a high-res canvas.
const dpRatio = window.devicePixelRatio;

canvas.width = window.innerWidth * dpRatio;
canvas.height = window.innerHeight * dpRatio;

canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

// Scale the matrix.
function scale(mat, factor) {
  for (let i = 0; i < mat.length; ++i) {
    for (let j = 0; j < mat[0].length; ++j) {
      mat[i][j] *= factor;
    }
  }
  return mat;
}

// Multiply two matricies.
function multiply(a, b) {
  const product = matrix(a.length, b[0].length);
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < b[0].length; ++j) {
      let sum = 0;
      for (let e = 0; e < a[0].length; ++e) {
        sum += a[i][e] * b[e][j];
      }
      product[i][j] = sum;
    }
  }
  return product;
}

// Multiply a list of matricies.
function multiplyList(list) {
  let i = list.length - 1;
  let lastProduct = list[i--];
  for (; i >= 0; --i) {
    lastProduct = multiply(list[i], lastProduct);
  }
  return lastProduct;
}

// Create a matrix.
function matrix(rows, cols) {
  const mat = new Array(rows);
  for (let i = 0; i < rows; ++i) {
    mat[i] = new Array(cols);
  }
  return mat;
}

// Create a vector.
function vector(...rows) {
  return rows.map(row => [row]);
}

// Draw a vertex.
function drawVertex([[x], [y]]) {
  ctx.save();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, POINT_RADIUS, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw a line.
function drawLine([[x1], [y1]], [[x2], [y2]]) {
  ctx.save();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

// Draw a set of lines.
function drawLines(matrix, ...verticies) {
  for (let i = 0; i < verticies.length; ++i) {
    const [v1, v2] = verticies[i];
    drawLine(matrix[v1], matrix[v2]);
  }
}

// All the verticies of the cube.
const verticies = [
  // Front Face
  vector(SIZE, SIZE, -SIZE),
  vector(SIZE, -SIZE, -SIZE),
  vector(-SIZE, -SIZE, -SIZE),
  vector(-SIZE, SIZE, -SIZE),

  // Back Face
  vector(SIZE, SIZE, SIZE),
  vector(SIZE, -SIZE, SIZE),
  vector(-SIZE, -SIZE, SIZE),
  vector(-SIZE, SIZE, SIZE)
];

// Base angle (alpha) for the rotation animation.
let a = 10;

// Main loop
function loop() {
  const projectedVerticies = [];

  const sinA = Math.sin(a);
  const cosA = Math.cos(a);

  const projectionMatrix = ORTHO_PROJECTION;
  const rotXMatrix = [[1, 0, 0], [0, cosA, -sinA], [0, sinA, cosA]];
  const rotYMatrix = [[cosA, 0, sinA], [0, 1, 0], [-sinA, 0, cosA]];
  const rotZMatrix = [[cosA, -sinA, 0], [sinA, cosA, 0], [0, 0, 1]];

  // Draw each vertex.
  for (let i = 0; i < verticies.length; ++i) {
    const vertex = verticies[i];

    const projectedVertex = multiplyList([
      projectionMatrix,
      rotXMatrix,
      rotYMatrix,
      rotZMatrix,
      vertex
    ]);

    // Draw and save each projected vertex.
    projectedVerticies.push(projectedVertex);
    drawVertex(projectedVertex);
  }

  // Draw the edges.
  drawLines(
    projectedVerticies,

    // Front face
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    // Back face
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    // Connecting edges
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  );

  // Angle step
  a = (a + 0.01) % 360;
}

// Center the origin.
ctx.translate(canvas.width / 2, canvas.height / 2);

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  loop();
}

// Begin the animation.
animate();
