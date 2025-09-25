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
renderer.setClearColor("#0a0c2c");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

const orbit = new THREE.Group();
scene.add(orbit);

// 3.1 Configurar mesh.
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
const geo = new THREE.OctahedronGeometry(1, 1);
const geo2 = new THREE.TorusGeometry( 2, 0.2, 16, 100 ); 


const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    //wireframe: false,
});

const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
scene.add(orbit);
mesh.position.z = -7;

const ring = new THREE.Mesh(geo2, material);
scene.add(ring);
scene.add(orbit);
ring.position.z = -7;


// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#ffffff", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#0066ff", 50, 100); //LUZ TRASEA/CONTRALUZ
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);

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
const tex = {
   albedo: loader.load('./assets/texturas/bricks/albedo.png'),
   ao: loader.load('./assets/texturas/bricks/ao.png'),
   metalness: loader.load('./assets/texturas/bricks/metallic.png'),// define si la textura es metálica o no, blanca= metal negro=no metal (mate).
   normal: loader.load('./assets/texturas/bricks/normal.png'), // ayuda a definir los relieves  y luz de la textura.
   roughness: loader.load('./assets/texturas/bricks/roughness.png'), //brillo blanco
   displacement: loader.load('./assets/texturas/bricks/displacement.png'),
};
// NOTA: las texturas se cargan de forma asíncrona, por lo que no podemos usarlas hasta que no estén todas cargadas.

// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var pbrMaterial;

function createMaterial() {
   pbrMaterial = new THREE.MeshStandardMaterial({
       map: tex.albedo,
       aoMap: tex.ao,
       metalnessMap: tex.metalness,
       normalMap: tex.normal,
       roughnessMap: tex.roughness,
       displacementMap: tex.displacement,
       displacementScale: 0.4,
       side: THREE.FrontSide,
       //wireframe: true,
   });
   ring.material =pbrMaterial;
   mesh.material = pbrMaterial; // VAS A REMPLAZAR EL MATERIAL POR ESTE NUEVO. Linea 79.
}


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


// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate); /// renderiza constantemente nuestro objeto 3D.
    // 4. Dentro de la función “animate”, ejecutamos la función que acabamos de crear.
   ring.rotation.x += 0.005;
    mesh.rotation.x -= 0.005;
    lerpScrollY()
    updateMeshRotation();
    lerpDistanceToCenter();
    updateCameraPosition();
    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
}

animate();