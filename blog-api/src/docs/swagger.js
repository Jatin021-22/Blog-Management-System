// Swagger / OpenAPI documentation, served at /docs
const swaggerJsdoc = require('swagger-jsdoc');

const postBody = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Introduction to Node.js' },
          content: { type: 'string', example: 'Node.js is a JavaScript runtime built on V8...' },
          category: {
            type: 'string',
            enum: ['Technology', 'Programming', 'Education', 'Career', 'Lifestyle', 'General'],
            example: 'Technology',
          },
        },
      },
    },
  },
};

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 };
const secured = [{ bearerAuth: [] }];

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Blog Management REST API',
    version: '1.0.0',
    description: 'Register, log in, and manage blog posts. Click "Authorize" and paste your JWT to call protected routes.',
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jatin' },
                  email: { type: 'string', example: 'jatin@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' }, 409: { description: 'Email already registered' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'jatin@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the logged-in user',
        security: secured,
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Posts'],
        summary: 'List posts (public) with pagination, search and category filter',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a post',
        security: secured,
        requestBody: postBody,
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/posts/mine': {
      get: {
        tags: ['Posts'],
        summary: "List the logged-in user's posts",
        security: secured,
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get a single post (public)',
        parameters: [idParam],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Posts'],
        summary: 'Update your own post',
        security: secured,
        parameters: [idParam],
        requestBody: postBody,
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' }, 403: { description: 'Not the owner' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Delete your own post',
        security: secured,
        parameters: [idParam],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' }, 403: { description: 'Not the owner' }, 404: { description: 'Not found' } },
      },
    },
  },
};

module.exports = swaggerJsdoc({ definition: spec, apis: [] });
