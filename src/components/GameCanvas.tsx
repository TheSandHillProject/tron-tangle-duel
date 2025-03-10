
import React, { useRef, useEffect } from 'react';
import { GameState, Position } from '@/utils/gameUtils';

interface GameCanvasProps {
  gameState: GameState;
  canvasWidth: number;
  canvasHeight: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, canvasWidth, canvasHeight }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Draw game on canvas
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { players, gridSize, cellSize, tokens, bullets, purpleBullet, hydroTrons, gravitron, gravitronActive } = gameState;
    
    // Clear canvas with background color
    const backgroundColor = gravitronActive ? '#000000' : '#0B1622';
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add red glow effect around the edges if GraviTron is active
    if (gravitronActive) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 
        Math.min(canvas.width, canvas.height) * 0.2, 
        canvas.width / 2, canvas.height / 2, 
        Math.min(canvas.width, canvas.height) * 0.8
      );
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#330000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw grid
    ctx.strokeStyle = gravitronActive ? 'rgba(80, 20, 20, 0.3)' : 'rgba(26, 42, 58, 0.3)';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let x = 0; x <= gridSize.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, gridSize.height * cellSize);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= gridSize.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(gridSize.width * cellSize, y * cellSize);
      ctx.stroke();
    }
    
    // Draw tokens
    tokens.forEach(token => {
      if (token.collected) return;
      
      // Draw token
      ctx.fillStyle = '#FFFF00';
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 10;
      
      // Draw circular token
      ctx.beginPath();
      ctx.arc(
        token.position.x * cellSize + cellSize / 2,
        token.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw purple bullet if it exists
    if (purpleBullet && !purpleBullet.collected) {
      ctx.fillStyle = '#BB00FF'; // Purple color
      ctx.shadowColor = '#BB00FF';
      ctx.shadowBlur = 15;
      
      // Draw circular purple bullet (slightly larger than normal tokens)
      ctx.beginPath();
      ctx.arc(
        purpleBullet.position.x * cellSize + cellSize / 2,
        purpleBullet.position.y * cellSize + cellSize / 2,
        cellSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add a pulsing effect
      ctx.strokeStyle = '#BB00FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        purpleBullet.position.x * cellSize + cellSize / 2,
        purpleBullet.position.y * cellSize + cellSize / 2,
        cellSize / 2 + 2 + Math.sin(Date.now() / 200) * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Draw HydroTron tokens
    hydroTrons.forEach(hydroTron => {
      if (hydroTron.collected) return;
      
      const hydroTronOrangeColor = '#FF9900'; // Changed to the themed orange color
      
      ctx.fillStyle = hydroTronOrangeColor; // Changed from green to orange
      ctx.shadowColor = hydroTronOrangeColor;
      ctx.shadowBlur = 15;
      
      // Draw circular HydroTron token
      ctx.beginPath();
      ctx.arc(
        hydroTron.position.x * cellSize + cellSize / 2,
        hydroTron.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add a pulsing effect with an orange glow
      ctx.strokeStyle = hydroTronOrangeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        hydroTron.position.x * cellSize + cellSize / 2,
        hydroTron.position.y * cellSize + cellSize / 2,
        cellSize / 2 + 3 + Math.sin(Date.now() / 150) * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });
    
    // Draw GraviTron token if it exists
    if (gravitron && !gravitron.collected) {
      const gravitronRedColor = '#ea384c'; // Glowing red color
      
      ctx.fillStyle = '#000000'; // Black center
      ctx.shadowColor = gravitronRedColor;
      ctx.shadowBlur = 20;
      
      // Draw circular GraviTron token (larger than other tokens)
      ctx.beginPath();
      ctx.arc(
        gravitron.position.x * cellSize + cellSize / 2,
        gravitron.position.y * cellSize + cellSize / 2,
        cellSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add a pulsing red outline
      ctx.strokeStyle = gravitronRedColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        gravitron.position.x * cellSize + cellSize / 2,
        gravitron.position.y * cellSize + cellSize / 2,
        cellSize / 2 + 4 + Math.sin(Date.now() / 100) * 3,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      
      // Add an inner red ring
      ctx.beginPath();
      ctx.arc(
        gravitron.position.x * cellSize + cellSize / 2,
        gravitron.position.y * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = gravitronRedColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw player trails
    players.forEach(player => {
      // Set trail color based on player and GraviTron state
      if (player.id === 1) {
        ctx.fillStyle = gravitronActive ? '#ea384c' : '#0CD0FF';
        ctx.shadowColor = gravitronActive ? '#ea384c' : '#0CD0FF';
      } else {
        ctx.fillStyle = '#FF9900';
        ctx.shadowColor = '#FF9900';
      }
      
      ctx.shadowBlur = 5;
      
      // Draw trail
      player.trail.forEach(pos => {
        ctx.fillRect(
          pos.x * cellSize + 1, 
          pos.y * cellSize + 1, 
          cellSize - 2, 
          cellSize - 2
        );
      });
      
      // Draw current position (head) if player is alive
      if (player.isAlive) {
        // Make head slightly brighter
        if (player.id === 1) {
          ctx.fillStyle = gravitronActive ? '#ff5f70' : '#4FDFFF';
          ctx.shadowColor = gravitronActive ? '#ff5f70' : '#4FDFFF';
        } else {
          ctx.fillStyle = '#FFBB4D';
          ctx.shadowColor = '#FFBB4D';
        }
        
        ctx.shadowBlur = 10;
        
        ctx.fillRect(
          player.position.x * cellSize, 
          player.position.y * cellSize, 
          cellSize, 
          cellSize
        );
      }
    });
    
    // Draw bullets
    bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      // Set bullet color based on player and GraviTron state
      if (bullet.playerId === 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = gravitronActive ? '#ea384c' : '#0CD0FF';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF9900';
      }
      
      ctx.shadowBlur = 15;
      
      // Draw circular bullet
      ctx.beginPath();
      ctx.arc(
        bullet.position.x * cellSize + cellSize / 2,
        bullet.position.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Effect to draw game
  useEffect(() => {
    drawGame();
  }, [gameState]);
  
  return (
    <canvas 
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="rounded"
    />
  );
};

export default GameCanvas;
