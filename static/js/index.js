const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();
let net;

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  // Make a prediction through the model on our image.
  /*
  const imgEl = document.getElementById('img');
  const result = await net.classify(imgEl);
  console.log(result);
  

  await setupWebcam();
  while (true) {
    const result = await net.classify(webcamElement);

    document.getElementById('console').innerText = `
      prediction: ${result[0].className}\n
      probability: ${result[0].probability}
    `;

    // Give some breathing room by waiting for the next animation frame to
    // fire.
    await tf.nextFrame();
  }
  */

  await setupWebcam();

  predict();
}


async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({
          video: true
        },
        stream => {
          window.localStream = stream;
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

async function predict() {
  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C'];
      document.getElementById('console').innerText = `
       Prediction: ${classes[result.classIndex]}\n
       Probability: ${result.confidences[result.classIndex]}
     `;
    }

    await tf.nextFrame();
  }
}

function camera() {
  var vdo = document.getElementById("webcam");
  var result = document.getElementById("console");
  var btn = document.getElementById("webcam-btn");
  var elems = document.getElementsByClassName("btn-class");
  if (btn.innerHTML === "Stop") {
    //webcamElement.pause(); 
    var track = localStream.getTracks()[0]; // if only one media track
    track.stop();
    vdo.style.display = "none";
    result.style.display = "none";
    for (var i = 0; i < elems.length; i++) {
      elems[i].disabled = true;
    }
    btn.innerHTML = "Start";
    btn.classList.remove("btn-outline-danger");
    btn.classList.add("btn-outline-success");
  } else {
    vdo.style.display = "inline";
    result.style.display = "inline";
    setupWebcam();
    btn.innerHTML = "Stop";
    for (var i = 0; i < elems.length; i++) {
      elems[i].disabled = false;
    }
    predict();
    btn.classList.remove("btn-outline-success");
    btn.classList.add("btn-outline-danger");
  }
}

app();