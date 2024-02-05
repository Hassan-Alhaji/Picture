// script.js
let stream;
let capturedImages = [];
let scannedQRCodes = [];

async function openCamera() {
  try {
    const constraints = { video: true };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    scannedQRCodes = [];
    updateImageGrid();
    updateQRCodeList();
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

async function downloadImages() {
  if (capturedImages.length === 0) {
    alert('No images to download.');
    return;
  }

  const zip = new JSZip();

  const promises = capturedImages.map(async (imageSrc, index) => {
    const response = await fetch(imageSrc);
    const arrayBuffer = await response.arrayBuffer();

    zip.file(`captured_image_${index + 1}.png`, arrayBuffer);
  });

  await Promise.all(promises);

  zip.generateAsync({ type: 'blob' })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'captured_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

function scanQRCode() {
  const videoElement = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    // Add the scanned QR code data to the list
    scannedQRCodes.push(code.data);

    // Update the QR code list
    updateQRCodeList();

    // Display the URL link under the camera
    const qrCodeLink = document.getElementById('qrCodeLink');
    qrCodeLink.textContent = `Scanned QR Code: ${code.data}`;
  } else {
    alert('No QR Code found.');
  }
}

function updateQRCodeList() {
  const qrCodeTableBody = document.getElementById('qrCodeTableBody');
  while (qrCodeTableBody.firstChild) {
    qrCodeTableBody.removeChild(qrCodeTableBody.firstChild);
  }

  scannedQRCodes.forEach((qrCodeData, index) => {
    const row = qrCodeTableBody.insertRow();
    
    const numberCell = row.insertCell(0);
    numberCell.textContent = index + 1;

    const linkCell = row.insertCell(1);
    linkCell.textContent = qrCodeData;
  });
}
