import React from 'react';

function ClubInfoBlock({ clubData, liga, rankingNacional, rankingMundial }) {
    return (
        <div style={{ background: '#f7faff', borderRadius: 10, boxShadow: '0 1px 8px #0001', padding: 24, marginBottom: 24, maxWidth: 320 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo del club" style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} />
                <input type="file" style={{ marginTop: 8 }} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1a2a44', marginBottom: 8 }}>{clubData?.teamName}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>Estadio: {clubData?.stadiumName}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>País: {clubData?.country}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>Ciudad: {clubData?.city}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>Liga: {liga}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>Ranking nacional: {rankingNacional}</div>
            <div style={{ color: '#1a2a44', marginBottom: 4 }}>Ranking mundial: {rankingMundial}</div>
        </div>
    );
}

export default ClubInfoBlock;
