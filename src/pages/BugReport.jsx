import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Bug } from 'lucide-react';
import { createPageUrl } from '@/utils/pageUtils';
import { useLanguage } from '../components/i18n/LanguageContext';

const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';
const GOLD = '#f5c518';
const PILL_STYLE = { background: CYAN, color: COBALT, border: `1.5px solid ${GOLD}` };
const FIELD_STYLE = {
  background: 'rgba(0,188,212,0.07)',
  border: '2px solid #f5c518',
  color: '#fff',
  fontSize: '1rem',
};

export default function BugReport() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: '', page: '', severity: '', area: '', email: '', description: ''
  });

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)' }}
      >
        <div className="text-center px-6">
          <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#34d399' }} />
          <h2 className="text-3xl font-bold mb-3" style={{ color: CYAN }}>{t('bugReport.success')}</h2>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            {t('bugReport.returnHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="p-3 rounded-lg transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: COBALT }} />
          </button>
          <div className="flex items-center gap-3">
            <Bug className="w-7 h-7" style={{ color: CYAN }} />
            <h1 className="text-3xl font-bold" style={{ color: CYAN }}>{t('bugReport.title')}</h1>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid rgba(0,188,212,0.25)` }}
          >

            {/* Platform & Page row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.platform')}</label>
                <Select value={formData.platform} onValueChange={v => set('platform', v)}>
                  <SelectTrigger style={FIELD_STYLE}>
                    <SelectValue placeholder={t('bugReport.platform')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">{t('bugReport.platformOptions.web')}</SelectItem>
                    <SelectItem value="mobile">{t('bugReport.platformOptions.mobile')}</SelectItem>
                    <SelectItem value="tablet">{t('bugReport.platformOptions.tablet')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.page')}</label>
                <Select value={formData.page} onValueChange={v => set('page', v)}>
                  <SelectTrigger style={FIELD_STYLE}>
                    <SelectValue placeholder={t('bugReport.page')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">{t('bugReport.pageOptions.home')}</SelectItem>
                    <SelectItem value="practice">{t('bugReport.pageOptions.practice')}</SelectItem>
                    <SelectItem value="curriculum">{t('bugReport.pageOptions.curriculum')}</SelectItem>
                    <SelectItem value="history">{t('bugReport.pageOptions.history')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Severity & Area row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.severity')}</label>
                <Select value={formData.severity} onValueChange={v => set('severity', v)}>
                  <SelectTrigger style={FIELD_STYLE}>
                    <SelectValue placeholder={t('bugReport.severity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('bugReport.severityOptions.low')}</SelectItem>
                    <SelectItem value="medium">{t('bugReport.severityOptions.medium')}</SelectItem>
                    <SelectItem value="high">{t('bugReport.severityOptions.high')}</SelectItem>
                    <SelectItem value="critical">{t('bugReport.severityOptions.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.area')}</label>
                <Select value={formData.area} onValueChange={v => set('area', v)}>
                  <SelectTrigger style={FIELD_STYLE}>
                    <SelectValue placeholder={t('bugReport.area')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animation">{t('bugReport.areaOptions.animation')}</SelectItem>
                    <SelectItem value="recording">{t('bugReport.areaOptions.recording')}</SelectItem>
                    <SelectItem value="grading">{t('bugReport.areaOptions.grading')}</SelectItem>
                    <SelectItem value="ui">{t('bugReport.areaOptions.ui')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.emailLabel')} <span style={{ color: '#666' }}>{t('bugReport.emailOptional')}</span></label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => set('email', e.target.value)}
                style={FIELD_STYLE}
                className="placeholder:text-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: CYAN }}>{t('bugReport.description')} <span style={{ color: '#f87171' }}>*</span></label>
              <Textarea
                placeholder={t('bugReport.description')}
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                rows={6}
                required
                style={FIELD_STYLE}
                className="placeholder:text-gray-500 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!formData.description || isLoading}
              className="w-full py-3 rounded-xl font-bold text-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={PILL_STYLE}
            >
              {isLoading ? '…' : t('bugReport.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}