import React, { useEffect, useState } from 'react';

function ManagerCount() {
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL + '/api/user-stats/active')
            .then(res => res.json())
            .then(data => {
                setCount(data.activeManagers);
                setLoading(false);
            })
            .catch(err => {
                setError('No se pudo obtener el número de managers');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Cargando número de managers...</div>;
    if (error) return <div>{error}</div>;
    return <div>Managers registrados: {count}</div>;
}

export default ManagerCount;
