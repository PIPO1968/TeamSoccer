const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ForumPostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
