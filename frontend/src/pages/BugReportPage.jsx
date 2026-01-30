import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { submitBugReport } from '../lib/api';
import { BUG_REPORT_OPTIONS } from '../lib/constants';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Home, Type, BookOpen, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BugReportPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    platform: '',
    page: '',
    severity: '',
    feature_area: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.platform && 
           formData.page && 
           formData.severity && 
           formData.feature_area && 
           formData.description.trim().length > 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setSubmitting(true);
    try {
      // Get browser info
      const browser = navigator.userAgent;
      const os_info = navigator.platform;

      await submitBugReport({
        ...formData,
        browser,
        os_info,
      });

      setSubmitted(true);
      toast.success('Bug report submitted successfully!');
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      page: '',
      severity: '',
      feature_area: '',
      description: '',
    });
    setSubmitted(false);
  };

  return (
    <div 
      data-testid="bug-report-page" 
      className="min-h-screen bg-cobalt-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-home-btn"
            >
              <Home className="w-4 h-4 mr-1" />
              {t('return_home')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/letter-practice')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-letter-practice-btn"
            >
              <Type className="w-4 h-4 mr-1" />
              {t('letter_practice')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/word-practice')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-word-practice-btn"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {t('word_practice')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('bug_report')}
        </h1>

        {submitted ? (
          <Card className="border-green-500/30 bg-green-900/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-green-300 mb-2">
                Thank You!
              </h2>
              <p className="text-green-400 mb-6">
                Your bug report has been submitted successfully. We appreciate your feedback!
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="rounded-full border-green-500/30 text-green-300 hover:bg-green-600/20"
                  data-testid="report-another-btn"
                >
                  Report Another Issue
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="rounded-full bg-green-600 hover:bg-green-500"
                  data-testid="back-home-btn"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-cobalt-surface border-blue-500/20 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Platform *
                  </label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => handleChange('platform', value)}
                  >
                    <SelectTrigger className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="platform-select">
                      <SelectValue placeholder="Select your platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUG_REPORT_OPTIONS.platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Page */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Page *
                  </label>
                  <Select 
                    value={formData.page} 
                    onValueChange={(value) => handleChange('page', value)}
                  >
                    <SelectTrigger className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="page-select">
                      <SelectValue placeholder="Select the affected page" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUG_REPORT_OPTIONS.pages.map((page) => (
                        <SelectItem key={page} value={page}>
                          {page}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Severity *
                  </label>
                  <Select 
                    value={formData.severity} 
                    onValueChange={(value) => handleChange('severity', value)}
                  >
                    <SelectTrigger className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="severity-select">
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUG_REPORT_OPTIONS.severities.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          <span className={`flex items-center gap-2 ${
                            severity === 'Critical' ? 'text-red-600' :
                            severity === 'High' ? 'text-orange-600' :
                            severity === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            <AlertCircle className="w-4 h-4" />
                            {severity}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature Area */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Feature Area *
                  </label>
                  <Select 
                    value={formData.feature_area} 
                    onValueChange={(value) => handleChange('feature_area', value)}
                  >
                    <SelectTrigger className="rounded-xl border-blue-500/30 bg-[#0f2847] text-white" data-testid="feature-area-select">
                      <SelectValue placeholder="Select the feature area" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUG_REPORT_OPTIONS.featureAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Please describe the issue in detail. Include steps to reproduce if possible..."
                    rows={5}
                    className="rounded-xl resize-none border-blue-500/30 bg-[#0f2847] text-white placeholder:text-blue-300/50"
                    data-testid="description-textarea"
                  />
                  <p className="text-xs text-blue-400 mt-1">
                    Minimum 10 characters required
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid() || submitting}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  data-testid="submit-bug-report-btn"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-cobalt-surface rounded-xl border border-blue-500/20">
          <h3 className="font-semibold text-white mb-2">Tips for a Good Bug Report</h3>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Be specific about what you were doing when the bug occurred</li>
            <li>• Include any error messages you saw</li>
            <li>• Describe what you expected to happen vs what actually happened</li>
            <li>• Note if the issue happens every time or intermittently</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
