const width = 1280
const height = 720
const cameraScreen = document.getElementById('camera-screen')
const eulogyScreen = document.getElementById('eulogy-screen')
const videoEl = document.getElementById('video')
const snapEl = document.getElementById('snap')
const ytEl = document.getElementById('yt')

// prevent garbage collection of utterances, so onend gets called >:(
window.utterances = []

const grammar = tracery.createGrammar({
  'names': [
    'ethel',
    'meredith',
    'meribell',
    'claire',
    'winston',
    'billy',
    'arnold',
    'timmy',
    'lulubell',
    'daisy',
    'rupert',
  ],
  'state': [
    'indiana',
    'oregon',
    'california',
    'maryland',
    'vermont',
  ],
  'price': [
    'discount',
    'premium',
    'organic',
  ],
  'color': [
    'yellow, like the sun',
    'blue, like the sky',
    'green, like the grass',
  ],
  'description': [
    'bursting with heart and energy',
    'filled with a natural curiosity',
    'dearly loved by its parents',
  ],
  'story': [
    '#storystart# #anecdote# #storyend# #name# is survived by #storysurvived# #rip#',
  ],
  'storystart': [
    '#name# began life in #state# as a #noun# #description#.',
  ],
  'anecdote': [
    '#name# loved the color yellow.',
    '#name#\'s favorite food was strawberries.',
    '#name# loved to walk long circles in the grass.',
    'making friends came easily to #name#.',
    '#name# loved to roll around in the grass',
  ],
  'storyend': [
    'at the ripe old age of #age#, #name# was slaughtered, processed, and distributed by #packer#, and sold as #price# #meat# in #state#.'
  ],
  'storysurvived': [
    '3 #noun.s# and mate named #names#.',
    '2 #noun.s#, also deceased.',
    'a mate named #names# who has also been slaughtered.',
  ],
  'beefnoun': ['calf'],
  'porknoun': ['piglet'],
  'chickennoun': ['chick'],
  'beefage': ['36 months', '30 months', '29 months'],
  'porkage': ['3 months', '2 months'],
  'chickenage': ['4 weeks', '60 days', '40 days'],
  'beefpacker': [
    'Tyson Foods',
    'Cargill Meat Solutions',
    'JBS USA',
    'National Beef',
  ],
  'porkpacker': [
    'Smithfield Foods',
    'Tyson Foods',
    'JBS USA',
    'Cargill Meat Solutions',
  ],
  'chickenpacker': [
    'Pilgrim\'s Pride',
    'Tyson Foods',
    'Perdue Farms',
    'Sanderson Farms',
  ],
  'rip': [
    'peace be to you, #name#. we will never forget you.',
    'rest in peace, #name#. you will always be in our hearts.',
    'let us have a moment of silence for #name#. #name# will forever be in our thoughts.',
  ],
})

const videos = ['GmXeJlJFSXs', 'qROfc8FkbVk', 'lR71H1nxp-0', 'fahr069-fzE']
const meats = new Set(['chicken', 'pork', 'beef'])

const youngPhotos = {
  'beef': ['calf1.jpg', 'calf2.jpg', 'calf3.jpg', 'calf4.jpg'],
  'chicken': ['chick1.jpg', 'chick2.jpg', 'chick3.jpg', 'chick4.jpg'],
  'pork': ['piglet1.jpg', 'piglet2.jpg', 'piglet3.jpg', 'piglet4.jpg'],
}
const oldPhotos = {
  'beef': ['cow1.jpg', 'cow2.jpg', 'cow3.jpg', 'cow4.jpg'],
  'chicken': ['chicken1.jpg', 'chicken2.jpg', 'chicken3.jpg', 'chicken4.jpg'],
  'pork': ['pig1.jpg', 'pig2.jpg', 'pig3.jpg', 'pig4.jpg'],
}
const extraPhotos = ['grass.jpg', 'hay.jpg']

// this is a proof of concept. please be kind to these keys. :P
const app = new Clarifai.App(
  'eXCIkBf70ng0Iquq8aNFTz7qrHxD-7S7-qBwQb9h',
  's-C29IbBfaCSsxisHcsED8Thu94DX3VUjs9koYKf'
)

function ytURL(id) {
  return `https://www.youtube.com/embed/${id}?rel=0&controls=0&showinfo=0&autoplay=1`
}

function imgURL(name) {
  return `img/${name}`
}

function addPhoto(url) {
  const photoEl = document.createElement('img')
  photoEl.src = url
  photoEl.style.left = '-70vw'
  photoEl.style.top = `${Math.random() * 40}vh`
  eulogyScreen.appendChild(photoEl)
  photoEl.offsetLeft
  photoEl.style.transition = 'all 20s linear'
  photoEl.style.left = `${Math.random() * 50}vw`
}

function eulogize(meatKind, cameraImg) {
  cameraScreen.style.display = 'none'
  eulogyScreen.style.display = 'block'
  ytEl.src = ytURL(_.sample(videos))
  addPhoto(imgURL(_.sample(youngPhotos[meatKind])))
  setTimeout(() => {
    addPhoto(imgURL(_.sample(oldPhotos[meatKind])))
  }, 15 * 1000)
  setTimeout(() => {
    addPhoto(cameraImg)
  }, 30 * 1000)
  setTimeout(() => {
    const eulogyText = grammar.flatten(`#[meat:${meatKind}][name:#names#][noun:#${meatKind}noun#][age:#${meatKind}age#][packer:#${meatKind}packer#]story#`)
    console.log(eulogyText)
    const sentences = eulogyText.split('.')

    function nextUtterance() {
      const sentence = sentences.shift()
      if (!sentence) {
        return
      }
      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.rate = .9
      utterance.volume = 1
      utterance.onend = () => setTimeout(nextUtterance, 650)
      window.utterances.push(utterance)
      speechSynthesis.speak(utterance)
    }
    nextUtterance()
  }, 10 * 1000)
}

function analyze(cameraImg) {
  const base64 = cameraImg.split(',')[1]
  app.models.predict(Clarifai.FOOD_MODEL, {base64}).then(
    function(response) {
      const ingredients = response.outputs[0].data.concepts.map(c => c.name)
      const meatKind = ingredients.find(w => meats.has(w))
      console.log(meatKind, ingredients)
      if (!meatKind) {
        console.error('unknown meat kind:', meatKind)
        return
      }
      eulogize(meatKind, cameraImg)
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
  const cameraImg = canvas.toDataURL('image/png;base64')
  analyze(cameraImg)
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
