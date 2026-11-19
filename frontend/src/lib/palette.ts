/**
 * Yagona reń manbası (Tailwind hám Ant Design tek usı jerden aladı).
 * Fon — lavanda-aq, tiykarǵı reń — elektr indigo, aksent — shafran-altın (logotip altını),
 * qosımsha: mint (tabıs), coral (itibar), sky (maǵlıwmat).
 */
export const palette = {
  midnight: '#0b1530',
  midnightSoft: '#13224a',
  primary: '#1b3768',
  primaryHover: '#284b8a',
  primarySoft: '#e9eef8',
  accent: '#c29a45',
  accentLight: '#e6c77c',
  accentSoft: '#f7f0e1',
  accentDeep: '#8f6a24',
  mint: '#10b981',
  mintSoft: '#dcf7ea',
  coral: '#ff5d73',
  coralSoft: '#ffe6ea',
  sky: '#22a6f2',
  skySoft: '#dff2fe',
  ink: '#141c2e',
  muted: '#5d6779',
  line: '#e6e3dc',
  canvas: '#fbfaf4',
} as const;

/** Gradientler (CSS/inline ushın) */
export const gradients = {
  brand: 'linear-gradient(135deg, #0b1530 0%, #1b3768 100%)',
  sun: 'linear-gradient(135deg, #f3dd9e 0%, #c29a45 45%, #8f6a24 100%)',
  night: 'linear-gradient(160deg, #0b1530 0%, #13224a 70%, #1b3768 130%)',
} as const;
