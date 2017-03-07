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

ss.GET('https://7drl-2017.solsort.com/level0.map').then(handleMap);
function handleMap(m) {
  console.log('here');
  var map = [];
  var rows = m.split('\n');
  var id = 0;
  for(var i = 0; i < rows.length; ++i) {
    for(var j = 1 + (i & 1) * 4; j < rows[i].length; j += 8) {
      var x = j/2 | 0;
      var y = i;
      map.push(Object.assign({x:x, y:y}, terrain[rows[i][j]]));
      if(rows[i][j+1] !== ' ') {
        let unit = Object.assign({x:x, y:y}, 
                               unitObjs[rows[i][j+1]]);
        unit.unique = !!unit.id;
        unit.id = unit.id || rows[i][j+1] + id++;
        console.log(rows[i][j+1], unit);
        ss.set(['units', unit.id], unit);
      }
    }
  }
  ss.set('map', map);
  console.log(ss.get([]));
}

var terrain = {
  r: {
    img: 'cave/floor',
    passable: true
  },
  g: {
    img: 'grass/green',
    passable: true
  },
  '.': {
    img: 'swamp/water',
    passable: false
  },
  s: {
    img: 'sand/beach',
    passable: false
  },
  ':': {
    img: 'mountains/basic',
    passable: false
  },
  l: {
    img:'unwalkable/lava',
    passable: false,
  },
  '_': {
    img:'flat/dirt',
    passable: false,
  }
};

var unitObjs = {
  p: {
    img: 'human-loyalists/sergeant',
    id: 'player'
  },
  d: {
    img: 'dwarves/fighter'
  },
  w: {
    img: 'goblins/direwolver'
  },
  s: {
    img: 'undead-skeletal/deathblade'
  }
};

/*

UI-design

---------.--.--------  -+-
      .-'\__/'-.     |  | ,- 120px
   .-'\__/  \__/'-.  | ,|'
,-'\__/  \__/  \__/'-.- |        18px
|__/  \__/  \__/  \__|  |    ____|-|  ___
|  \__/  \__/  \__/  |  |   /`-. \     |
|__/  \__/@ \__/  \__|  |  /    `-\    | 72px
|  \__/  \__/  \__/  |  |  \      /    |
|__/  \__/  \__/  \__|  |   \____/    _|_
|  \__/  \__/  \__/  |  |    |---|
`-./  \__/  \__/  \.-|  |    36px
   `-./  \__/  \.-'  |  |
      `-./  \.-'     |  | 7*72px-2*12px = 480px
---------`--'--------+ -+-

|--------------------|
  7*36+6*18 = 360
*/

function unitToImg(unit) {
  return ['img', {
    src: imgUrl + 'units/' + unit.img + '.png',
    style: {
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: (unit.y - ss.get('game.pos.y')) * 36 + 240,
      left: (unit.x - ss.get('game.pos.x')) * 27 + 180,
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
      top: (o.y - ss.get('game.pos.y')) * 36 + 240,
      left: (o.x - ss.get('game.pos.x')) * 27 + 180,
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
      top: (terrain.y - ss.get('game.pos.y')) * 36 + 240,
      left: (terrain.x - ss.get('game.pos.x')) * 27 + 180,
    }
  }];
}

function filterPos(objs) {
  var p = ss.get('game.pos');
  return objs.filter(o => {
    var dx = o.x - p.x | 0;
    var dy = o.y - p.y | 0;
    return dx * dx + dy * dy < 60;
  });
}

// Render the ui reactively
//setInterval(() => ss.set('game.time', Date.now()), 100);
ss.rerun('updateGame', 
() => ss.set('game.pos', {
  x: 12,
  y: 8,
}));

if(!Object.values) {
  Object.values = (o) => Object.keys(o).map(k => o[k]);
}
            
var background = '#eee';
ss.html(() => 
  ['div',
   {
     onClick: ss.event('click', {extract: ['clientX', 'clientY']}),
     //onMouseDown: ss.event('click', {extract: ['clientX', 'clientY']}),
     //onTouchStart: ss.event('click', {extract: ['touches.0']}),
   style: {position:'absolute', background: background, width: '100%', height: '100%'}},
   ['div', { style: {
     display: 'inline-block', 
     width: 360,
     height: 480,
     position: 'absolute',
     top: 0,
     left: 0,
     overflow: 'hidden',
   }} ,
   ['div'].concat(filterPos(ss.get('map',[])).map(terrainToImg)),
   ['div'].concat(filterPos(Object.values(ss.get('units', {}))).map(unitToImg)),
   ['div'].concat(filterPos(ss.get('map',[]))
               //   .map(o => Object.assign({debug: [o.x, o.y]}, o))
                  .map(debugImg)),
   ['img', {src: '//7drl-2017.solsort.com/shadow.png', style: {position: 'absolute'}}],
    ['svg', {width: 360, height: 480, style: {position: 'absolute'}},
     ['polyline', {points:'0,0 180,0 0,120',
         fill: background}],
     ['polyline', {points:'360,0 180,0 360,120',
         fill: background}],
     ['polyline', {points:'0,480 180,480 0,360',
         fill: background}],
     ['polyline', {points:'360,480 180,480 360,360',
         fill: background}],
    ],
   ],
   ['div', {style: {
     position: 'absolute', 
     display: 'inline-block', 
     fontWeight: 'bold',
     color: 'white',
     textShadow: '1px 1px 2px black',
   }},
    //['pre', {style: {background: 'rgba(0,0,0,0)'}}, JSON.stringify(ss.get('game'), null, 1)], ['br'],
//   JSON.stringify(ss.get('ui.bounds'), null, 4),
  //['p', 'Count: ', ss.getJS('count', 0)],
  //['button', {onClick: ss.event('increment')}, 'Click']
   ]]);

function toCoord(o) {
  o.x = 2 * Math.round(o.x / 2);
  if(o.x % 4 === 0) {
    o.y = 2 * Math.round(o.y / 2);
  } else {
    o.y = 2 * Math.round((o.y - 1) / 2) + 1;
  }
  return o;
}

// Handler for button clicks

ss.handle('click', o => {
  var x = (o.clientX - ss.get('ui.bounds.left'));
  var y = (o.clientY - ss.get('ui.bounds.top'));
  x = (x - 180)/14;
  y = (y - 240)/18;
  console.log('click', x, y);
  
  ss.set('game.event', o);
  var targetPos = toCoord({
    x: ss.get('game.pos.x') + x/2,
    y: ss.get('game.pos.y') + y/2
  });
  ss.set('game.target', targetPos);
  ss.set('units.player.x', targetPos.x);
  ss.set('units.player.y', targetPos.y);
  ss.set('game.pos', targetPos);
  /*
  ss.set('game.pos', //toCoord(
         {
    x: ss.get('game.pos.x') + x/2,
    y: ss.get('game.pos.y') + y/2
  }
 //   )
  );
  */
});
ss.handle('increment', () => 
  ss.setJS('count', ss.getJS('count', 0) + 1));

// Information about the app, - used for exporting to github, etc.

exports.info = {
  name: 'Seven day rogue like',
  github: 'solsort/7drl-2017'
};
