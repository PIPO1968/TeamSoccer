const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');

// Obtener todos los posts del foro
router.get('/', async (req, res) => {
    try {
        const posts = await ForumPost.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los posts del foro' });
    }
});

// Crear un nuevo post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = new ForumPost({
            author: req.user.id,
            title,
            content
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear el post' });
    }
});

// Comentar en un post
router.post('/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await ForumPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post no encontrado' });
        post.comments.push({ author: req.user.id, content });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: 'Error al agregar el comentario' });
    }
});

module.exports = router;

// Middleware para verificar si es autor o admin
async function isAuthorOrAdmin(req, res, next) {
    const post = await ForumPost.findById(req.params.postId).populate('author');
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    const user = await User.findById(req.user.id);
    if (post.author._id.equals(req.user.id) || user.isAdmin) {
        req.forumPost = post;
        return next();
    }
    return res.status(403).json({ error: 'No autorizado' });
}

// Editar un post
router.put('/:postId', authenticateToken, isAuthorOrAdmin, async (req, res) => {
    const { title, content } = req.body;
    if (title) req.forumPost.title = title;
    if (content) req.forumPost.content = content;
    await req.forumPost.save();
    res.json(req.forumPost);
});

// Eliminar un post
router.delete('/:postId', authenticateToken, isAuthorOrAdmin, async (req, res) => {
    await req.forumPost.deleteOne();
    res.json({ success: true });
});

// Editar un comentario
router.put('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    const post = await ForumPost.findById(req.params.postId).populate('author');
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    const user = await User.findById(req.user.id);
    if (comment.author.equals(req.user.id) || user.isAdmin) {
        if (req.body.content) comment.content = req.body.content;
        await post.save();
        return res.json(post);
    }
    return res.status(403).json({ error: 'No autorizado' });
});

// Eliminar un comentario
router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    const post = await ForumPost.findById(req.params.postId).populate('author');
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    const user = await User.findById(req.user.id);
    if (comment.author.equals(req.user.id) || user.isAdmin) {
        comment.remove();
        await post.save();
        return res.json(post);
    }
    return res.status(403).json({ error: 'No autorizado' });
});
