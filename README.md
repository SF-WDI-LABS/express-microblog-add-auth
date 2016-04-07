# <img src="https://cloud.githubusercontent.com/assets/7833470/10899314/63829980-8188-11e5-8cdd-4ded5bcb6e36.png" height="60"> Express Microblog - Weekend Lab

**Objective:** Use Node, Express, and MongoDB to build a full-stack microblog application.

## Minimum Requirements

* A server with RESTful API routes for blog posts. Your API should have the following five routes:
  * `GET /api/posts` to READ all blog posts
  * `POST /api/posts` to CREATE a new blog post
  * `GET /api/posts/:id` to READ one blog post
  * `PUT /api/posts/:id` to UPDATE one blog post
  * `DELETE /api/posts/:id` to DELETE one blog post
* Request specs for each of your API routes.
* A persistent database to store blog posts. Blog posts should at minimum have a `title` and `description`.
* A client that uses AJAX and Handlebars templating to `CREATE`, `READ`, `UPDATE`, and `DELETE` blog posts. **A user should be able to:**
  * See a list of all blog posts
  * Create a new blog post
  * Update an existing blog post
  * Delete an existing blog post
* A pleasing a logical user experience (take advantage of Bootstrap!)

## Bonus

* Prevent invalid data from being saved into the database, and handle errors in your API routes.
* Build a "likes" functionality that lets users "upvote" blog posts.
* Add a "category" attribute to your blog posts. When a user clicks on a category, take them to a page that displays all the blog posts that have that category.

## Getting Started

1. Fork this repo, and clone it into your `develop` folder on your local machine.
2. `npm init` to get started. You'll need to install the following node modules:
  * `express`
  * `body-parser`
  * `hbs`
  * `mongoose`
  * `mocha`
  * `chai`
  * `request`
3. Use Postman to test and debug your API routes. Make sure you are always `console.log`-ing data that comes back from your API when you make an AJAX call before you write any other code.

## Submission

* As you make code changes, frequently commit and push to GitHub.
* Once you've finished the assignment and pushed your work to GitHub, make a pull request from your fork to the original repo.
