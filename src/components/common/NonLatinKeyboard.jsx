import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const CYAN   = '#00bcd4';
const COBALT = '#0a3d6b';
const BTN    = { background: CYAN, color: COBALT, border: '1.5px solid #f5c518' };

// ── Per-language keyboard layouts ─────────────────────────────────────────────

const JAPANESE_TABS = {
  'ひらがな': [
    ['あ','い','う','え','お','か','き','く','け','こ'],
    ['さ','し','す','せ','そ','た','ち','つ','て','と'],
    ['な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ'],
    ['ま','み','む','め','も','や','ゆ','よ','わ','を'],
    ['ら','り','る','れ','ろ','ん','っ','ー','、','⌫'],
  ],
  'カタカナ': [
    ['ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ'],
    ['サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト'],
    ['ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ'],
    ['マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ワ','ヲ'],
    ['ラ','リ','ル','レ','ロ','ン','ッ','ー','・','⌫'],
  ],
};

const ARABIC_ROWS = [
  ['ا','ب','ت','ث','ج','ح','خ'],
  ['د','ذ','ر','ز','س','ش','ص'],
  ['ض','ط','ظ','ع','غ','ف','ق'],
  ['ك','ل','م','ن','ه','و','ي'],
  ['أ','إ','آ','ة','ى','لا','⌫'],
];

// Common Mandarin characters grouped by topic
const MANDARIN_TABS = {
  '基础': [
    ['你','我','他','她','们','的','了','是','在','不'],
    ['有','和','也','都','就','来','去','说','看','想'],
    ['好','大','小','多','少','这','那','什','么','吗'],
    ['一','二','三','四','五','六','七','八','九','十'],
    ['⌫'],
  ],
  '问候': [
    ['你','好','早','晚','再','见','谢','请','对','不'],
    ['起','没','关','系','欢','迎','对','不','起','⌫'],
  ],
  '数字': [
    ['零','一','二','三','四','五','六','七','八','九'],
    ['十','百','千','万','亿','第','号','点','多','⌫'],
  ],
};

// ── Sub-keyboards ─────────────────────────────────────────────────────────────

function TabKeyboard({ tabs, onKey, big = false }) {
  const tabNames = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(tabNames[0]);
  const rows = tabs[activeTab];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 mb-1">
        {tabNames.map(name => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className="px-3 py-1 rounded-md text-xs font-bold transition-all"
            style={activeTab === name ? BTN : { background: 'rgba(0,188,212,0.15)', color: CYAN, border: '1px solid rgba(0,188,212,0.4)' }}
          >
            {name}
          </button>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 flex-wrap">
          {row.map(key => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className="font-bold text-lg md:text-xl rounded-md transition-all active:scale-95 hover:brightness-110"
              style={{
                ...BTN,
                minWidth: key === '⌫' ? '44px' : '36px',
                height: '38px',
                padding: '0 6px',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function RowKeyboard({ rows, onKey, dir = 'ltr' }) {
  return (
    <div className="flex flex-col gap-1.5" dir={dir}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 flex-wrap">
          {row.map(key => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className="font-bold text-lg md:text-xl rounded-md transition-all active:scale-95 hover:brightness-110"
              style={{
                ...BTN,
                minWidth: key === '⌫' ? '44px' : '36px',
                height: '38px',
                padding: '0 6px',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NonLatinKeyboard({ onKey, language, layout = null }) {
  const { t } = useLanguage();

  const handleKey = (key) => {
    if (key === '⌫') { onKey('⌫'); return; }
    onKey(key);
  };

  return (
    <div className="flex flex-col gap-2 w-fit">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ color: CYAN }}>
        {t('practice.customEntries')}
      </p>

      {layout?.type === 'tabs' && <TabKeyboard tabs={layout.tabs} onKey={handleKey} big />}
      {layout?.type === 'rows' && <RowKeyboard rows={layout.rows} onKey={handleKey} dir={layout.direction || 'ltr'} />}
      {!layout && language === 'ja' && <TabKeyboard tabs={JAPANESE_TABS} onKey={handleKey} big />}
      {!layout && language === 'ar' && <RowKeyboard rows={ARABIC_ROWS} onKey={handleKey} dir="rtl" />}
      {!layout && language === 'zh' && <TabKeyboard tabs={MANDARIN_TABS} onKey={handleKey} />}
    </div>
  );
}
