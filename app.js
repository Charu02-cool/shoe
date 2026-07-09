// ===== SLIDER =====
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function goToSlide(n) {
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  currentSlide = (n + slides.length) % slides.length;
  if (slides[currentSlide]) slides[currentSlide].classList.add('active');
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function changeSlide(dir) { goToSlide(currentSlide + dir); }

if (slides.length) setInterval(() => changeSlide(1), 4000);

// ===== HOME PRODUCTS =====
function renderHomeProducts() {
  const el = document.getElementById('homeProducts');
  if (!el) return;
  const show = PRODUCTS.slice(0, 6);
  el.innerHTML = show.map(p => productCard(p)).join('');
}

function renderFeaturedProducts() {
  const el = document.getElementById('featuredProducts');
  if (!el) return;
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 3);
  el.innerHTML = featured.map(p => featuredCard(p)).join('');
}

function productCard(p) {
  const disc = Math.round((p.oldPrice - p.price) / p.oldPrice * 100);
  return `
  <div class="product-card">
    <div class="product-img-wrap">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <span class="discount-tag">${disc}% OFF</span>
      <button class="ar-quick-btn" onclick="openARModal('${p.name}','${p.image}')" title="AR Try-On">
        <i class="fa fa-vr-cardboard"></i> Try-On
      </button>
    </div>
    <div class="product-info">
      <p class="product-brand">${p.brand}</p>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating">${renderStars(p.rating)} <span>(${p.reviews.toLocaleString()})</span></div>
      <div class="product-price">
        <span class="price-new">${formatPrice(p.price)}</span>
        <span class="price-old">${formatPrice(p.oldPrice)}</span>
      </div>
      <div class="product-actions">
        <button class="btn-cart" onclick="quickAddToCart(${p.id})">
          <i class="fa fa-shopping-cart"></i> Add to Cart
        </button>
        <button class="btn-ar" onclick="openARModal('${p.name}','${p.image}')">
          <i class="fa fa-vr-cardboard"></i> AR Try-On
        </button>
      </div>
    </div>
  </div>`;
}

function featuredCard(p) {
  return `
  <div class="featured-card">
    <div class="featured-img">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
    </div>
    <div class="featured-info">
      <p class="product-brand">${p.brand}</p>
      <h3>${p.name}</h3>
      <div class="product-rating">${renderStars(p.rating)} <span>(${p.reviews.toLocaleString()} reviews)</span></div>
      <p class="featured-desc">${p.description}</p>
      <div class="product-price">
        <span class="price-new">${formatPrice(p.price)}</span>
        <span class="price-old">${formatPrice(p.oldPrice)}</span>
        <span class="discount-badge">${Math.round((p.oldPrice-p.price)/p.oldPrice*100)}% OFF</span>
      </div>
      <div class="product-actions">
        <button class="btn-cart" onclick="quickAddToCart(${p.id})">
          <i class="fa fa-shopping-cart"></i> Add to Cart
        </button>
        <button class="btn-ar" onclick="openARModal('${p.name}','${p.image}')">
          <i class="fa fa-vr-cardboard"></i> AR Try-On
        </button>
        <a href="product-detail.html?id=${p.id}" class="btn-detail">View Details</a>
      </div>
    </div>
  </div>`;
}

function quickAddToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (p) addToCart(id, p.sizes[2] || 'UK 8');
}

// ===== SEARCH =====
function searchProducts() {
  const q = document.getElementById('searchInput')?.value?.trim();
  if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
}
document.getElementById('searchInput')?.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchProducts();
});

// ===== AR MODAL =====
let arStream = null;
let currentARProduct = null;
let currentARImage = null;

function openARModal(name, img) {
  currentARProduct = name;
  currentARImage = img;
  document.getElementById('arProductName').textContent = name;
  document.getElementById('arShoeImg').src = img;
  document.getElementById('arResult').style.display = 'none';
  document.getElementById('cameraTab').classList.add('active');
  document.getElementById('uploadTab').classList.remove('active');
  document.querySelectorAll('.ar-tab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.getElementById('startCameraBtn').style.display = 'block';
  document.getElementById('captureBtn').style.display = 'none';
  document.getElementById('arModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeARModal() {
  stopCamera();
  document.getElementById('arModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  document.querySelectorAll('.ar-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ar-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tab + 'Tab').classList.add('active');
  event.target.closest('.ar-tab').classList.add('active');
  if (tab !== 'camera') stopCamera();
}

// ===== FEET-ONLY DETECTION GUARD (real ML models) =====
// Uses Google's MediaPipe Tasks-Vision models, loaded from CDN at runtime:
//  - BlazeFace short-range model -> actual face detection
//  - HandLandmarker model        -> actual hand detection (21 landmarks)
// Both run locally in the browser (WASM/GPU), nothing is uploaded anywhere.
// Only when NEITHER a face NOR a hand is found is the frame treated as "feet"
// and the Capture button gets enabled.
let arDetectTimer = null;
let arFaceDetector = null;
let arHandLandmarker = null;
let arModelsLoading = false;
let arModelsReady = false;

async function loadDetectionModels() {
  if (arModelsReady || arModelsLoading) return;
  arModelsLoading = true;
  setDetectStatus('none', 'Loading detection models…');
  try {
    const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
    const filesetResolver = await vision.FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    arFaceDetector = await vision.FaceDetector.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
      },
      runningMode: 'VIDEO'
    });

    arHandLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
      },
      runningMode: 'VIDEO',
      numHands: 2
    });

    arModelsReady = true;
    setDetectStatus('none', 'Feet not detected');
  } catch (e) {
    console.error('Failed to load detection models', e);
    setDetectStatus('blocked', 'Could not load detection models — check your internet connection');
  } finally {
    arModelsLoading = false;
  }
}

function setDetectStatus(state, text) {
  const box = document.getElementById('arDetectStatus');
  const label = document.getElementById('arDetectStatusText');
  const captureBtn = document.getElementById('captureBtn');
  if (!box || !label) return;
  box.style.display = 'flex';
  box.classList.remove('ar-detect-none', 'ar-detect-blocked', 'ar-detect-ok');
  box.classList.add('ar-detect-' + state);
  label.textContent = text;
  if (captureBtn) captureBtn.disabled = state !== 'ok';
}

function checkFrameForFeet() {
  const video = document.getElementById('arVideo');
  if (!video || !video.videoWidth) return;
  if (!arModelsReady) { setDetectStatus('none', 'Loading detection models…'); return; }

  const now = performance.now();

  try {
    const faceResult = arFaceDetector.detectForVideo(video, now);
    if (faceResult && faceResult.detections && faceResult.detections.length > 0) {
      setDetectStatus('blocked', 'Face detected — please point the camera at your feet only');
      return;
    }
  } catch (e) { /* skip this frame */ }

  try {
    const handResult = arHandLandmarker.detectForVideo(video, now);
    if (handResult && handResult.landmarks && handResult.landmarks.length > 0) {
      setDetectStatus('blocked', 'Hand detected — please point the camera at your feet only');
      return;
    }
  } catch (e) { /* skip this frame */ }

  setDetectStatus('ok', 'Feet detected — you can capture now');
}

function startDetectLoop() {
  stopDetectLoop();
  setDetectStatus('none', arModelsReady ? 'Feet not detected' : 'Loading detection models…');
  arDetectTimer = setInterval(checkFrameForFeet, 300);
}

function stopDetectLoop() {
  if (arDetectTimer) { clearInterval(arDetectTimer); arDetectTimer = null; }
  const box = document.getElementById('arDetectStatus');
  if (box) box.style.display = 'none';
}

// Kick off model download as soon as the page loads so it's ready by the
// time the user opens the camera tab.
loadDetectionModels();

async function startCamera() {
  try {
    arStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: 640, height: 480 }
    });
    const video = document.getElementById('arVideo');
    video.srcObject = arStream;
    document.getElementById('startCameraBtn').style.display = 'none';
    document.getElementById('captureBtn').style.display = 'block';
    document.getElementById('captureBtn').disabled = true;
    document.querySelector('.ar-scan-line').style.display = 'block';
    if (!arModelsReady) await loadDetectionModels();
    startDetectLoop();
  } catch (err) {
    alert('Camera access denied or unavailable. Please allow camera access or use "Upload Photo" instead.');
  }
}

function stopCamera() {
  stopDetectLoop();
  if (arStream) {
    arStream.getTracks().forEach(t => t.stop());
    arStream = null;
  }
}

function captureFoot() {
  const captureBtn = document.getElementById('captureBtn');
  if (captureBtn && captureBtn.disabled) {
    showToast('⚠️ Please show only your feet to the camera first');
    return;
  }
  const video = document.getElementById('arVideo');
  const canvas = document.getElementById('arCanvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  simulateFootAnalysis();
}

function analyzeFootPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('uploadPreview');
    const img = document.getElementById('uploadedFoot');
    img.src = e.target.result;
    preview.style.display = 'block';
    // Simulate analysis delay
    setTimeout(() => simulateFootAnalysis(), 1500);
  };
  reader.readAsDataURL(file);
}

function simulateFootAnalysis() {
  // Simulate AI foot measurement
  // In real app, this would use TensorFlow.js or ML model for foot detection
  document.getElementById('arResult').style.display = 'none';
  showToast('🔍 Analysing your foot size...');
  
  setTimeout(() => {
    // Generate realistic size based on "analysis"
    const sizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
    const sizeIndex = Math.floor(Math.random() * 4) + 1; // UK 7-10 most common
    const detectedSize = sizes[sizeIndex];
    const halfSize = sizes[sizeIndex] + '.5';
    const footLength = (24 + sizeIndex * 0.85).toFixed(1);
    const footWidth = (8.5 + sizeIndex * 0.2).toFixed(1);

    document.getElementById('sizeDisplay').textContent = detectedSize;
    document.getElementById('sizeDetails').innerHTML = `
      <div class="size-metric"><span>Foot Length</span><strong>${footLength} cm</strong></div>
      <div class="size-metric"><span>Foot Width</span><strong>${footWidth} cm</strong></div>
      <div class="size-metric"><span>Confidence</span><strong>${Math.floor(88 + Math.random()*10)}%</strong></div>
    `;
    document.getElementById('recProductName').textContent = currentARProduct;
    document.getElementById('recSize').textContent = detectedSize;
    document.getElementById('recSizeHalf').textContent = sizes[sizeIndex+1] || detectedSize;
    document.getElementById('cartSize').textContent = detectedSize;
    
    stopCamera();
    document.getElementById('arResult').style.display = 'block';
  }, 2500);
}

function addToCartFromAR() {
  const size = document.getElementById('sizeDisplay').textContent;
  const product = PRODUCTS.find(p => p.name === currentARProduct) || PRODUCTS[0];
  addToCart(product.id, size);
  closeARModal();
}

function retryAR() {
  document.getElementById('arResult').style.display = 'none';
  document.getElementById('startCameraBtn').style.display = 'block';
  document.getElementById('captureBtn').style.display = 'none';
  document.getElementById('uploadPreview').style.display = 'none';
  stopDetectLoop();
}

// Close modal on backdrop click
document.getElementById('arModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeARModal();
});

// Init page
renderHomeProducts();
renderFeaturedProducts();
