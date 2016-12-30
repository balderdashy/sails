module.exports = {
  schema: true,
  primaryKey: 'user_id',
  attributes: {
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
      model: 'userprofile',
      via: 'user'
    }
  }

};
