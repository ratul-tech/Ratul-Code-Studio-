export interface Project {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  techStack: string;
  demoUrl: string;
  createdAt: any;
}

export interface SiteSettings {
  // Profile Picture URL
  avatarUrl: string;

  // Identity & Hero
  fullName: string;
  highlightName: string;
  statusBadge: string;
  biography: string;

  // Social & Contact
  whatsappNumber: string;
  whatsappRaw: string;
  whatsappDefaultMsg: string;
  whatsappSubtitle?: string;
  whatsappDescription?: string;

  email: string;
  emailSubject?: string;
  emailSubtitle?: string;
  emailDescription?: string;

  facebookUrl: string;
  facebookHandle?: string;
  facebookSubtitle?: string;
  facebookDescription?: string;

  instagramUrl: string;
  instagramHandle?: string;
  instagramSubtitle?: string;
  instagramDescription?: string;

  // 3 Core Pillars
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;

  // Contact Section Texts
  contactBadgeText?: string;
  contactHeading: string;
  contactSubtitle: string;

  // Footer text
  footerText: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  avatarUrl: '',
  fullName: 'Shahriar Islam',
  highlightName: 'Ratul',
  statusBadge: 'Independent Web Developer & Software Prototyper',
  biography: 'I am an independent web developer in the path of mastery of the art of modern software prototyping. Since 2025, I have been learning how to use modern AI and LLMs in the creation of web apps. I try to be fast in my prototyping by using my powers of thinking and prompting in tandem with my knowledge of web dev.',
  whatsappNumber: '+8801743904049',
  whatsappRaw: '8801743904049',
  whatsappDefaultMsg: 'Hi Shahriar! I saw your portfolio and would like to discuss a project with you.',
  whatsappSubtitle: 'Click to start chat with default message',
  whatsappDescription: 'Opens WhatsApp directly targeting my inbox with a ready-to-send greeting.',
  email: 'shahriarislam275@gmail.com',
  emailSubject: 'Project Inquiry - Portfolio Contact',
  emailSubtitle: 'Direct correspondence',
  emailDescription: 'Ideal for detailed project scopes, proposals, and collaboration offers.',
  facebookUrl: 'https://www.facebook.com/shahriar.islam.ratul.00',
  facebookHandle: 'shahriar.islam.ratul.00',
  facebookSubtitle: 'Personal profile & network',
  facebookDescription: 'Connect with me on Facebook for social updates, networking, and direct messaging.',
  instagramUrl: 'https://www.instagram.com/shahriar_islam_ratul/',
  instagramHandle: '@shahriar_islam_ratul',
  instagramSubtitle: 'Visuals & prototyping stories',
  instagramDescription: 'Follow along my journey in modern web dev, AI-assisted development, and software prototyping.',
  pillar1Title: 'Modern AI & LLMs',
  pillar1Desc: 'Leveraging LLMs and modern AI engineering since 2025 to synthesize web applications rapidly.',
  pillar2Title: 'Rapid Prototyping',
  pillar2Desc: 'Translating concepts into functional, interactive software prototypes with speed and agility.',
  pillar3Title: 'Thought & Web Dev',
  pillar3Desc: 'Combining structured prompting and creative thinking in tandem with modern web engineering.',
  contactBadgeText: "Let's Build Together",
  contactHeading: 'Get In Touch',
  contactSubtitle: 'Have an idea, need a rapid prototype, or want to collaborate? Reach out directly through any of the channels below.',
  footerText: 'Shahriar Islam Ratul. Built with passion & precision.'
};

