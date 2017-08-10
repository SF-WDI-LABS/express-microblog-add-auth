# <img src="https://cloud.githubusercontent.com/assets/7833470/10899314/63829980-8188-11e5-8cdd-4ded5bcb6e36.png" height="60"> Adding Auth to an Express Microblog

**Objective:** Add auth to a simple blogging platform using passport.js

## MicroBlog Overview

This application has the following REST endpoints:
  * `GET /api/posts` to READ all blog posts
  * `POST /api/posts` to CREATE a new blog post
  * `GET /api/posts/:id` to READ one blog post
  * `PUT /api/posts/:id` to UPDATE one blog post
  * `DELETE /api/posts/:id` to DELETE one blog post
* Full CRUD for blog posts
* A persistent database that store blog posts with a `title` and `description`.
* Client-side templating using Handlebars (and AJAX)
* Bootstrap

## Initial Setup

1. Fork this repo, and clone it into your `develop` folder on your local machine.
2. Next, run `npm install` to download the dependencies listed in `package.json`
3. You are encouraged to use Postman to test and debug your API routes. Make sure you are always `console.log`-ing data that comes back from your API when you make an AJAX call before you write any other code.

## Micro-blog Tutorial: Setting Up Users & Auth

Adapted from <a href="http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VkVw8t-rSRs" target="_blank">User Authentication With Passport and Express 4</a>.

### Install additional dependencies
 
1. Install the new libraries `cookie-parser`, `express-session`, `passport`, `passport-local`, and `passport-local-mongoose`.

  ```bash
  ➜  npm install --save cookie-parser express-session passport passport-local passport-local-mongoose
  ```

  * **<a href="https://github.com/expressjs/cookie-parser" target="_blank">cookie-parser</a>:** parses cookies from the browser
  * **<a href="https://github.com/expressjs/session" target="_blank">express-session</a>:** stores logged-in user info in the session
  * **<a href="http://passportjs.org/docs" target="_blank">passport</a>:** authentication middleware for Node/Express
  * **<a href="https://github.com/jaredhanson/passport-local" target="_blank">passport-local</a>:** passport strategy for authenticating with username and password
  * **<a href="https://github.com/saintedlama/passport-local-mongoose" target="_blank">passport-local-mongoose</a>:** mongoose plugin that simplifies building username and password auth with passport

3. Require the newly installed dependencies in `server.js`.

  ```js
  /*
   * server.js
   */

  // require express and other modules
  var express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),

      //  NEW ADDITIONS
      cookieParser = require('cookie-parser'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;
  ```

4. Also in `server.js`, tell Express to use the auth middleware you just installed.

  ```js
  /*
   * server.js
   */

  ...

  // middleware for auth
  app.use(cookieParser());
  app.use(session({
    secret: 'supersecretkey', // change this!
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  ```

5. Right under your auth middleware in `server.js`, configure passport. This allows users to sign up, log in, and log out of your application.

  ```js
  /*
   * server.js
   */

  ...

  // passport config
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  ```

  At this point, if you check your terminal, you'll see that your server crashed. This is because in your passport configuration, you're using a `User` model (`User.authenticate()`, etc.), which you haven't defined yet. Let's go ahead and do that now!

### User Model

1. Create a new file in `models` called `user.js`.

  ```bash
  ➜  touch models/user.js
  ```

2. Open up `user.js`, and require `mongoose` and `passport-local-mongoose` at the top.

  ```js
  /*
   * models/user.js
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');
  ```

3. Also in `user.js`, define the `UserSchema`. Users should have the attributes `email` and `password`.

  ```js
  /*
   * models/user.js
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');

  var UserSchema = new Schema({
    username: String,
    password: String
  });
  ```

4. Next, add `passportLocalMongoose` to the `UserSchema`. `passportLocalMongoose` takes care of hashing and salting the user's plain-text password when they sign up. It also takes of comparing the password the user enters at login to their hashed and salted password stored in the database.

  ```js
  /*
   * models/user.js
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');

  var UserSchema = new Schema({
    username: String,
    password: String
  });

  UserSchema.plugin(passportLocalMongoose);
  ```

5. The last step is to create the `User` model and export it.

  ```js
  /*
   * models/user.js
   */

  var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      passportLocalMongoose = require('passport-local-mongoose');

  var UserSchema = new Schema({
    username: String,
    password: String
  });
  
  UserSchema.plugin(passportLocalMongoose);

  var User = mongoose.model('User', UserSchema);
  module.exports = User;
  ```

Make sure to also update `/models/index.js` to import/export your `User` model:

  ``` js
  /*
   * models/user.js
   */

   ...
   module.exports.User = require("./user");
  ```

6. Back in `server.js`, require the `User` model (you can do this right under where you required the `Post` model). Ensure that any references to `User` in `server.js` come after variable declaration for `User`!

  ```js
  /*
   * server.js
   */

  ...

  // require Post and User models
  var db = require("./models"),
      Post = db.Post,
      User = db.User;
  ```

### Sign Up Routes

1. Create a new view with a form for users to sign up.

  ```bash
  ➜  touch views/signup.hbs
  ```

  Your signup form should look something like this:

  ```html
  <!-- signup.html -->

  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <!-- set viewport to device width to make site responsive -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- bootstrap css -->
    <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <!-- custom styles -->
    <link rel="stylesheet" type="text/css" href="/styles/style.css">
    <!-- jquery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <!-- bootstrap js -->
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <title>Express Microblog App</title>
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h2>Sign Up</h2>
          <br>
          <form method="POST" action="/signup">
            <div class="form-group">
              <input type="text" name="username" class="form-control" placeholder="Username" autofocus>
            </div>
            <div class="form-group">
              <input type="password" name="password" class="form-control" placeholder="Password">
            </div>
            <div class="form-group">
              <input type="submit" class="btn btn-block btn-primary" value="Sign Up">
            </div>
          </form>
        </div>
      </div>
    </div>
  </body>
</html>

  ```

  Take note of the `method` and `action` in the form. This combination of the request type `POST` and the URL `/signup` will correspond to a server route for signing up new users.

3. In `server.js`, you need two new routes for signing up new users: a route to render the `signup` view, and a route to handle the `signup` request when the user submits the form. Let's create the route to render the view first:

  ```js
  /*
   * server.js
   */

  ...

  // AUTH ROUTES

  // show signup view
  app.get('/signup', function (req, res) {
   res.sendFile('/views/signup.html', { root: __dirname });
  });
  ```

4. Now, let's create the route that handles signing up new users. Again, the code in this route will run when the user submits the signup form (since you already set `method` and `action` in the form to match this route).

  ```js
  /*
   * server.js
   */

  ...

  // AUTH ROUTES

  ...

  // sign up new user, then log them in
  // hashes and salts password, saves new user to db
  app.post('/signup', function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password,
      function (err, newUser) {
        passport.authenticate('local')(req, res, function() {
          res.send('signed up!!!');
        });
      }
    );
  });
  ```

5. Go to `http://localhost:3000/signup` in your browser. You should see the signup form. Fill out the form and hit submit. If it's working, you should see the "signed up!!!" message in your browser. If not, use the error messages you're getting to guide your debugging.

6. Best practice is to redirect your user when they have successfully signed up. Change `res.send` to `res.redirect('/')` (or wherever you want to send them).

### Log In Routes

1. Create a new view with a form for users to login.

  ```bash
  ➜  touch views/login.hbs
  ```

  Your login form should look something like this:

  ```html
  <!-- login.html -->

  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <!-- set viewport to device width to make site responsive -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- bootstrap css -->
    <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <!-- custom styles -->
    <link rel="stylesheet" type="text/css" href="/styles/style.css">
    <!-- jquery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <!-- bootstrap js -->
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

    <title>Express Microblog App</title>
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h2>Log In</h2>
          <br>
          <form method="POST" action="/login">
            <div class="form-group">
              <input type="text" name="username" class="form-control" placeholder="Username" autofocus>
            </div>
            <div class="form-group">
              <input type="password" name="password" class="form-control" placeholder="Password">
            </div>
            <div class="form-group">
              <input type="submit" class="btn btn-block btn-primary" value="Log In">
            </div>
          </form>
        </div>
      </div>
    </div>
  </body>
</html>

  ```

  Take note of the `method` and `action` in the form. This combination of the request type `POST` and the URL `/login` will correspond to a server route for logging in existing users.

  > We are not using AJAX to sumbit our forms! We are just using a vanilla HTML form.

3. In `server.js`, you need two new routes for logging in existing users: a route to render the `login` view, and a route to handle the `login` request when the user submits the form. Let's create the route to render the view first:

  ```js
  /*
   * server.js
   */

  ...

  // AUTH ROUTES

  ...

  // show login view
  app.get('/login', function (req, res) {
   res.sendFile('/views/login.html', { root: __dirname });
  });
  ```

4. Now, let's create the route that handles logging in existing users. Again, the code in this route will run when the user submits the login form (since you already set `method` and `action` in the form to match this route).

  ```js
  /*
   * server.js
   */

  ...

  // AUTH ROUTES

  ...

  // log in user
  app.post('/login', passport.authenticate('local'), function (req, res) {
    console.log(req.user);
    res.send('logged in!!!'); // sanity check
    // res.redirect('/'); // preferred!
  });
  ```

5. Go to `http://localhost:3000/login` in your browser. You should see the login form. Fill out the form with the username and password of the user you just created, then hit submit. If it's working, you should see the "logged in!!!" message in your browser. If not, use the error messages you're getting to guide your debugging.

6. Best practice is to redirect your user when they have successfully logged in. Change `res.send` to `res.redirect('/')` (or wherever you want to send them).

### Log Out Route

1. You should also have a route for a user to log out. Set this up in `server.js` as well. You'll want to redirect the user to the homepage (`/`) after successfully logging out.

  ```js
  /*
   * server.js
   */

  ...

  // AUTH ROUTES

  ...

  // log out user
  app.get('/logout', function (req, res) {
    console.log("BEFORE logout", JSON.stringify(req.user));
    req.logout();
    console.log("AFTER logout", JSON.stringify(req.user));
    res.redirect('/');
  });
  ```

### Embedding the User Object in the page

This is an odd step, but a useful strategy for attaching your user to the page without requiring an additional request/response for user data.

1. Open `views/index.hbs` and add the following script:

  ```html
  <script type="text/javascript">
    window.user = {{{ user }}};
  </script>
  ```

2. We also need to update `server.js` to pass in the `user` object:

  ```js
  /*
   * server.js
   */

   ...
   app.get('/', function (req, res) {
        res.render('index', {user: JSON.stringify(req.user) + " || null"});
   });
  ```

  This works just like you would expect a front-end handlebars template to work, except that now we're doing this work on the backend!

3. Visit your homepage, and see if the user object is globally accessible:

    ```js
    window.user // {_id: "13245t", username: "example"}
    // or just
    user //  {_id: "13245t", username: "example"}
    ```

    Congrats! If a user is currently logged in, you now have an easy way of retrieving their data from the page!

### Authorization: Protecting Routes

When a logged-in user visits our site, they send a cookie to server which stores their session id. Passport.js looks up the session and attaches the user to the request (`req.user`). We can access this user object at any time, and use it to "authorize" or protect our routes.

Of the following `/posts` CRUD routes, which do we need to protect?
*  `GET /posts`
*  `GET /posts/:id`
*  `POST /posts`
*  `PUT /posts/:id`
*  `DELETE /posts/:id`

Can you use the `req.user` object to protect sensitive endpoints?

For example:

``` js
if (req.user) {
    res.send(...)
} else {
    res.status(401).send({error: "Not Authorized! Please login first."})
}
```

Or using the "return early and often" pattern:

``` js
if (!req.user) {
   return res.sendStatus(401);
}
```

These approaches may eventually start to get repetitive and cumbersome, at which point you should consider refactoring to use express middleware. For example, you could create a blanket check that no un-logged-in user should ever be able to `DELETE`. To get this to work you will need to research [`app.use` and create your own custom middleware](http://expressjs.com/en/4x/api.html#app.use).

#### Solution
See the `solution` branch.
