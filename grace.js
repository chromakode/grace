const width = 1280
const height = 720
const videoEl = document.getElementById('video')
const snapEl = document.getElementById('snap')

const grammar = tracery.createGrammar({
  'grace': [
    `Thank you for this #noun1#`
  ],
})

// this is a proof of concept. please be kind to these keys. :P
const app = new Clarifai.App(
  'eXCIkBf70ng0Iquq8aNFTz7qrHxD-7S7-qBwQb9h',
  's-C29IbBfaCSsxisHcsED8Thu94DX3VUjs9koYKf'
)

function sayGrace(base64) {
  app.models.predict(Clarifai.FOOD_MODEL, {base64}).then(
    function(response) {
      const words = response.outputs[0].data.concepts.map(c => c.name)
      const graceText = grammar.flatten(`#[noun1:${words[0]}]grace#`)
      speechSynthesis.speak(new SpeechSynthesisUtterance(graceText))
    },
    function(err) {
      console.error(err)
    }
  )
}

function takePicture() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  ctx.drawImage(videoEl, 0, 0, width, height)
  const base64 = canvas.toDataURL('image/png;base64').split(',')[1]
  sayGrace(base64)
}

function init() {
  navigator.getUserMedia({ video: { width, height, facingMode: { exact: 'environment' } } },
    function(stream) {
      videoEl.srcObject = stream
      videoEl.onloadedmetadata = () => videoEl.play()
    },
    function(err) {
      console.log("The following error occurred: " + err.name)
    }
  )

  snapEl.addEventListener('click', takePicture)
}

init()
