var inherits = require('inherits');
var lsb = require('lsb');
var voxelMesh = require('voxel-mesh');
var voxel = require('voxel');
var Creature = require('voxel-creature').Creature;
var Convert = require('./lib/convert.js');

function Critter(game, img, opts, done) {
  var self = this;
  if (typeof opts === 'function') {
    done = opts;
    opts = {};
  }
  this.game = game;
  this.convert = new Convert();
  this.convert.readImage(img, function(err, hash) {
    if (err) throw err;
    if (!hash) throw new Error('Invalid image.');
    var data = self.build(hash);
    Creature.call(self, game, data, opts);
    done(null, self);
  });
}
inherits(Critter, Creature);

module.exports = function(game) {
  return function(img, opts, done) {
    return new Critter(game, img, opts || {}, done);
  };
};
module.exports.Critter = Critter;

Critter.prototype.build = function(hash) {
  var self = this;

  var converted = this.convert.toVoxels(hash);
  var bounds = converted.bounds;
  var voxels = converted.voxels;
  var colors = converted.colors;
  
  // create voxels
  bounds[0] = bounds[0].map(function(b) { return b - 1; });
  bounds[1] = bounds[1].map(function(b) { return b + 1; });
  var voxels = voxel.generate(bounds[0], bounds[1], function(x, y, z) {
    return voxels[[x, y, z].join('|')] || 0;
  });
  
  // create mesh
  var scale = 0.2;
  var mesh = voxelMesh(voxels, this.game.mesher, new this.game.THREE.Vector3(scale, scale, scale), this.game.THREE);
  var mat = new self.game.THREE.MeshBasicMaterial({vertexColors: this.game.THREE.FaceColors});
  mesh.createSurfaceMesh(mat);

  // colorize
  for (var i = 0; i < mesh.surfaceMesh.geometry.faces.length; i++) {
    var face = mesh.surfaceMesh.geometry.faces[i];
    var index = Math.floor(face.color.b*255 + face.color.g*255*255 + face.color.r*255*255*255);
    var color = colors[index] || colors[0];
    face.color.setRGB(color[0], color[1], color[2]);
  }

  // center the geometry
  this.game.THREE.GeometryUtils.center(mesh.surfaceMesh.geometry);
  mesh.setPosition(0, 1.5, 0);

  // create creature
  var critter = new this.game.THREE.Object3D();
  critter.add(mesh.surfaceMesh);
  return critter;
};
