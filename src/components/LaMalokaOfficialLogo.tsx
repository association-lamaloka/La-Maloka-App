import React from 'react';

interface LogoProps {
  className?: string;
  opacity?: number;
  showText?: boolean;
  withBackground?: boolean;
  monochrome?: boolean;
  color?: string;
  variant?: 'full' | 'emblem' | 'horizontal';
}

/**
 * Official SVG Logo of Association La Maloka
 * Accurately matching the official visual identity:
 * - Bright Chartreuse / Lime Green field (#95B208)
 * - Indigenous Maloka thatched shelter (#D8E28C / #C6D371)
 * - Two dancing ribbon silhouettes: Vibrant Red (#C51D24) & Olive Green (#557219)
 * - "la Maloka" calligraphy & "association" tracked lettering
 */
export const LaMalokaOfficialLogoSVG: React.FC<LogoProps> = ({
  className = 'w-full h-auto',
  opacity = 1,
  showText = true,
  withBackground = false,
  monochrome = false,
  color,
  variant = 'full',
}) => {
  const redColor = monochrome ? (color || 'currentColor') : '#C51D24';
  const greenColor = monochrome ? (color || 'currentColor') : '#557219';
  const hutColor = monochrome ? (color || 'currentColor') : '#D8E28C';
  const hutPillarsColor = monochrome ? (color || 'currentColor') : '#C9D677';
  const bgColor = '#95B208';

  // If emblem only requested
  const isEmblemOnly = variant === 'emblem' || !showText;

  return (
    <svg
      viewBox={withBackground ? "0 0 420 340" : (isEmblemOnly ? "0 0 320 230" : "0 0 380 300")}
      className={className}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft shadow for depth */}
        <filter id="malokaSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Optional Official Lime Green Background */}
      {withBackground && (
        <rect width="420" height="340" rx="28" fill={bgColor} />
      )}

      <g transform={withBackground ? "translate(30, 20)" : "translate(10, 5)"}>
        {/* ============================================================ */}
        {/* 1. THE MALOKA INDIGENOUS HUT (BACKGROUND ELEMENT)            */}
        {/* ============================================================ */}
        <g id="maloka-hut-structure" opacity="0.95">
          {/* Thatched Main Roof */}
          <path
            d="M 125 15
               C 150 10, 185 16, 215 32
               C 240 45, 275 75, 288 108
               C 292 118, 282 124, 255 128
               C 200 136, 110 138, 48 130
               C 25 126, 18 116, 32 98
               C 52 72, 85 35, 125 15 Z"
            fill={hutColor}
          />

          {/* Roof Ridge Curve Highlight */}
          <path
            d="M 42 122 Q 95 116 160 118 Q 220 116 268 122"
            stroke="#FEFFF0"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />

          {/* Wooden Structure Pillars */}
          {/* Pillar 1 (Leftmost wall) */}
          <path d="M 40 126 C 37 145, 36 170, 41 190 C 45 192, 53 189, 51 170 C 49 148, 51 130, 50 125 Z" fill={hutPillarsColor} />
          {/* Pillar 2 */}
          <path d="M 68 128 C 65 148, 64 172, 70 188 C 75 190, 83 186, 81 168 C 79 148, 80 130, 79 126 Z" fill={hutPillarsColor} />
          {/* Pillar 3 */}
          <path d="M 102 130 C 100 148, 99 168, 104 182 C 108 184, 115 180, 114 165 C 112 148, 114 132, 113 128 Z" fill={hutPillarsColor} />
          
          {/* Central Entrance / Porch Frame */}
          <path
            d="M 130 132 L 130 185 Q 165 178 198 185 L 198 132 Z"
            fill={hutColor}
            opacity="0.45"
          />
          {/* Pillar 4 (Entrance Left) */}
          <path d="M 132 132 C 130 148, 130 166, 134 180 C 138 182, 145 178, 143 164 C 141 148, 142 134, 141 130 Z" fill={hutPillarsColor} />
          {/* Pillar 5 (Entrance Right) */}
          <path d="M 168 132 C 166 148, 166 166, 170 180 C 174 182, 181 178, 179 164 C 177 148, 178 134, 177 130 Z" fill={hutPillarsColor} />
          {/* Pillar 6 (Rightmost) */}
          <path d="M 220 127 C 218 144, 217 162, 222 176 C 226 178, 233 174, 231 160 C 229 144, 231 130, 230 125 Z" fill={hutPillarsColor} />
        </g>

        {/* ============================================================ */}
        {/* 2. THE TWO DANCING SILHOUETTES (RED & OLIVE RIBBONS)         */}
        {/* ============================================================ */}
        <g id="maloka-dancers-ribbons" filter="url(#malokaSoftGlow)">
          
          {/* --- DANCER 1 (RED) --- */}
          {/* Red Head */}
          <circle cx="198" cy="42" r="14" fill={redColor} />

          {/* Red Dancer Spine & Sweeping Loop */}
          <path
            d="M 222 15
               C 232 5, 242 12, 236 28
               C 230 46, 218 64, 204 84
               C 188 106, 175 130, 180 156
               C 183 172, 192 184, 196 200
               C 186 194, 172 174, 168 150
               C 165 120, 182 92, 200 68
               C 214 48, 224 28, 215 15 Z"
            fill={redColor}
          />

          {/* Red Dancer Extended Right Leg Sweep */}
          <path
            d="M 180 156
               C 192 168, 225 182, 265 198
               C 288 206, 310 210, 322 212
               C 305 212, 278 206, 252 196
               C 218 182, 192 170, 180 156 Z"
            fill={redColor}
          />

          {/* --- DANCER 2 (OLIVE GREEN) --- */}
          {/* Green Head */}
          <circle cx="248" cy="46" r="14" fill={greenColor} />

          {/* Green Dancer Upper Arm Ribbon & Intertwined Flow */}
          <path
            d="M 230 10
               C 222 22, 226 40, 234 54
               C 246 72, 260 96, 256 125
               C 252 148, 236 174, 220 200
               C 208 220, 200 240, 204 250
               C 208 250, 218 230, 232 205
               C 250 172, 270 142, 270 110
               C 270 82, 252 56, 242 34
               C 234 18, 238 8, 230 10 Z"
            fill={greenColor}
          />

          {/* Green Dancer Hip/Arm Connection Loop */}
          <path
            d="M 234 54
               C 218 68, 212 86, 218 104
               C 226 116, 236 126, 244 136
               C 236 126, 226 114, 218 100
               C 212 82, 222 66, 234 54 Z"
            fill={greenColor}
            opacity="0.9"
          />
        </g>

        {/* ============================================================ */}
        {/* 3. TYPOGRAPHY: "la Maloka" & "a s s o c i a t i o n"          */}
        {/* ============================================================ */}
        {showText && !isEmblemOnly && (
          <g id="maloka-typography" transform="translate(10, 215)">
            
            {/* "la Maloka" Expressive Cursive Wordmark */}
            <text
              x="170"
              y="40"
              fontFamily="'Brush Script MT', 'Dancing Script', 'Caveat', 'Playfair Display', cursive, sans-serif"
              fontSize="68"
              fontStyle="italic"
              fontWeight="bold"
              fill={greenColor}
              textAnchor="middle"
              letterSpacing="-1"
            >
              <tspan fontSize="44" fontStyle="italic" dy="-10" dx="-4">la </tspan>
              <tspan fontSize="76" fontWeight="900">M</tspan>
              <tspan fontSize="60">aloka</tspan>
            </text>

            {/* Cursive Decorative Dot */}
            <ellipse cx="152" cy="-22" rx="4" ry="2.5" fill={greenColor} transform="rotate(-15 152 -22)" />

            {/* "a s s o c i a t i o n" Tracked Subtitle in Cuban Red */}
            <text
              x="170"
              y="74"
              fontFamily="'Plus Jakarta Sans', 'Inter', 'Montserrat', sans-serif"
              fontSize="20"
              fontWeight="800"
              fill={redColor}
              textAnchor="middle"
              letterSpacing="9"
            >
              association
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

/**
 * Official Logo Badge with official lime-green rounded card
 * Perfect for Headers, Hero sections, and Official Announcements
 */
export const LaMalokaLogoBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shadow?: boolean;
}> = ({
  size = 'md',
  className = '',
  shadow = true,
}) => {
  const sizeClasses = {
    sm: 'w-16 h-13',
    md: 'w-24 h-20 sm:w-28 sm:h-23',
    lg: 'w-36 h-29 sm:w-44 sm:h-35',
    xl: 'w-56 h-45 sm:w-64 sm:h-52',
  };

  return (
    <div className={`inline-block rounded-2xl overflow-hidden ${shadow ? 'shadow-lg shadow-lime-900/20' : ''} ${sizeClasses[size]} ${className}`}>
      <LaMalokaOfficialLogoSVG withBackground={true} className="w-full h-full object-contain" />
    </div>
  );
};

/**
 * Background Watermark Component (Fond d'eau / Arrière-plan filigrane)
 * Displays the official La Maloka logo in an unobtrusive, watermark style.
 */
export const LaMalokaWatermarkBackground: React.FC<{
  position?: 'fixed' | 'absolute';
  opacity?: string;
  variant?: 'center' | 'subtle-multi' | 'top-right';
}> = ({
  position = 'fixed',
  opacity = 'opacity-[0.045] dark:opacity-[0.065]',
  variant = 'center',
}) => {
  if (variant === 'subtle-multi') {
    return (
      <div className={`${position} inset-0 pointer-events-none -z-20 overflow-hidden select-none`}>
        {/* Large watermark centered in page background */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] max-w-[90vw] ${opacity} transition-opacity duration-700`}>
          <LaMalokaOfficialLogoSVG />
        </div>

        {/* Secondary subtle floating watermark in bottom left */}
        <div className="absolute -bottom-20 -left-20 w-[420px] opacity-[0.025] dark:opacity-[0.035] rotate-[-8deg]">
          <LaMalokaOfficialLogoSVG />
        </div>

        {/* Secondary subtle floating watermark in top right */}
        <div className="absolute -top-10 -right-20 w-[380px] opacity-[0.025] dark:opacity-[0.035] rotate-[6deg]">
          <LaMalokaOfficialLogoSVG />
        </div>
      </div>
    );
  }

  // Default 'center' watermark
  return (
    <div className={`${position} inset-0 pointer-events-none -z-20 overflow-hidden select-none flex items-center justify-center`}>
      <div className={`w-[820px] max-w-[92vw] ${opacity} transition-opacity duration-700`}>
        <LaMalokaOfficialLogoSVG />
      </div>
    </div>
  );
};

