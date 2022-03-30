"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var wagTail = new Boolean(false);

//cat IDs

var bodyId = 0;
var headId = 1;
var frontLeftLegId = 2;
var frontLeftLegLowId = 3;
var frontRightLegId = 4;
var frontRightLegLowId = 5;
var backLeftLegId = 6;
var backLeftLegLowId = 7;
var backRightLegId = 8;
var backRightLegLowId = 9;
var tailId = 10;
var bodyXId = 11;
var bodyZId = 12;
var earId = 13;

//cat parts heights and weights
var bodyHeight = 2.0;
var bodyWidth = 5.0;
var bodyZ = 2.0;

var headHeight = 1.0;
var headWidth = 1.5;

var upperLegHeight = 2.0;
var upperLegWidth  = 1.0;

var lowerLegWidth  = 0.5;
var lowerLegHeight = 1.0;


var tailHeight = 3.5;
var tailWidth = 0.3;



var numNodes = 14;


//theta is used to rotate the different parts around their center of rotation
//the starting values decide the preset rotation on the page being ran
var theta = [
        0,      //body
        0,      //head
        180,    //front left leg
        45,      //front left leg low
        180,    //front right leg
        45,      //front right leg low
        180,    //back left leg
        45,      //back left leg low
        180,    //back right leg
        45,      //back right leg low
        270,     //tail
        0,      //bodyXId
        0,      //bodyZId
    ];

var transformX = 0.0;
var transformY = 0.0;

var numVertices = 24;

var stack = [];

var cat = [];

for( var i=0; i<numNodes; i++) cat[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case bodyId:
    case bodyXId:
    case bodyZId:
    
    m = translate(0.0 + transformX, 0.0 + transformY, 0.0);
    m = mult(m, rotate(theta[bodyId], 0, 1, 0));
    m = mult(m, rotate(theta[bodyXId], 1, 0, 0));
    m = mult(m, rotate(theta[bodyZId], 0, 0, 1));
    cat[bodyId] = createNode( m, body, null, headId );
    break;

    // CHILDREN NODES //

    case headId:


    m = translate((-(0.5 * bodyWidth)), bodyHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[headId], 0, 0, 1));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    cat[headId] = createNode( m, head, frontLeftLegId, null);
    break;


    case frontLeftLegId:

    m = translate(-(0.5 * bodyWidth), 0.5 * bodyHeight, (0.5 * bodyZ));
	m = mult(m, rotate(theta[frontLeftLegId], 0, 0, 1));
    cat[frontLeftLegId] = createNode( m, frontLeftLeg, frontRightLegId, frontLeftLegLowId );
    break;

    case frontRightLegId:

    m = translate(-(0.5 * bodyWidth), 0.5 * bodyHeight, -(0.5 * bodyZ));
	m = mult(m, rotate(theta[frontRightLegId], 0, 0, 1));
    cat[frontRightLegId] = createNode( m, frontRightLeg, backLeftLegId, frontRightLegLowId );
    break;

    case backLeftLegId:

    m = translate((0.5 * bodyWidth), 0.5 * bodyHeight, (0.5 * bodyZ));
	m = mult(m , rotate(theta[backLeftLegId], 0, 0, 1));
    cat[backLeftLegId] = createNode( m, backLeftLeg, backRightLegId, backLeftLegLowId );
    break;

    case backRightLegId:

    m = translate((0.5 * bodyWidth), 0.5 * bodyHeight, -(0.5 * bodyZ));
	m = mult(m, rotate(theta[backRightLegId], 0, 0, 1));
    cat[backRightLegId] = createNode( m, backRightLeg, tailId, backRightLegLowId );
    break;

    case tailId:
    m = translate((0.5 * bodyWidth), (0.5 * tailHeight), 0.0);
    m = mult(m, rotate(theta[tailId], 0, 0, 1))
    cat[tailId] = createNode( m, tail, null, null);
    break;
    
    // LOWEST CHILDREN NODES //


    case frontLeftLegLowId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[frontLeftLegLowId], 0, 0, 1));
    cat[frontLeftLegLowId] = createNode( m, frontLeftLegLow, null, null );
    break;

    case frontRightLegLowId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[frontRightLegLowId], 0, 0, 1));
    cat[frontRightLegLowId] = createNode( m, frontRightLegLow, null, null );
    break;

    case backLeftLegLowId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[backLeftLegLowId], 0, 0, 1));
    cat[backLeftLegLowId] = createNode( m, backLeftLegLow, null, null );
    break;

    case backRightLegLowId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[backRightLegLowId], 0, 0, 1));
    cat[backRightLegLowId] = createNode( m, backRightLegLow, null, null );
    break;    

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, cat[Id].transform);
   cat[Id].render();
   if(cat[Id].child != null) traverse(cat[Id].child);
    modelViewMatrix = stack.pop();
   if(cat[Id].sibling != null) traverse(cat[Id].sibling);
}

function body() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*bodyHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( bodyWidth, bodyHeight, bodyZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function frontLeftLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, 0.5 * upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function frontLeftLegLow() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function frontRightLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, 0.5 * upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function frontRightLegLow() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  backLeftLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, 0.5 * upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function backLeftLegLow() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function backRightLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, 0.5 * upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function backRightLegLow() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, - (0.5 * tailHeight), 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    // console.log("tail");
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}



function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}





window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider0").onchange = function(event) {
        theta[bodyId ] = event.target.value;
        initNodes(bodyId);
    };
        document.getElementById("slider1").onchange = function(event) {
        theta[headId] = event.target.value;
        initNodes(headId);
    };

    document.getElementById("slider2").onchange = function(event) {
         theta[frontLeftLegId] = event.target.value;
         initNodes(frontLeftLegId);
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[frontLeftLegLowId] =  event.target.value;
         initNodes(frontLeftLegLowId);
    };

    document.getElementById("slider4").onchange = function(event) {
        theta[frontRightLegId] = event.target.value;
        initNodes(frontRightLegId);
    };
    document.getElementById("slider5").onchange = function(event) {
         theta[frontRightLegLowId] =  event.target.value;
         initNodes(frontRightLegLowId);
    };
        document.getElementById("slider6").onchange = function(event) {
        theta[backLeftLegId] = event.target.value;
        initNodes(backLeftLegId);
    };
    document.getElementById("slider7").onchange = function(event) {
         theta[backLeftLegLowId] = event.target.value;
         initNodes(backLeftLegLowId);
    };
    document.getElementById("slider8").onchange = function(event) {
         theta[backRightLegId] =  event.target.value;
         initNodes(backRightLegId);
    };
        document.getElementById("slider9").onchange = function(event) {
        theta[backRightLegLowId] = event.target.value;
        initNodes(backRightLegLowId);
    };
    document.getElementById("slider11").onchange = function(event) {
        theta[tailId] = event.target.value;
        initNodes(tailId);
   };
   document.getElementById("slider12").onchange = function(event) {
    theta[bodyXId] = event.target.value;
    initNodes(bodyXId);
    };
    document.getElementById("slider13").onchange = function(event) {
        theta[bodyZId] = event.target.value;
        initNodes(bodyZId);
    };

    document.getElementById("walkingSlider").onchange = function(event) {
        theta[frontLeftLegId] = event.target.value;
        initNodes(frontLeftLegId);

        theta[frontRightLegId] = - (event.target.value);
        initNodes(frontRightLegId);

        theta[backLeftLegId] = event.target.value;
        initNodes(backLeftLegId);

        theta[backRightLegId] = - (event.target.value);
        initNodes(backRightLegId);
    };

    document.getElementById("moveCatPX").onclick = function(event) {
        
        transformX += 1.0;
        initNodes(bodyId);
    };

    document.getElementById("moveCatNX").onclick = function(event) {
        
        transformX -= 1.0;
        initNodes(bodyId);
    };

    document.getElementById("moveCatPY").onclick = function(event) {
        
        transformY += 1.0;
        initNodes(bodyId);
    };

    document.getElementById("moveCatNY").onclick = function(event) {
        
        transformY -= 1.0;
        initNodes(bodyId);
    };

   document.getElementById("wagTail").onclick = function(event) {
        var i = 0;

        function myLoop() {
            setTimeout(function() {
                theta[tailId] = theta[tailId] + 1;
                initNodes(tailId);
                i ++;
                if( i < 45 ) {
                    myLoop();
                }
            }, 100)
        }

        myLoop();
        
   };


   document.getElementById("wagTail2").onclick = function(event) {

        var i = 1;
        var upDown = 0;

        function myLoop() {
            setTimeout(function() {
                if(upDown === 0){
                    theta[tailId] = theta[tailId] + 1;
                    // console.log(theta[tailId]);
                    initNodes(tailId);
                }
                else{
                    theta[tailId] = theta[tailId] - 1;
                    // console.log(theta[tailId]);
                    initNodes(tailId);
                }

                if(i === 43){
                    if(upDown === 0){
                        upDown = 1;
                        i = 0;
                    }
                    else{
                        upDown = 0;
                        i = 0;
                    }
                }

                i ++;
                if( i < 45 ) {
                    myLoop();
                }
            }, 100)
        }


        myLoop();
    };

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        
        traverse(bodyId);
        requestAnimFrame(render);

        
}