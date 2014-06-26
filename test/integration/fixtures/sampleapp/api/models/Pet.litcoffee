Here is a model to represent a pet. It is also acting as a test to demonstrate
that Sails happily copes with literate coffeescript files.

    module.exports =
      autoPK: false
      schema: true
      attributes:
        pet_id:
          type: 'integer'
          primaryKey: true
          autoIncrement: true
        name: 'string'
        owner:
          model: 'user'
        bestFriend:
          model: 'user'
        parents:
          collection: 'pet'
          via: 'children'
        children:
          collection: 'pet'
          via: 'parents'
        bestFurryFriend:
          model: 'pet'
        vets:
          collection: 'user'
          via: 'patients'

It is useful to know whether a pet is a pet, hence:

        isPet:
          type: 'boolean'
          defaultsTo: true
