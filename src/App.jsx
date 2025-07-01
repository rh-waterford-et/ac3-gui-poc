import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import Controls from './components/Controls';
import StatusBar from './components/StatusBar';
import AladinInteractions from './components/AladinInteractions';
import logoImage from './assets/AC3-LogoConFrase.jpg';

function App() {
  const [aladinInstance, setAladinInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadAladinScript();
  }, []);

  useEffect(() => {
    if (scriptLoaded) {
      initializeAladin();
    }
  }, [scriptLoaded]);

  /**
   * Load the Aladin Lite v3 script dynamically
   */
  const loadAladinScript = async () => {
    try {
      // Check if Aladin is already loaded
      if (window.A) {
        setScriptLoaded(true);
        return;
      }

      console.log('Loading Aladin Lite v3 script...');

      // Load jQuery first (required for Aladin Lite)
      if (!window.jQuery && !window.$) {
        await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
        console.log('jQuery loaded successfully');
      }

      // Load Aladin Lite v3
      await loadScript('https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js');
      console.log('Aladin Lite v3 script loaded successfully');

      setScriptLoaded(true);
    } catch (error) {
      console.error('Failed to load Aladin Lite script:', error);
      setError('Failed to load Aladin Lite script: ' + error.message);
      setIsLoading(false);
    }
  };

  /**
   * Helper function to load a script dynamically
   */
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  };

  /**
   * Initialize Aladin Lite v3
   */
  const initializeAladin = async () => {
    try {
      console.log('Initializing Aladin Lite v3...');
      
      // Wait for Aladin to be available
      if (typeof window.A === 'undefined') {
        throw new Error('Aladin Lite script not loaded');
      }

      // Initialize Aladin v3
      await window.A.init.then(() => {
        console.log('Aladin Lite v3 initialized successfully');
        
        // Create Aladin instance
        const aladin = window.A.aladin('#aladin-lite-div', {
          survey: 'P/DSS2/color',
          fov: 1.5,
          projection: 'SIN',
          cooFrame: 'ICRS',
          showReticle: true,
          showZoomControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showGotoControl: true,
          showShareControl: false,
          showCatalogControl: true,
          showFrame: true,
          showCooGrid: false,
          fullScreen: false,
          reticleColor: '#ff89ba',
          reticleSize: 22,
          log: true
        });

        console.log('Aladin instance created:', aladin);
        setAladinInstance(aladin);
        
        // Make Aladin instance globally available for coordinate checking
        window.aladinInstance = aladin;
        
        setIsLoading(false);

        // Set initial position to a nice galaxy
        setTimeout(() => {
          aladin.gotoRaDec(210.8, 54.3); // M101 Pinwheel Galaxy
        }, 1000);
      });

    } catch (error) {
      console.error('Error initializing Aladin:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Error Loading Aladin Lite</h2>
          <p>{error}</p>
          <p>Please ensure you have a WebGL2-compatible browser and try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <img src={logoImage} alt="AC³ Logo" className="logo-image" />
            <span className="app-name">AC³ Astronomy Maps</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="connection-status">
            <div className="status-indicator active"></div>
            <span>Connected</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="content-layout">
          <div className="left-content">
            {/* Controls */}
            <Controls aladinInstance={aladinInstance} />

            {/* Aladin Container */}
            <div className="aladin-container">
              {isLoading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>
                    {!scriptLoaded 
                      ? 'Loading Aladin Lite v3 script...' 
                      : 'Initializing Aladin Lite v3...'
                    }
                  </p>
                </div>
              )}
              <div id="aladin-lite-div"></div>
            </div>

            {/* Bottom Gallery */}
            <Gallery aladinInstance={aladinInstance} />

            {/* Status Bar */}
            <StatusBar />
          </div>

          {/* Right Sidebar */}
          <Sidebar aladinInstance={aladinInstance} />
        </div>
      </main>
      
      {/* Interactions Handler (invisible component) */}
      <AladinInteractions aladinInstance={aladinInstance} />
    </div>
  );
}

export default App; 