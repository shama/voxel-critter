var test = require('tape');
var Convert = require('./lib/convert');
var path = require('path');

test('converts image to hash', function(t) {
  t.plan(1);
  var c = new Convert();
  c.readImage(path.resolve('rabbit.png'), function(err, hash) {
    t.equal(hash, 'A/bfhkSfdihfShaefShahfShahhYfYfYfSfSfSfYhYhYhahjSdechjYhYhYhadfQUhchfYhYhSfYdQYhYhaefQYhYhYhYhSjcchQYhYhYhYhSfSfWehSfUhShecheQYhYhYhYhachYhYhafhYhahfShXdfhShcihYaVhfYmfbihhQYhYhYhaddQShahfYhYhYhShYfYfYfafhQUhchfYhYhYhShechdUhUhcheUhUhcheUhUhcheUhUhcheUhUhWehUhUhcfeUhUhcfeUhUhcfeUhUhcfeUhUhehehUhUhcheUhUhcheUhUhcheUhUhWehUhUhcfeUhUhcfeUhUhcfeUhUhcfeUhUhWffUhWheQYhYhYhYhachQYiYhYhShYfYfYfYfShYhYhYhYhadeakiQSfSfSfUfShShShUfSfSfSfUfShShShUfSfSfSfcakQShShWfeQShShWeeQUhWfhUhShUfWjhQUfUfUfWfdQShShShWkhQUfUfUfchjQYhYhYhYhUfYfYfYeYhUfYhYhcifQYfYfYfYeQcffQYhYhYiYiYfcdhckjUfUfZfeYcciefhleiYhYcYhcfhYhcfhYhcifYhcfhYhcfhYhYcYh:C/2ecc713498db34495ee67e22ecf0f1000000');
  });
});

test('convert hash to voxel data', function(t) {
  t.plan(3);
  var c = new Convert();
  c.readImage(path.resolve('rabbit.png'), function(err, hash) {
    var data = c.toVoxels(hash);
    t.deepEqual(data.bounds, [[-3, -1, -1], [3, 12, 3]]);
    t.equal(data.colors.length, 6);
    t.equal(Object.keys(data.voxels).length, 259);
  });
});
