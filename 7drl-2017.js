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

// Render the ui reactively

ss.html(() => 
  ['div',
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
