var createGame = require('voxel-engine');
var perlinTerrain = require('voxel-perlin-terrain')
var walk = require('voxel-walk');
var request = require('browser-request');

var game = createGame({
  chunkDistance: 3,
  generateChunks: false,
  materials: [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt'],
  texturePath: 'textures/'
});

var terrainGenerator = perlinTerrain('foobar', 0, 4)

game.voxels.on('missingChunk', function(chunkPosition) {
  var size = game.chunkSize
  var voxels = terrainGenerator(chunkPosition, size)
  var chunk = {
    position: chunkPosition,
    dims: [size, size, size],
    voxels: voxels
  }
  game.showChunk(chunk)
})

game.paused = false

var container = document.body;
game.appendTo(container);

// create a player
var createPlayer = require('voxel-player')(game);
var player = createPlayer('textures/shama.png');
player.yaw.position.set(0, 10, 0);
player.possess();
player.toggle(); // switch to 3rd person

game.on('tick', function() {
  walk.render(player.playerSkin)
  var vx = Math.abs(player.velocity.x)
  var vz = Math.abs(player.velocity.z)
  if (vx > 0.001 || vz > 0.001) walk.stopWalking()
  else walk.startWalking()
})

// toggle between first and third person modes
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) player.toggle()
})

function addImage(src) {
  function appendImage(el) {
    var right = document.querySelector('.right');
    if (right.childNodes.length > 10) {
      right.removeChild(right.childNodes[2]);
    }
    var li = document.createElement('li');
    li.appendChild(el);
    right.appendChild(li);
  }
  if (typeof src === 'string') {
    var img = new Image();
    img.onload = function() {
      appendImage(img);
    }
    img.src = src;
  } else {
    appendImage(src);
  }
}

// create a critter
var critterCreator = require('./')(game);
function createCritter(img, done) {
  if (typeof img !== 'string') {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    addImage(canvas);
  } else {
    addImage(img);
  }
  critterCreator(img, function(err, critter) {
    critter.position.clone(game.controls.target().avatar.position);
    critter.position.z += 10;
    critter.position.y += 10;
    
    critter.on('block', function () {
      critter.move(0, 0.02, 0.02);
    });
    critter.notice(player, { radius: 5 });
    
    critter.on('notice', function (p) {
      critter.lookAt(p);
      critter.move(0, 0, 0.05);
    });
    
    critter.on('collide', function (p) {
      //console.log('COLLISION');
    });

    game.setInterval(function () {
      if (critter.noticed) return;
      critter.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
      critter.move(0, 0, 0.05 * Math.random());
    }, 1000);

    if (typeof done === 'function') done(null, critter);
  });
}

// Create a rabbit
game.once('tick', function() {
  createCritter('./rabbit.png', function(err, r) {
    r.position.x = player.yaw.position.x;
    r.position.y = player.yaw.position.y;
    r.position.z = player.yaw.position.z - 10;
  });
});

// critter browser
function showCritterBrowser() {
  var content = document.querySelector('#critters')
  content.style.display = "block"
  content.innerHTML = '<p>Loading...</p>'
  request({ 
      url: 'http://maxcors.jit.su/http://max.ic.ht/critters/_all_docs?include_docs=true', 
      json: true
    }, function(err, resp, data) {
    if (err) {
      alert('error loading critters!')
      hideCritterBrowser()
      return
    }
    content.innerHTML = ""
    data.rows.map(function(row) {
      if (!row || !row.doc) return
      if (row.doc.link && row.doc.link.match(/imgur/)) {
        content.innerHTML += ('<img class="critterImage" src="' + row.doc.link + '"/>')
      }
    })
    
  })
}

function hideCritterBrowser() {
  document.querySelector('#critters').style.display = 'none'
}

function getProxyImage(imgURL, cb) {
  var proxyURL = 'http://maxcors.jit.su/' + imgURL // until imgur gets CORS on GETs
  var img = new Image()
  img.crossOrigin = ''
  img.src = proxyURL
  img.onload = function() {
    cb(img)
  }
}

document.querySelector('.browser').addEventListener('click', showCritterBrowser)
document.addEventListener('click', function(e) {
  if (!e.target.className.match(/critterImage/)) return
  hideCritterBrowser()
  getProxyImage(e.target.src, function(img) {
    createCritter(img)
  })
})

// handle drag and drop
if (typeof window.FileReader === 'undefined') {
  alert('Sorry your browser doesn\'t support drag and drop files.');
}
container.ondragover = function() { this.className = 'active'; return false; };
container.ondragend = function() { this.className = ''; return false; };
container.ondrop = function (e) {
  e.preventDefault();
  this.className = '';
  for (i in e.dataTransfer.files) {
    var file = e.dataTransfer.files[i];
    if (!(file instanceof File)) { continue; }
    var reader = new FileReader();
    reader.onload = function(event) {
      var img = new Image();
      img.onload = function() {
        createCritter(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
  return false;
};