const width = 1280
const height = 720
const videoEl = document.getElementById('video')
const snapEl = document.getElementById('snap')

const activeIngredients = new Set(['bread', 'chicken', 'pork', 'beef', 'fish', 'spaghetti'])

const grammar = tracery.createGrammar({
  'grace': [
    'As we begin this meal. #details# #signoff#',
    'Reflecting on this repast. #details# #signoff#',
    'In this plate #details# #signoff#',
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
    'Let us keep our #ones# and #ones# in our thoughts as we enjoy this meal.',
    'With thoughts to the less fortunate #ones# than us, let us begin this meal.',
    'May this meal bring us joy and health',
  ],
  'thanks': [
    'consideration for',
    'thanks to',
    'thank you for',
    'gratitude for',
  ],
  'bread': [
    '#thanks# to the farmers who grew this wheat the grinders who made the flour and the bakers who rose the dough.',
    'let us reflect upon the flaky crust and chewy dough',
  ],
  'chicken': [
    'with #thanks# to the chicken who gave its wings for this succulent meat',
    'with #thanks# to the feathered friend who provided its tasty flesh',
  ],
  'pork': [
    '#thanks# to the pig for its delicious bacon',
  ],
  'beef': [
    '#thanks# to the cow for converting grass into tasty beef',
  ],
  'fish': [
    '#thanks# to the fish who will never swim again',
  ],
  'spaghetti': [
    'let us rejoice in the fact that noodles are simply awesome',
    'we will slurp these noodles with #thanks# to the #ones# before and after us',
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
