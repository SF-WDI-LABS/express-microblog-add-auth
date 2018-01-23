# <img src="https://cloud.githubusercontent.com/assets/7833470/10899314/63829980-8188-11e5-8cdd-4ded5bcb6e36.png" height="60"> Adding Auth to an Express Microblog

## Sprint 2: Adding Associations

Now that we have users on our blog, we should start ensuring that we show & allow correct behavior from the app. Each blog post should now belong to a user, and only logged-in users should be able to create posts.

### Auth I: Only Logged-In Users Create Posts

1. Make sure the new post form on the index page is only shown to logged-in users.

2. Make sure that the `app.post("/posts")` route redirects, and doesn't save to the database, unless there is a logged-in user.

### Association: Posts Have Owners

1. Update the `Post` schema to include a reference to a `User`. If you're stuck, [StackOverflow](https://stackoverflow.com/questions/34894293/nodejs-mongoose-how-to-get-related-data-using-mongoose) might be able to help.

2. When a new post is created (in `app.post("/posts")`), set the post's `user` to be the currently logged-in user.

3. Update the post show page to include the username of the person who wrote the post. (Do that for the index page, too, if you'd like.)

> Note that you'll need to be careful in how you show the post's user's name in the view: any posts already in your database won't have a user, so `post.user.username` will throw an error. Write your view code in such a way that it doesn't break when the post doesn't have an owner.

### Auth II: Only Owners Modify Posts

1. Update the `app.put("/posts/:id")` and `app.delete("/posts/:id")` routes to ensure that only the user who wrote the posts can perform those actions.

2. Update the index and show pages to only show the edit/delete buttons to the user who owns that post. (Ideally, this means that from the index page, a user can edit their own posts and also read everyone else's posts.)

### Refactor: This View Code Is Gross

1. Move the head of the HTML into a partial. Call that partial in each of `index/show/login/signup.ejs`. Make sure it's displaying well on each page.

2. Move the HTML for displaying a single post into a partial. Call that partial in `index` and `show`. Make sure it looks good in both places.
  > Challenge: can you show a link to the show page from the index, but not from the show page, by passing an extra parameter to the partial?

3. Move the HTML for displaying login or signup inputs into a partial. Call that partial from both `signup.ejs` and `login.ejs`. Test all the functionality.
