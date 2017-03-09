module.exports = {
  primaryKey: 'user_id',
  attributes: {
    id: false,
    user_id: {
      type: 'integer',
      autoIncrement: true
    },
    name: 'string',
    pets: {
      collection: 'pet',
      via: 'owner'
    },
    patients: {
      collection: 'pet',
      via: 'vets'
    },
    profile: {
      model: 'userprofile'
    }
  }

};
