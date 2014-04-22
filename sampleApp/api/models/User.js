/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {

    username: {
      type: 'string',
      minLength: 4,
      maxLength: 10,
      required: true,
      unique: true
    }
  }
};
