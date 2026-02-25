import React, { useRef, useState, useEffect, useContext } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { servicesData } from '../data/servicesData';
import '../styles/Upload.css';

const API = import.meta.env.VITE_API_URL;

const Upload = ({ serviceId = null, operation = null }) => {
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { serviceId: urlServiceId } = useParams();
  const { user } = useContext(AuthContext);

  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processType, setProcessType] = useState(operation || searchParams.get('operation') || 'compress');
  const [result, setResult] = useState(null);

  // helper for formatting a file size returned by backend
  // backend sometimes gives a plain number (MB) for videos and
  // a string with unit ("123 KB" / "1.2 MB") for images.
  const formatSize = (size) => {
    if (size == null) return "";
    // handle strings first
    if (typeof size === "string") {
      const trimmed = size.trim();
      // if the string already contains a unit just return it
      if (/\b(KB|MB)\b/i.test(trimmed)) {
        return trimmed;
      }
      // otherwise treat plain numbers as MB value
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        size = num; // fall through to numeric handling below
      } else {
        return trimmed; // unrecognized format, just return
      }
    }

    // numeric path (size now is number)
    const mb = parseFloat(size);
    if (isNaN(mb)) return "";
    if (mb < 1) {
      // convert to kilobytes when less than 1MB
      return `${(mb * 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };
  const [selectedFormat, setSelectedFormat] = useState(null);
  // for conversion we also need explicit source/target selection
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
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

  // available individual formats for conversion service
  const formatChoices = currentServiceId === 'format-conversion' && currentService
    ? [...new Set(currentService.conversions.flatMap(c => c.split(' ↔ ').map(p => p.trim())))]
    : [];

  // get user-friendly display name for a format code
  const getFormatDisplayName = (code) => {
    if (!currentService?.formatDisplayNames) return code.toUpperCase();
    return currentService.formatDisplayNames[code] || code.toUpperCase();
  };

  // reset combined format string when user modifies selections
  useEffect(() => {
    if (currentServiceId === 'format-conversion') {
      setSelectedFormat(null);
    }
  }, [selectedFrom, selectedTo, currentServiceId]);

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



  const handleChooseVideo = () => {
    setError('');
    if (currentService) {
      if (currentServiceId === 'format-conversion') {
        if (!selectedFrom || !selectedTo) {
          setError('❌ Choose both source and target formats.');
          return;
        }
        if (selectedFrom === selectedTo) {
          setError('❌ Source and target formats must differ.');
          return;
        }
        // ensure the pair is supported (any direction)
        const pair = `${selectedFrom} ↔ ${selectedTo}`;
        const reversePair = `${selectedTo} ↔ ${selectedFrom}`;
        if (!currentService.conversions.includes(pair) && !currentService.conversions.includes(reversePair)) {
          setError('❌ This conversion combination is not supported.');
          return;
        }
        // Set the conversion pair as selectedFormat for the processFile function
        setSelectedFormat(pair);
      } else if (!selectedFormat) {
        setError('❌ Please pick a format first.');
        return;
      }
    }
    
    // Trigger file input
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        console.error('File input ref not available');
      }
    } catch (err) {
      console.error('Error triggering file input:', err);
      setError('❌ Could not open file picker. Please try again.');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // format conversion skips the media-type validation and uses a generic endpoint
      if (currentServiceId === 'format-conversion') {
        await processFile(file);
      } else {
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

  const processFile = async (file) => {
    try {
      setProcessing(true);
      setProgress(0);
      setResult(null);

      // Extract target format from selectedFormat (e.g., "DOCX ↔ PDF" -> "pdf")
      let targetFormat = selectedTo;
      if (!targetFormat && selectedFormat) {
        // Fallback: parse the format string if selectedFormat is "FROM ↔ TO"
        const parts = selectedFormat.split('↔').map(p => p.trim());
        targetFormat = parts[1] || parts[0];
      }

      targetFormat = targetFormat.toLowerCase();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', targetFormat);

      // Backend endpoint for file conversion
      const endpoint = `${API}/convert`;

      console.log('📤 Uploading file to:', endpoint);
      console.log('📋 File details:', { name: file.name, size: file.size, type: file.type });
      console.log('🎯 Target format:', targetFormat);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      console.log('📨 Response status:', response.status, response.statusText);

      // Check content type to determine if response is JSON or binary file
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (isJson) {
        // Failed response - JSON error message
        const data = await response.json();
        console.log('📥 Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || data.message || `Conversion failed with status ${response.status}`);
        }
      } else {
        // Success response - binary file being downloaded
        if (!response.ok) {
          throw new Error(`Conversion failed with status ${response.status}`);
        }

        // Extract filename from Content-Disposition header or generate one
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `converted.${targetFormat}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(?:(['"]).*?\1|[^;\n]*)/);
          if (filenameMatch && filenameMatch[0]) {
            filename = filenameMatch[0].replace(/filename[^;=\n]*=/g, '').replace(/['"]/g, '');
          }
        }

        // Get the blob and trigger download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        downloadFile(downloadUrl, filename);

        console.log('✅ Conversion complete! File downloaded.');
        setProgress(100);
        setResult({
          success: true,
          message: 'Conversion complete! File downloaded successfully.',
          file: { filename }
        });
      }
    } catch (err) {
      console.error('❌ Conversion error:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setProcessing(false);
    }
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

          {!user && (
            <div style={{
              marginTop: '1.5rem',
              padding: '2rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px dashed #a90006'
            }}>
              <h3 style={{ color: '#a90006', marginBottom: '1rem' }}>🔐 Authentication Required</h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
                You need to sign up or log in to access this service.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to="/user/signup" 
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#a90006',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Sign Up
                </Link>
                <Link 
                  to="/user/login" 
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#333',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Log In
                </Link>
              </div>
            </div>
          )}
          

          {user && !processing && !result && currentService && (
            (currentServiceId !== 'format-conversion' && !selectedFormat) ||
            (currentServiceId === 'format-conversion' && (!selectedFrom || !selectedTo))
          ) && (
            <div className="format-message">
              <p>📋 Please select your file format first</p>
            </div>
          )}
          
          {user && !processing && !result && (
            <>
              {/* Format Selection */}
              {currentService && currentServiceId !== 'format-conversion' && (
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

              {/* conversion controls for format-conversion service */}
              {currentServiceId === 'format-conversion' && (
                <div className="format-selection conversion-row">
                  <div className="conversion-field">
                    <label htmlFor="from-select" 
                    style={{ fontSize: '14px', fontWeight: '700', color: '#a90006'}} >
                    From
                    </label>
                    <select
                      id="from-select"
                      className='format-select'
                      value={selectedFrom}
                      onChange={e => setSelectedFrom(e.target.value)}
                    >
                      <option value="" disabled>-- choose source format --</option>
                      {formatChoices.map(opt => <option key={opt} value={opt}>{getFormatDisplayName(opt)}</option>)}
                    </select>
                  </div>

                  <div className="conversion-field">
                    <label htmlFor="to-select" 
                    style={{ fontSize: '14px', fontWeight: '700', color: '#a90006'}}>
                      To
                      </label>
                    <select
                      id="to-select"
                      className='format-select'
                      value={selectedTo}
                      onChange={e => setSelectedTo(e.target.value)}
                    >
                      <option value="" disabled>-- choose target format --</option>
                      {formatChoices.map(opt => <option key={opt} value={opt}>{getFormatDisplayName(opt)}</option>)}
                    </select>
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
                disabled={
                  (currentServiceId === 'format-conversion' && (!selectedFrom || !selectedTo)) ||
                  (currentServiceId === 'ai-enhancement' && selectedFeatures.length === 0) ||
                  (currentServiceId !== 'format-conversion' && currentServiceId !== 'ai-enhancement' && currentService && !selectedFormat) ||
                  processing
                }
              >
                {processing ? 'Processing...' : currentService ? 'Upload & Process' : 'Choose your file'}
              </button>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={
              currentServiceId === 'format-conversion'
                ? '*/*'
                : 'video/*,image/*'
            }
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
              <p>
                Processing your {processType === 'compress' ? 'compression'
                  : processType === 'enhance' ? 'enhancement'
                  : processType === 'convert' ? 'conversion'
                  : ''}...
              </p>
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
                      <span className="stat-value">{formatSize(result.file.originalSize)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Compressed Size:</span>
                      <span className="stat-value">{formatSize(result.file.compressedSize)}</span>
                    </div>
                    <div className="stat highlight">
                      <span className="stat-label">Size Reduction:</span>
                      <span className="stat-value">{result.file.sizeReduction}%</span>
                    </div>
                  </>
                ) : processType === 'enhance' ? (
                  <>
                    <div className="stat">
                      <span className="stat-label">Original Size:</span>
                      <span className="stat-value">{formatSize(result.file.originalSize)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Enhanced Size:</span>
                      <span className="stat-value">{formatSize(result.file.enhancedSize)}</span>
                    </div>
                    <div className="stat highlight">
                      <span className="stat-label">Quality Boost:</span>
                      <span className="stat-value">+{result.file.sizeIncrease}%</span>
                    </div>
                  </>
                ) : (
                  <p>Your file is ready for download.</p>
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

