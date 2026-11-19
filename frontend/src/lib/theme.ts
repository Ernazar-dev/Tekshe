import type { ThemeConfig } from 'antd';
import type { Locale } from 'antd/es/locale';
import { palette as p } from './palette';

const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";

/** Ant Design tokenları — Tailwind penen birdey palitra (lib/palette.ts) */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: p.primary,
    colorInfo: p.primary,
    colorSuccess: p.mint,
    colorWarning: p.accent,
    colorError: '#e11d48',
    colorTextBase: p.ink,
    colorTextSecondary: p.muted,
    colorBgLayout: p.canvas,
    colorBgContainer: '#ffffff',
    colorBorder: p.line,
    colorBorderSecondary: '#efece3',
    colorLink: p.primary,
    borderRadius: 12,
    borderRadiusLG: 20,
    borderRadiusSM: 8,
    controlHeight: 42,
    fontFamily: FONT,
    fontSize: 14,
    boxShadow: '0 10px 28px -14px rgba(11, 21, 48,0.28)',
    boxShadowSecondary: '0 26px 60px -20px rgba(11, 21, 48,0.45)',
  },
  components: {
    Input: { borderRadiusLG: 14 },
    Select: { borderRadiusLG: 14 },
    Button: { borderRadiusLG: 14, fontWeight: 600, primaryShadow: '0 8px 20px -8px rgba(11, 21, 48,0.6)', defaultShadow: 'none' },
    Card: { headerFontSize: 17, paddingLG: 24 },
    Table: {
      headerBg: '#f4f1e8',
      headerColor: p.ink,
      headerSplitColor: 'transparent',
      rowHoverBg: '#f8f5ec',
      borderColor: '#efece3',
      cellPaddingBlock: 14,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: 'rgba(255,255,255,0.72)',
      darkItemHoverColor: '#ffffff',
      darkItemHoverBg: 'rgba(255,255,255,0.08)',
      darkItemSelectedColor: '#ffffff',
      darkItemSelectedBg: 'rgba(194, 154, 69, 0.30)',
      itemBorderRadius: 12,
      itemHeight: 46,
      itemMarginInline: 0,
    },
    Modal: { titleFontSize: 20 },
    Tag: { borderRadiusSM: 999 },
    Segmented: { itemSelectedBg: p.primary, itemSelectedColor: '#ffffff', trackBg: '#ebe6d8' },
    Statistic: { contentFontSize: 34 },
  },
};

/** Ant Design'nıń túsinikli jazıwları (Qaraqalpaq latın) */
export const antdLocale: Locale = {
  locale: 'kk',
  Empty: { description: 'Maǵlıwmat joq' },
  Modal: { okText: 'Jaqsı', cancelText: 'Biykar etiw', justOkText: 'Jaqsı' },
  Pagination: { items_per_page: '/ bet', jump_to: 'Ótiw', page: 'Bet', prev_page: 'Aldınǵı', next_page: 'Keyingi' },
  Table: { filterTitle: 'Filtr', filterConfirm: 'Qollanıw', filterReset: 'Tazalaw', emptyText: 'Maǵlıwmat joq' },
  Popconfirm: { okText: 'Awa', cancelText: 'Yaq' },
};
