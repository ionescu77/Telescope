var RSS = Npm.require('rss');

var getMeta = function(url) {
  var siteUrl = getSetting('siteUrl', Meteor.absoluteUrl());
  return {
    title: getSetting('title'),
    description: getSetting('tagline'),
    feed_url: siteUrl+url,
    site_url: siteUrl,
    image_url: siteUrl+'img/favicon.png',
  };
};

servePostRSS = function(view, url) {
  var feed = new RSS(getMeta(url));

  var params = getPostsParameters({view: view, limit: 20});
  delete params['options']['sort']['sticky'];

  Posts.find(params.find, params.options).forEach(function(post) {
    var description = !!post.tagline ? post.tagline+'</br></br>' : '';
    feed.item({
     title: post.title,
     description: description+'<a href="'+getPostUrl(post._id)+'">Discuss</a>',
     author: post.author,
     date: post.postedAt,
     url: getPostLink(post),
     guid: post._id
    });
  });

  return feed.xml();
};

serveCommentRSS = function() {
  var feed = new RSS(getMeta(Router.routes['rss_comments'].path()));

  Comments.find({isDeleted: {$ne: true}}, {sort: {postedAt: -1}, limit: 20}).forEach(function(comment) {
    post = Posts.findOne(comment.postId);
    feed.item({
     title: 'Comment on '+post.title,
     description: comment.body+'</br></br>'+'<a href="'+getPostCommentUrl(post._id, comment._id)+'">Discuss</a>',
     author: comment.author,
     date: comment.postedAt,
     url: getCommentUrl(comment._id),
     guid: comment._id
    });
  });

  return feed.xml();
};
