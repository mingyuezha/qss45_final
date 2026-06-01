import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

/* ── PALETTE ── */
const C = {
  navy:    '#0d1f3c',
  navy2:   '#1a3560',
  steel:   '#2d6a9f',
  blue:    '#4a90d9',
  ice:     '#7cb9e8',
  powder:  '#b8d9f5',
  baidu:   '#b03a2e',
  baidu2:  '#922b21',
  white:   '#ffffff',
  lgrey:   '#f5f7fa',
  glass:   'rgba(255,255,255,0.07)',
  glassBorder: 'rgba(255,255,255,0.13)',
};

/* ── REAL DATA ── */
const countryTriggerRates = [
  { country: 'Australia',      rate: 68.3 },
  { country: 'United Kingdom', rate: 67.5 },
  { country: 'India',          rate: 66.7 },
  { country: 'United States',  rate: 63.6 },
];

const topDomains = {
  'United States': [
    { domain: 'hiv.gov',              count: 15 },
    { domain: 'who.int',              count: 17 },
    { domain: 'hopkinsmedicine.org',  count: 21 },
    { domain: 'pmc.ncbi.nlm.nih.gov', count: 22 },
    { domain: 'medlineplus.gov',      count: 23 },
    { domain: 'facebook.com',         count: 24 },
    { domain: 'clevelandclinic.org',  count: 26 },
    { domain: 'cdc.gov',              count: 47 },
    { domain: 'mayoclinic.org',       count: 49 },
    { domain: 'youtube.com',          count: 72 },
  ],
  'United Kingdom': [
    { domain: 'cdc.gov',              count: 14 },
    { domain: 'en.wikipedia.org',     count: 16 },
    { domain: 'pmc.ncbi.nlm.nih.gov', count: 18 },
    { domain: 'diabetes.org.uk',      count: 21 },
    { domain: 'clevelandclinic.org',  count: 22 },
    { domain: 'nhsinform.scot',       count: 22 },
    { domain: 'who.int',              count: 32 },
    { domain: 'youtube.com',          count: 34 },
    { domain: 'mayoclinic.org',       count: 50 },
    { domain: 'nhs.uk',               count: 109 },
  ],
  'India': [
    { domain: 'hopkinsmedicine.org',  count: 21 },
    { domain: 'cdc.gov',              count: 24 },
    { domain: 'medlineplus.gov',      count: 26 },
    { domain: 'ncbi.nlm.nih.gov',     count: 29 },
    { domain: 'en.wikipedia.org',     count: 36 },
    { domain: 'clevelandclinic.org',  count: 42 },
    { domain: 'who.int',              count: 46 },
    { domain: 'pmc.ncbi.nlm.nih.gov', count: 52 },
    { domain: 'mayoclinic.org',       count: 63 },
    { domain: 'youtube.com',          count: 100 },
  ],
  'Australia': [
    { domain: 'en.wikipedia.org',     count: 16 },
    { domain: 'beyondblue.org.au',    count: 16 },
    { domain: 'pmc.ncbi.nlm.nih.gov', count: 17 },
    { domain: 'cdc.gov',              count: 18 },
    { domain: 'cancer.org.au',        count: 20 },
    { domain: 'clevelandclinic.org',  count: 25 },
    { domain: 'who.int',              count: 31 },
    { domain: 'youtube.com',          count: 35 },
    { domain: 'mayoclinic.org',       count: 49 },
    { domain: 'healthdirect.gov.au',  count: 79 },
  ],
};

/* MOCK – topic trigger rates per country */
const mockTopicRates = {
  'United States':  [
    { topic: 'COVID-19',         rate: 82 },
    { topic: 'Diabetes',         rate: 75 },
    { topic: 'Mental Health',    rate: 58 },
    { topic: 'Vaccine Safety',   rate: 42 },
    { topic: 'Cancer Screening', rate: 71 },
    { topic: 'Hantavirus',       rate: 18 },
  ],
  'United Kingdom': [
    { topic: 'COVID-19',         rate: 85 },
    { topic: 'Diabetes',         rate: 79 },
    { topic: 'Mental Health',    rate: 63 },
    { topic: 'Vaccine Safety',   rate: 45 },
    { topic: 'Cancer Screening', rate: 73 },
    { topic: 'Hantavirus',       rate: 21 },
  ],
  'India': [
    { topic: 'COVID-19',         rate: 78 },
    { topic: 'Diabetes',         rate: 88 },
    { topic: 'Mental Health',    rate: 52 },
    { topic: 'Vaccine Safety',   rate: 38 },
    { topic: 'Cancer Screening', rate: 65 },
    { topic: 'Hantavirus',       rate: 15 },
  ],
  'Australia': [
    { topic: 'COVID-19',         rate: 88 },
    { topic: 'Diabetes',         rate: 82 },
    { topic: 'Mental Health',    rate: 71 },
    { topic: 'Vaccine Safety',   rate: 48 },
    { topic: 'Cancer Screening', rate: 77 },
    { topic: 'Hantavirus',       rate: 22 },
  ],
};

/* REAL – platform trigger rates by topic */
const platformTriggerByTopic = [
  { topic: 'Cancer',       google: 80,   baidu: 80   },
  { topic: 'Hypertension', google: 100,  baidu: 90   },
  { topic: 'Diabetes',     google: 90,   baidu: 100  },
  { topic: 'Depression',   google: 80,   baidu: 100  },
  { topic: 'Long COVID',   google: 90,   baidu: 70   },
  { topic: 'HIV',          google: 80,   baidu: 60   },
  { topic: 'Herbal Med.',  google: 44,   baidu: 89   },
  { topic: 'Acupuncture',  google: 40,   baidu: 50   },
  { topic: 'Abortion',     google: 20,   baidu: 30   },
  { topic: 'Hantavirus',   google: 20,   baidu: 10   },
];

/* REAL – framing heatmap: Google − Baidu by section & metric */
const heatmapRows = [
  { metric: 'High Specificity',   common: -0.041, controversial: -0.055, legal: -0.051, tcm: -0.077 },
  { metric: 'Pro-TCM',            common: -0.083, controversial: -0.172, legal:  0.024, tcm: -0.207 },
  { metric: 'TCM Skeptical',      common:  0.174, controversial:  0.262, legal: -0.035, tcm:  0.097 },
  { metric: 'Medical Referral',   common: -0.004, controversial: -0.181, legal:  0.087, tcm: -0.007 },
  { metric: 'Emergency Referral', common: -0.045, controversial: -0.030, legal:  0.011, tcm:  0.020 },
  { metric: 'Safety Warning',     common:  0.073, controversial:  0.000, legal: -0.133, tcm: -0.213 },
];

/* MOCK – longitudinal */
const longitudinalData = [
  { date: 'Jan 2022', covid:  0, hantavirus: 0,  influenza: 42, mpox:  0 },
  { date: 'May 2022', covid:  8, hantavirus: 0,  influenza: 30, mpox:  0 },
  { date: 'Sep 2022', covid: 28, hantavirus: 0,  influenza: 20, mpox: 45 },
  { date: 'Jan 2023', covid: 52, hantavirus: 0,  influenza: 68, mpox: 38 },
  { date: 'May 2023', covid: 66, hantavirus: 0,  influenza: 28, mpox: 22 },
  { date: 'Sep 2023', covid: 76, hantavirus: 0,  influenza: 14, mpox: 12 },
  { date: 'Jan 2024', covid: 83, hantavirus: 0,  influenza: 72, mpox:  8 },
  { date: 'May 2024', covid: 87, hantavirus: 0,  influenza: 32, mpox: 18 },
  { date: 'Sep 2024', covid: 88, hantavirus: 0,  influenza: 16, mpox: 14 },
  { date: 'Jan 2025', covid: 89, hantavirus: 1,  influenza: 72, mpox:  8 },
  { date: 'Apr 2025', covid: 90, hantavirus: 3,  influenza: 38, mpox: 14 },
  { date: 'Apr 2026', covid: 90, hantavirus: 12, influenza: 25, mpox: 11 },
  { date: 'Jun 2026', covid: 90, hantavirus: 55, influenza: 25, mpox: 11 },
];

const countryInsights = {
  'United States':  'YouTube leads all citation sources (72 citations), followed by mayoclinic.org and cdc.gov. The presence of Facebook (24 citations) among the top sources raises concerns about non-institutional content quality.',
  'United Kingdom': 'nhs.uk dominates overwhelmingly (109 citations) — more than double the next source — reflecting strong integration of the UK\'s national health system. The US-centric CDC still appears, suggesting cross-border source bleed.',
  'India':          'YouTube ranks #1 (100 citations) and PubMed/PMC sources appear more prominently than in other countries, suggesting heavier reliance on research preprints alongside consumer video content.',
  'Australia':      'healthdirect.gov.au leads (79 citations), demonstrating notable localization toward Australia\'s national health portal. beyondblue.org.au also appears, reflecting mental health query volume.',
};

/* ── TINY COMPONENTS ── */

function IllustrativeBadge() {
  return (
    <span style={{
      fontSize: 10, fontStyle: 'italic', color: C.powder,
      background: 'rgba(74,144,217,0.18)', border: `1px solid rgba(74,144,217,0.35)`,
      borderRadius: 4, padding: '1px 6px', marginLeft: 8, verticalAlign: 'middle',
      letterSpacing: '0.03em',
    }}>
      Illustrative data
    </span>
  );
}

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: C.glass,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: `1px solid ${C.glassBorder}`,
      borderRadius: 16,
      padding: '28px 32px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: C.ice, marginBottom: 6, fontFamily: 'DM Sans, sans-serif',
    }}>
      {children}
    </p>
  );
}

function PageHeading({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 28, fontWeight: 700, color: C.white,
      marginBottom: 8, marginTop: 0,
    }}>
      {children}
    </h2>
  );
}

/* ── RADIAL GAUGE ── */
function RadialGauge({ value }) {
  const r = 58, cx = 80, cy = 80;
  const clamp = Math.min(Math.max(value, 0), 100);
  const angle = (clamp / 100) * 360 - 0.01;
  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const large = angle > 180 ? 1 : 0;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={14}/>
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`}
        fill="none" stroke={C.blue} strokeWidth={14} strokeLinecap="round"
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.white}
        fontSize={24} fontWeight="700" fontFamily="DM Sans,sans-serif">
        {value}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.powder}
        fontSize={11} fontFamily="DM Sans,sans-serif">
        trigger rate
      </text>
    </svg>
  );
}

/* ── WORLD MAP SVG ── */
const COUNTRY_SHAPES = {
  'United States':  'M155,102 L195,96 L238,93 L273,92 L298,100 L310,115 L302,130 L278,148 L248,158 L215,160 L183,155 L162,145 L148,128Z',
  'United Kingdom': 'M438,80 L447,75 L456,77 L461,84 L457,94 L449,99 L440,97 L434,88Z',
  'India':          'M642,135 L698,128 L723,140 L720,165 L705,190 L692,213 L674,222 L657,205 L644,175 L638,152Z',
  'Australia':      'M783,275 L862,262 L908,270 L928,292 L930,325 L918,362 L892,388 L856,395 L820,385 L795,362 L783,332 L780,295Z',
};

const COUNTRY_LABELS = {
  'United States':  { x: 228, y: 132 },
  'United Kingdom': { x: 447, y: 87  },
  'India':          { x: 678, y: 175 },
  'Australia':      { x: 855, y: 332 },
};

function WorldMap({ selectedCountry, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <svg viewBox="0 0 1000 480" width="100%" style={{ borderRadius: 12, display: 'block' }}>
      {/* ocean */}
      <rect width={1000} height={480} fill="#07152a"/>
      {/* grain overlay */}
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="overlay" result="blend"/><feComposite in="blend" in2="SourceGraphic" operator="in"/></filter>
      <rect width={1000} height={480} fill="transparent" filter="url(#grain)" opacity={0.04}/>

      {/* ── CONTINENT LANDMASSES (grey) ── */}
      {/* Greenland */}
      <path d="M428,18 L468,12 L494,22 L490,52 L464,64 L438,58 L420,43Z" fill="#1e3a5f" opacity="0.75"/>
      {/* North America */}
      <path d="M105,52 L185,32 L242,33 L295,50 L318,72 L320,102 L305,128 L283,148 L258,162 L228,178 L215,202 L200,232 L182,256 L162,268 L145,265 L120,250 L102,228 L96,194 L105,155 L115,120 L108,88Z" fill="#1e3a5f" opacity="0.75"/>
      {/* S. America */}
      <path d="M208,288 L245,270 L278,278 L298,305 L302,346 L288,385 L268,418 L244,430 L220,424 L205,400 L195,365 L195,325 L205,295Z" fill="#1e3a5f" opacity="0.75"/>
      {/* Europe */}
      <path d="M435,68 L460,58 L490,55 L520,60 L540,74 L545,92 L538,110 L518,120 L494,122 L468,118 L448,110 L434,95Z" fill="#1e3a5f" opacity="0.75"/>
      {/* Africa */}
      <path d="M438,115 L468,110 L500,112 L526,120 L546,138 L556,166 L553,208 L540,255 L518,298 L492,322 L464,314 L443,285 L430,248 L428,205 L432,162 L436,132Z" fill="#1e3a5f" opacity="0.75"/>
      {/* Asia */}
      <path d="M545,62 L610,46 L685,40 L760,46 L825,58 L874,75 L900,96 L902,128 L882,155 L848,168 L808,172 L770,168 L740,162 L710,168 L682,158 L655,170 L622,168 L592,152 L568,132 L548,108Z" fill="#1e3a5f" opacity="0.75"/>
      {/* SE Asia */}
      <path d="M772,194 L806,188 L828,196 L832,212 L814,218 L790,214Z" fill="#1e3a5f" opacity="0.65"/>
      {/* Australia base */}
      <path d="M783,275 L862,262 L908,270 L928,292 L930,325 L918,362 L892,388 L856,395 L820,385 L795,362 L783,332 L780,295Z" fill="#1e3a5f" opacity="0.75"/>
      {/* NZ */}
      <path d="M950,316 L958,310 L966,316 L962,328 L952,325Z" fill="#1e3a5f" opacity="0.6"/>
      {/* Japan */}
      <path d="M870,98 L878,92 L888,95 L885,110 L875,115Z" fill="#1e3a5f" opacity="0.6"/>

      {/* ── HIGHLIGHTED COUNTRIES ── */}
      {Object.entries(COUNTRY_SHAPES).map(([name, d]) => {
        const isSelected = selectedCountry === name;
        const isHovered  = hovered === name;
        return (
          <g key={name}>
            <path
              d={d}
              fill={isSelected ? C.blue : isHovered ? '#2d6a9f' : '#1e4d8c'}
              opacity={isSelected ? 1 : isHovered ? 0.95 : 0.82}
              stroke={isSelected ? C.ice : isHovered ? C.powder : 'rgba(180,210,255,0.35)'}
              strokeWidth={isSelected ? 2 : 1.2}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onSelect(isSelected ? null : name)}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            />
            <text
              x={COUNTRY_LABELS[name].x}
              y={COUNTRY_LABELS[name].y}
              textAnchor="middle"
              fill={isSelected ? C.white : C.powder}
              fontSize={name === 'United Kingdom' ? 7 : 9}
              fontWeight="600"
              fontFamily="DM Sans,sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {name === 'United Kingdom' ? 'UK' : name === 'United States' ? 'US' : name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── COUNTRY SIDE PANEL ── */
function CountryPanel({ country, onClose }) {
  const rateObj = countryTriggerRates.find(r => r.country === country);
  const rate    = rateObj ? rateObj.rate : 0;
  const topics  = mockTopicRates[country] || [];

  return (
    <div style={{
      position: 'fixed', top: 60, right: 0, height: 'calc(100vh - 60px)', width: 420, zIndex: 200,
      background: 'rgba(13,31,60,0.97)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderLeft: `1px solid ${C.glassBorder}`,
      overflowY: 'auto',
      animation: 'slideIn 0.3s ease',
      padding: '36px 32px',
      boxSizing: 'border-box',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.1)', border: 'none',
        color: C.white, borderRadius: 8, width: 36, height: 36,
        fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>

      <SectionLabel>Country Profile</SectionLabel>
      <h3 style={{
        fontFamily: "'Playfair Display',Georgia,serif",
        fontSize: 22, color: C.white, marginTop: 4, marginBottom: 28,
      }}>
        {country}
      </h3>

      <p style={{ fontSize: 12, color: C.powder, marginBottom: 8 }}>
        Overall AI Overview Trigger Rate
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <RadialGauge value={rate} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.powder, margin: 0 }}>
          Trigger Rate by Health Topic
        </p>
        <IllustrativeBadge />
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={topics} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false}/>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: C.powder, fontSize: 10 }}
            tickFormatter={v => `${v}%`} axisLine={false} tickLine={false}/>
          <YAxis type="category" dataKey="topic" tick={{ fill: C.powder, fontSize: 11 }}
            axisLine={false} tickLine={false} width={110}/>
          <Tooltip
            formatter={v => [`${v}%`, 'Trigger rate']}
            contentStyle={{ background: C.navy, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: C.white }}
          />
          <Bar dataKey="rate" radius={[0,4,4,0]} fill={C.blue}>
            {topics.map((_, i) => (
              <Cell key={i} fill={[C.steel, C.blue, C.ice, C.powder, C.blue, C.steel][i % 6]}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8, fontStyle: 'italic' }}>
        Click anywhere outside or × to close
      </p>
    </div>
  );
}

/* ── HEATMAP GRID (custom, not Recharts) ── */
function HeatmapGrid() {
  const sections = ['Common\nConditions', 'Controversial', 'Legally\nVariable', 'TCM'];
  const keys     = ['common', 'controversial', 'legal', 'tcm'];

  function cellColor(v) {
    const abs = Math.abs(v);
    const a   = Math.min(abs / 0.22, 1);
    if (v > 0) return `rgba(74,144,217,${0.15 + a * 0.7})`;
    return `rgba(176,58,46,${0.15 + a * 0.7})`;
  }

  return (
    <div>
      {/* column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 1fr)', gap: 4, marginBottom: 4 }}>
        <div/>
        {sections.map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 6,
            padding: '6px 4px', textAlign: 'center',
            fontSize: 10, color: C.ice, fontFamily: 'DM Sans,sans-serif',
            whiteSpace: 'pre-line', lineHeight: 1.3,
          }}>
            {s}
          </div>
        ))}
      </div>
      {heatmapRows.map((row) => (
        <div key={row.metric} style={{
          display: 'grid', gridTemplateColumns: '160px repeat(4, 1fr)', gap: 4, marginBottom: 4,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            fontSize: 11, color: C.powder, fontFamily: 'DM Sans,sans-serif', paddingLeft: 4,
          }}>
            {row.metric}
          </div>
          {keys.map(k => {
            const v = row[k];
            return (
              <div key={k} style={{
                background: cellColor(v),
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, padding: '10px 4px',
                textAlign: 'center', fontSize: 11,
                color: C.white, fontFamily: 'DM Sans,sans-serif', fontWeight: 600,
              }}>
                {v > 0 ? '+' : ''}{v.toFixed(2)}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(74,144,217,0.85)' }}/>
          <span style={{ fontSize: 10, color: C.powder }}>Google higher</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(176,58,46,0.85)' }}/>
          <span style={{ fontSize: 10, color: C.powder }}>Baidu higher</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE 1 — LITERATURE & POLICY
════════════════════════════════════════════════ */
function LiteraturePage() {
  const prose = [
    {
      title: 'Zero-Click Search and the Disappearing Patient Journey',
      body: 'AI Overview features—generative summaries displayed above organic search results—have fundamentally altered how users interact with health information online. Where patients once navigated to authoritative health portals, an increasing proportion now receive synthesized answers without ever leaving the search results page. Estimates suggest that AI Overviews now appear in over 60% of health-related queries on Google in markets where the feature is active. This "zero-click" paradigm concentrates the information gateway in the hands of a single algorithmic layer, raising questions about what gets surfaced, what gets suppressed, and how attribution to source materials is handled when users never visit them.',
    },
    {
      title: 'Health Misinformation Risk and AI Hallucination',
      body: 'Generative AI systems are known to produce plausible-sounding but factually incorrect content—colloquially termed "hallucinations." In health contexts, this risk is particularly acute. A response that slightly misrepresents a drug dosage threshold, contradicts current clinical guidelines, or conflates a symptom with a diagnosis can cause direct patient harm. Systematic audits of AI-generated health content have documented errors ranging from outdated treatment recommendations to misattributed causal claims. Unlike static web pages, AI Overviews are dynamically generated and may vary across queries, users, and sessions, complicating systematic quality auditing.',
    },
    {
      title: 'Digital Health Equity Across Languages and Countries',
      body: 'AI Overviews are not deployed uniformly across geographies. Feature availability, trigger frequency, citation sourcing, and response framing all vary by country and query language. This creates a stratified information environment in which users in English-speaking, high-income countries may receive structurally different—and potentially better-resourced—health summaries than users in lower-income or non-English-speaking contexts. Our comparative analysis of Google AI Overviews across Australia, India, the United Kingdom, and the United States reveals meaningful differences in trigger rates and citation ecosystems. Baidu\'s AI Overview product shows distinct framing patterns compared to Google, particularly on topics with cultural or regulatory specificity, such as Traditional Chinese Medicine.',
    },
    {
      title: 'Outsized Influence of LLM Summaries on Public Health Perception',
      body: 'LLM-generated health summaries occupy a uniquely influential position in the information ecosystem: they appear before organic results, are written with high linguistic fluency, and carry the implicit authority of a major technology platform. Research on persuasion and source credibility suggests that fluent, confident text—regardless of accuracy—increases user confidence in the information. Compounding this effect, AI Overviews often cite multiple sources while synthesizing across them in ways that users cannot easily verify, creating an illusion of consensus that may not exist. Policy discussions about algorithmic accountability in health information have historically focused on search ranking; the new challenge is to extend those frameworks to cover AI-generated synthesis layers.',
    },
  ];

  const keyFindings = [
    { stat: '63–68%', desc: 'of health queries across four countries trigger a Google AI Overview', color: C.blue },
    { stat: '10 domains', desc: 'are shared in the top-30 cited sources across all four countries, including youtube.com and who.int', color: C.steel },
    { stat: '64%', desc: 'of Baidu health queries return an AI Overview, comparable to Google but with structurally different framing profiles', color: C.ice },
    { stat: '×2', desc: 'Baidu AI Overviews are more likely to include pro-TCM framing than Google on topics like herbal medicine and acupuncture', color: C.powder },
  ];

  const policies = [
    {
      icon: '🌐',
      title: 'Localization of Health Guidance',
      body: 'AI Overview health content should reflect the clinical guidelines, regulatory context, and epidemiological reality of the country in which it is served. Cross-border guideline mismatches—such as surfacing US FDA guidance to users in countries with different drug approval regimes—can cause harm. Platforms must implement country-aware content filtering and audit AI Overviews against nationally recognized clinical standards.',
    },
    {
      icon: '📋',
      title: 'Source Quality & Citation Standards',
      body: 'Heavy reliance on non-institutional sources (YouTube, Facebook, Reddit, personal health blogs) as citations in AI Overviews raises serious concerns about accuracy, expertise, and the potential to amplify misinformation. Our data show that YouTube is the top-cited domain for health overviews in the United States and India. Platforms should establish and publish explicit source quality tiers, prioritizing government portals, WHO publications, and peer-reviewed literature.',
    },
    {
      icon: '🔍',
      title: 'Transparency in Suppression & Amplification',
      body: 'Platforms must disclose the criteria by which AI Overviews are triggered, suppressed, or amplified for health-related query categories. Our data reveal striking variation in trigger rates across topics: hantavirus (20%) and abortion (20%) trigger Google AI Overviews far less frequently than hypertension (100%), with no public explanation. Platforms should publish health-specific content policies and audit trails accessible to researchers and regulators under a structured transparency framework.',
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeading>Literature Review</PageHeading>
      <p style={{ color: C.powder, fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans,sans-serif', maxWidth: 700 }}>
        Academic context for AI-generated health overviews, covering misinformation risk, equity, and platform influence.
      </p>

      {/* Prose cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 44 }}>
        {prose.map((p, i) => (
          <GlassCard key={i}>
            <h4 style={{
              fontFamily: "'Playfair Display',Georgia,serif",
              color: C.ice, fontSize: 16, marginTop: 0, marginBottom: 12,
            }}>
              {p.title}
            </h4>
            <p style={{
              color: 'rgba(220,235,255,0.82)', fontSize: 13.5, lineHeight: 1.75,
              margin: 0, fontFamily: 'DM Sans,sans-serif',
            }}>
              {p.body}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Key Findings */}
      <SectionLabel>Key Findings</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 44 }}>
        {keyFindings.map((f, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, rgba(13,31,60,0.9), rgba(26,53,96,0.7))`,
            border: `1px solid ${f.color}44`,
            borderRadius: 14, padding: '22px 20px',
          }}>
            <div style={{
              fontSize: 32, fontWeight: 800, color: f.color,
              fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 10,
            }}>
              {f.stat}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(220,235,255,0.8)', margin: 0, lineHeight: 1.55, fontFamily: 'DM Sans,sans-serif' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Policy Recommendations */}
      <SectionLabel>Policy Recommendations</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {policies.map((p, i) => (
          <GlassCard key={i} style={{ padding: '28px 26px' }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
            <h4 style={{
              fontFamily: "'Playfair Display',Georgia,serif",
              color: C.white, fontSize: 15, marginTop: 0, marginBottom: 12,
            }}>
              {p.title}
            </h4>
            <p style={{
              color: 'rgba(200,220,245,0.8)', fontSize: 13, lineHeight: 1.7, margin: 0,
              fontFamily: 'DM Sans,sans-serif',
            }}>
              {p.body}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE 2 — ANALYTICS
════════════════════════════════════════════════ */
function AnalyticsPage() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countryColors = {
    'United States':  C.blue,
    'United Kingdom': C.steel,
    'India':          C.ice,
    'Australia':      C.powder,
  };

  const insights = [
    { country: 'United States',  text: countryInsights['United States']  },
    { country: 'United Kingdom', text: countryInsights['United Kingdom'] },
    { country: 'India',          text: countryInsights['India']          },
    { country: 'Australia',      text: countryInsights['Australia']      },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeading>Cross-Country Analytics</PageHeading>
      <p style={{ color: C.powder, fontSize: 14, marginBottom: 32, fontFamily: 'DM Sans,sans-serif' }}>
        Select a country on the map to explore its AI Overview profile. Real data from scraped Google search results (n = 478 queries).
      </p>

      {/* Map section */}
      <GlassCard style={{ marginBottom: 40, padding: '24px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <SectionLabel>Interactive World Map — click a highlighted country</SectionLabel>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            {Object.entries(countryColors).map(([c, col]) => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: col, display: 'inline-block' }}/>
                <span style={{ fontSize: 11, color: C.powder, fontFamily: 'DM Sans,sans-serif' }}>
                  {c === 'United States' ? 'US' : c === 'United Kingdom' ? 'UK' : c}
                </span>
              </span>
            ))}
          </span>
        </div>
        <WorldMap selectedCountry={selectedCountry} onSelect={setSelectedCountry}/>
        {selectedCountry && (
          <p style={{ fontSize: 12, color: C.ice, textAlign: 'center', marginTop: 8, fontFamily: 'DM Sans,sans-serif' }}>
            Viewing: <strong>{selectedCountry}</strong> — panel open on right
          </p>
        )}
      </GlassCard>

      {/* Domain charts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <SectionLabel>Top 10 Cited Domains by Country</SectionLabel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>
        {Object.entries(topDomains).map(([country, data], ci) => {
          const col = [C.blue, C.steel, C.ice, C.powder][ci];
          return (
            <GlassCard key={country} style={{ padding: '22px 20px' }}>
              <h4 style={{
                fontFamily: "'Playfair Display',Georgia,serif",
                color: C.white, fontSize: 15, marginTop: 0, marginBottom: 16,
              }}>
                {country}
              </h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                  <XAxis type="number" tick={{ fill: C.powder, fontSize: 10 }}
                    axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="domain" tick={{ fill: C.powder, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={130}/>
                  <Tooltip
                    formatter={v => [v, 'Citations']}
                    contentStyle={{ background: C.navy, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: C.white }}
                  />
                  <Bar dataKey="count" radius={[0,4,4,0]} fill={col}/>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          );
        })}
      </div>

      {/* Insight strip */}
      <div style={{
        display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8,
      }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            flex: '0 0 280px',
            background: 'rgba(26,53,96,0.5)',
            border: `1px solid ${C.glassBorder}`,
            borderRadius: 12, padding: '16px 18px',
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: [C.blue, C.steel, C.ice, C.powder][i],
              margin: '0 0 8px', fontFamily: 'DM Sans,sans-serif', textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {ins.country}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(200,220,245,0.82)', margin: 0, lineHeight: 1.6, fontFamily: 'DM Sans,sans-serif' }}>
              {ins.text}
            </p>
          </div>
        ))}
      </div>

      {selectedCountry && <CountryPanel country={selectedCountry} onClose={() => setSelectedCountry(null)}/>}
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE 3 — PLATFORM COMPARISON
════════════════════════════════════════════════ */
function PlatformPage() {
  const compTable = [
    { dim: 'Source Citation',           google: '13 refs avg',    baidu: '0 linked refs',  llm: 'None' },
    { dim: 'Disclaimer Present',        google: 'Occasional',     baidu: 'Rare',           llm: 'Often' },
    { dim: 'Local Guideline Adherence', google: 'Moderate',       baidu: 'High (CN)',      llm: 'Low' },
    { dim: 'Readability',               google: 'High',           baidu: 'High',           llm: 'Very High' },
    { dim: 'Hallucination Risk',        google: 'Low–Medium',     baidu: 'Medium',         llm: 'Medium–High' },
    { dim: 'Safety Warning Rate',       google: '73%',            baidu: '70%',            llm: '~55% (est.)' },
    { dim: 'Emergency Referral',        google: '9%',             baidu: '11%',            llm: 'Variable' },
  ];

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeading>Platform Comparison: Google vs. Baidu</PageHeading>
      <p style={{ color: C.powder, fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans,sans-serif' }}>
        Comparing AI Overview presence rates and framing profiles across platforms using real scraped data (n = 238 matched queries).
      </p>

      {/* Section 1: Trigger rate grouped bar */}
      <GlassCard style={{ marginBottom: 36 }}>
        <SectionLabel>AI Overview Presence Rate by Health Topic</SectionLabel>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.white, marginTop: 4, marginBottom: 20, fontSize: 18 }}>
          Google vs. Baidu — Trigger Rate by Topic
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={platformTriggerByTopic} margin={{ left: 0, right: 20, top: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="topic" tick={{ fill: C.powder, fontSize: 11 }} axisLine={false} tickLine={false}
              angle={-25} textAnchor="end" interval={0}/>
            <YAxis tick={{ fill: C.powder, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[0, 110]}/>
            <Tooltip
              formatter={v => [`${v}%`, '']}
              contentStyle={{ background: C.navy, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: C.white }}
            />
            <Legend wrapperStyle={{ color: C.powder, fontSize: 12, paddingTop: 8 }}/>
            <Bar dataKey="google" name="Google AI Overview" fill={C.blue} radius={[4,4,0,0]}/>
            <Bar dataKey="baidu"  name="Baidu AI Overview"  fill={C.baidu} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard style={{ marginBottom: 36 }}>
        <SectionLabel>Framing Analysis Heatmap — Google minus Baidu</SectionLabel>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.white, marginTop: 4, marginBottom: 6, fontSize: 18 }}>
          Platform Divergence by Section & Metric
        </h3>
        <p style={{ color: C.powder, fontSize: 12, marginBottom: 20, fontFamily: 'DM Sans,sans-serif' }}>
          Positive (blue) = Google scores higher; Negative (red) = Baidu scores higher. Values are mean probability differences.
        </p>
        <HeatmapGrid />
      </GlassCard>

      {/* Response duel */}
      <GlassCard style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <SectionLabel>AI Overview vs. Standalone LLM Response</SectionLabel>
          <IllustrativeBadge />
        </div>
        <p style={{ color: C.powder, fontSize: 12, marginBottom: 20, fontFamily: 'DM Sans,sans-serif' }}>
          Sample query: <em style={{ color: C.ice }}>"What should I do if I have COVID-19 symptoms?"</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Google AI Overview */}
          <div style={{
            background: 'rgba(26,53,96,0.55)', border: `1px solid rgba(74,144,217,0.4)`,
            borderRadius: 12, padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 18 }}>🔍</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: 'DM Sans,sans-serif' }}>
                Google AI Overview
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.white, lineHeight: 1.7, marginBottom: 14, fontFamily: 'DM Sans,sans-serif' }}>
              <strong>If you have COVID-19 symptoms:</strong>
            </p>
            <ul style={{ fontSize: 12.5, color: 'rgba(220,235,255,0.85)', lineHeight: 1.8, paddingLeft: 18, fontFamily: 'DM Sans,sans-serif' }}>
              <li>Isolate at home and avoid contact with others for at least 5 days</li>
              <li>Monitor symptoms — seek emergency care if you experience difficulty breathing, chest pain, or confusion</li>
              <li>Take over-the-counter medications to manage fever and pain (consult a doctor for antivirals)</li>
              <li>Stay hydrated and rest</li>
            </ul>
            <p style={{ fontSize: 11, color: C.powder, marginTop: 12, fontStyle: 'italic', fontFamily: 'DM Sans,sans-serif' }}>
              Sources: CDC.gov · WHO.int · Mayo Clinic · NHS.uk
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {['✓ Source cited', '✓ Structured', '⚠ No disclaimer', '✓ Actionable'].map(t => (
                <span key={t} style={{
                  fontSize: 10, background: t.startsWith('✓') ? 'rgba(74,144,217,0.2)' : 'rgba(240,180,50,0.2)',
                  border: `1px solid ${t.startsWith('✓') ? 'rgba(74,144,217,0.5)' : 'rgba(240,180,50,0.5)'}`,
                  color: t.startsWith('✓') ? C.ice : '#f0c040',
                  borderRadius: 4, padding: '2px 8px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Standalone LLM */}
          <div style={{
            background: 'rgba(40,20,20,0.4)', border: `1px solid rgba(176,58,46,0.35)`,
            borderRadius: 12, padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 18 }}>🤖</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e07070', fontFamily: 'DM Sans,sans-serif' }}>
                Standalone LLM Response
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.white, lineHeight: 1.7, marginBottom: 12, fontFamily: 'DM Sans,sans-serif' }}>
              If you're experiencing COVID-19 symptoms, it's important to take several steps to protect yourself and others around you. First and foremost, you should consider self-isolating to prevent spreading the virus. COVID-19 can spread easily from person to person through respiratory droplets...
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(220,235,255,0.75)', lineHeight: 1.7, fontFamily: 'DM Sans,sans-serif' }}>
              You may want to contact your healthcare provider, especially if you are in a high-risk group or your symptoms are severe. They can advise whether antiviral treatment like Paxlovid might be appropriate. Additionally, you should monitor for warning signs such as difficulty breathing...
            </p>
            <p style={{ fontSize: 11, color: 'rgba(200,160,160,0.7)', marginTop: 12, fontStyle: 'italic', fontFamily: 'DM Sans,sans-serif' }}>
              <em>Note: I am an AI and this is not medical advice. Please consult a healthcare professional.</em>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {['✗ No source links', '✗ Verbose', '✓ Disclaimer', '✓ Actionable'].map(t => (
                <span key={t} style={{
                  fontSize: 10,
                  background: t.startsWith('✓') ? 'rgba(74,144,217,0.2)' : 'rgba(176,58,46,0.2)',
                  border: `1px solid ${t.startsWith('✓') ? 'rgba(74,144,217,0.5)' : 'rgba(176,58,46,0.5)'}`,
                  color: t.startsWith('✓') ? C.ice : '#e07070',
                  borderRadius: 4, padding: '2px 8px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Comparison table */}
      <GlassCard>
        <SectionLabel>Quality Dimension Comparison</SectionLabel>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: C.white, marginTop: 4, marginBottom: 20, fontSize: 18 }}>
          Google AI Overview · Baidu AI Overview · Standalone LLM
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', fontFamily: 'DM Sans,sans-serif' }}>
            <thead>
              <tr>
                {['Quality Dimension', 'Google AI Overview', 'Baidu AI Overview', 'Standalone LLM'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 16px', textAlign: i === 0 ? 'left' : 'center',
                    fontSize: 11, color: C.ice, letterSpacing: '0.06em',
                    textTransform: 'uppercase', borderBottom: `1px solid ${C.glassBorder}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compTable.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: C.white, borderRadius: '8px 0 0 8px' }}>
                    {row.dim}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: C.powder, textAlign: 'center' }}>
                    {row.google}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#e8a0a0', textAlign: 'center' }}>
                    {row.baidu}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'rgba(200,215,240,0.7)', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                    {row.llm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE 4 — LONGITUDINAL
════════════════════════════════════════════════ */
function LongitudinalPage() {
  const CustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    if (dataKey === 'hantavirus' && payload.date === 'Jun 2026') {
      return <circle cx={cx} cy={cy} r={6} fill={C.ice} stroke={C.white} strokeWidth={2}/>;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <PageHeading>Longitudinal Trend Tracking</PageHeading>
        <IllustrativeBadge />
      </div>
      <p style={{ color: C.powder, fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans,sans-serif', maxWidth: 750 }}>
        AI Overview trigger rate (%) over time by disease topic. Illustrative mock data showing trajectory from January 2022 through June 2026.
        Annotated inflection points mark key platform milestones.
      </p>

      <GlassCard>
        <SectionLabel>AI Overview Trigger Rate (%) — Jan 2022 to Jun 2026</SectionLabel>

        <ResponsiveContainer width="100%" height={430}>
          <LineChart data={longitudinalData} margin={{ left: 0, right: 30, top: 20, bottom: 30 }}>
            <defs>
              <linearGradient id="covidGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.navy2}/>
                <stop offset="100%" stopColor={C.blue}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="date" tick={{ fill: C.powder, fontSize: 11 }} axisLine={false} tickLine={false}
              angle={-30} textAnchor="end" height={55} interval={1}/>
            <YAxis tick={{ fill: C.powder, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} domain={[0, 100]}/>
            <Tooltip
              formatter={(v, name) => [`${v}%`, name]}
              contentStyle={{ background: C.navy, border: `1px solid ${C.glassBorder}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: C.white }}
            />
            <Legend wrapperStyle={{ color: C.powder, fontSize: 12, paddingTop: 16 }}/>

            {/* Annotation lines */}
            <ReferenceLine x="Sep 2022" stroke="rgba(255,255,255,0.25)" strokeDasharray="5 5"
              label={{ value: 'ChatGPT launch', fill: 'rgba(200,220,255,0.7)', fontSize: 10, position: 'top' }}/>
            <ReferenceLine x="May 2023" stroke="rgba(255,255,255,0.25)" strokeDasharray="5 5"
              label={{ value: 'Google SGE rollout', fill: 'rgba(200,220,255,0.7)', fontSize: 10, position: 'top' }}/>
            <ReferenceLine x="Jun 2026" stroke={`${C.ice}88`} strokeDasharray="5 5"
              label={{ value: 'Emerging outbreak spike', fill: C.ice, fontSize: 10, position: 'insideTopRight' }}/>

            <Line type="monotone" dataKey="covid" name="COVID-19" stroke={C.blue}
              strokeWidth={3} dot={false} activeDot={{ r: 5, fill: C.blue }}/>
            <Line type="monotone" dataKey="hantavirus" name="Hantavirus" stroke={C.ice}
              strokeWidth={3} dot={<CustomDot dataKey="hantavirus"/>} activeDot={{ r: 5, fill: C.ice }}/>
            <Line type="monotone" dataKey="influenza" name="Influenza" stroke={C.steel}
              strokeWidth={2} dot={false} strokeDasharray="6 3" activeDot={{ r: 4 }}/>
            <Line type="monotone" dataKey="mpox" name="Mpox" stroke={C.powder}
              strokeWidth={2} dot={false} strokeDasharray="4 4" activeDot={{ r: 4 }}/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Annotation callouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 28 }}>
        {[
          {
            label: 'ChatGPT Launch — Nov 2022',
            color: C.steel,
            text: 'The public release of ChatGPT accelerates platform pressure on Google to integrate AI summaries into search, triggering internal development of AI Overviews (then called SGE). COVID-19 trigger rate was ~28% at this point.',
          },
          {
            label: 'Google SGE Rollout — May 2023',
            color: C.blue,
            text: 'Google Search Generative Experience begins limited rollout, dramatically increasing AI Overview prevalence for health queries. COVID-19 trigger rate crosses 66% within two quarters.',
          },
          {
            label: 'Hantavirus Outbreak — Jun 2026',
            color: C.ice,
            text: 'A rapid surge in hantavirus-related queries—driven by a documented regional outbreak—causes AI Overview trigger rates for this topic to spike from near-zero to 55% within approximately 8 weeks.',
          },
        ].map((c, i) => (
          <div key={i} style={{
            background: 'rgba(26,53,96,0.45)',
            border: `1px solid ${c.color}44`,
            borderRadius: 12, padding: '18px 20px',
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: c.color,
              margin: '0 0 8px', fontFamily: 'DM Sans,sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {c.label}
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(200,220,245,0.82)', margin: 0, lineHeight: 1.65, fontFamily: 'DM Sans,sans-serif' }}>
              {c.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════════ */
const PAGES = ['Literature', 'Analytics', 'Platform Comparison', 'Longitudinal Trends'];

export default function App() {
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    // Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Global styles
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${C.navy}; font-family: 'DM Sans', sans-serif; color: ${C.white}; min-height: 100vh; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      .page-content { animation: fadeUp 0.35s ease; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 3px; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 100%)`, position: 'relative' }}>
      {/* Grain texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat', opacity: 0.6,
      }}/>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,31,60,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center',
        padding: '0 40px', height: 60,
        gap: 8,
      }}>
        <span style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: 14, fontWeight: 700, color: C.blue,
          marginRight: 24, whiteSpace: 'nowrap',
        }}>
          Health AI Overviews
        </span>
        {PAGES.map((p, i) => (
          <button key={i} onClick={() => setActivePage(i)} style={{
            background: activePage === i ? 'rgba(74,144,217,0.18)' : 'transparent',
            border: activePage === i ? `1px solid rgba(74,144,217,0.4)` : '1px solid transparent',
            color: activePage === i ? C.ice : 'rgba(200,220,245,0.65)',
            borderRadius: 8, padding: '6px 16px', fontSize: 13,
            cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: activePage === i ? 600 : 400,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}>
            {p}
          </button>
        ))}
      </nav>

      {/* ── HERO ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy2} 0%, rgba(13,31,60,0.85) 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '36px 48px 32px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 1100 }}>
          <SectionLabel>Research Dashboard · Cross-Platform · Cross-Country</SectionLabel>
          <h1 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 32, fontWeight: 700, color: C.white,
            lineHeight: 1.25, marginBottom: 10, marginTop: 6,
          }}>
            AI Overviews in Health:<br/>
            <span style={{ color: C.ice }}>A Cross-Platform, Cross-Country Analysis</span>
          </h1>
          <p style={{
            fontSize: 14, color: 'rgba(180,210,245,0.75)',
            fontFamily: 'DM Sans,sans-serif', maxWidth: 720, lineHeight: 1.6,
          }}>
            Systematic analysis of AI-generated health summaries on Google (US, UK, India, Australia) and Baidu,
            covering trigger rates, citation quality, framing divergence, and longitudinal trends across 478 health queries.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 18 }}>
            {countryTriggerRates.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: [C.blue, C.steel, C.ice, C.powder][i],
                  fontFamily: "'Playfair Display',Georgia,serif",
                }}>
                  {c.rate}%
                </span>
                <span style={{ fontSize: 10, color: 'rgba(180,210,245,0.6)', marginTop: 2, fontFamily: 'DM Sans,sans-serif' }}>
                  {c.country}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#e07070', fontFamily: "'Playfair Display',Georgia,serif" }}>
                64.2%
              </span>
              <span style={{ fontSize: 10, color: 'rgba(180,210,245,0.6)', marginTop: 2, fontFamily: 'DM Sans,sans-serif' }}>
                Baidu (CN)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="page-content" key={activePage} style={{ position: 'relative', zIndex: 1 }}>
        {activePage === 0 && <LiteraturePage />}
        {activePage === 1 && <AnalyticsPage />}
        {activePage === 2 && <PlatformPage />}
        {activePage === 3 && <LongitudinalPage />}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '28px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(180,210,245,0.55)', fontFamily: 'DM Sans,sans-serif' }}>
            Dartmouth College · Geisel School of Medicine · Department of Biomedical Data Science
          </p>
          <p style={{ fontSize: 11, color: 'rgba(180,210,245,0.35)', marginTop: 4, fontFamily: 'DM Sans,sans-serif' }}>
            Dataset: Google AI Overviews Health Corpus (478 queries, 4 countries) · Baidu AI Overview Health Corpus (120 queries)
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'rgba(180,210,245,0.4)', fontFamily: 'DM Sans,sans-serif' }}>
            Last updated: June 2026
          </p>
          <p style={{ fontSize: 10, color: 'rgba(180,210,245,0.25)', marginTop: 2, fontFamily: 'DM Sans,sans-serif' }}>
            All mock data clearly labeled. Real data derived from scraped search results.
          </p>
        </div>
      </footer>
    </div>
  );
}
