# voxel-critter [![Build Status](http://img.shields.io/travis/shama/voxel-critter.svg)](https://travis-ci.org/shama/voxel-critter)

Make your [voxel critter](http://voxelbuilder.com) come to life!

Extends [voxel-creature](https://github.com/substack/voxel-creature)
and loads encoded PNG files exported from voxelbuilder.com.

# example

[View this example](http://shama.github.io/voxel-critter)

```js
var critterCreator = require('voxel-critter')(game);
critterCreator('./critter.png', function(err, critter) {
  // Move forward
  critter.move(0, 0, 0.02);

  // Jump!
  critter.jump();
});
```

## converting images to voxel data

If you would like to convert images into voxel data within Node.js or the browser do:

```js
var convert = require('voxel-critter').Convert();
convert.readImage('./critter.png', function(err, hash) {
  var data = convert.toVoxels(hash);
  // data now contains the voxels, colors, and bounds
});
```

# install

With [npm](https://npmjs.org) do:

```
npm install voxel-critter
```

Use [browserify](http://browserify.org) to `require('voxel-critter')`.

## release history
* 0.1.2 - Fix non-existent load (@domenic)
* 0.1.1 - Subdivide functionality into load and convertToVoxels (@maxogden)
* 0.1.0 - initial release

## license
Copyright (c) 2014 Kyle Robinson Young
Licensed under the MIT license.
