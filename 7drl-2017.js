// # 7 Day Rogue Like  2017
//
// **In progress / under development, not functional yet**
//
// This is an entry for the 7 day rogulike hackathon.
//
// It is made using <https://appedit.solsort.com>, 
// and uses graphics from <https://wesnoth.org>,

var ss = require('solsort');

// We get the graphic assets directly from <https://githubusercontent.com> CDN.

var cdnHost = "https://raw.githubusercontent.com/";
var cdnUrl = cdnHost + "wesnoth/wesnoth/a9d014665673beb2bd4ad2c0d0e3a1f019e920bc/";
var imgUrl = cdnUrl + "data/core/images/";

var map = `
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w s w w w w g w w w w w w w w w w w w w w w w w w w w w w w
w s s s sds s g g g g g w w w w w w w w w w w w w w w w w w 
 w s s s s s s g g g w w w w w w w w w w w w w w w w w w w w
w s g g m mdm s g g g w w w w w w w w w w w w w w w w w w w 
 w s gWg mdl m s g g w w w w w w w w w w w w w w w w w w w w
w w gWg g m mdm g g g w w w w w w w w w w w w w w w w w w w 
 w g g g m m ssg g g w w w w w w w w w w w w w w w w w w w w
d d d d g m g g g g w w w w w w w w w w w w w w w w w w w w 
 w g g dWg g g g w w w w w w w w w w w w w w w w w w w w w w
w w g g d g g g w w w w w w w w w w w w w w w w w w w w w w 
 w w g w d w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w d w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
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
    landscapeTiles.push(Object.assign({x:y, y:x, debug: [y,x]}, terrain[map[y][x]]));
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
      top: unit.y * 36 - 16 - 42,
      left: unit.x * 54
    }
  }];
}

function debugImg(o) {
  return ['str',  { style: {
      display: 'inline-block',
      width: 72,
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      color: '#0f0',
      fontSize: 10,
      textShadow: '1px 1px 2px black',
      top: o.y * 36 - 36 - 16,
      left: o.x * 54 - 36
    }
  }, (o.debug || "").toString()];
}

function terrainToImg(terrain) {
  return ['img', {
    src: imgUrl + 'terrain/' + terrain.img + '.png',
    style: {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: terrain.y * 36 - 16,
      left: terrain.x * 54
    }
  }];
}
// Render the ui reactively

ss.html(() => 
  ['div',
   ['div', {style: {position: 'relative', display: 'inline-block', background: 'red'}} ,
   ['div'].concat(landscapeTiles.map(terrainToImg)),
   ['div'].concat(units.map(unitToImg)),
   ['div'].concat(units.concat(landscapeTiles).map(debugImg))
   ],
   ['div', {style: {
     position: 'absolute', 
     display: 'inline-block', 
     fontWeight: 'bold',
     color: 'white',
     textShadow: '1px 1px 2px black',
   }} ,
  ['h1', '7DRL'],
   JSON.stringify(units),
  ['p', 'Count: ', ss.getJS('count', 0)],
  ['button', {onClick: ss.event('increment')},
    'Click']]]);

// Handler for button clicks

ss.handle('increment', () => 
  ss.setJS('count', ss.getJS('count', 0) + 1));

// Information about the app, - used for exporting to github, etc.

exports.info = {
  name: 'Seven day rogue like',
  github: 'solsort/7drl-2017'
};
