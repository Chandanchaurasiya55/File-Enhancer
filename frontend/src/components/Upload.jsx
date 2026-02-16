import React, { useRef, useState } from 'react';
import '../styles/Upload.css';

const Upload = () => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const formats = ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'PRORES', 'HEVC'];

  const validVideoFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/x-prores', 'video/x-h265'];
  const validImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  const handleChooseVideo = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValidVideo = validVideoFormats.includes(file.type);
      const isValidImage = validImageFormats.includes(file.type);
      
      if (!isValidVideo && !isValidImage) {
        setError('❌ Invalid file format! Please upload only video or image files.');
        // Reset input
        fileInputRef.current.value = '';
        return;
      }
      
      setError('');
      console.log('Selected file:', file.name);
      // Add your file processing logic here
    }
  };

  return (
    <section className="upload-section" id="upload">
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-icon">🎥</div>
          <h2>Begin Your Journey</h2>
          <p>Drop your masterpiece here and watch the magic unfold</p>
          <button className="upload-btn" onClick={handleChooseVideo}>Choose Your File</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          {error && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#ffe6e6',
              color: '#a90006',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              textAlign: 'center',
              animation: 'slideDown 0.3s ease-out'
            }}>
              {error}
            </div>
          )}
          <div className="upload-formats">
            {formats.map((format) => (
              <span key={format} className="format-badge">{format}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Upload;
