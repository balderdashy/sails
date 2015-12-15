var async = require('async');
module.exports = function(sails, cb) {

  var users = [];
  for (var userId = 1; userId <= 11; userId++) {
      var user = {
          name: 'user_'+userId,
          pets: [],
          profile: {}
      };
      for (var petId = 1; petId <= 11; petId++) {
          user.pets.push({name: 'user_'+userId+'_pet_'+petId});
      }
      user.profile.zodiac = 'user_'+userId+'_zodiac';
      users.push(user);
  }

  async.forEach(users, function create(user, cb) {sails.models.user.create(user).exec(cb);}, cb);

};
