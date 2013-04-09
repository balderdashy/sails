var _ = require('underscore');

module.exports = function ( errors, req, res, next ) {

    // Log errors
    _.each(errors, function (err) {
        sails.log.error(err);
    });
	
    // If asking for json, ajax, or socket sens in json format
    if(req.isJson || req.isAjax || req.isSocket) {
        return jsonError(req,res);
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
                return jsonError(req,res);
            }
            else res.view('500', { errors: errors } );
        });
    }
    
    function jsonError (req,res) {
        return res.json(errors, 500);
    }
};
