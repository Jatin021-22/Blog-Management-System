const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const posts = require('../controllers/postController');

const router = express.Router();

router.get('/', validate(schemas.listPosts, 'query'), posts.list);

// IMPORTANT: '/mine' must be defined BEFORE '/:id', otherwise "mine" would be read as an id.
router.get('/mine', auth, posts.mine);

router.get('/:id', posts.getOne);
router.post('/', auth, validate(schemas.createPost), posts.create);
router.put('/:id', auth, validate(schemas.updatePost), posts.update);
router.delete('/:id', auth, posts.remove);

module.exports = router;
