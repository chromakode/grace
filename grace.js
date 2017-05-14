const width = 1280
const height = 720
const videoEl = document.getElementById('video')
const snapEl = document.getElementById('snap')

const activeIngredients = new Set(['bread', 'chicken'])

const grammar = tracery.createGrammar({
  'grace': [
    'As we begin this meal of #noun1#. #details# #signoff#',
    'Let us give thanks for this #noun1#. #details# #signoff#',
    'In this plate of #noun1#',
  ],
  'ones': [
    'family',
    'friends',
    'stomachs',
    'ancestors',
    'descendents',
    'children',
    'kindred',
    'peers',
    'enemies',
  ],
  'signoff': [
    'Blessed be our #ones#, our #ones#, and our #ones#.',
    'Let us keep our #ones# in our thoughts as we enjoy this meal.',
    'With thoughts to the less fortunate #ones# than us, let us begin this meal.',
  ],
  'thanks': [
    'with consideration for',
    'thanks to',
    'thank you for',
    'with gratitude for',
  ],
  'bread': [
    '#thanks# to the farmers who grew this wheat the grinders who made the flour and the bakers who rose the dough.',
  ],
  'chicken': [
    '#thanks# to the chicken who gave its wings for this succulent meat',
  ],
})

// this is a proof of concept. please be kind to these keys. :P
const app = new Clarifai.App(
  'eXCIkBf70ng0Iquq8aNFTz7qrHxD-7S7-qBwQb9h',
  's-C29IbBfaCSsxisHcsED8Thu94DX3VUjs9koYKf'
)

function sayGrace(words) {
  const ingredients = words.filter(word => activeIngredients.has(word))
  const details = ingredients.map(word => `#[word:${word}]${word}#`).join('')
  const graceText = grammar.flatten(`#[noun1:${words[0]}][details:${details}]grace#`)
  console.log(words, ingredients, graceText)
  speechSynthesis.speak(new SpeechSynthesisUtterance(graceText))
}

function analyze(base64) {
  app.models.predict(Clarifai.FOOD_MODEL, {base64}).then(
    function(response) {
      const words = response.outputs[0].data.concepts.filter(c => c.value > .75).map(c => c.name)
      sayGrace(words)
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
  analyze(base64)
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
