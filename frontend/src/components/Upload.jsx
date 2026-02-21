import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useLocation, useParams } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import '../styles/Upload.css';

const API = import.meta.env.VITE_API_URL;

const Upload = ({ hideSelector = false, serviceId = null, operation = null }) => {
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { serviceId: urlServiceId } = useParams();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processType, setProcessType] = useState(operation || searchParams.get('operation') || 'compress');
  const [result, setResult] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  // Get service data if available
  const currentServiceId = serviceId || urlServiceId;
  const currentService = currentServiceId 
    ? servicesData.find(s => s.id === currentServiceId)
    : null;

  // Get formats - either from service or default list
  const displayFormats = currentService?.formats || ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'PRORES', 'HEVC'];

  const validVideoFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/x-prores', 'video/x-h265'];
  const validImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  useEffect(() => {
    if (operation) {
      setProcessType(operation);
    } else {
      const urlOperation = searchParams.get('operation');
      if (urlOperation) {
        setProcessType(urlOperation);
      }
    }
  }, [searchParams, operation]);

  // Hide selector when on VideoProcessor page, service detail page or when hideSelector prop is true
  const showSelector = !hideSelector && !location.pathname.includes('/process-video') && !location.pathname.includes('/service/');

  const handleChooseVideo = () => {
    setError('');
    if (currentService && !selectedFormat) {
      setError('❌ Please pick a format first.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
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
      
      // Process video if it's a video file
      if (isValidVideo) {
        await processVideo(file);
      }
      
      // Reset input for future selections
      fileInputRef.current.value = '';
    }
  };

  const pollJobStatus = async (jobId) => {
    const statusUrl = `${API}/video/status/${jobId}`;
    const maxAttempts = 300; // 5 minutes max
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const response = await fetch(statusUrl);
          const data = await response.json();

          if (!response.ok) {
            clearInterval(pollInterval);
            reject(new Error(data.error || 'Failed to check job status'));
            return;
          }

          console.log('[Status]', data.status, 'Progress:', data.progress);
          setProgress(data.progress || 0);

          if (data.status === 'done') {
            clearInterval(pollInterval);
            resolve(data);
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            reject(new Error(data.error || 'Compression failed'));
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            reject(new Error('Processing timeout - took too long'));
          }
        } catch (err) {
          clearInterval(pollInterval);
          reject(err);
        }
      }, 1000); // Poll every 1 second
    });
  };

  const processVideo = async (file) => {
    try {
      setProcessing(true);
      setProgress(0);
      setResult(null);

      const formData = new FormData();
      formData.append('video', file);
      if (selectedFormat) {
        formData.append('format', selectedFormat);
      }

      const endpoint = processType === 'compress' 
        ? `${API}/video/compress`
        : `${API}/video/enhance`;

      console.log('📤 Uploading to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status} with non-JSON response. Check if backend is running.`);
      }

      const data = await response.json();
      
      // 202 is "Accepted" - job is processing in background
      if (response.status === 202 && data.success && data.jobId) {
        console.log('✅ Job accepted! ID:', data.jobId);
        setProgress(5);

        // Poll the status endpoint until done
        const jobData = await pollJobStatus(data.jobId);

        console.log('✅ Job complete!', jobData);
        setProgress(100);

        // Construct download info
        setResult({
          success: true,
          message: '✅ Compression complete! Ready to download.',
          file: {
            originalSize: jobData.originalSize,
            compressedSize: jobData.compressedSize,
            sizeReduction: (((jobData.originalSize - jobData.compressedSize) / jobData.originalSize) * 100).toFixed(1),
            downloadUrl: `${API}/video/download/${jobData.jobId}`,
            filename: `compressed_${jobData.originalName}`
          }
        });
      } else if (!response.ok) {
        throw new Error(data.error || `Processing failed with status ${response.status}`);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('❌ Processing error:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = (url, filename) => {
    console.log('📥 Downloading from:', url);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="upload-section" id="upload">
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-icon">📤</div>
          <h2>Upload &amp; Process</h2>
          <p>1. Pick compress or enhance → 2. Choose a format → 3. Upload file → 4. Download when done</p>

          {/* informational cards tied to current operation */}
          <div className="upload-info-cards">
            { (processType === 'compress' ?
              [
                'Compressing makes your files smaller for easy sharing.',
                'Keep the quality high while saving storage space.'
              ] :
              [
                'Enhancing brings out details and sharpness in your video.',
                'Great for improving old or low‑resolution footage.'
              ]
            ).map((txt, idx) => (
              <div key={idx} className="info-card">{txt}</div>
            )) }
          </div>
          
          {!processing && !result && (
            <>
              {showSelector && (
                <div className="process-selector">
                  <label htmlFor="processType">Pick an action:</label>
                  <select 
                    id="processType"
                    value={processType} 
                    onChange={(e) => setProcessType(e.target.value)}
                    className="process-select"
                  >
                    <option value="compress">🗜️ Make file smaller</option>
                    <option value="enhance">✨ Make quality better</option>
                  </select>
                </div>
              )}

              {/* Format Selection */}
              {currentService && (
                <div className="format-selection">
                  <div className="format-buttons">
                    {displayFormats.map((format) => (
                      <button
                        key={format}
                        className={`format-btn ${selectedFormat === format ? 'selected' : ''}`}
                        onClick={() => setSelectedFormat(format)}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                  {selectedFormat && (
                    <p style={{ marginTop: '0.8rem', fontSize: '0.95rem', color: '#333' }}>
                      Selected format: <strong>{selectedFormat}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* unified upload trigger button */}
              <button
                className="upload-btn"
                onClick={handleChooseVideo}
                disabled={currentService && !selectedFormat}
              >
                {currentService ? 'Upload file' : 'Choose your file'}
              </button>
            </>
          )}
          
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

          {processing && (
            <div className="processing-container">
              <div className="spinner"></div>
              <p>Processing your {processType === 'compress' ? 'compression' : 'enhancement'}...</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="progress-text">{progress}%</p>
            </div>
          )}

          {result && result.success && (
            <div className="result-container">
              <div className="success-icon">✅</div>
              <h3>{result.message}</h3>
              <div className="file-stats">
                {processType === 'compress' ? (
                  <>
                    <div className="stat">
                      <span className="stat-label">Original Size:</span>
                      <span className="stat-value">{result.file.originalSize} MB</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Compressed Size:</span>
                      <span className="stat-value">{result.file.compressedSize} MB</span>
                    </div>
                    <div className="stat highlight">
                      <span className="stat-label">Size Reduction:</span>
                      <span className="stat-value">{result.file.sizeReduction}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat">
                      <span className="stat-label">Original Size:</span>
                      <span className="stat-value">{result.file.originalSize} MB</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Enhanced Size:</span>
                      <span className="stat-value">{result.file.enhancedSize} MB</span>
                    </div>
                    <div className="stat highlight">
                      <span className="stat-label">Quality Boost:</span>
                      <span className="stat-value">+{result.file.sizeIncrease}%</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                className="download-btn"
                onClick={() => downloadFile(result.file.downloadUrl, result.file.filename)}
              >
                📥 Download Your File
              </button>
              <button 
                className="process-again-btn"
                onClick={() => {
                  setResult(null);
                  setError('');
                  setProgress(0);
                  fileInputRef.current.value = '';
                }}
              >
                Process Another File
              </button>
            </div>
          )}

          {!processing && !result && !currentService && (
            <div className="upload-formats">
              {displayFormats.map((format) => (
                <span key={format} className="format-badge">{format}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Upload;

