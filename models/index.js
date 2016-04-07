var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microblog-app');

module.exports.Post = require("./post");
module.exports.User = require("./user");
