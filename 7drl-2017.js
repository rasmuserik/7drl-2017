// # 7 Day Rogue Like  2017
//
// **In progress / under development, not functional yet**
//
// This is an entry for the [7 day rogue-like](http://7drl.org/) hackathon.
//
// It is made using <https://appedit.solsort.com>, 
// and uses graphics from <https://wesnoth.org>,

// Information about the app, - used for exporting to github, etc.
 
exports.info = {
  name: 'Seven day rogue like',
  github: 'solsort/7drl-2017'
};

var ss = require('solsort');

var cdnHost = "https://cdn.rawgit.com/";
var cdnUrl = cdnHost + "wesnoth/wesnoth/a9d014665673beb2bd4ad2c0d0e3a1f019e920bc/";
var imgUrl = cdnUrl + "data/core/images/";

// ## Initialisation

// Render the ui reactively
//setInterval(() => ss.set('game.time', Date.now()), 100);

// Clock

function clock(name, interval) {
  if(!ss.get(name)) {
    setInterval(() => clock(name), interval);
  }
  ss.set(name, Date.now());
}
var msPerTurn = 800;
clock('time', 1000/10);
clock('game.tick', msPerTurn);

// Shim
if(!Object.values) {
  Object.values = (o) => Object.keys(o).map(k => o[k]);
}
            
// ## Fetch map, and create data structure from it

var rawMap;
if(!rawMap) {
  ss.GET('https://7drl-2017.solsort.com/level0.map').then(handleMap);
} else {
  handleMap(rawMap);
}

function handleMap(m) {
  rawMap = m;
  console.log('here');
  var map = {};
  var rows = m.split('\n');
  var id = 0;
  for(var i = 0; i < rows.length; ++i) {
    for(var j = 1 + (i & 1) * 4; j < rows[i].length; j += 8) {
      var x = j/2 | 0;
      var y = i;
      map[[x,y]] = Object.assign({pos: {x:x, y:y}}, terrain[rows[i][j]]);
      if(rows[i][j+1] !== ' ') {
        let unit = Object.assign({pos: {x:x, y:y}}, 
                                 unitDefault,
                               unitObjs[rows[i][j+1]]);
        unit.unique = !!unit.id;
        unit.id = unit.id || rows[i][j+1] + id++;
        ss.set(['units', unit.id], unit);
      }
    }
  }
  ss.set('map', map);
  console.log(ss.get([]));
  start();
}

// ## Terrain / unit definitions

var terrain = {
  r: {
    img: 'cave/floor',
    passable: true
  },
  m: {
    img: 'grass/green',
    passable: true
  },
  t: {
    img: 'cave/lava',
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
    passable: true
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
    passable: true,
  }
};

function dist2(a,b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx* dx + dy * dy;
}
var unitObjs = {
  p: {
    img: 'human-loyalists/sergeant',
    id: 'player',
    update: function() {
      this.energy = Math.min(100, this.energy + 10);
      this.health = Math.min(100, this.health + 1);
      var n = neighbours(this.next);
      n = n.filter(o => getTile(o).passable);
      //n = n.filter(o => !unitsByPos[posKey(o)]);
      n.push(Object.assign({}, this.next)); 
      n = n.map(p =>  Object.assign(p, {dist:
                        dist2(p, ss.get('game.target'))}));
      n.sort((a,b) => a.dist - b.dist);
      var pos = n[0];
      var enemy = unitsByPos[posKey(pos)];
      if(enemy === this.id) {
        enemy = undefined;
      }
      if(enemy) {
        if(this.energy > 20) {
        var enemyHealth = ss.get(['units', enemy, 'health']);
        ss.set(['units', enemy, 'health'], enemyHealth - 25);
        console.log('player attack', enemy, enemyHealth, 
            ss.get(['units', enemy, 'health']));
        
          this.energy -= 20;
        }
      } else if(this.energy> 15 && pos && dist2(pos, this.next) > 0) {
        this.energy -= 15;
        this.next = pos;
        this.next.t =  Date.now() + msPerTurn;
      }
      /*
      this.next = {
        x: ss.get('game.target.x', this.next.x),
        y: ss.get('game.target.y', this.next.y),
        t: Date.now() + msPerTurn,
      };
      */
    }
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

var unitDefault = {
  health: 100,
  energy: 100,
  damage: 10,
  update: function() {
    this.energy = Math.min(100, this.energy + 10);
    this.health = Math.min(100, this.health + 1);
    var n = neighbours(this.next);
    n = n.filter(o => getTile(o).passable);
    var player = n.filter(o => unitsByPos[posKey(o)] === 'player')[0];
    n = n.filter(o => !unitsByPos[posKey(o)]);
    var pos = n[Math.random() * n.length |0];
    if(player && Math.random() < 0.8 && this.energy > 30) {
        if(this.energy > 30) {
        var enemy = 'player';
        var enemyHealth = ss.get(['units', enemy, 'health']);
        ss.set(['units', enemy, 'health'], enemyHealth - this.damage * Math.random());
          this.energy -= 30;
        }
      console.log('here');
      } else if(this.energy > 50 + Math.random() * 30  && pos && dist2(pos, this.next) > 0) {
        this.energy -= 15;
        this.next = pos;
        this.next.t =  Date.now() + msPerTurn;
      }
  }
};

function posKey(pos) {
  return [pos.x, pos.y].toString();
}
function getTile(pos) {
  return ss.get(['map', [pos.x, pos.y].toString()],{});
}

function neighbours(o) {
  return [
    {x: o.x + 2, y: o.y + 1},
    {x: o.x - 2, y: o.y + 1},
    {x: o.x, y: o.y + 2},
    {x: o.x, y: o.y - 2},
    {x: o.x + 2, y: o.y - 1},
    {x: o.x - 2, y: o.y - 1},
  ];
}
// ## Notes on UI-design
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

// ## Rendering functions

function unitToImg(unit) {
  return ['div', {
    style: {
      display: 'inline-block',
      width: 72,
      height: 72,
      background: 'url(' + imgUrl + 'units/' + unit.img + '.png)',
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: (unit.pos.y - ss.get('units.player.pos.y')) * 36 + 240,
      left: (unit.pos.x - ss.get('units.player.pos.x')) * 27 + 180,
    }
  },
          ['span', {style: {
            position: 'absolute',
            width: 38,
            background: '#000',
            height: 7,
            top: 59,
            left: 17,
          }}],
          ['span', {style: {
            position: 'absolute',
            background: '#0a0',
            width: unit.energy/ 100 * 36,
            height: 2,
            top: 60,
            left: 18,
          }}],
          ['span', {style: {
            position: 'absolute',
            background: '#c00',
            width: unit.health / 100 * 36,
            height: 2,
            top: 63,
            left: 18,
          }}],
         ];
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
      top: (o.pos.y - ss.get('units.player.pos.y')) * 36 + 240,
      left: (o.pos.x - ss.get('units.player.pos.x')) * 27 + 180,
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
      top: (terrain.pos.y - ss.get('units.player.pos.y')) * 36 + 240,
      left: (terrain.pos.x - ss.get('units.player.pos.x')) * 27 + 180,
    }
  }];
}

function filterPos(objs) {
  var p = ss.get('units.player.pos');
  return objs.filter(o => {
    var dx = o.pos.x - p.x | 0;
    var dy = o.pos.y - p.y | 0;
    return dx * dx + dy * dy < 60;
  });
}

// ## Update units

ss.rerun('world-update', () => {
  ss.get('game.tick');
  setTimeout(worldUpdate, 0);
}); 

ss.rerun('frame-update', () => {
  ss.get('time');
  setTimeout(frameUpdate, 0);
}); 


function kv2obj(arr) {
  var result = {};
  for(var i = 0; i < arr.length; ++i) {
    result[arr[i][0]] = arr[i][1];
  }
  return result;
} 
var unitsByPos = {};

var prevTime = 0;
function worldUpdate() {
  var units = Object.values(ss.get('units', {}));
  units = units.filter(o => o);
  unitsByPos =
         kv2obj(
    units.map(u => [posKey(u.next||{}), u.id])
  );
                                                       
  units.forEach(unit => {
    unit = ss.get(['units', unit.id]);
    unit.next = unit.next || unit.pos;
    unit.prev = unit.next;
    unit.prev.t = Date.now();
    unit.update();
    ss.set(['units', unit.id], unit);
    unitsByPos[posKey(unit.next)] = unit.id;
  });
  units.forEach(unit => {
    if(unit.health < 0) {
      ss.set(['units', unit.id]);
    }
  });
}
worldUpdate();

function frameUpdate() {
  var t = Date.now();
  Object.values(ss.get('units',{})).filter(o=>o).forEach(unit => {
    if(unit && unit.next && unit.prev && t < unit.next.t) {
      var dt = (t - unit.prev.t) / (unit.next.t - unit.prev.t);
      unit.pos.x = (1-dt) * unit.prev.x + dt * unit.next.x;
      unit.pos.y = (1-dt) * unit.prev.y + dt * unit.next.y;
      ss.set(['units', unit.id], unit);
    }
  });
}

// ## Main rendering

var background = '#eee';
function start() {
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
   ['div'].concat(filterPos(Object.values(ss.get('map',{}))).map(terrainToImg)),
   ['div'].concat(filterPos(Object.values(ss.get('units', {})).filter(o=>o)).map(unitToImg)),
   ['div'].concat(filterPos(Object.values(ss.get('map',{})))
     //             .map(o => Object.assign({debug: [o.pos.x, o.pos.y]}, o))
                  .map(debugImg)),
   ['img', {src: '//7drl-2017.solsort.com/shadow.png', style: {position: 'absolute'}}],
   ],
   ['div', {style: {
     position: 'absolute', 
     display: 'inline-block', 
     fontWeight: 'bold',
     color: 'white',
     textShadow: '1px 1px 2px black',
   }},
    //['pre', {style: {background: 'rgba(0,0,0,0)'}}, JSON.stringify(ss.get('game'), null, 1)], ['br'],
    //['pre', {style: {background: 'rgba(0,0,0,0)'}}, JSON.stringify(ss.get('units.player'), null, 1)], ['br'],
//   JSON.stringify(ss.get('ui.bounds'), null, 4),
  //['p', 'Count: ', ss.getJS('count', 0)],
  //['button', {onClick: ss.event('increment')}, 'Click']
   ]]);
}

// ## Utility functions

function toCoord(o) {
  o.x = 2 * Math.round(o.x / 2);
  if(o.x % 4 === 0) {
    o.y = 2 * Math.round(o.y / 2);
  } else {
    o.y = 2 * Math.round((o.y - 1) / 2) + 1;
  }
  return o;
}

// ## Handler for button clicks

ss.ready(() => {
 ss.handle('click', o => {
  var x = (o.clientX - ss.get('ui.bounds.left'));
  var y = (o.clientY - ss.get('ui.bounds.top'));
  x = (x - 180)/14;
  y = (y - 240)/18;
  
  ss.set('game.event', o);
  var targetPos = toCoord({
    x: ss.get('units.player.pos.x') + x/2,
    y: ss.get('units.player.pos.y') + y/2
  });
  ss.set('game.target.x', targetPos.x);
  ss.set('game.target.y', targetPos.y);
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
});
ss.handle('increment', () => 
  ss.setJS('count', ss.getJS('count', 0) + 1));

