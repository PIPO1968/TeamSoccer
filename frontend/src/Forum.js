import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function Forum({ token, user }) {
    const { t } = useLanguage();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetch('/api/forum')
            .then(res => res.json())
            .then(setPosts);
    }, [success]);

    const handleCreatePost = async e => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch('/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setTitle(''); setContent(''); setSuccess(t.postCreated || 'Post creado');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleComment = async (postId) => {
        setError(''); setSuccess('');
        try {
            const res = await fetch(`/api/forum/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ content: comment })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setComment(''); setSuccess(t.commentAdded || 'Comentario agregado');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>{t.forum || 'Foro general'}</h2>
            <form onSubmit={handleCreatePost}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t.title || 'Título'} required />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t.content || 'Contenido'} required />
                <button type="submit">{t.createPost || 'Crear tema'}</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <ul>
                {posts.map(post => (
                    <li key={post._id}>
                        <b>{post.title}</b> {t.by || 'por'} {post.author?.username || 'N/A'}<br />
                        {post.content}<br />
                        <button onClick={() => setSelectedPost(post)}>{t.viewComments || 'Ver comentarios'}</button>
                    </li>
                ))}
            </ul>
            {selectedPost && (
                <div style={{ border: '1px solid #ccc', padding: 8, marginTop: 8 }}>
                    <h3>{selectedPost.title}</h3>
                    <div>{selectedPost.content}</div>
                    <b>{t.comments || 'Comentarios'}:</b>
                    <ul>
                        {selectedPost.comments.map(c => (
                            <li key={c._id}>{c.content} - {c.author?.username || 'N/A'}</li>
                        ))}
                    </ul>
                    {user && (
                        <form onSubmit={e => { e.preventDefault(); handleComment(selectedPost._id); }}>
                            <input value={comment} onChange={e => setComment(e.target.value)} placeholder={t.addComment || 'Agregar comentario'} required />
                            <button type="submit">{t.comment || 'Comentar'}</button>
                        </form>
                    )}
                    <button onClick={() => setSelectedPost(null)}>{t.close || 'Cerrar'}</button>
                </div>
            )}
        </div>
    );
}

export default Forum;
