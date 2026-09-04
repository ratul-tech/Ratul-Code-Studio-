import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  User, 
  Phone, 
  Share2, 
  Sparkles, 
  FileText, 
  Check, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';
import profilePhoto from '../assets/images/ratul_profile.jpg';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (updated: SiteSettings) => Promise<void>;
  isSaving: boolean;
}

type TabType = 'general' | 'contact' | 'pillars';

export function SiteSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving
}: SiteSettingsModalProps) {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [imgError, setImgError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
    setImgError(false);
    setSaveSuccess(false);
    setErrorMessage(null);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save website settings');
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all website details and photo back to defaults?")) {
      setFormData(DEFAULT_SITE_SETTINGS);
      setImgError(false);
    }
  };

  const activePhotoSrc = formData.avatarUrl && formData.avatarUrl.trim() && !imgError
    ? formData.avatarUrl.trim()
    : profilePhoto;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl glass rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/15 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  Edit Website Details &amp; Profile Image
                </h3>
                <p className="text-xs text-neutral-400">
                  Update your profile picture URL, bio, contacts, and texts live
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 py-3 border-b border-white/5 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={15} />
              <span>Profile Image &amp; Hero Bio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'contact'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Phone size={15} />
              <span>Contacts &amp; Social Links</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pillars')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'pillars'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={15} />
              <span>3 Core Pillars &amp; Footer</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs shrink-0">
              <Check size={16} className="text-emerald-400" />
              <span>All website details and profile photo saved successfully! Live website updated.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs shrink-0">
              <AlertCircle size={16} className="text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* TAB 1: Profile Photo & Hero */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Profile Image Section */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <ImageIcon size={16} />
                      <span>Profile Picture (Image URL)</span>
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, avatarUrl: '' });
                          setImgError(false);
                        }}
                        className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                      >
                        Reset to Original Photo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Live Image Preview Thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-emerald-500/30 shrink-0 shadow-lg group">
                      <img
                        src={activePhotoSrc}
                        alt="Profile Preview"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-mono text-center px-1">
                        Preview
                      </div>
                    </div>

                    {/* Input and helper text */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="url"
                        value={formData.avatarUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, avatarUrl: e.target.value });
                          setImgError(false);
                        }}
                        placeholder="https://example.com/your-photo.jpg (Imgur, GitHub, Cloudinary, etc.)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                      />
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Paste a direct image link (JPEG, PNG, WebP). If left blank or if an invalid link is given, your original portrait photo will automatically be used.
                      </p>
                      {imgError && (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                          <AlertCircle size={12} />
                          Image URL failed to load. Falling back to the default profile picture.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Highlight Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      First / Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Shahriar Islam"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Highlighted Name / Nickname
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.highlightName}
                      onChange={(e) => setFormData({ ...formData, highlightName: e.target.value })}
                      placeholder="Ratul"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Status Badge (Top Pill in Hero)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.statusBadge}
                    onChange={(e) => setFormData({ ...formData, statusBadge: e.target.value })}
                    placeholder="Independent Web Developer & Software Prototyper"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Biography / About Shahriar
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    placeholder="Write your story, expertise, and vibe coding journey..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Contacts & Socials */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="shahriarislam275@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      WhatsApp Display Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+8801743904049"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      WhatsApp Direct Digits (for wa.me link)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.whatsappRaw}
                      onChange={(e) => setFormData({ ...formData, whatsappRaw: e.target.value })}
                      placeholder="8801743904049"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Facebook Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      placeholder="https://www.facebook.com/shahriar.islam.ratul.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://www.instagram.com/shahriar_islam_ratul/"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    WhatsApp Default Greeting Message
                  </label>
                  <textarea
                    rows={2}
                    value={formData.whatsappDefaultMsg}
                    onChange={(e) => setFormData({ ...formData, whatsappDefaultMsg: e.target.value })}
                    placeholder="Hi Shahriar! I saw your portfolio and would like to discuss a project with you."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Contact Section Headings
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Heading</label>
                      <input
                        type="text"
                        value={formData.contactHeading}
                        onChange={(e) => setFormData({ ...formData, contactHeading: e.target.value })}
                        placeholder="Get In Touch"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={formData.contactSubtitle}
                        onChange={(e) => setFormData({ ...formData, contactSubtitle: e.target.value })}
                        placeholder="Have an idea, need a rapid prototype, or want to collaborate? Reach out directly..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 3 Pillars & Footer */}
            {activeTab === 'pillars' && (
              <div className="space-y-4">
                {/* Pillar 1 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                    Pillar 1 (Vibe Coding)
                  </span>
                  <input
                    type="text"
                    value={formData.pillar1Title}
                    onChange={(e) => setFormData({ ...formData, pillar1Title: e.target.value })}
                    placeholder="Pillar 1 Title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                  />
                  <textarea
                    rows={2}
                    value={formData.pillar1Desc}
                    onChange={(e) => setFormData({ ...formData, pillar1Desc: e.target.value })}
                    placeholder="Pillar 1 Description"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>

                {/* Pillar 2 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                    Pillar 2 (Rapid Prototyping)
                  </span>
                  <input
                    type="text"
                    value={formData.pillar2Title}
                    onChange={(e) => setFormData({ ...formData, pillar2Title: e.target.value })}
                    placeholder="Pillar 2 Title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                  />
                  <textarea
                    rows={2}
                    value={formData.pillar2Desc}
                    onChange={(e) => setFormData({ ...formData, pillar2Desc: e.target.value })}
                    placeholder="Pillar 2 Description"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>

                {/* Pillar 3 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                    Pillar 3 (Thought & Web Dev)
                  </span>
                  <input
                    type="text"
                    value={formData.pillar3Title}
                    onChange={(e) => setFormData({ ...formData, pillar3Title: e.target.value })}
                    placeholder="Pillar 3 Title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/60 font-semibold"
                  />
                  <textarea
                    rows={2}
                    value={formData.pillar3Desc}
                    onChange={(e) => setFormData({ ...formData, pillar3Desc: e.target.value })}
                    placeholder="Pillar 3 Description"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>

                {/* Footer Note */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Footer Note
                  </label>
                  <input
                    type="text"
                    value={formData.footerText}
                    onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                    placeholder="Shahriar Islam Ratul. Built with passion & Vibe coding."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors order-2 sm:order-1"
              >
                <RotateCcw size={14} />
                <span>Reset to Defaults</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 text-sm"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
