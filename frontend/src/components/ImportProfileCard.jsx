import React, { useRef, useState } from 'react';
import { AlertCircle, Download, UploadCloud } from 'lucide-react';

export default function ImportProfileCard({ onProfileImported }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please upload a valid .json contract file exported from Member 1.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload.data?.studentId) {
        throw new Error('Unrecognized contract schema. Missing student data.');
      }

      const response = await fetch('/api/v1/recommendations/import-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.detail || 'Server rejected the imported profile.');
      }

      onProfileImported(result);
    } catch (uploadError) {
      setError(uploadError instanceof Error
        ? uploadError.message
        : 'Failed to parse or import profile file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-panel" style={{
      padding: '1.1rem 1.25rem',
      marginBottom: '1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Download size={22} color="#ffb38f" />
        <div>
          <h2 style={{ color: '#fff8f4', fontSize: '1rem', fontWeight: 800 }}>
            Import Member 1 Student Profile
          </h2>
          <p style={{ color: '#cdb9ce', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            Upload a ProfileSnapshot v1 JSON to run matching with the student&apos;s saved criteria.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn-glow-primary"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <UploadCloud size={16} />
        {loading ? 'Importing & Matching...' : 'Select Profile JSON'}
      </button>

      {error && (
        <div style={{ flexBasis: '100%', color: '#ff829c', fontSize: '0.8rem', display: 'flex', gap: '0.4rem' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
    </section>
  );
}
