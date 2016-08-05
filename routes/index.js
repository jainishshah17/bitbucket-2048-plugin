var https = require('https');
var http = require('http');

module.exports = function (app, addon) {
    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });


    app.get('/game', function(req,res){
        var bitBucketUsername = req.query['bitBucketUsername'];
        var repoUuid = req.query['repoUuid'];
        res.render('game');

    });

};
