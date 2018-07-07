
//
// WebGL Cube Demo
//

// global variables
let camera, scene, renderer;
let cube;
let stats;

start();      // start the program; launches init() and animate()

function start() {

  init();       // ***initialize; stage everything for first draw***
  
  // start button on-click functionality
  const startButton = document.getElementById( 'start-button' );      // get ref to start button
  startButton.addEventListener ("click", function() {                 // on button click event listener
    const startScreen = document.getElementById( 'start-screen' );    // get ref to the start screen
    startScreen.classList.add( "start-screen-hidden" );               // remove start screen by adding css class with display none
    if (document.webkitFullscreenEnabled) {                           // if webkit fullscreen api is supported
      addFullScreenButton();                                          // add fullscreen toggle button
      toggleFullScreen();                                             // go fullscreen with custom function
    }
    animate();                                                        // ***call animate function and render the scene***
  });
  
  // fullscreen toggle button
  let fullScreenButton;                                           // declare button var here for multi-function use
  function addFullScreenButton() {
    fullScreenButton = document.createElement("button");          // create the fullscreen button

    const body = document.getElementsByTagName("body")[0];        // get ref to <body> element
    body.appendChild(fullScreenButton);                           // add new button as child to <body> element
    
    fullScreenButton.addEventListener ("click", function() {      // on click
    toggleFullScreen();                                           // toggle fullscreen mode on/off
    });
  }
  
  // fullscreen api function prefixed for Blink(Chrome & Opera) June 2018
  function toggleFullScreen() {                                   // toggle fullscreen when called
    if (!document.webkitFullscreenElement) {                      // if webkit fullscreen not activated
      document.documentElement.webkitRequestFullscreen();         // go fullscreen with webkit's fullscreen function
      screen.orientation.lock('landscape');                       // lock screen to landscape mode on mobile devices (Chrome, working draft)
      fullScreenButton.innerHTML = "Exit";                        // add button text
      fullScreenButton.classList.remove("fullscreen-button");     // remove button css class (if toggled)
      fullScreenButton.classList.add("fullscreen-exit-button");   // add button css class
    } else {
      if (document.webkitExitFullscreen) {                        // if fullscreen the exit property will be available
        document.webkitExitFullscreen();                          // request webkit's exit fullscreen function
        fullScreenButton.innerHTML = "Fullscreen";                // change button text
        fullScreenButton.classList.add("fullscreen-button");      // add css class (different colors)
      }
    }
  }
  
  // toggle key for full screen mode
  document.addEventListener("keydown", function(e) {    // event listener for key press
    if (e.keyCode == 13) {                              // enter key
      toggleFullScreen();                               // toggle full screen custom function
    }
  }, false);
}




// Initialize

function init() {
  scene = new THREE.Scene();    // initialize a new scene
  
  camera = new THREE.PerspectiveCamera(        // initialize a camera to view the scene
      45,                                      // field of view (in degrees)
      window.innerWidth/window.innerHeight,    // aspect ratio
      0.1,                                     // near clipping plane
      1000                                     // far clipping plane
      );

  renderer = new THREE.WebGLRenderer( { antialias: true } );    // initialize threejs renderer (with AA on)
  renderer.setPixelRatio( window.devicePixelRatio );            // set renderer to match device pixel resolution
  renderer.setSize( window.innerWidth, window.innerHeight );    // set render resolution to full window size
  document.body.appendChild( renderer.domElement );             // add to DOM
  
  window.addEventListener( 'resize', onWindowResize, false );   // window resize event runs onWindowResize() function
  
  stats = new Stats();                      // initialize stats.js performance monitor
  stats.showPanel( 0 );                     // select starting info panel (0: fps, 1: ms, 2: mb, 3+: custom)
  document.body.appendChild( stats.dom );   // add to DOM

  const geometry = new THREE.BoxGeometry( 1, 1, 1 );                      // create a box with dimensions x,y,z at center of scene (default location)
  const texture = new THREE.TextureLoader().load( 'images/image-300.png' );      // load custom image file
  texture.minFilter = THREE.NearestFilter;                                // crisper image quality like original image, less blur, more readable
  texture.magFilter = THREE.LinearFilter;                                 // default; weighted average of mipmaps
  const material = new THREE.MeshLambertMaterial( { map: texture } );     // use Lambert for custom texture
  cube = new THREE.Mesh( geometry, material );                            // combine geometry and material to create a mesh object for use in the scene
  scene.add( cube );                                                      // add it to the scene

  camera.position.set( 0, 0, 6 );   // move the camera back to view cube (x,y,z)

  const controls = new THREE.OrbitControls( camera );     // initialize orbit controls (OrbitControls.js)
  controls.update();                                      // "controls.update() must be called after any manual changes to the camera's transform"
  
  // Grids

  const size = 12;                                                // size of the grids
  const divisions = 10;                                           // number of divisions in the grids
  
  // position each side of the grid
  const gridBack = new THREE.GridHelper( size, divisions );     // create a plane grid using GridHelper
  gridBack.position.set(0,0,-(size / 2));                       // centerpoint(x,y,z); at half grid size for a square
  gridBack.rotation.x = Math.PI/2;                              // set grid rotation; rotate 180
  scene.add( gridBack );                                        // add to scene
  
  const gridFront = new THREE.GridHelper( size, divisions );     
  gridFront.position.set(0,0,(size / 2));                            
  gridFront.rotation.x = Math.PI/2;                            
  scene.add( gridFront );

  const gridTop = new THREE.GridHelper( size, divisions );     
  gridTop.position.set(0,(size / 2),0);                                                     
  scene.add( gridTop );
  
  const gridBottom = new THREE.GridHelper( size, divisions );     
  gridBottom.position.set(0,-(size / 2),0);                                                     
  scene.add( gridBottom );
  
  const gridLeft = new THREE.GridHelper( size, divisions );     
  gridLeft.position.set(-(size / 2),0,0);
  gridLeft.rotation.z = Math.PI/2;
  scene.add( gridLeft );
  
  const gridRight = new THREE.GridHelper( size, divisions );     
  gridRight.position.set((size / 2),0,0);
  gridRight.rotation.z = Math.PI/2;
  scene.add( gridRight );

  // Lighting
  
  // add soft lighting to entire scene, no light source
  const light = new THREE.AmbientLight( 0x4d4d4d );    // lightness value of 0.30
  scene.add( light );
  
  // (colored) directional light at (0-1) intensity
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );   // (white, 100%)
  directionalLight.position.set(0,1,0);                                 // change light source position property (xyz clip coord)
  scene.add( directionalLight );
}




// Responsive

// update on window resize event
function onWindowResize() {                                     // event listener located in init() function
  camera.aspect = window.innerWidth / window.innerHeight;       // get the new viewport size for the camera
  camera.updateProjectionMatrix();                              // update camera with new dimensions
  
  renderer.setSize( window.innerWidth, window.innerHeight );    // update renderer with new viewport dimensions
}



// Animation

// animate the scene
function animate() {
  requestAnimationFrame( animate );      // request a new frame at default 60fps
  
  render();                              // call the render function to draw the scene
  
  stats.update();                        // update stats.js fps monitor
}



// Draw

// draw/render this every frame
function render() {
  cube.rotation.x += 0.01;            // rotate and concat this amount each frame
  cube.rotation.y += 0.01;
  
  renderer.render(scene, camera);     // ask Three.js to render the scene and camera view using WebGL
}