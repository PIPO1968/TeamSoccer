import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

function Login({ onLogin }) {
    const { t } = useLanguage();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t.login || 'Iniciar Sesión'}</h2>
            <input name="email" type="email" placeholder={t.email || 'Email'} value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder={t.password || 'Contraseña'} value={form.password} onChange={handleChange} required />
            <button type="submit">{t.loginBtn || t.login || 'Entrar'}</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
}

export default Login;
