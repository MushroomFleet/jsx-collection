import React, { useState, useEffect, useRef } from 'react';

const RPSLSStatsComponent = () => {
  // Game rules: what each element beats
  const BEATS = {
    rock: ['scissors', 'lizard'],
    paper: ['rock', 'spock'],
    scissors: ['paper', 'lizard'],
    lizard: ['paper', 'spock'],
    spock: ['rock', 'scissors']
  };

  // What beats each element
  const BEATEN_BY = {
    rock: ['paper', 'spock'],
    paper: ['scissors', 'lizard'],
    scissors: ['rock', 'spock'],
    lizard: ['rock', 'scissors'],
    spock: ['paper', 'lizard']
  };

  const ELEMENTS = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
  const TOTAL_POINTS = 500;
  const MAX_PER_STAT = 150;
  const MIN_PER_STAT = 20;

  // Initialize with balanced stats
  const [stats, setStats] = useState({
    rock: 100,
    paper: 100,
    scissors: 100,
    lizard: 100,
    spock: 100
  });

  const [dragging, setDragging] = useState(null);
  const canvasRef = useRef(null);

  // Adjust stats based on RPSLS rules
  const adjustStats = (element, newValue) => {
    const delta = newValue - stats[element];
    if (delta === 0) return;

    const newStats = { ...stats, [element]: newValue };
    
    // Calculate how much we need to redistribute
    const elementsToAdjust = [...BEATS[element], ...BEATEN_BY[element]];
    const adjustmentPerElement = -delta / elementsToAdjust.length;

    // Apply adjustments to related elements
    elementsToAdjust.forEach(el => {
      let adjusted = newStats[el] + adjustmentPerElement;
      adjusted = Math.max(MIN_PER_STAT, Math.min(MAX_PER_STAT, adjusted));
      newStats[el] = adjusted;
    });

    // Normalize to maintain total
    const currentTotal = Object.values(newStats).reduce((sum, val) => sum + val, 0);
    const normalizationFactor = TOTAL_POINTS / currentTotal;
    
    Object.keys(newStats).forEach(key => {
      newStats[key] = Math.max(MIN_PER_STAT, Math.min(MAX_PER_STAT, newStats[key] * normalizationFactor));
    });

    setStats(newStats);
  };

  // Draw pentagon radar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw concentric pentagons (grid)
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      ctx.beginPath();
      const levelRadius = (radius / levels) * i;
      
      for (let j = 0; j <= 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw radial lines
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw stat polygon
    ctx.beginPath();
    ELEMENTS.forEach((element, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const statRadius = (stats[element] / MAX_PER_STAT) * radius;
      const x = centerX + statRadius * Math.cos(angle);
      const y = centerY + statRadius * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 0, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw stat points
    ELEMENTS.forEach((element, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const statRadius = (stats[element] / MAX_PER_STAT) * radius;
      const x = centerX + statRadius * Math.cos(angle);
      const y = centerY + statRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw labels
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ELEMENTS.forEach((element, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const labelRadius = radius + 40;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.fillText(element.toUpperCase(), x, y);
      ctx.shadowBlur = 0;
    });

  }, [stats]);

  const getElementColor = (element) => {
    const colors = {
      rock: '#ff6b35',
      paper: '#f7f7f2',
      scissors: '#4ecdc4',
      lizard: '#95e06c',
      spock: '#6c5ce7'
    };
    return colors[element];
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '"Orbitron", "Courier New", monospace',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
      borderRadius: '20px',
      boxShadow: '0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 60px rgba(255, 0, 255, 0.1)',
      border: '2px solid rgba(0, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        pointerEvents: 'none',
        zIndex: 10
      }} />

      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        color: '#00ffff',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '4px',
        marginBottom: '10px',
        textShadow: '0 0 20px #00ffff, 0 0 40px #ff00ff',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        RPSLS Combat Matrix
      </h1>

      <p style={{
        textAlign: 'center',
        color: '#ff00ff',
        fontSize: '0.9rem',
        marginBottom: '30px',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        Total Power: {Math.round(Object.values(stats).reduce((a, b) => a + b, 0))} / {TOTAL_POINTS}
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{
            maxWidth: '100%',
            height: 'auto',
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))'
          }}
        />

        {/* Sliders */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '25px'
        }}>
          {ELEMENTS.map((element) => (
            <div key={element} style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${getElementColor(element)}`,
              boxShadow: `0 0 15px ${getElementColor(element)}40`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label style={{
                  color: getElementColor(element),
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textShadow: `0 0 10px ${getElementColor(element)}`
                }}>
                  {element}
                </label>
                <span style={{
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  minWidth: '60px',
                  textAlign: 'right',
                  padding: '4px 12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {Math.round(stats[element])}
                </span>
              </div>
              
              <input
                type="range"
                min={MIN_PER_STAT}
                max={MAX_PER_STAT}
                value={stats[element]}
                onChange={(e) => adjustStats(element, parseFloat(e.target.value))}
                onMouseDown={() => setDragging(element)}
                onMouseUp={() => setDragging(null)}
                onTouchStart={() => setDragging(element)}
                onTouchEnd={() => setDragging(null)}
                style={{
                  width: '100%',
                  height: '8px',
                  background: `linear-gradient(to right, 
                    ${getElementColor(element)} 0%, 
                    ${getElementColor(element)} ${((stats[element] - MIN_PER_STAT) / (MAX_PER_STAT - MIN_PER_STAT)) * 100}%, 
                    rgba(255, 255, 255, 0.1) ${((stats[element] - MIN_PER_STAT) / (MAX_PER_STAT - MIN_PER_STAT)) * 100}%, 
                    rgba(255, 255, 255, 0.1) 100%)`,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              
              <div style={{
                marginTop: '10px',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: '#ff6b6b' }}>
                  Beats: {BEATS[element].map(e => e.toUpperCase()).join(', ')}
                </span>
                <span style={{ color: '#6bcf7f' }}>
                  Weak to: {BEATEN_BY[element].map(e => e.toUpperCase()).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Panel */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.85rem',
          lineHeight: '1.6'
        }}>
          <h3 style={{
            color: '#00ffff',
            marginBottom: '10px',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            ⚡ System Behavior
          </h3>
          <p>
            Adjusting a stat automatically rebalances related dimensions based on RPSLS rules. 
            Increasing a stat reduces what it beats and what beats it maintains equilibrium. 
            Total combat power remains constant at {TOTAL_POINTS} units.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 0 15px #00ffff, 0 0 30px #ff00ff;
          border: 2px solid #00ffff;
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 0 15px #00ffff, 0 0 30px #ff00ff;
          border: 2px solid #00ffff;
          transition: all 0.2s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        }
      `}</style>
    </div>
  );
};

export default RPSLSStatsComponent;
