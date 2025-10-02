///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#090014");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

const orbit = new THREE.Group();
scene.add(orbit);

// 3.1 Configurar mesh.
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
const geo = new THREE.OctahedronGeometry(1, 10);
const geo2 = new THREE.TorusGeometry( 2, 0.1, 16, 100 ); 


const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    //wireframe: false,
});

const mesh = new THREE.Mesh(geo, material);
orbit.add(mesh);
mesh.position.z = 0; // <-- Cambia a 0

const ring = new THREE.Mesh(geo2, material);
orbit.add(ring);
ring.position.z = 0; // <-- Cambia a 0

orbit.position.z = -7; // <-- Mueve el grupo

// 3.2 Crear luces.
// Luz principal tenue (frontal, como reflejo de luna fría)
const frontLight = new THREE.PointLight("#8a6db3", 40, 100); 
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

// Contraluz morada fuerte izquierda/atrás
const rimLightLeft = new THREE.PointLight("#6a00ff", 250, 200);
rimLightLeft.position.set(-7, -3, -7);
scene.add(rimLightLeft);

// Nueva contraluz derecha
const rimLightRight = new THREE.PointLight("#bf00ff", 180, 200); 
rimLightRight.position.set(7, -3, -7); 
scene.add(rimLightRight);

// Luz ambiental muy oscura para que no quede todo negro
const ambientLight = new THREE.AmbientLight("#1a0d33", 0.3); 
scene.add(ambientLight);

//const rimLight02 = new THREE.PointLight("#a200ff", 30, 50); //LUZ TRASEA/CONTRALUZ
//rimLight02.position.set(7, -3, -7);
//scene.add(rimLight02);

///////// EN CLASE.

//// A) Cargar múltiples texturas.
// 1. "Loading manager". Indica el estado de carga de los assets.
const manager = new THREE.LoadingManager(); // crear constante de nuesrtro loading manager.

// eventos sobre el proceso de carga.
// onStart: cuando inicia la carga.
manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`); //${text} variables de texto para en otra variable poder utlizar otras variables.
};
// onProgress: mientras se está cargando.
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};
// onLoad: cuando termina de cargar.
manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   createMaterial();
};
// onError: si hay un error en la carga, dando una pista del error.
manager.onError = function (url) {
   console.error(`❌ Error al cargar: ${url}`);
};

// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager);

// 3. Cargamos texturas guardadas en el folder del proyecto.

const redCrystal = {
   albedo: loader.load('./assets/texturas/red_crystal/albedo.jpg'),
   ao: loader.load('./assets/texturas/red_crystal/ao.jpg'),
   metalness: loader.load('./assets/texturas/red_crystal/metallic.png'),// define si la textura es metálica o no, blanca= metal negro=no metal (mate).
   normal: loader.load('./assets/texturas/red_crystal/normal_opengl.png'), // ayuda a definir los relieves  y luz de la textura.
   roughness: loader.load('./assets/texturas/red_crystal/roughness.jpg'), //brillo blanco
   displacement: loader.load('./assets/texturas/red_crystal/displacement.png'),
};

const violetCrystal = {
  albedo: loader.load('./assets/texturas/violet_crystal/albedo.jpg'),
  ao: loader.load('./assets/texturas/violet_crystal/ao.jpg'),
  metalness: loader.load('./assets/texturas/violet_crystal/metallic.jpg'),
  normal: loader.load('./assets/texturas/violet_crystal/normal.jpg'),
  roughness: loader.load('./assets/texturas/violet_crystal/roughness.jpg'),
  displacement: loader.load('./assets/texturas/violet_crystal/displacement.jpg'),
  emissive: loader.load('./assets/texturas/violet_crystal/emissive.jpg'), 
};

const greenCrystal = {
  albedo: loader.load('./assets/texturas/crystal/albedo.jpg'),
  ao: loader.load('./assets/texturas/crystal/ao.jpg'),
  metalness: loader.load('./assets/texturas/crystal/metallic.png'),
  normal: loader.load('./assets/texturas/crystal/normal.jpg'),
  roughness: loader.load('./assets/texturas/crystal/roughness.jpg'),
  displacement: loader.load('./assets/texturas/crystal/displacement.png'),
};

const metalTexture = {
  albedo: loader.load('./assets/texturas/metal/albedo.png'),
  ao: loader.load('./assets/texturas/metal/ao.png'),
  metalness: loader.load('./assets/texturas/metal/metallic.png'),
  normal: loader.load('./assets/texturas/metal/normal.png'),
  roughness: loader.load('./assets/texturas/metal/roughness.png'),
  displacement: loader.load('./assets/texturas/metal/displacement.png'),
};


// NOTA: las texturas se cargan de forma asíncrona, por lo que no podemos usarlas hasta que no estén todas cargadas.

// 4. Definimos variables y la función que va a crear el material al cargar las texturas.

var metalMaterial;
var redCrystalMaterial;
var violetCrystalMaterial;
var greenCrystalMaterial;

function createMaterial() {
   metalMaterial = new THREE.MeshStandardMaterial({
       map: metalTexture.albedo,
       aoMap: metalTexture.ao,
       metalnessMap: metalTexture.metalness,
       normalMap: metalTexture.normal,
       roughnessMap: metalTexture.roughness,
       displacementMap: metalTexture.displacement,
       displacementScale: 0.4,
       side: THREE.DoubleSideSide,
       metalness: 0.5,
       roughness: 0.1,
       //wireframe: true,
   });

   redCrystalMaterial = new THREE.MeshStandardMaterial({
       map: redCrystal.albedo,
       metalnessMap: redCrystal.metalness,
       normalMap: redCrystal.normal,
       roughnessMap: redCrystal.roughness,
       displacementMap: metalTexture.displacement,
       displacementScale: 0.4,
       metalness: 1,
       roughness: 0.2,
       side: THREE.DoubleSide,
   });

   violetCrystalMaterial = new THREE.MeshStandardMaterial({
       map: violetCrystal.albedo,
       metalnessMap: violetCrystal.metalness,
       normalMap: violetCrystal.normal,
       roughnessMap: violetCrystal.roughness,
       displacementMap: metalTexture.displacement,
       displacementScale: 0.4,
       metalness: 1,
       roughness: 1,
       side: THREE.DoubleSide,
   });

   greenCrystalMaterial = new THREE.MeshStandardMaterial({
       map: greenCrystal.albedo,
       metalnessMap: greenCrystal.metalness,
       normalMap: greenCrystal.normal,
       roughnessMap: greenCrystal.roughness,
       displacementMap: metalTexture.displacement,
       displacementScale: 0.4,
       metalness: 1,
       roughness: 1,
       side: THREE.DoubleSide,
   });


   ring.material =metalMaterial;
   mesh.material = metalMaterial; // VAS A REMPLAZAR EL MATERIAL POR ESTE NUEVO. Linea 79.
}

// 5. Cambiar materiales con botones.



//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
   y: 0, // escuchar el valor del scroll (y).
   lerpedY: 0, // técnica de animación, valor del scroll en fricción.
   speed: 0.005, //disminución o aumento de la velocidad del scroll.
   cof: 0.007 // coeficiente de fricción, calcular que tan suave.
};

// 2. Escuchar el evento scroll y actualizar el valor del scroll.
function updateScrollData(eventData) {
   scroll.y += eventData.deltaX * scroll.speed;
}

//updateScrollData es la función que actualiza el valor del scroll.
window.addEventListener("wheel", updateScrollData); // wheel es el evento que escucha el scroll del mouse.

// 3. Aplicar el valor del scroll a la rotación del mesh. (en el loop de animación)
function updateMeshRotation() {
   mesh.rotation.y = scroll.lerpedY;
   ring.rotation.y = scroll.lerpedY;
}

// 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollY() {
   scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
}


//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".
// 1. Crear un objeto con la data referente al MOUSE para ocuparla en todos lados.
var mouse = {
   x: 0,
   y: 0,
   normalOffset: {
       x: 0,
       y: 0
   },
   lerpNormalOffset: {
       x: 0,
       y: 0
   },

   cof: 0.07,
   gazeRange: {
       x: 7,
       y: 3
   }
}

// 2. Leer posición del mouse y calcular distancia del mouse al centro.
function updateMouseData(eventData) {
   updateMousePosition(eventData); // calcular la posicion del mouse
   calculateNormalOffset(); // calcular la distancia del centro
}
function updateMousePosition(eventData) {
   mouse.x = eventData.clientX;
   mouse.y = eventData.clientY;
}
function calculateNormalOffset() {
   let windowCenter = {
       x: canvas.width / 2,
       y: canvas.height / 2,
   }
   mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
   mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
}

window.addEventListener("mousemove", updateMouseData);

// 3. Aplicar valor calculado a la posición de la cámara. (en el loop de animación)
function updateCameraPosition() {
   camera.position.x = mouse.normalOffset.x * mouse.gazeRange.x;
   camera.position.y = -mouse.normalOffset.y * mouse.gazeRange.y;
}

// 1. Incrementar gradualmente el valor de la distancia que vamos a usar para animar y lo guardamos en otro atributo. (en el loop de animación)

function lerpDistanceToCenter() {
   mouse.lerpNormalOffset.x += (mouse.normalOffset.x - mouse.lerpNormalOffset.x) * mouse.cof;
   mouse.lerpNormalOffset.y += (mouse.normalOffset.y - mouse.lerpNormalOffset.y) * mouse.cof;
}


///////// FIN DE LA CLASE.


/////////


let grande = false; // estado inicial

canvas.addEventListener("mousedown", function () {
  if (!grande) {
    // Si está en tamaño normal → lo agranda
    gsap.to(orbit.scale, {
      x: 2,
      y: 2,
      z: 2,
      duration: 0.7,
      ease: "circ.out"
    });
  } else {
    // Si ya está grande → lo regresa
    gsap.to(orbit.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.7,
      ease: "power2.out"
    });
  }

  // Cambiar el estado
  grande = !grande;
});

// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);
    ring.rotation.x += 0.01;
    mesh.rotation.x -= 0.005;
    lerpScrollY()
    updateMeshRotation();
    lerpDistanceToCenter();
    updateCameraPosition();
    camera.lookAt(orbit.position); // <-- Mira al grupo
    renderer.render(scene, camera);
}

animate();


// para la interfaz (botones y tooltip)
const toggleBtn = document.getElementById("indicacionesToggle");
const indicaciones = document.getElementById("indicacionesContenido");

toggleBtn.addEventListener("click", () => {
    indicaciones.style.display = indicaciones.style.display === "block" ? "none" : "block";
});


const buttons = document.querySelectorAll(".materiaSwitch");
const tooltip = document.getElementById("tooltip");

buttons.forEach(btn => {
  btn.addEventListener("mousemove", e => {
    tooltip.textContent = btn.getAttribute("data-info");
    tooltip.style.left = e.pageX + 15 + "px";
    tooltip.style.top = e.pageY + 15 + "px";
    tooltip.style.opacity = 1;
  });

  btn.addEventListener("mouseleave", () => {
    tooltip.style.opacity = 0;
  });
});

let wireframeActivo = false;

window.addEventListener("keydown", function(e) {
  if (e.key.toLowerCase() === "w") {
    wireframeActivo = !wireframeActivo;

    if (metalMaterial) metalMaterial.wireframe = wireframeActivo;
    if (redCrystalMaterial) redCrystalMaterial.wireframe = wireframeActivo;
    if (violetCrystalMaterial) violetCrystalMaterial.wireframe = wireframeActivo;
    if (greenCrystalMaterial) greenCrystalMaterial.wireframe = wireframeActivo;
  }
});


// Botones interactivos.
const redCrystalMaterialButton = document.getElementById("textura01");
redCrystalMaterialButton.addEventListener("mousedown", function() {
   ring.material = redCrystalMaterial;
   mesh.material = redCrystalMaterial;
});

const violetCrystalMaterialButton = document.getElementById("textura02");
violetCrystalMaterialButton.addEventListener("mousedown", function() {
   ring.material = violetCrystalMaterial;
   mesh.material = violetCrystalMaterial;
});
 
const greenCrystalMaterialButton = document.getElementById("textura03");   
greenCrystalMaterialButton.addEventListener("mousedown", function() {
   ring.material = greenCrystalMaterial;
   mesh.material = greenCrystalMaterial;
});

