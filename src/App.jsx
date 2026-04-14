import { useEffect, useState } from 'react';

const stylesConfig = [
  { id: 'Cinematic', label: 'Cinematic', icon: '[C]' },
  { id: 'Anime', label: 'Anime', icon: '[A]' },
  { id: 'Cyberpunk', label: 'Cyberpunk', icon: '[N]' },
  { id: 'Realistic', label: 'Realistic', icon: '[R]' },
  { id: 'Oil Painting', label: 'Oil Painting', icon: '[O]' },
];

function GridOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,200,80,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,200,80,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }}
    />
  );
}

function ScanlineEffect() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }}
    />
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [charCount, setCharCount] = useState(0);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
    setCharCount(event.target.value.length);
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
    if (!apiKey) {
      setError('Missing Stability API key. Add VITE_STABILITY_API_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setImage(null);
    setError(null);
    setStatus('Sending to Stability AI...');

    try {
      const promptText = `${selectedStyle} style: ${prompt.trim()}, highly detailed, masterpiece, 4k`;
      const formData = new FormData();
      formData.append('prompt', promptText);
      formData.append('output_format', 'png');
      formData.append('aspect_ratio', '1:1');

      setStatus('Rendering your image...');

      const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/*',
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let message = 'Generation failed. Check your API key and credits.';

        if (contentType.includes('application/json')) {
          const result = await response.json();
          message = result.errors?.[0] || result.message || JSON.stringify(result);
        } else {
          const text = await response.text();
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error('No image returned from the Stability API.');
      }

      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Generation failed. Check your API key and network.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const theme = {
    bg: isLight ? '#f5f0e8' : '#111010',
    bgCard: isLight ? 'rgba(255,248,235,0.85)' : 'rgba(22,20,18,0.85)',
    bgCardBorder: isLight ? 'rgba(200,160,60,0.25)' : 'rgba(255,200,80,0.12)',
    bgInput: isLight ? 'rgba(255,252,242,0.9)' : 'rgba(18,16,14,0.9)',
    inputBorder: isLight ? 'rgba(180,140,50,0.4)' : 'rgba(255,200,80,0.18)',
    textPrimary: isLight ? '#1a1612' : '#f0e8d0',
    textSecondary: isLight ? '#6b5c3a' : '#a08c60',
    textMuted: isLight ? '#a08c60' : '#5a4e38',
    accent: '#e8a020',
    accentGlow: isLight ? 'rgba(232,160,32,0.2)' : 'rgba(232,160,32,0.25)',
    accentDim: isLight ? 'rgba(232,160,32,0.12)' : 'rgba(232,160,32,0.08)',
    chipActive: isLight ? '#fff8ee' : '#1e1a12',
    shellBg: isLight ? 'rgba(250,244,230,0.7)' : 'rgba(16,14,12,0.75)',
    shellBorder: isLight ? 'rgba(200,160,60,0.3)' : 'rgba(255,200,80,0.1)',
    blurBg1: isLight ? 'rgba(240,180,60,0.15)' : 'rgba(180,120,20,0.12)',
    blurBg2: isLight ? 'rgba(220,140,40,0.1)' : 'rgba(120,80,20,0.1)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100vh; width: 100%; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: ${theme.bg};
          transition: background 0.35s ease;
        }

        #root {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
          min-height: 100vh;
        }

        .blob-warm-1 {
          position: fixed; width: 700px; height: 700px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, ${theme.blurBg1} 0%, transparent 65%);
          filter: blur(90px); pointer-events: none; z-index: 0; border-radius: 50%;
        }
        .blob-warm-2 {
          position: fixed; width: 500px; height: 500px;
          bottom: -160px; right: -100px;
          background: radial-gradient(circle, ${theme.blurBg2} 0%, transparent 65%);
          filter: blur(80px); pointer-events: none; z-index: 0; border-radius: 50%;
        }

        .shell {
          position: relative; z-index: 2;
          width: 100%; max-width: 1160px;
          background: ${theme.shellBg};
          backdrop-filter: blur(28px);
          border-radius: 20px;
          border: 1px solid ${theme.shellBorder};
          padding: 1.5rem 2rem 2rem;
        }

        .navbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${theme.bgCardBorder};
        }

        .logo-wrap {
          display: flex; align-items: baseline; gap: 0.55rem;
        }
        .logo-ps {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: ${theme.accent};
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .logo-sep {
          width: 1px; height: 16px;
          background: ${theme.textMuted};
          align-self: center;
        }
        .logo-tagline {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${theme.textMuted};
        }

        .nav-right {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .status-tag {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          background: ${theme.accentDim};
          border: 1px solid ${theme.bgCardBorder};
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${theme.accent};
        }
        .status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: ${theme.accent};
          animation: pulse-dot 1.2s ease infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .theme-btn {
          width: 36px; height: 36px; border-radius: 6px;
          background: ${theme.bgCard};
          border: 1px solid ${theme.bgCardBorder};
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem;
          transition: border-color 0.2s;
          color: ${theme.textSecondary};
        }
        .theme-btn:hover { border-color: ${theme.accent}; }

        .meta-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .step-tag {
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${theme.textMuted};
        }
        .char-count {
          font-size: 0.62rem;
          font-weight: 500;
          color: ${theme.textMuted};
          letter-spacing: 0.04em;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }

        .card {
          background: ${theme.bgCard};
          border-radius: 12px;
          border: 1px solid ${theme.bgCardBorder};
          padding: 1.1rem;
          margin-bottom: 1rem;
        }
        .card:last-child { margin-bottom: 0; }

        .label {
          display: block;
          font-size: 0.57rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${theme.textMuted};
          margin-bottom: 0.75rem;
        }

        .prompt-area {
          width: 100%;
          min-height: 130px;
          background: ${theme.bgInput};
          border: 1px solid ${theme.inputBorder};
          border-radius: 8px;
          padding: 0.9rem;
          color: ${theme.textPrimary};
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 300;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
        }
        .prompt-area::placeholder { color: ${theme.textMuted}; }
        .prompt-area:focus { border-color: ${theme.accent}; box-shadow: 0 0 0 3px ${theme.accentDim}; }

        .style-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .style-chip {
          background: transparent;
          border: 1px solid ${theme.bgCardBorder};
          border-radius: 8px;
          padding: 0.6rem 0.2rem;
          cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; gap: 0.3rem;
          transition: all 0.18s;
          color: ${theme.textSecondary};
        }
        .style-chip:hover {
          border-color: ${theme.accent};
          background: ${theme.accentDim};
        }
        .style-chip.active {
          background: ${theme.chipActive};
          border-color: ${theme.accent};
          box-shadow: 0 0 0 1px ${theme.accent}22, 0 4px 12px ${theme.accentGlow};
          color: ${theme.textPrimary};
        }
        .chip-icon { font-size: 1rem; }
        .chip-name {
          font-size: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: inherit;
        }

        .gen-btn {
          width: 100%;
          padding: 0.88rem 1rem;
          background: linear-gradient(135deg, #e8a020 0%, #c07818 100%);
          border: none;
          border-radius: 8px;
          color: #0d0900;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .gen-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px ${theme.accentGlow};
        }
        .gen-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .canvas-pane {
          background: ${theme.bgCard};
          border-radius: 12px;
          border: 1px solid ${theme.bgCardBorder};
          aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }

        .idle-state {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.75rem;
        }
        .idle-cross {
          width: 36px; height: 36px; position: relative; opacity: 0.25;
        }
        .idle-cross::before, .idle-cross::after {
          content: '';
          position: absolute;
          background: ${theme.accent};
          border-radius: 2px;
        }
        .idle-cross::before { width: 2px; height: 100%; left: 50%; transform: translateX(-50%); }
        .idle-cross::after { height: 2px; width: 100%; top: 50%; transform: translateY(-50%); }
        .idle-text {
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${theme.textMuted};
        }

        .spinner-ring {
          width: 42px; height: 42px;
          border: 2px solid ${theme.bgCardBorder};
          border-top-color: ${theme.accent};
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .result-img {
          width: 100%; height: 100%;
          object-fit: cover;
          animation: reveal 0.5s ease;
        }
        @keyframes reveal {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }

        .download-row {
          margin-top: 0.6rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.5rem;
        }
        .download-link {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${theme.accent};
          text-decoration: none;
          padding: 0.32rem 0.7rem;
          border: 1px solid ${theme.accent}55;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .download-link:hover {
          background: ${theme.accentDim};
          border-color: ${theme.accent};
        }

        .error-tag {
          margin-top: 0.5rem;
          font-size: 0.65rem;
          color: #e05050;
          text-align: center;
          letter-spacing: 0.04em;
        }
      `}</style>

      <GridOverlay />
      <ScanlineEffect />
      <div className="blob-warm-1" />
      <div className="blob-warm-2" />

      <div className="shell">
        <nav className="navbar">
          <div className="logo-wrap">
            <span className="logo-ps">Prompt Studio</span>
            <div className="logo-sep" />
            <span className="logo-tagline">AI Image Synthesis</span>
          </div>
          <div className="nav-right">
            {loading && (
              <div className="status-tag">
                <div className="status-dot" />
                {status}
              </div>
            )}
            <button
              className="theme-btn"
              type="button"
              onClick={() => setIsLight((current) => !current)}
            >
              {isLight ? 'Moon' : 'Sun'}
            </button>
          </div>
        </nav>

        <div className="two-col">
          <div>
            <div className="card">
              <div className="meta-bar">
                <span className="step-tag">01 - Vision</span>
                <span className="char-count">{charCount} / 500</span>
              </div>
              <textarea
                className="prompt-area"
                placeholder="A futuristic Mumbai skyline at dusk, golden hour light..."
                value={prompt}
                onChange={handlePromptChange}
                maxLength={500}
              />
            </div>

            <div className="card">
              <span className="label">02 - Style</span>
              <div className="style-row">
                {stylesConfig.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`style-chip ${selectedStyle === style.id ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <span className="chip-icon">{style.icon}</span>
                    <span className="chip-name">{style.label}</span>
                  </button>
                ))}
              </div>
              <button
                className="gen-btn"
                type="button"
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
              >
                {loading ? 'Synthesizing...' : 'Generate Image'}
              </button>
              {error && <p className="error-tag">{error}</p>}
            </div>
          </div>

          <div>
            <div className="canvas-pane">
              {!image && !loading && (
                <div className="idle-state">
                  <div className="idle-cross" />
                  <span className="idle-text">Awaiting Prompt</span>
                </div>
              )}
              {loading && <div className="spinner-ring" />}
              {image && !loading && <img src={image} alt="Generated" className="result-img" />}
            </div>
            {image && !loading && (
              <div className="download-row">
                <a href={image} download="prompt-studio.png" className="download-link">
                  Export PNG
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
