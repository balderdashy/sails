module.exports = {
  autoPK: false,
  schema: true,
  attributes: {
    pet_id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    name: 'string',
    owner: {
      model: 'user'
    },
    bestFriend: {
      model: 'user'
    },
    parents: {
      collection: 'pet',
      via: 'children'
    },
    children: {
      collection: 'pet',
      via: 'parents'
    },
    bestFurryFriend: {
      model: 'pet'
    },
    vets: {
      collection: 'user',
      via: 'patients'
    },
    isPet: {
      type: 'boolean',
      defaultsTo: true
    }
  }
};
