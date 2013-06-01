# voxel-critter

Make your [voxel critter](voxelbuilder.com) come to life!

Extends [voxel-creature](https://github.com/substack/voxel-creature)
and loads encoded PNG files exported from voxelbuilder.com.

# example

[View this example](http://shama.github.io/voxel-critter)

```js
var critterCreator = require('voxel-critter')(game);

var img = new Image();
img.onload = function() {
  var critter = critterCreator(img);
  
  // Move forward
  critter.move(0, 0, 0.02);

  // Jump!
  critter.jump();
};
img.src = 'critter.png';
```

# install

With [npm](https://npmjs.org) do:

```
npm install voxel-critter
```

Use [browserify](http://browserify.org) to `require('voxel-critter')`.

## release history
* 0.1.0 - initial release

## license
Copyright (c) 2013 Kyle Robinson Young<br/>
Licensed under the MIT license.
