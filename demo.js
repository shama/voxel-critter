var createGame = require('voxel-engine');
var tic = require('tic')();
var createTerrain = require('voxel-perlin-terrain');

var game = createGame({
  chunkDistance: 2,
  generateVoxelChunk: createTerrain({scaleFactor:6}),
  materials: ['brick', ['grass', 'dirt', 'grass_dirt'], 'dirt'],
  texturePath: 'textures/'
});
var container = document.body;
game.appendTo(container);

// create a player
var createPlayer = require('voxel-player')(game);
var player = createPlayer('textures/shama.png');
player.yaw.position.set(0, -40, 0);
player.possess();

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

  critter.position.y = 5.5;
  critter.position.x = Math.random() * 100 - 15;
  critter.position.z = Math.random() * 100 - 15;
  
  critter.on('block', function () {
    critter.move(0, 0.02, 0.02);
  });
  critter.notice(player, { radius: 500 });
  
  critter.on('notice', function (p) {
    critter.lookAt(p);
    critter.move(0, 0, 0.05);
  });
  
  critter.on('collide', function (p) {
    //console.log('COLLISION');
  });

  tic.interval(function () {
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