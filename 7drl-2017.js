// # AppEdit Hello World
//
// Modules/libraries are loaded with `require(...)`.
//
// Documentation/source for the solsort library can be read on:
// <https://appedit.solsort.com/?page=read&github=solsort/solsort>

var ss = require('solsort');

var cdnHost = "https://raw.githubusercontent.com/";
var cdnUrl = cdnHost + "wesnoth/wesnoth/a9d014665673beb2bd4ad2c0d0e3a1f019e920bc/";
var imgUrl = cdnUrl + "data/core/images/";
var unitUrl = imgUrl + "units/";

var map = `
w s w w w w w w w w w w w w w 
 w s s w w w w w w w w w w w 
w w s w w w w w w w w w w w w 
 w w w w w w w w w w w w w w 
w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w 
w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w 
`.split('\n').slice(1,-1);

var terrain = {
  g: {
    img: 'grass/dry',
    passable: true
  },
  w: {
    img: 'swamp/water',
    passable: false
  },
  s: {
    img: 'sand/beach',
    passable: false
  },
  m: {
    img: 'mountains/basic',
    passable: false
  },
  l: {
    img:'unwalkable/lava',
    passable: false,
  }
};

var landscapeTiles = [];
for(var y = 0; y < map.length; ++y) {
  for(var x = y & 1; x < map[y].length; x += 2) {
    landscapeTiles.push(Object.assign({x:x, y:y}, terrain[map[y][x]]));
  }
}

function terrainToImg(terrain) {
  return ['img', {
    src: imgUrl + 'terrain/' + terrain.img + '.png',
    style: {
      position: 'absolute',
      top: terrain.y * 36,
      left: terrain.x * 54
    }
  }];
}
// Render the ui reactively

ss.html(() => 
  ['div',
   JSON.stringify(landscapeTiles),
   ['div'].concat(landscapeTiles.map(terrainToImg)),
    ["img", {src: unitUrl + "dwarves/fighter.png"}],
  ['h1', 'Hello world'],
  ['p', 'Count: ', ss.getJS('count', 0)],
  ['button', {onClick: ss.event('increment')},
    'Increment']]);

// Handler for button clicks

ss.handle('increment', () => 
  ss.setJS('count', ss.getJS('count', 0) + 1));

// Information about the app, - used for exporting to github, etc.

exports.info = {
  name: 'Hello World',
  github: 'solsort/7drl-2017'
};
