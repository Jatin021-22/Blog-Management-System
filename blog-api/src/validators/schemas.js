// Joi schemas describe what valid input looks like.
const Joi = require('joi');

const CATEGORIES = ['Technology', 'Programming', 'Education', 'Career', 'Lifestyle', 'General'];

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().max(255).required(),
  password: Joi.string().min(8).max(100).required(),
});

const login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const createPost = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().trim().min(10).required(),
  category: Joi.string().valid(...CATEGORIES).default('General'),
});

const updatePost = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().trim().min(10).required(),
  category: Joi.string().valid(...CATEGORIES).default('General'),
});

const listPosts = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().allow('').max(100).default(''),
  category: Joi.string().valid(...CATEGORIES).allow('').default(''),
});

module.exports = { CATEGORIES, register, login, createPost, updatePost, listPosts };
