import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        surface: '#0B1220',
        'surface-2': '#111827',
        accent: '#E8F000',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'btn': '16px',
        'input': '14px',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(232, 240, 0, 0.1)',
        'glow-sm': '0 0 20px rgba(232, 240, 0, 0.08)',
      },
      fontSize: {
        'display': ['72px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['56px', { lineHeight: '1.15', fontWeight: '700' }],
        'h2': ['40px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;
