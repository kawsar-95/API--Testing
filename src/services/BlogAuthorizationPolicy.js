'use strict';

// A normal user may only modify their own blog; an admin may modify any.
class BlogAuthorizationPolicy {
  canModify(user, blog) {
    return user.role === 'admin' || blog.userId === user.id;
  }
}

module.exports = BlogAuthorizationPolicy;
