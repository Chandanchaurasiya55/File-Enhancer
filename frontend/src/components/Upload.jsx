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
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // AI Enhancement features list
  const enhancementFeatures = [
    { id: 'upscale', icon: '📈', title: 'Image Upscaling', desc: 'Enlarge small photos without quality loss' },
    { id: 'sharpen', icon: '✨', title: 'Blur Remove / Sharpen', desc: 'Clarify blurry photos and enhance facial details' },
    { id: 'denoise', icon: '🔇', title: 'Noise Removal', desc: 'Clean dark and grainy photos, improve low-light images' },
    { id: 'restore', icon: '🎨', title: 'Old Photo Restore', desc: 'Repair faded photos, remove scratches, colorize B&W' },
    { id: 'bgremove', icon: '🎯', title: 'Background Remove', desc: 'Remove backgrounds and create transparent PNGs' },
    { id: 'face', icon: '👤', title: 'Face Enhancement', desc: 'Smooth face, balance skin tone, enhance eyes' },
    { id: 'color', icon: '🌈', title: 'Color Correction', desc: 'Adjust brightness, improve contrast, balance colors' },
    { id: 'objremove', icon: '🚫', title: 'AI Object Remove', desc: 'Remove unwanted objects with AI precision' },
  ];

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
      
      // Process based on file type
      if (isValidVideo) {
        await processVideo(file);
      } else if (isValidImage) {
        await processImage(file);
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
          message: 'Compression complete! Ready to download.',
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

  const processImage = async (file) => {
    try {
      setProcessing(true);
      setProgress(0);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      // Pass selected features to the API
      if (selectedFeatures && selectedFeatures.length > 0) {
        formData.append('features', selectedFeatures.join(','));
      }

      // Use enhance endpoint for image enhancement
      const endpoint = `${API}/image/enhance`;

      console.log('📤 Uploading image to:', endpoint);
      console.log('🎯 Selected features:', selectedFeatures);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Processing failed with status ${response.status}`);
      }

      if (data.success && data.data && data.data.downloadUrl) {
        console.log('✅ Image enhanced!', data);
        setProgress(100);

        // Parse sizes to calculate quality boost
        const parseSize = (sizeStr) => {
          const match = sizeStr.match(/(\d+\.?\d*)\s*(MB|KB)/i);
          if (!match) return 0;
          const size = parseFloat(match[1]);
          const unit = match[2].toUpperCase();
          return unit === 'MB' ? size * 1024 : size;
        };

        const originalSizeKB = parseSize(data.data.original.size);
        const enhancedSizeKB = parseSize(data.data.enhanced.size);
        
        // Calculate change percentage
        let qualityBoost = 0;
        if (originalSizeKB > 0) {
          const changePercent = ((enhancedSizeKB - originalSizeKB) / originalSizeKB * 100);
          // Cap between -99% and 99% for realistic display
          qualityBoost = Math.max(-99, Math.min(99, changePercent)).toFixed(1);
        }

        // Construct download info
        setResult({
          success: true,
          message: 'Image enhancement complete! Ready to download.',
          file: {
            originalSize: data.data.original.size,
            enhancedSize: data.data.enhanced.size,
            sizeIncrease: qualityBoost,
            downloadUrl: `${API.replace('/api', '')}${data.data.downloadUrl}`,
            filename: data.data.filename
          }
        });
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('❌ Image processing error:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="upload-section" id="upload">
      <div className="upload-container">
        <div className="upload-content">
          <div className="upload-icon">📤  <h2>Upload Your File</h2></div>
          

          {!processing && !result && currentService && !selectedFormat && (
            <div className="format-message">
              <p>📋 Please select your file format first</p>
            </div>
          )}
          
          {!processing && !result && (
            <>
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
                </div>
              )}

              {/* AI Enhancement Features Selection */}
              {currentServiceId === 'ai-enhancement' && (
                <div className="feature-selection">
                  <h3>🎯 Choose Enhancement Features</h3>
                  <p className="feature-subtitle">Select the features you want to apply to your image</p>
                  <div className="features-grid">
                    {enhancementFeatures.map((feature) => (
                      <div 
                        key={feature.id}
                        className="feature-card"
                        onClick={() => {
                          setSelectedFeatures(prev => 
                            prev.includes(feature.id)
                              ? prev.filter(f => f !== feature.id)
                              : [...prev, feature.id]
                          );
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedFeatures.includes(feature.id)}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <span className="feature-icon">{feature.icon}</span>
                        <h4>{feature.title}</h4>
                        <p>{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                  {selectedFeatures.length === 0 && (
                    <p style={{ color: '#a90006', marginTop: '1rem', fontWeight: '600' }}>
                      ⚠️ Please select at least one feature
                    </p>
                  )}
                </div>
              )}

              {/* unified upload trigger button */}
              <button
                className="upload-btn"
                onClick={handleChooseVideo}
                disabled={currentService && !selectedFormat || (currentServiceId === 'ai-enhancement' && selectedFeatures.length === 0)}
              >
                {currentService ? 'Upload & Process' : 'Choose your file'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <div className="success-icon">✅</div>
                <h3 style={{ margin: 0 }}>{result.message}</h3>
              </div>
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

