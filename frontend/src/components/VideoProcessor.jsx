import { useSearchParams } from 'react-router-dom';
import Navigation from './Navigation';
import Upload from './Upload';
import Footer from './Footer';
import '../styles/VideoProcessor.css';

const VideoProcessor = () => {
  const [searchParams] = useSearchParams();
  const operation = searchParams.get('operation') || 'compress';

  return (
    <>
      <Navigation />
      <div className="processor-container">
        <div className="processor-header">
          <div className="processor-title">
            {operation === 'compress' ? (
              <>
                <h2>🗜️ Video Compression</h2>
                <p>Reduce file sizes while maintaining exceptional quality</p>
              </>
            ) : (
              <>
                <h2>✨ Video Enhancement</h2>
                <p>Boost your video quality to professional standards</p>
              </>
            )}
          </div>
        </div>
        <Upload />
      </div>
      <Footer />
    </>
  );
};

export default VideoProcessor;
