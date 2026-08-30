'use strict';

// Single wiring point: repositories -> services -> controllers/middleware.
// Route files pull their controllers/guards from here instead of reaching
// into models/ or instantiating services themselves.
const UserRepository = require('./repositories/UserRepository');
const BlogRepository = require('./repositories/BlogRepository');

const PasswordHasher = require('./services/PasswordHasher');
const TokenService = require('./services/TokenService');
const BlogAuthorizationPolicy = require('./services/BlogAuthorizationPolicy');
const AuthService = require('./services/AuthService');
const UserService = require('./services/UserService');
const BlogService = require('./services/BlogService');
const AdminSeeder = require('./services/AdminSeeder');

const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');
const BlogController = require('./controllers/blogController');

const createAuthMiddleware = require('./middlewares/auth');

const userRepository = new UserRepository();
const blogRepository = new BlogRepository();

const passwordHasher = new PasswordHasher();
const tokenService = new TokenService();
const blogAuthorizationPolicy = new BlogAuthorizationPolicy();

const authService = new AuthService(userRepository, passwordHasher, tokenService);
const userService = new UserService(userRepository, passwordHasher);
const blogService = new BlogService(blogRepository, blogAuthorizationPolicy);
const adminSeeder = new AdminSeeder(userRepository, passwordHasher);

const authController = new AuthController(authService);
const userController = new UserController(userService);
const blogController = new BlogController(blogService);

const { authenticate, authorize } = createAuthMiddleware({ tokenService, userRepository });

module.exports = {
  authController,
  userController,
  blogController,
  authenticate,
  authorize,
  adminSeeder,
};
