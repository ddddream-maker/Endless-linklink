
import React, { useMemo } from 'react';

interface MonsterProps {
  id: string;
  size: number;
}

const Monster: React.FC<MonsterProps> = ({ id, size }) => {
  // Extract numeric index from ID (e.g., "mon_5" -> 5)
  const index = useMemo(() => {
    const match = id.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  }, [id]);

  // 16 Unique Designs
  // We cycle through them, but change colors/variants for the next cycle
  const typeIndex = index % 16;
  const cycle = Math.floor(index / 16);

  // SVG Helper: 100x100 ViewBox
  const renderVehicle = () => {
    switch (typeIndex) {
      // 1. Lamborghini / Supercar (Side View)
      // Wedge shape, very low profile.
      case 0: 
        const carColor = cycle % 3 === 0 ? '#facc15' : cycle % 3 === 1 ? '#ef4444' : '#f97316'; // Yellow / Red / Orange
        return (
          <g>
            <title>Supercar</title>
            {/* Shadow */}
            <ellipse cx="50" cy="85" rx="45" ry="5" fill="rgba(0,0,0,0.2)" />
            {/* Body */}
            <path d="M5,75 L15,55 L40,52 L50,40 L80,40 L95,55 L98,75 Z" fill={carColor} stroke="#1e293b" strokeWidth="2" />
            {/* Cabin */}
            <path d="M42,52 L52,42 L78,42 L85,55 L42,55 Z" fill="#1e293b" /> 
            {/* Spoiler */}
            <path d="M5,60 L2,50 L15,52 L12,62 Z" fill="#1e293b" />
            {/* Side Intake */}
            <path d="M55,55 L70,55 L65,70 Z" fill="#000" opacity="0.3" />
            {/* Wheels */}
            <circle cx="28" cy="75" r="10" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="28" cy="75" r="4" fill="#eab308" />
            <circle cx="80" cy="75" r="11" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="80" cy="75" r="4" fill="#eab308" />
          </g>
        );

      // 2. Raptor / Stealth Fighter (Top View)
      // Diamond wings, twin tail.
      case 1:
        return (
          <g transform="translate(50,50) scale(0.9) translate(-50,-50)">
            <title>Stealth Fighter</title>
            {/* Shadow */}
            <path d="M50,95 L20,70 L20,40 L50,10 L80,40 L80,70 Z" fill="rgba(0,0,0,0.1)" transform="translate(5,5)" />
            {/* Main Wing (Diamond) */}
            <path d="M50,10 L25,50 L10,80 L50,70 L90,80 L75,50 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            {/* Fuselage Spine */}
            <path d="M50,10 L45,50 L50,90 L55,50 Z" fill="#334155" />
            {/* Cockpit */}
            <path d="M50,30 L47,45 L50,50 L53,45 Z" fill="#fbbf24" />
            {/* Tail Fins */}
            <path d="M40,75 L30,95 L45,90 Z" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
            <path d="M60,75 L70,95 L55,90 Z" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
            {/* Engine Glow */}
            <circle cx="45" cy="90" r="2" fill="#ef4444" />
            <circle cx="55" cy="90" r="2" fill="#ef4444" />
          </g>
        );

      // 3. Jiefang Truck (Side View)
      // Classic hood, vertical grille, cargo bed.
      case 2:
        return (
          <g>
            <title>Jiefang Truck</title>
            {/* Shadow */}
            <ellipse cx="50" cy="85" rx="45" ry="5" fill="rgba(0,0,0,0.2)" />
            {/* Cargo Bed */}
            <rect x="35" y="35" width="60" height="30" fill="#3f6212" stroke="#1e293b" strokeWidth="2" /> {/* Army Green */}
            {/* Canvas Texture Lines */}
            <line x1="45" y1="35" x2="45" y2="65" stroke="#1e293b" strokeWidth="1" opacity="0.3"/>
            <line x1="65" y1="35" x2="65" y2="65" stroke="#1e293b" strokeWidth="1" opacity="0.3"/>
            <line x1="85" y1="35" x2="85" y2="65" stroke="#1e293b" strokeWidth="1" opacity="0.3"/>
            
            {/* Cab */}
            <path d="M5,65 L5,45 L15,35 L35,35 L35,65 Z" fill="#4d7c0f" stroke="#1e293b" strokeWidth="2" />
            {/* Window */}
            <rect x="15" y="40" width="15" height="12" fill="#a7f3d0" stroke="#1e293b" strokeWidth="1"/>
            {/* Fender */}
            <path d="M5,65 Q15,55 25,65" fill="none" stroke="#1e293b" strokeWidth="3" />
            {/* Wheels */}
            <circle cx="15" cy="75" r="10" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="15" cy="75" r="3" fill="#525252" />
            <circle cx="60" cy="75" r="10" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="60" cy="75" r="3" fill="#525252" />
            <circle cx="80" cy="75" r="10" fill="#171717" stroke="#333" strokeWidth="2" />
            <circle cx="80" cy="75" r="3" fill="#525252" />
          </g>
        );

      // 4. Battle Tank (Side View)
      case 3:
        return (
           <g>
             <title>Tank</title>
             {/* Shadow */}
             <ellipse cx="50" cy="85" rx="45" ry="5" fill="rgba(0,0,0,0.2)" />
             {/* Tracks */}
             <path d="M10,65 L90,65 L95,75 L90,85 L10,85 L5,75 Z" fill="#374151" stroke="#000" strokeWidth="2" />
             <line x1="15" y1="75" x2="85" y2="75" stroke="#525252" strokeWidth="1" strokeDasharray="5,3" />
             <circle cx="15" cy="75" r="4" fill="#000"/>
             <circle cx="30" cy="75" r="4" fill="#000"/>
             <circle cx="45" cy="75" r="4" fill="#000"/>
             <circle cx="60" cy="75" r="4" fill="#000"/>
             <circle cx="75" cy="75" r="4" fill="#000"/>
             <circle cx="85" cy="70" r="3" fill="#000"/>

             {/* Main Body */}
             <path d="M15,65 L85,65 L80,50 L20,50 Z" fill="#57534e" stroke="#1e293b" strokeWidth="2"/>
             {/* Turret */}
             <path d="M30,50 L70,50 L65,35 L35,35 Z" fill="#44403c" stroke="#1e293b" strokeWidth="2"/>
             {/* Barrel */}
             <rect x="65" y="38" width="30" height="6" fill="#292524" stroke="#000" strokeWidth="1"/>
             <rect x="92" y="36" width="4" height="10" fill="#000"/>
             {/* Hatch */}
             <ellipse cx="50" cy="35" rx="8" ry="3" fill="#292524"/>
           </g>
        );

      // 5. Formula 1 Car (Top View)
      case 4:
        return (
          <g transform="translate(50,50) scale(0.9) translate(-50,-50)">
            <title>Formula 1</title>
             {/* Shadow */}
             <rect x="25" y="15" width="50" height="70" fill="rgba(0,0,0,0.1)" rx="10"/>
             {/* Rear Wing */}
             <rect x="25" y="80" width="50" height="10" fill="#dc2626" stroke="#000" strokeWidth="1"/>
             {/* Front Wing */}
             <path d="M20,15 L80,15 L70,25 L30,25 Z" fill="#dc2626" stroke="#000" strokeWidth="1"/>
             {/* Body */}
             <path d="M45,10 L55,10 L60,30 L65,50 L60,80 L40,80 L35,50 L40,30 Z" fill="#dc2626" stroke="#000" strokeWidth="1"/>
             {/* Cockpit */}
             <circle cx="50" cy="50" r="5" fill="#1e293b"/>
             <rect x="42" y="45" width="16" height="12" fill="none" stroke="#000" strokeWidth="1" rx="2"/>
             {/* Wheels */}
             <rect x="10" y="25" width="15" height="25" fill="#171717" rx="4"/>
             <rect x="75" y="25" width="15" height="25" fill="#171717" rx="4"/>
             <rect x="10" y="65" width="15" height="25" fill="#171717" rx="4"/>
             <rect x="75" y="65" width="15" height="25" fill="#171717" rx="4"/>
          </g>
        );

      // 6. Excavator (Side View)
      case 5:
        return (
          <g>
            <title>Excavator</title>
            {/* Tracks */}
            <path d="M20,75 L80,75 L85,85 L15,85 Z" fill="#3f3f46" stroke="#000" strokeWidth="1"/>
            {/* Body */}
            <rect x="30" y="55" width="40" height="20" fill="#facc15" stroke="#000" strokeWidth="1"/>
            {/* Cab */}
            <path d="M35,55 L35,35 L55,35 L55,55 Z" fill="#eab308" stroke="#000" strokeWidth="1"/>
            <rect x="37" y="38" width="16" height="14" fill="#bae6fd"/>
            {/* Arm */}
            <path d="M65,60 L90,40 L85,35 L60,55 Z" fill="#facc15" stroke="#000" strokeWidth="1"/>
            <path d="M90,40 L95,65 L88,68 L85,42 Z" fill="#facc15" stroke="#000" strokeWidth="1"/>
            {/* Bucket */}
            <path d="M85,65 L95,85 L80,80 Z" fill="#171717"/>
          </g>
        );
      
      // 7. Jumbo Jet (Top View)
      case 6:
        return (
          <g transform="translate(50,50) scale(0.9) translate(-50,-50)">
             <title>Jumbo Jet</title>
             {/* Wings */}
             <path d="M50,45 L5,65 L10,75 L50,55 L90,75 L95,65 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
             {/* Fuselage */}
             <ellipse cx="50" cy="50" rx="10" ry="45" fill="#fff" stroke="#475569" strokeWidth="1"/>
             {/* Tail */}
             <path d="M50,80 L35,95 L65,95 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
             {/* Engines */}
             <rect x="20" y="60" width="8" height="12" fill="#ef4444" rx="2"/>
             <rect x="72" y="60" width="8" height="12" fill="#ef4444" rx="2"/>
             {/* Cockpit Windows */}
             <path d="M47,15 Q50,12 53,15" fill="none" stroke="#38bdf8" strokeWidth="2"/>
          </g>
        );

      // 8. Attack Helicopter (Side View)
      case 7:
        return (
          <g>
            <title>Attack Helicopter</title>
            {/* Rotors */}
            <ellipse cx="50" cy="20" rx="45" ry="3" fill="#171717" opacity="0.5"/>
            <rect x="48" y="15" width="4" height="15" fill="#4b5563"/>
            {/* Body */}
            <path d="M25,30 L70,30 L80,45 L95,40 L95,50 L75,55 L30,55 L20,45 Z" fill="#064e3b" stroke="#000" strokeWidth="1"/>
            {/* Cockpit */}
            <path d="M25,30 L45,30 L45,45 L20,45 Z" fill="#38bdf8" stroke="#000" strokeWidth="1"/>
            {/* Tail Rotor */}
            <circle cx="95" cy="45" r="8" fill="none" stroke="#171717" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
            {/* Skids */}
            <path d="M35,55 L35,65 L70,65" fill="none" stroke="#171717" strokeWidth="2"/>
            <path d="M50,55 L50,65" fill="none" stroke="#171717" strokeWidth="2"/>
          </g>
        );
      
      // 9. Monster Truck
      case 8:
        return (
          <g>
            <title>Monster Truck</title>
            {/* Suspension */}
            <path d="M25,60 L25,75 M75,60 L75,75" stroke="#94a3b8" strokeWidth="3"/>
            {/* Body (Pickup) */}
            <path d="M10,60 L90,60 L90,45 L65,45 L60,35 L30,35 L25,45 L10,45 Z" fill="#7c3aed" stroke="#000" strokeWidth="2"/>
            {/* Window */}
            <path d="M32,38 L58,38 L62,45 L28,45 Z" fill="#c4b5fd"/>
            {/* Giant Wheels */}
            <circle cx="25" cy="75" r="14" fill="#171717" stroke="#333" strokeWidth="3"/>
            <circle cx="25" cy="75" r="5" fill="#94a3b8"/>
            <circle cx="75" cy="75" r="14" fill="#171717" stroke="#333" strokeWidth="3"/>
            <circle cx="75" cy="75" r="5" fill="#94a3b8"/>
            {/* Flames */}
            <path d="M30,50 L50,50 L40,58 Z" fill="#fbbf24"/>
          </g>
        );

      // 10. School Bus
      case 9:
        return (
          <g>
            <title>School Bus</title>
            {/* Body */}
            <rect x="10" y="35" width="80" height="35" fill="#fbbf24" stroke="#000" strokeWidth="1" rx="2"/>
            {/* Hood */}
            <rect x="85" y="50" width="10" height="20" fill="#fbbf24" stroke="#000" strokeWidth="1"/>
            {/* Windows */}
            <rect x="15" y="40" width="10" height="10" fill="#bae6fd" stroke="#000"/>
            <rect x="28" y="40" width="10" height="10" fill="#bae6fd" stroke="#000"/>
            <rect x="41" y="40" width="10" height="10" fill="#bae6fd" stroke="#000"/>
            <rect x="54" y="40" width="10" height="10" fill="#bae6fd" stroke="#000"/>
            <rect x="67" y="40" width="10" height="10" fill="#bae6fd" stroke="#000"/>
            {/* Stripe */}
            <line x1="10" y1="58" x2="90" y2="58" stroke="#000" strokeWidth="2"/>
            {/* Wheels */}
            <circle cx="25" cy="70" r="8" fill="#171717"/>
            <circle cx="75" cy="70" r="8" fill="#171717"/>
          </g>
        );

      // 11. Police Cruiser
      case 10:
        return (
          <g>
            <title>Police Cruiser</title>
            {/* Body */}
            <path d="M5,65 L95,65 L90,50 L70,48 L65,35 L35,35 L30,48 L10,50 Z" fill="#fff" stroke="#000" strokeWidth="1"/>
            {/* Doors (Black) */}
            <path d="M32,48 L68,48 L68,64 L32,64 Z" fill="#000"/>
            {/* Windows */}
            <path d="M37,38 L63,38 L68,48 L32,48 Z" fill="#bae6fd"/>
            {/* Lights */}
            <rect x="45" y="30" width="4" height="5" fill="#ef4444"/>
            <rect x="51" y="30" width="4" height="5" fill="#3b82f6"/>
            {/* Wheels */}
            <circle cx="25" cy="65" r="8" fill="#171717"/>
            <circle cx="25" cy="65" r="3" fill="#94a3b8"/>
            <circle cx="75" cy="65" r="8" fill="#171717"/>
            <circle cx="75" cy="65" r="3" fill="#94a3b8"/>
          </g>
        );

      // 12. Rocket
      case 11:
        return (
          <g>
             <title>Rocket</title>
             {/* Fins */}
             <path d="M30,70 L20,90 L40,85 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1"/>
             <path d="M70,70 L80,90 L60,85 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1"/>
             {/* Body */}
             <ellipse cx="50" cy="50" rx="15" ry="40" fill="#f1f5f9" stroke="#334155" strokeWidth="2"/>
             {/* Window */}
             <circle cx="50" cy="40" r="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="1"/>
             {/* Flame */}
             <path d="M45,90 L55,90 L50,100 Z" fill="#f59e0b" className="animate-pulse"/>
          </g>
        );

      // 13. Submarine
      case 12:
        return (
          <g>
            <title>Submarine</title>
            {/* Propeller */}
            <path d="M5,50 L10,40 L10,60 Z" fill="#f59e0b"/>
            {/* Body */}
            <ellipse cx="55" cy="50" rx="40" ry="15" fill="#1e3a8a" stroke="#172554" strokeWidth="2"/>
            {/* Conning Tower */}
            <rect x="45" y="25" width="15" height="15" fill="#1e3a8a" stroke="#172554" strokeWidth="2"/>
            {/* Periscope */}
            <path d="M52,25 L52,15 L60,15" fill="none" stroke="#64748b" strokeWidth="3"/>
            {/* Windows */}
            <circle cx="35" cy="50" r="3" fill="#60a5fa"/>
            <circle cx="55" cy="50" r="3" fill="#60a5fa"/>
            <circle cx="75" cy="50" r="3" fill="#60a5fa"/>
          </g>
        );
      
      // 14. Locomotive (Steam)
      case 13:
        return (
           <g>
             <title>Locomotive</title>
             {/* Cab */}
             <rect x="60" y="30" width="25" height="35" fill="#b91c1c" stroke="#000" strokeWidth="1"/>
             <rect x="65" y="35" width="15" height="10" fill="#fca5a5"/>
             {/* Boiler */}
             <rect x="15" y="40" width="45" height="25" fill="#000" stroke="#333" strokeWidth="1"/>
             {/* Funnel */}
             <path d="M25,40 L22,25 L33,25 L30,40 Z" fill="#000"/>
             {/* Cowcatcher */}
             <path d="M15,65 L5,65 L15,50 Z" fill="#666"/>
             {/* Wheels */}
             <circle cx="30" cy="70" r="8" fill="#b91c1c" stroke="#000" strokeWidth="1"/>
             <circle cx="50" cy="70" r="8" fill="#b91c1c" stroke="#000" strokeWidth="1"/>
             <circle cx="75" cy="70" r="10" fill="#b91c1c" stroke="#000" strokeWidth="1"/>
             {/* Rod */}
             <line x1="30" y1="70" x2="75" y2="70" stroke="#9ca3af" strokeWidth="2"/>
           </g>
        );
      
      // 15. Biplane
      case 14:
        return (
          <g>
            <title>Biplane</title>
            {/* Wings */}
            <rect x="20" y="30" width="60" height="5" fill="#f97316" rx="2"/>
            <rect x="25" y="55" width="50" height="5" fill="#f97316" rx="2"/>
            {/* Struts */}
            <line x1="30" y1="35" x2="30" y2="55" stroke="#000" strokeWidth="1"/>
            <line x1="70" y1="35" x2="70" y2="55" stroke="#000" strokeWidth="1"/>
            {/* Body */}
            <ellipse cx="50" cy="45" rx="35" ry="10" fill="#fed7aa"/>
            {/* Tail */}
            <path d="M15,45 L5,35 L10,50 Z" fill="#f97316"/>
            {/* Propeller */}
            <ellipse cx="85" cy="45" rx="2" ry="15" fill="#9ca3af" opacity="0.6"/>
            {/* Wheels */}
            <circle cx="35" cy="65" r="4" fill="#000"/>
            <line x1="35" y1="65" x2="40" y2="55" stroke="#000" strokeWidth="1"/>
          </g>
        );

      // 16. Container Ship
      case 15:
        return (
          <g>
             <title>Container Ship</title>
             {/* Water */}
             <path d="M0,75 Q25,80 50,75 T100,75" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5"/>
             {/* Hull */}
             <path d="M10,60 L20,75 L80,75 L95,60 Z" fill="#be123c" stroke="#000" strokeWidth="1"/>
             {/* Bridge */}
             <rect x="70" y="45" width="15" height="15" fill="#fff" stroke="#000"/>
             <rect x="72" y="48" width="11" height="4" fill="#60a5fa"/>
             {/* Containers */}
             <rect x="25" y="50" width="12" height="10" fill="#f59e0b" stroke="#000" strokeWidth="0.5"/>
             <rect x="37" y="50" width="12" height="10" fill="#3b82f6" stroke="#000" strokeWidth="0.5"/>
             <rect x="49" y="50" width="12" height="10" fill="#10b981" stroke="#000" strokeWidth="0.5"/>
             <rect x="30" y="40" width="12" height="10" fill="#8b5cf6" stroke="#000" strokeWidth="0.5"/>
             <rect x="45" y="40" width="12" height="10" fill="#ef4444" stroke="#000" strokeWidth="0.5"/>
          </g>
        );

      default:
        return <rect x="10" y="10" width="80" height="80" fill="#ccc" />;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className="drop-shadow-sm transition-transform duration-200"
    >
      {renderVehicle()}
    </svg>
  );
};

export default React.memo(Monster);
