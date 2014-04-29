/**
 * Draw an ASCII image of a ship
 */
module.exports = function _drawShip(message, log) {
  log = log || console.log;

  // There are 20 characters before the ship's mast on the 2nd line,
  // starting from the 'v' (inclusive)
  var mesageLen = message.length;
  var numSpaces = 19 - mesageLen;
  for (var i = 0; i < numSpaces; i++) {
    message += ' ';
  }

  return function() {
    log('');
    log('');
    log('   ' + 'Sails   ' + '           ' + '<' + '|');
    log('   ' + message + ' |\\');
    log('                      /|.\\');
    log('                     / || \\');
    log('                   ,\'  |\'  \\');
    log('                .-\'.-==|/_--\'');
    log('                `--\'-------\' ');
    log('   __---___--___---___--___---___--___');
    log(' ____---___--___---___--___---___--___-__');
    log('');
  };
};
