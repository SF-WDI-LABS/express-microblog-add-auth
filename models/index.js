var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/microblog-app", {useMongoClient: true, });

module.exports.Post = require("./post");
module.exports.User = require("./user");

