// wait for DOM to load before running JS
$(function() {

  // base API route
  var baseUrl = '/api/posts';

  // array to hold post data from API
  var allPosts = [];

  // element to display list of posts
  var $postsList = $('#posts-list');

  // form to create new post
  var $createpost = $('#create-post');

  // compile handlebars template
  var source = $('#posts-template').html();
  var template = Handlebars.compile(source);

  // helper function to render all posts to view
  // note: we empty and re-render the collection each time our post data changes
  var render = function() {
    // empty existing posts from view
    $postsList.empty();

    // pass `allPosts` into the template function
    var postsHtml = template({ posts: allPosts });

    // append html to the view
    $postsList.append(postsHtml);
  };

  // GET all posts on page load
  $.get(baseUrl, function (data) {
    console.log(data);

    // set `allPosts` to post data from API
    allPosts = data.posts;

    // render all posts to view
    render();
  });

  // listen for submit even on form
  $createpost.on('submit', function (event) {
    event.preventDefault();

    // serialze form data
    var newpost = $(this).serialize();

    // POST request to create new post
    $.post(baseUrl, newpost, function (data) {
      console.log(data);

      // add new post to `allPosts`
      allPosts.push(data);

      // render all posts to view
      render();
    });

    // reset the form
    $createpost[0].reset();
    $createpost.find('input').first().focus();
  });

  // add event-handlers to posts for updating/deleting
  $postsList

    // for update: submit event on `.update-post` form
    .on('submit', '.update-post', function (event) {
      event.preventDefault();
      
      // find the post's id (stored in HTML as `data-id`)
      var postId = $(this).closest('.post').attr('data-id');

      // find the post to update by its id
      var postToUpdate = allPosts.filter(function (post) {
        return post._id == postId;
      })[0];

      // serialze form data
      var updatedpost = $(this).serialize();

      // PUT request to update post
      $.ajax({
        type: 'PUT',
        url: baseUrl + '/' + postId,
        data: updatedpost,
        success: function(data) {
          // replace post to update with newly updated version (data)
          allPosts.splice(allPosts.indexOf(postToUpdate), 1, data);

          // render all posts to view
          render();
        }
      });
    })
    
    // for delete: click event on `.delete-post` button
    .on('click', '.delete-post', function (event) {
      event.preventDefault();

      // find the post's id (stored in HTML as `data-id`)
      var postId = $(this).closest('.post').attr('data-id');

      // find the post to delete by its id
      var postToDelete = allPosts.filter(function (post) {
        return post._id == postId;
      })[0];

      // DELETE request to delete post
      $.ajax({
        type: 'DELETE',
        url: baseUrl + '/' + postId,
        success: function(data) {
          // remove deleted post from all posts
          allPosts.splice(allPosts.indexOf(postToDelete), 1);

          // render all posts to view
          render();
        }
      });
    });

});