// script.js
let stream;
let capturedImages = [];

async function openCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

function closeCamera() {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    const videoElement = document.getElementById('video');
    videoElement.srcObject = null;
    capturedImages = [];
    updateImageGrid();
  }
}

async function openCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}


function capturePicture() {
  const videoElement = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  
  if (stream && capturedImages.length < 9) {
    const capturedImage = document.createElement('img');
    capturedImage.src = captureFrame(videoElement, canvas);
    capturedImages.push(capturedImage.src);
    updateImageGrid();
  } else {
    alert('You have reached the maximum limit of 9 captures or the camera is not open.');
  }
}

function removeLastPicture() {
  if (capturedImages.length > 0) {
    capturedImages.pop();
    updateImageGrid();
  }
}

function updateImageGrid() {
  const imageGrid = document.getElementById('imageGrid');
  const noPicturesMessage = document.getElementById('noPicturesMessage');

  while (imageGrid.firstChild) {
    imageGrid.removeChild(imageGrid.firstChild);
  }

  capturedImages.forEach(imageSrc => {
    const capturedImage = document.createElement('img');
    capturedImage.src = imageSrc;
    imageGrid.appendChild(capturedImage);
  });

  noPicturesMessage.style.display = capturedImages.length === 0 ? 'block' : 'none';
}

function captureFrame(videoElement, canvas) {
  const context = canvas.getContext('2d');

  canvas.width = 100;
  canvas.height = (videoElement.videoHeight / videoElement.videoWidth) * canvas.width;

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL('image/png');

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  return imageData;
}
