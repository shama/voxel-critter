var createGame = require('voxel-engine');
var perlinTerrain = require('voxel-perlin-terrain')
var walk = require('voxel-walk')
var request = require('browser-request')

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
player.yaw.position.set(0, 100, 0);
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

function addImage(img) {
  var right = document.querySelector('.right');
  if (right.childNodes.length > 10) {
    right.removeChild(right.childNodes[2]);
  }
  var li = document.createElement('li');
  li.appendChild(img);
  right.appendChild(li);
}

// create a critter
var critterCreator = require('./')(game);
function createCritter(img) {
  addImage(img);
  var critter = critterCreator(img);

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

  return critter;
}

// Create a rabbit
game.once('tick', function() {
  var rabbit = new Image();
  rabbit.onload = function() {
    var r = createCritter(rabbit);
    r.position.x = player.yaw.position.x;
    r.position.y = player.yaw.position.y;
    r.position.z = player.yaw.position.z - 10;
  };
  rabbit.src = './rabbit.png';
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
      img.src = event.target.result;
      img.onload = function() {
        createCritter(img);
      };
    };
    reader.readAsDataURL(file);
  }
  return false;
};