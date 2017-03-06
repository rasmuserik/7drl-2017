// # 7 Day Rogue Like  2017
//
// **In progress / under development, not functional yet**
//
// This is an entry for the 7 day rogulike hackathon.
//
// It is made using <https://appedit.solsort.com>, 
// and uses graphics from <https://wesnoth.org>,

var ss = require('solsort');

var cdnHost = "https://cdn.rawgit.com/";
var cdnUrl = cdnHost + "wesnoth/wesnoth/a9d014665673beb2bd4ad2c0d0e3a1f019e920bc/";
var imgUrl = cdnUrl + "data/core/images/";

var map = `
w w w w w w w w w w w w w w w w w w w w w w w w w w w w w w 
 w s w w w w g w w w w w w w w w w w w w w w w w w w w w w w
w s s s sds s g g g g g w w w w w w w w w w w w w w w w w w 
 w s s s s s s g g g w w w w w w w g w w w w w w w w w w w w
w s g g m mdm s g g g w w w w w g g g w w w w w w w w w w w 
 w s gWg mdl m s g g w w w w w g g g g w w w w w w w w w w w
w w gWg g m mdm g g g w w w w g g w w w w w w w w w w w w w 
 w g g g m m ssg g g w w w w w g w w w w w w w w w w w w w w
d d d d g m g g g g w w w w w w w w w w w w w w w w w w w w 
 w g g dWg g g g w w w w w w w w w w w w w w w w w w w w w w
w w g g d g g g w w w w w w w w w w w w w w w w w w w w w w 
 w w g w d w w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w d w w w w w w w w w w w w w w w w w w w w w w w w 
 w w w w w d w w w w w w w w w w w w w w w w w w w w w w w w
w w w w w w d w w w w w w w m w w w w w w w w w w w w w w w 
 w w w w w w d d d d d d d d m m w w w w w w w w w w w w w w
w w w w w w w w w w w w w w w m w w w w w w w w w w w w w w 
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
    img: 'grass/green',
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
    landscapeTiles.push(Object.assign({x:y*2, y:x}, terrain[map[y][x]]));
  }
}

var units = [];
for(var y = 0; y < map.length; ++y) {
  for(var x = (y & 1) + 1; x < map[y].length; x += 2) {
    if(map[y][x] !== ' ') {
      units.push(Object.assign({x:y*2, y:x - 1}, unitObjs[map[y][x]]));
    }
  }
}

function unitToImg(unit) {
  return ['img', {
    src: imgUrl + 'units/' + unit.img + '.png',
    style: {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: unit.y * 36,
      left: unit.x * 27
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
      textAlign: 'center',
      fontSize: 10,
      textShadow: '1px 1px 2px black',
      top: o.y * 36 - 36,
      left: o.x * 27
    }
  }, (o.debug || "").toString()];
}

function terrainToImg(terrain) {
  return ['img', {
    src: imgUrl + 'terrain/' + terrain.img + '.png',
    style: {
      onClick: ss.event('increment', {data: terrain}),
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: terrain.y * 36,
      left: terrain.x * 27
    }
  }];
}

function filterPos(objs, p) {
  return objs.filter(o => {
    var dx = o.x - (p.x & ~1);
    var dy = o.y - (p.y & ~1);
    return dx * dx + dy * dy < 48;
  });
}

ss.handle('click', (a, b) => ss.set('game.event', a));
// Render the ui reactively
setInterval(() => ss.set('game.time', Date.now()), 100);
ss.rerun('updateGame', 
() => ss.set('game.pos', {
  x: ss.get('game.time') / 1000 % 21 + 8,
  y: ss.get('game.time') / 1000 % 30 + 8
}));
            
ss.html(() => 
  ['div',
   {onClick: ss.event('increment')},
   ['div', { style: {
     position: 'relative', 
     display: 'inline-block',
     top: 36 * 8 - 36 * ss.get('game.pos.y'),
     left: 27 * 8 - 27 * ss.get('game.pos.x')
   }} ,
   ['div'].concat(filterPos(landscapeTiles, ss.get('game.pos')).map(terrainToImg)),
   ['div'].concat(filterPos(units, ss.get('game.pos')).map(unitToImg)),
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
   JSON.stringify(ss.get('game')),
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
