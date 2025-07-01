import React, { useEffect } from 'react';

/**
 * Normalize object name for S3 path (e.g., 'NGC 7025' -> 'ngc7025')
 * @param {string} objectName - The raw object name
 * @returns {string} - Normalized name for S3 path
 */
const normalizeObjectName = (objectName) => {
  return objectName
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
};

/**
 * Check if an image exists at the given URL
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - True if image exists, false otherwise
 */
const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get human-readable label for map type
 * @param {string} mapType - The map type key
 * @returns {string} - Human-readable label
 */
const getMapTypeLabel = (mapType) => {
  const labels = {
    'stellar-velocity': 'Stellar Velocity',
    'velocity-dispersion': 'Velocity Dispersion',
    'stellar-velocity-error': 'Stellar Velocity Error',
    'velocity-dispersion-error': 'Velocity Dispersion Error',
    'h3': 'H3',
    'age-lum-weighted': 'Age (Luminosity Weighted)',
    'metallicity': 'Metallicity'
  };
  return labels[mapType] || mapType;
};

/**
 * Get icon for map type
 * @param {string} mapType - The map type
 * @returns {string} - Icon character
 */
const getMapTypeIcon = (mapType) => {
  const icons = {
    'stellar-velocity': '🌀',
    'velocity-dispersion': '📊', 
    'stellar-velocity-error': '⚠️',
    'velocity-dispersion-error': '📈',
    'h3': '🔬',
    'age-lum-weighted': '⏳',
    'metallicity': '⚛️'
  };
  return icons[mapType] || '📷';
};

const Controls = ({ aladinInstance }) => {
  useEffect(() => {
    if (!aladinInstance) return;
    
    setupControls(aladinInstance);
    setupKeyboardControls(aladinInstance);
  }, [aladinInstance]);

  return (
    <div className="controls">
      <div className="controls-grid">
        <div className="control-group">
          <label htmlFor="format-select" className="control-label">
            <span className="label-icon">🎯</span>
            Image Format
          </label>
          <div className="select-wrapper">
            <select id="format-select" defaultValue="fits" className="modern-select">
              <option value="fits">FITS</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
            <div className="select-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="survey-select" className="control-label">
            <span className="label-icon">🛰️</span>
            Survey
          </label>
          <div className="select-wrapper">
            <select id="survey-select" defaultValue="P/DSS2/color" className="modern-select">
              <option value="P/DSS2/color">DSS2 Color</option>
              <option value="P/2MASS/color">2MASS</option>
              <option value="P/allWISE/color">AllWISE</option>
              <option value="P/SDSS9/color">SDSS9</option>
              <option value="P/GLIMPSE360">GLIMPSE</option>
            </select>
            <div className="select-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="control-group search-group">
          <label htmlFor="galaxy-search" className="control-label">
            <span className="label-icon">🔍</span>
            Galaxy Search
          </label>
          <div className="search-input-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="galaxy-search"
                className="modern-input"
                placeholder="Enter galaxy name..."
              />
              <div className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <button id="search-galaxy-btn" className="modern-btn">
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="controls-footer">
        <div className="keyboard-shortcuts">
          <span className="shortcuts-label">Shortcuts:</span>
          <div className="shortcut-tags">
            <span className="shortcut-tag">
              <kbd>F</kbd> Format
            </span>
            <span className="shortcut-tag">
              <kbd>S</kbd> Survey
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Set up controls functionality
 * @param {Object} aladin - The Aladin Lite instance
 */
const setupControls = (aladin) => {
  // Format selection
  const formatSelect = document.getElementById('format-select');
  if (formatSelect) {
    formatSelect.addEventListener('change', (event) => {
      applyImageFormat(aladin, event.target.value);
    });
  }

  // Survey selection
  const surveySelect = document.getElementById('survey-select');
  if (surveySelect) {
    surveySelect.addEventListener('change', (event) => {
      aladin.setImageSurvey(event.target.value);
      
      // Update status
      const statusElement = document.getElementById('current-status');
      if (statusElement) {
        const format = formatSelect?.value || 'fits';
        statusElement.textContent = `Format: ${format.toUpperCase()} | Survey: ${event.target.value}`;
      }
      
      console.log(`Survey changed to: ${event.target.value}`);
    });
  }

  // Galaxy search
  const searchGalaxyBtn = document.getElementById('search-galaxy-btn');
  const galaxySearchInput = document.getElementById('galaxy-search');
  
  if (searchGalaxyBtn && galaxySearchInput) {
    searchGalaxyBtn.addEventListener('click', () => {
      const input = galaxySearchInput.value.trim();
      console.log('Search button clicked, input:', input);
      if (input) {
        handleGalaxySearch(aladin, input);
      } else {
        console.log('No input provided for search');
      }
    });
  }

  // Enter key support for galaxy search
  if (galaxySearchInput) {
    galaxySearchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        console.log('Enter key pressed in search input');
        searchGalaxyBtn?.click();
      }
    });
  }

  console.log('Controls set up');
};

/**
 * Set up keyboard controls
 * @param {Object} aladin - The Aladin Lite instance
 */
const setupKeyboardControls = (aladin) => {
  document.addEventListener('keydown', (event) => {
    // Only trigger if not typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'f':
        event.preventDefault();
        toggleImageFormat(aladin);
        break;
      case 's':
        event.preventDefault();
        cycleSurvey(aladin);
        break;
    }
  });

  console.log('Keyboard controls set up (F = format toggle, S = survey cycle)');
};

/**
 * Apply image format to current survey
 * @param {Object} aladin - The Aladin Lite instance
 * @param {string} format - The format to apply ('fits', 'jpeg', 'png')
 */
const applyImageFormat = (aladin, format) => {
  try {
    const currentSurvey = document.getElementById('survey-select')?.value || 'P/DSS2/color';
    
    // For FITS format, we use the survey as-is
    // For other formats, we might need to modify the survey ID
    let surveyWithFormat = currentSurvey;
    
    switch (format) {
      case 'fits':
        // FITS is the default high-quality format
        break;
      case 'jpeg':
        // Some surveys support format specification
        if (!currentSurvey.includes('?')) {
          surveyWithFormat = `${currentSurvey}?format=jpeg`;
        }
        break;
      case 'png':
        if (!currentSurvey.includes('?')) {
          surveyWithFormat = `${currentSurvey}?format=png`;
        }
        break;
    }
    
    aladin.setImageSurvey(surveyWithFormat);
    
    // Update status
    const statusElement = document.getElementById('current-status');
    if (statusElement) {
      statusElement.textContent = `Format: ${format.toUpperCase()} | Survey: ${currentSurvey}`;
    }
    
    console.log(`Applied ${format} format to survey: ${currentSurvey}`);
  } catch (error) {
    console.error('Error applying image format:', error);
  }
};

/**
 * Toggle between image formats
 * @param {Object} aladin - The Aladin Lite instance
 */
const toggleImageFormat = (aladin) => {
  const formatSelect = document.getElementById('format-select');
  if (!formatSelect) return;

  const formats = ['fits', 'jpeg', 'png'];
  const currentIndex = formats.indexOf(formatSelect.value);
  const nextIndex = (currentIndex + 1) % formats.length;
  
  formatSelect.value = formats[nextIndex];
  applyImageFormat(aladin, formats[nextIndex]);
};

/**
 * Cycle through available surveys
 * @param {Object} aladin - The Aladin Lite instance
 */
const cycleSurvey = (aladin) => {
  const surveySelect = document.getElementById('survey-select');
  if (!surveySelect) return;

  const currentIndex = surveySelect.selectedIndex;
  const nextIndex = (currentIndex + 1) % surveySelect.options.length;
  
  surveySelect.selectedIndex = nextIndex;
  
  // Trigger change event
  const changeEvent = new Event('change');
  surveySelect.dispatchEvent(changeEvent);
};

/**
 * Handle galaxy search input
 * @param {Object} aladin - The Aladin Lite instance
 * @param {string} input - The galaxy name or identifier
 */
const handleGalaxySearch = (aladin, input) => {
  console.log('handleGalaxySearch called with input:', input);
  
  // First try to resolve common galaxy names to their catalog equivalents
  const resolvedName = resolveGalaxyName(input);
  console.log('Resolved name:', resolvedName);
  
  if (resolvedName.coordinates) {
    console.log('Using predefined coordinates for:', resolvedName.displayName);
    // Use predefined coordinates for known galaxies
    aladin.gotoRaDec(resolvedName.coordinates.ra, resolvedName.coordinates.dec);
    console.log(`Navigated to ${resolvedName.displayName} at RA: ${resolvedName.coordinates.ra}°, Dec: ${resolvedName.coordinates.dec}°`);
    
    // Update status
    const statusElement = document.getElementById('current-status');
    if (statusElement) {
      statusElement.textContent = `Viewing: ${resolvedName.displayName}`;
    }
    
    // Store the current object and coordinates, then load images
    window.currentLoadedObject = resolvedName.displayName;
    window.currentObjectCoords = [resolvedName.coordinates.ra, resolvedName.coordinates.dec];
    if (window.loadObjectImages) {
      window.loadObjectImages(resolvedName.displayName);
    }
    
    // Clear the input
    const galaxySearchInput = document.getElementById('galaxy-search');
    if (galaxySearchInput) {
      galaxySearchInput.value = '';
    }
    return;
  }
  
  console.log('Using Aladin object resolution for:', resolvedName.searchName);
  // Try Aladin's object resolution with better error detection
  const currentPosition = aladin.getRaDec();
  console.log('Current position before search:', currentPosition);
  
  try {
    // Store current position to detect if gotoObject actually moved
    const beforeRa = currentPosition[0];
    const beforeDec = currentPosition[1];
    
    aladin.gotoObject(resolvedName.searchName);
    
    // Wait a moment for the navigation to complete, then check if position changed
    setTimeout(() => {
      const afterPosition = aladin.getRaDec();
      const afterRa = afterPosition[0];
      const afterDec = afterPosition[1];
      
      // If position didn't change significantly, the object wasn't found
      const raDiff = Math.abs(afterRa - beforeRa);
      const decDiff = Math.abs(afterDec - beforeDec);
      
      if (raDiff < 0.01 && decDiff < 0.01) {
        // Position didn't change - object not found
        console.log(`Object "${resolvedName.searchName}" not found - position unchanged`);
        handleGalaxyNotFound(input);
      } else {
        // Position changed - object found
        console.log(`Successfully navigated to galaxy: ${resolvedName.searchName}`);
        
        // Update status
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
          statusElement.textContent = `Viewing: ${resolvedName.displayName}`;
        }
        
        // Store the current object and coordinates, then load images
        window.currentLoadedObject = resolvedName.displayName;
        window.currentObjectCoords = afterPosition;
        if (window.loadObjectImages) {
          window.loadObjectImages(resolvedName.displayName);
        }
        
        // Clear the input on successful search
        const galaxySearchInput = document.getElementById('galaxy-search');
        if (galaxySearchInput) {
          galaxySearchInput.value = '';
        }
      }
    }, 1000); // Wait 1 second for navigation to complete
    
  } catch (error) {
    console.error('Galaxy search failed with error:', error);
    handleGalaxyNotFound(input);
  }
};

/**
 * Parse coordinate input string
 * @param {string} input - The coordinate input string
 * @returns {Object|null} - Parsed coordinates {ra, dec} or null if invalid
 */
const parseCoordinates = (input) => {
  // Remove extra whitespace and split
  const parts = input.trim().split(/\s+/);
  
  if (parts.length === 2) {
    const ra = parseFloat(parts[0]);
    const dec = parseFloat(parts[1]);
    
    // Validate ranges
    if (!isNaN(ra) && !isNaN(dec) && 
        ra >= 0 && ra <= 360 && 
        dec >= -90 && dec <= 90) {
      return { ra, dec };
    }
  }
  
  // Try other formats (e.g., "RA:210.8 Dec:54.3" or "210.8,54.3")
  const coordMatch = input.match(/(?:RA:?\s*)?([0-9.-]+)[\s,]+(?:Dec:?\s*)?([0-9.-]+)/i);
  if (coordMatch) {
    const ra = parseFloat(coordMatch[1]);
    const dec = parseFloat(coordMatch[2]);
    
    if (!isNaN(ra) && !isNaN(dec) && 
        ra >= 0 && ra <= 360 && 
        dec >= -90 && dec <= 90) {
      return { ra, dec };
    }
  }
  
  return null;
};

/**
 * Resolve common galaxy names to catalog names or coordinates
 * @param {string} input - The input galaxy name
 * @returns {Object} - Object with searchName, displayName, and optional coordinates
 */
const resolveGalaxyName = (input) => {
  const inputLower = input.toLowerCase().trim();
  
  // Common galaxy name mappings with coordinates for problematic ones
  const galaxyMappings = {
    // Milky Way - point to galactic center
    'milky way': {
      searchName: 'Milky Way',
      displayName: 'Milky Way (Galactic Center)',
      coordinates: { ra: 266.4, dec: -29.0 }
    },
    'galaxy': {
      searchName: 'Milky Way',
      displayName: 'Milky Way (Galactic Center)', 
      coordinates: { ra: 266.4, dec: -29.0 }
    },
    
    // Andromeda variations
    'andromeda': { searchName: 'M31', displayName: 'Andromeda Galaxy (M31)' },
    'andromeda galaxy': { searchName: 'M31', displayName: 'Andromeda Galaxy (M31)' },
    
    // Whirlpool variations
    'whirlpool': { searchName: 'M51', displayName: 'Whirlpool Galaxy (M51)' },
    'whirlpool galaxy': { searchName: 'M51', displayName: 'Whirlpool Galaxy (M51)' },
    
    // Pinwheel variations
    'pinwheel': { searchName: 'M101', displayName: 'Pinwheel Galaxy (M101)' },
    'pinwheel galaxy': { searchName: 'M101', displayName: 'Pinwheel Galaxy (M101)' },
    
    // Triangulum
    'triangulum': { searchName: 'M33', displayName: 'Triangulum Galaxy (M33)' },
    'triangulum galaxy': { searchName: 'M33', displayName: 'Triangulum Galaxy (M33)' },
    
    // Sombrero
    'sombrero': { searchName: 'M104', displayName: 'Sombrero Galaxy (M104)' },
    'sombrero galaxy': { searchName: 'M104', displayName: 'Sombrero Galaxy (M104)' },
    
    // Large/Small Magellanic Clouds
    'large magellanic cloud': {
      searchName: 'LMC',
      displayName: 'Large Magellanic Cloud',
      coordinates: { ra: 80.9, dec: -69.8 }
    },
    'lmc': {
      searchName: 'LMC',
      displayName: 'Large Magellanic Cloud',
      coordinates: { ra: 80.9, dec: -69.8 }
    },
    'small magellanic cloud': {
      searchName: 'SMC',
      displayName: 'Small Magellanic Cloud',
      coordinates: { ra: 13.2, dec: -72.8 }
    },
    'smc': {
      searchName: 'SMC',
      displayName: 'Small Magellanic Cloud',
      coordinates: { ra: 13.2, dec: -72.8 }
    }
  };
  
  // Check for direct mapping
  if (galaxyMappings[inputLower]) {
    return galaxyMappings[inputLower];
  }
  
  // Check for coordinate input
  const coords = parseCoordinates(input);
  if (coords) {
    return {
      searchName: `${coords.ra} ${coords.dec}`,
      displayName: `Coordinates (${coords.ra}°, ${coords.dec}°)`,
      coordinates: coords
    };
  }
  
  // Default: use input as-is for Aladin resolution
  return {
    searchName: input,
    displayName: input
  };
};

/**
 * Get search suggestions based on input
 * @param {string} input - The input string
 * @returns {Array} - Array of suggestion strings
 */
const getSuggestions = (input) => {
  const inputLower = input.toLowerCase();
  const suggestions = [];
  
  // Common galaxy names
  const commonNames = [
    'Andromeda', 'M31', 'M51', 'M101', 'M104', 'M33',
    'Milky Way', 'Whirlpool Galaxy', 'Pinwheel Galaxy',
    'Sombrero Galaxy', 'Triangulum Galaxy',
    'Large Magellanic Cloud', 'Small Magellanic Cloud'
  ];
  
  // NGC objects
  for (let i = 1; i <= 100; i++) {
    suggestions.push(`NGC ${i}`);
  }
  
  // Filter suggestions based on input
  return [...commonNames, ...suggestions]
    .filter(name => name.toLowerCase().includes(inputLower))
    .slice(0, 10); // Limit to 10 suggestions
};

/**
 * Handle case when galaxy is not found
 * @param {string} input - The original input
 */
const handleGalaxyNotFound = (input) => {
  console.log(`Galaxy not found: ${input}`);
  
  // Update status with suggestions
  const statusElement = document.getElementById('current-status');
  if (statusElement) {
    const suggestions = getSuggestions(input);
    if (suggestions.length > 0) {
      statusElement.textContent = `"${input}" not found. Try: ${suggestions.slice(0, 3).join(', ')}`;
    } else {
      statusElement.textContent = `"${input}" not found. Try NGC objects like "NGC 7025" or galaxy names like "Andromeda"`;
    }
  }
};

/**
 * Load astronomical catalogs for better object resolution
 * @param {Object} aladin - The Aladin Lite instance
 */
const loadAstronomicalCatalogs = (aladin) => {
  try {
    // Add some basic catalogs for better object resolution
    const catalogs = [
      'I/239/hip_main', // Hipparcos catalog
      'VII/118/ngc2000', // NGC 2000.0 catalog
      'I/280B/ascc', // All-sky Compiled Catalogue
    ];
    
    catalogs.forEach(catalogId => {
      try {
        aladin.addCatalog(aladin.createCatalogFromVizieR(catalogId, {maxNbSources: 1000}));
        console.log(`Loaded catalog: ${catalogId}`);
      } catch (error) {
        console.warn(`Failed to load catalog ${catalogId}:`, error);
      }
    });
  } catch (error) {
    console.warn('Error loading astronomical catalogs:', error);
  }
};

export default Controls; 