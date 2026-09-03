import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  ExternalLink, 
  Check, 
  Copy, 
  Send,
  Sparkles
} from 'lucide-react';

export function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const EMAIL = "shahriarislam275@gmail.com";
  const PHONE_NUMBER = "+8801743904049";
  const WHATSAPP_RAW = "8801743904049";
  const DEFAULT_MESSAGE = "Hi Shahriar! I saw your portfolio and would like to discuss a project with you.";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  const FACEBOOK_URL = "https://www.facebook.com/shahriar.islam.ratul.00";
  const INSTAGRAM_URL = "https://www.instagram.com/shahriar_islam_ratul/";

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPhone = () => {
    navigator.clipboard?.writeText(PHONE_NUMBER);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const contactMethods = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: PHONE_NUMBER,
      subtitle: 'Click to start chat with default message',
      description: 'Opens WhatsApp directly targeting my inbox with a ready-to-send greeting.',
      icon: MessageCircle,
      actionText: 'Chat on WhatsApp',
      href: WHATSAPP_URL,
      isExternal: true,
      color: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      badge: 'Fastest Response',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      allowCopy: true,
      onCopy: copyPhone,
      copied: copiedPhone
    },
    {
      id: 'email',
      name: 'Email',
      handle: EMAIL,
      subtitle: 'Direct correspondence',
      description: 'Ideal for detailed project scopes, proposals, and collaboration offers.',
      icon: Mail,
      actionText: 'Send Email',
      href: `mailto:${EMAIL}?subject=${encodeURIComponent("Project Inquiry - Portfolio Contact")}`,
      isExternal: false,
      color: 'from-blue-500/20 to-emerald-500/10',
      borderColor: 'border-white/10 hover:border-emerald-500/40',
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      badge: 'Official',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      allowCopy: true,
      onCopy: copyEmail,
      copied: copiedEmail
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'shahriar.islam.ratul.00',
      subtitle: 'Personal profile & network',
      description: 'Connect with me on Facebook for social updates, networking, and direct messaging.',
      icon: Facebook,
      actionText: 'Visit Facebook Profile',
      href: FACEBOOK_URL,
      isExternal: true,
      color: 'from-sky-500/20 to-indigo-500/10',
      borderColor: 'border-white/10 hover:border-sky-500/40',
      iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      badge: 'Social',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@shahriar_islam_ratul',
      subtitle: 'Visuals & prototyping stories',
      description: 'Follow along my journey in modern web dev, vibe coding experiments, and software prototyping.',
      icon: Instagram,
      actionText: 'Follow on Instagram',
      href: INSTAGRAM_URL,
      isExternal: true,
      color: 'from-pink-500/20 to-amber-500/10',
      borderColor: 'border-white/10 hover:border-pink-500/40',
      iconBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      badge: 'Social',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    }
  ];

  return (
    <section id="contact" className="mt-24 scroll-mt-24">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs text-neutral-300 mb-4 border border-white/10">
          <Sparkles size={13} className="text-emerald-400" />
          <span>Let&apos;s Build Together</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white mb-3">
          Get In <span className="text-emerald-500">Touch</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base font-light">
          Have an idea, need a rapid prototype, or want to collaborate? Reach out directly through any of the channels below.
        </p>
      </div>

      {/* Grid of Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className={`relative glass rounded-3xl p-6 sm:p-7 border ${method.borderColor} flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden group`}
            >
              {/* Background Glow */}
              <div className={`absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br ${method.color} blur-3xl rounded-full pointer-events-none -z-10 group-hover:scale-125 transition-transform duration-500`} />

              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${method.iconBg} shadow-inner`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${method.badgeColor}`}>
                    {method.badge}
                  </span>
                </div>

                {/* Title and Handle */}
                <h3 className="text-xl font-bold font-display text-white mb-1">
                  {method.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400 font-mono text-sm font-semibold tracking-tight">
                    {method.handle}
                  </span>
                  {method.allowCopy && (
                    <button
                      onClick={method.onCopy}
                      className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                      title={`Copy ${method.name}`}
                    >
                      {method.copied ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>

                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                  {method.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <a
                  href={method.href}
                  target={method.isExternal ? "_blank" : undefined}
                  rel={method.isExternal ? "noopener noreferrer" : undefined}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/20 group/btn"
                >
                  <span>{method.actionText}</span>
                  {method.id === 'whatsapp' ? (
                    <Send size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  ) : (
                    <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  )}
                </a>

                {method.allowCopy && (
                  <button
                    onClick={method.onCopy}
                    className="glass hover:bg-white/10 text-neutral-300 py-2.5 px-3.5 rounded-xl border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5"
                    title={`Copy ${method.handle}`}
                  >
                    {method.copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="hidden sm:inline text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* WhatsApp Pre-Filled Message Explainer Pill */}
      <div className="max-w-xl mx-auto mt-8 text-center">
        <div className="glass px-4 py-2.5 rounded-2xl border border-emerald-500/20 text-xs text-neutral-400 inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <MessageCircle size={14} /> WhatsApp Note:
          </span>
          <span>Clicking the WhatsApp card opens a direct chat with:</span>
          <span className="font-mono text-neutral-300 italic">&ldquo;{DEFAULT_MESSAGE}&rdquo;</span>
        </div>
      </div>
    </section>
  );
}
