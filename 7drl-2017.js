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
w w w w w w w w w w w w w w w 
 w s w w w w g w w w w w w w 
w s s s sds s g g g g g w w w 
 w s s s s s s g g g w w w w 
w s g g m mdm s g g g w w w w 
 w s gWg mdl m s g g w w w w 
w w g g g m mdm g g g w w w w 
 w g g g m m ssg g g w w w w 
d d d d g m g g g g w w w w w 
 w g g dWg g g g w w w w w w 
w w g g d g g g w w w w w w w 
 w w g w d w w w w w w w w w 
w w w w w d w w w w w w w w w 
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
  },
  d: {
    img:'flat/dirt',
    passable: false,
  }
};

var unitObjs = {
  d: {
    img: 'dwarves/fighter'
  },
  W: {
    img: 'goblins/direwolver'
  },
  s: {
    img: 'undead-skeletal/deathblade'
  }
};

var landscapeTiles = [];
for(var y = 0; y < map.length; ++y) {
  for(var x = y & 1; x < map[y].length; x += 2) {
    landscapeTiles.push(Object.assign({x:y, y:x}, terrain[map[y][x]]));
  }
}

var units = [];
for(var y = 0; y < map.length; ++y) {
  for(var x = (y & 1) + 1; x < map[y].length; x += 2) {
    if(map[y][x] !== ' ') {
      units.push(Object.assign({x:y, y:x}, unitObjs[map[y][x]]));
    }
  }
}

function unitToImg(unit) {
  return ['img', {
    src: imgUrl + 'units/' + unit.img + '.png',
    style: {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: unit.y * 36 - 45,
      left: unit.x * 54
    }
  }];
}


function terrainToImg(terrain) {
  return ['img', {
    src: imgUrl + 'terrain/' + terrain.img + '.png',
    style: {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: terrain.y * 36,
      left: terrain.x * 54
    }
  }];
}
// Render the ui reactively

ss.html(() => 
  ['div',
   ['div', {style: {position: 'relative', overflow: 'hidden', display: 'inline-block', background: 'red'}} ,
   ['div'].concat(landscapeTiles.map(terrainToImg)),
   ['div'].concat(units.map(unitToImg))
   ],
   JSON.stringify(units),
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
