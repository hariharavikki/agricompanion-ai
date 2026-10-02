import React, { useState } from 'react';

// Hardcoded sample data to guarantee initial visual rendering
const SAMPLE_DATA = {
  primaryCrop: { name: 'Brinjal / Eggplant', harvestDuration: '4 - 5 Months' },
  intercrop: { name: 'Coriander (Kothamalli)', lerScore: 1.34, rowRatio: '1:2' },
  marketData: { pricePerKg: 24.50, officialMspPerKg: 18.00 }
};

export default function App() {
  const [district, setDistrict] = useState('Thanjavur');
  const [crop, setCrop] = useState('Brinjal');

  return (
    <main style={{ minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        {/* Banner */}
        <header style={{ borderBottom: '2px solid #059669', paddingBottom: '12px', marginBottom: '20px' }}>
          <h1 style={{ color: '#065f46', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🌱 AgriCompanion AI</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Statewide Tamil Nadu Intercropping System</p>
        </header>

        {/* Diagnostic Confirmation Card */}
        <section style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ color: '#065f46', fontWeight: 'bold', margin: 0 }}>
            ✅ UI Loaded Successfully (React Engine Active)
          </p>
          <p style={{ color: '#047857', fontSize: '12px', margin: '6px 0 0 0' }}>
            District: <strong>{district}</strong> | Crop: <strong>{crop}</strong> | LER Score: <strong>{SAMPLE_DATA.intercrop.lerScore}</strong>
          </p>
        </section>

        {/* Inputs */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>District</label>
            <select 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              <option value="Thanjavur">Thanjavur (Cauvery Delta)</option>
              <option value="Coimbatore">Coimbatore (Western Zone)</option>
              <option value="Virudhunagar">Virudhunagar (Southern Zone)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Crop</label>
            <select 
              value={crop} 
              onChange={(e) => setCrop(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              <option value="Brinjal">Brinjal / Eggplant</option>
              <option value="Cotton">Cotton</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Tomato">Tomato</option>
            </select>
          </div>
        </section>

        {/* Output Blueprint Card */}
        <article style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            Recommended Intercrop: <span style={{ color: '#059669' }}>{SAMPLE_DATA.intercrop.name}</span>
          </h3>
          <p style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0' }}>
            <strong>Pattern:</strong> {SAMPLE_DATA.intercrop.rowRatio} | <strong>Cycle:</strong> {SAMPLE_DATA.primaryCrop.harvestDuration}
          </p>
          <p style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0' }}>
            <strong>Mandi Price:</strong> ₹{SAMPLE_DATA.marketData.pricePerKg.toFixed(2)}/kg (Govt Floor: ₹{SAMPLE_DATA.marketData.officialMspPerKg.toFixed(2)}/kg)
          </p>
        </article>

      </div>
    </main>
  );
}