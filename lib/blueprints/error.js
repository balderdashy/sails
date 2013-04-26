var _ = require('underscore');

module.exports = function ( errors, req, res, next ) {

    // Log errors
    for(var i=0; i < errors.length; i++) {
        sails.log.error(errors[i]);
        if(typeof errors[i] === 'object') errors[i] = errors[i].message;
    }

    // If asking for json, ajax, or socket sens in json format
    if(req.isJson || req.isAjax || req.isSocket) {
        return res.json(errors, 500);
    }
    // Otherwise serve up a webpage for 500 if the view exists.
    // If a view doesn't exist we still send json.
    else {
        res.view('500', {
            errors: errors
        }, function (err) {
            if (err) {
                sails.log.error(err);
                if (_.isArray(req.params.errors)) req.params.errors.push(err);
                else req.params.errors = [err];
                return res.json(errors, 500);
            }
            else res.view('500', { errors: errors } );
        });
    }
};
