// require express and other modules
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),

  //  NEW ADDITIONS
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

// require Post model
var db = require("./models"),
  Post = db.Post,
  User = db.User;
// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true, }));

// serve static files from public folder
app.use(express.static(__dirname + "/public"));

// set view engine to ejs
app.set("view engine", "ejs");

app.use(methodOverride("_method"));

app.use(cookieParser());
app.use(session({
  secret: "thisisasecret", // change this!
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// HOMEPAGE ROUTE

app.get("/", function (req, res) {
  Post.find(function (err, allPosts) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.render("index", { posts: allPosts, user: req.user, });
    }
  });
});

// AUTH ROUTES
app.get("/signup", function (req, res) {
  res.render("signup");
});

// sign up new user, then log them in
// hashes and salts password, saves new user to db
app.post("/signup", function (req, res) {
  User.register(new User({ username: req.body.username, }), req.body.password,
      function () {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/");
        });
      }
  );
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  console.log(req.user);
  // res.send("logged in!!!"); // sanity check
  res.redirect("/"); // preferred!
});

app.get("/logout", function (req, res) {
  console.log("BEFORE logout", JSON.stringify(req.user));
  req.logout();
  console.log("AFTER logout", JSON.stringify(req.user));
  res.redirect("/");
});

// SHOW PAGE ROUTE

app.get("/posts/:id", function(req, res) {
  Post.findById(req.params.id, function (err, foundPost) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.render("posts/show", { post: foundPost, });
    }
  });
});

app.post("/posts", function(req, res) {
  var newPost = new Post(req.body);

  // save new post in db
  newPost.save(function (err) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.redirect("/");
    }
  });
});

// update post
app.put("/posts/:id", function (req, res) {
  // get post id from url params (`req.params`)
  var postId = req.params.id;

  // find post in db by id
  Post.findOne({ _id: postId, }, function (err, foundPost) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      // update the posts's attributes
      foundPost.title = req.body.title || foundPost.title;
      foundPost.description = req.body.description || foundPost.description;

      // save updated post in db
      foundPost.save(function (err, savedPost) {
        if (err) {
          res.status(500).json({ error: err.message, });
        } else {
          res.redirect("/posts/" + savedPost._id);
        }
      });
    }
  });
});


// delete post
app.delete("/posts/:id", function (req, res) {
  // get post id from url params (`req.params`)
  var postId = req.params.id;

  // find post in db by id and remove
  Post.findOneAndRemove({ _id: postId, }, function () {
    res.redirect("/");
  });
});


// API ROUTES

// get all posts
app.get("/api/posts", function (req, res) {
  // find all posts in db
  Post.find(function (err, allPosts) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.json({ posts: allPosts, });
    }
  });
});

// create new post
app.post("/api/posts", function (req, res) {
  // create new post with form data (`req.body`)
  var newPost = new Post(req.body);

  // save new post in db
  newPost.save(function (err, savedPost) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.json(savedPost);
    }
  });
});

// get one post
app.get("/api/posts/:id", function (req, res) {
  // get post id from url params (`req.params`)
  var postId = req.params.id;

  // find post in db by id
  Post.findOne({ _id: postId, }, function (err, foundPost) {
    if (err) {
      if (err.name === "CastError") {
        res.status(404).json({ error: "Nothing found by this ID.", });
      } else {
        res.status(500).json({ error: err.message, });
      }
    } else {
      res.json(foundPost);
    }
  });
});

// update post
app.put("/api/posts/:id", function (req, res) {
  // get post id from url params (`req.params`)
  var postId = req.params.id;

  // find post in db by id
  Post.findOne({ _id: postId, }, function (err, foundPost) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      // update the posts's attributes
      foundPost.title = req.body.title;
      foundPost.description = req.body.description;

      // save updated post in db
      foundPost.save(function (err, savedPost) {
        if (err) {
          res.status(500).json({ error: err.message, });
        } else {
          res.json(savedPost);
        }
      });
    }
  });
});

// delete post
app.delete("/api/posts/:id", function (req, res) {
  // get post id from url params (`req.params`)
  var postId = req.params.id;

  // find post in db by id and remove
  Post.findOneAndRemove({ _id: postId, }, function (err, deletedPost) {
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.json(deletedPost);
    }
  });
});


// listen on port 3000
app.listen(3000, function() {
  console.log("server started");
});
