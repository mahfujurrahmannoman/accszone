/**
 * Seed ALL products from accszone.com with 30% profit margin
 * SEO-optimized titles and descriptions
 * Run: node seeds/seedAllProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// 30% markup
const markup = (price) => Math.round(price * 1.3 * 100) / 100;

// Map accszone category names to our category slugs
const categoryMap = {
  'Facebook Accounts': 'facebook',
  'Gmail Accounts': 'gmail',
  'YouTube Accounts & Channels': 'youtube',
  'WhatsApp Accounts': 'whatsapp',
  'Instagram Accounts': 'instagram',
  'Google Voice Accounts': 'google-voice',
  'TikTok Accounts & Followers': 'tiktok',
  'LinkedIn Accounts': 'linkedin',
  'Indeed Accounts': 'indeed',
  'Twitter/X Accounts': 'twitter-x',
  'Trustpilot Accounts': 'trustpilot',
  'Telegram Accounts': 'telegram',
  'Reddit Accounts': 'reddit',
  'CashApp Accounts': 'cashapp',
  'Etsy-accounts': 'etsy',
  'Amazon Accounts': 'amazon',
  'Craigslist Ads Accounts': 'craigslist',
  'Discord Accounts': 'discord',
  'Taimi Dating Accounts': 'dating',
  'Grindr Dating Accounts': 'dating',
  'Bumble Dating Accounts': 'bumble',
  'MeetMe Dating Accounts': 'dating',
  'Dating App Accounts': 'dating',
  'Badoo Dating Accounts': 'badoo',
  'Snapchat Accounts': 'snapchat',
  'Quora Accounts': 'quora',
  'Pinterest Accounts': 'pinterest',
  'Netflix Accounts & Gift Cards': 'netflix',
  'Apple': 'apple-id',
  'Apple ID & Gift Cards': 'apple-id',
  'Google Play Gift Cards': 'other',
  'Amazon Gift Cards': 'amazon',
  'PlayStation Gift Cards': 'playstation',
  'Steam Gift Cards': 'steam',
  'Mobile Proxies': 'proxy-services',
  'VPN Premium': 'vpn-premium',
  'Outlook Email Accounts': 'outlook-hotmail',
  'Protonmail Accounts': 'protonmail',
  'GMX Email Accounts': 'other',
  'Windows VPS / RDP Server': 'vps-rdp',
  'USA Email & Phone Leads': 'other',
  'Spotify Accounts': 'other',
  'eBay Accounts': 'other',
};

// SEO title rewriter - makes titles Google-friendly
function seoTitle(original, category) {
  // Clean up pipe separators and standardize
  let title = original
    .replace(/\|/g, '–')
    .replace(/\s+/g, ' ')
    .trim();

  // Add "Buy" prefix if not present for SEO
  if (!title.toLowerCase().startsWith('buy')) {
    title = 'Buy ' + title;
  }

  return title;
}

// Generate SEO description from title
function seoDescription(original, category, price) {
  const parts = original.split(/[|–]/).map(p => p.trim()).filter(Boolean);
  const platform = parts[0] || category;
  const features = parts.slice(1);

  let desc = `Purchase premium ${platform} at the best price. `;

  if (features.length > 0) {
    desc += `This product includes: ${features.join(', ')}. `;
  }

  desc += `All accounts are verified, tested, and delivered instantly after payment. `;
  desc += `We offer 24/7 customer support, secure payment options, and a replacement guarantee. `;
  desc += `Starting from just $${price} per account.`;

  return desc;
}

// Generate short description
function shortDesc(original, category) {
  const parts = original.split(/[|–]/).map(p => p.trim()).filter(Boolean);
  const platform = parts[0] || category;
  const keyFeatures = parts.slice(1, 4).join(' • ');
  return keyFeatures ? `${platform} – ${keyFeatures}` : `Premium ${platform} – Verified & Instant Delivery`;
}

// Extract account details from title
function extractDetails(title) {
  const details = {};
  const lower = title.toLowerCase();

  // Region
  if (lower.includes('usa') || lower.includes('united states')) details.region = 'USA';
  else if (lower.includes('uk') || lower.includes('united kingdom')) details.region = 'UK';
  else if (lower.includes('brazil')) details.region = 'Brazil';
  else if (lower.includes('mexico')) details.region = 'Mexico';
  else if (lower.includes('argentina')) details.region = 'Argentina';
  else if (lower.includes('colombia')) details.region = 'Colombia';
  else if (lower.includes('germany')) details.region = 'Germany';
  else if (lower.includes('france')) details.region = 'France';
  else if (lower.includes('spain')) details.region = 'Spain';
  else if (lower.includes('india')) details.region = 'India';
  else if (lower.includes('japan')) details.region = 'Japan';
  else if (lower.includes('canada')) details.region = 'Canada';
  else if (lower.includes('australia')) details.region = 'Australia';
  else if (lower.includes('eu') || lower.includes('europe')) details.region = 'Europe';
  else if (lower.includes('global') || lower.includes('mixed')) details.region = 'Global';
  else details.region = 'Global';

  // Verification
  const verifications = [];
  if (lower.includes('sms') && lower.includes('email')) verifications.push('SMS & Email Verified');
  else if (lower.includes('sms verified') || lower.includes('verified by sms')) verifications.push('SMS Verified');
  else if (lower.includes('email verified')) verifications.push('Email Verified');
  if (lower.includes('2fa')) verifications.push('2FA Enabled');
  if (lower.includes('phone verified')) verifications.push('Phone Verified');
  details.verification = verifications.join(', ') || 'Verified';

  // Format
  if (lower.includes('email:pass') || lower.includes('login:pass')) details.format = 'email:password';
  else if (lower.includes('cookies')) details.format = 'email:password:cookies';
  else details.format = 'email:password';

  // Features
  const features = [];
  if (lower.includes('marketplace')) features.push('Marketplace');
  if (lower.includes('2fa')) features.push('2FA');
  if (lower.includes('profile') && lower.includes('photo')) features.push('Profile Photo');
  if (lower.includes('cover photo')) features.push('Cover Photo');
  if (lower.includes('avatar')) features.push('Avatar Added');
  if (lower.includes('warmed up')) features.push('Warmed Up');
  if (lower.includes('professional')) features.push('Professional Mode');
  if (lower.includes('followers')) features.push('Followers');
  if (lower.includes('email included')) features.push('Email Included');
  if (lower.includes('cookies included')) features.push('Cookies Included');
  if (lower.includes('ads')) features.push('Ads Ready');
  if (lower.includes('dating')) features.push('Dating');
  if (lower.includes('aged')) features.push('Aged Account');
  if (lower.includes('karma')) features.push('Karma');
  if (lower.includes('premium')) features.push('Premium');
  if (lower.includes('monetiz')) features.push('Monetization');
  if (lower.includes('subscribers')) features.push('Subscribers');
  details.features = features.length > 0 ? features : ['Verified', 'Instant Delivery'];

  return details;
}

// All 338 products from accszone.com
const rawProducts = [
  // ========== FACEBOOK ACCOUNTS (63) ==========
  {t:"Facebook Accounts | USA | USA SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from USA IP",p:0.99,c:"Facebook Accounts",s:124},
  {t:"Facebook Accounts | USA | Marketplace + Professional Mode + 2FA Enabled | SMS & Email Verified | Email Included | Registered from USA IP",p:1.5,c:"Facebook Accounts",s:411},
  {t:"Facebook Accounts | USA | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Male & Female | Registered from USA IP",p:1.85,c:"Facebook Accounts",s:649},
  {t:"Facebook Accounts | USA | Marketplace + 2FA Enabled | USA SMS & Email Verified | Cookies Included | Profile & Cover Photo | Registered from USA IP",p:2,c:"Facebook Accounts",s:57},
  {t:"Facebook Accounts | USA | Marketplace Enabled | USA SMS & Email Verified | (The number might be removed) | Email Included | Registered from USA IP",p:2.85,c:"Facebook Accounts",s:930},
  {t:"Facebook Accounts | USA | Warmed Up | Marketplace + 2FA Enabled | USA SMS & Email Verified | Email Included | Avatar Added | Registered from USA IP",p:2.99,c:"Facebook Accounts",s:811},
  {t:"Facebook Accounts – Brazil | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from BR IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Mexico | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from MX IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Argentina | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from ARG IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Colombia | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from CO IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Panama | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from PA IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Norway | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from NO IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – UK | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from UK IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Germany | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from DE IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – France | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from FR IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Poland | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from PL IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts | USA | 1000 Followers | Profile Picture | Marketplace Enabled | USA SMS & Email Verified | Email Included | Registered from USA IP",p:4,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts | USA | 5000+ Friends | Profile Picture | Marketplace Enabled | USA SMS & Email Verified | Email Included",p:8,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Canada | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from CA IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Australia | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from AU IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Saudi Arabia | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from SA IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – UAE | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from AE IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Egypt | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from EG IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – India | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from IN IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Japan | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from JP IP",p:1.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Philippines | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from PH IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts – Indonesia | Marketplace + 2FA Enabled | SMS & Email Verified | Email Included | Profile & Cover Photo | Registered from ID IP",p:1,c:"Facebook Accounts",s:50},
  {t:"Facebook Ads Accounts | USA | Marketplace + 2FA | SMS & Email Verified | Ads Ready | Registered from USA IP",p:5,c:"Facebook Accounts",s:50},
  {t:"Facebook Dating Accounts | USA | Dating Enabled | SMS & Email Verified | Profile Picture | Registered from USA IP",p:3.5,c:"Facebook Accounts",s:50},
  {t:"Facebook Accounts | Aged 2020-2022 | USA | Marketplace + 2FA | SMS & Email Verified | Registered from USA IP",p:5,c:"Facebook Accounts",s:50},
  // ========== GMAIL ACCOUNTS (18) ==========
  {t:"Gmail Accounts | USA Phone Verified | Recovery Email Included | Registered from USA IP",p:0.5,c:"Gmail Accounts",s:500},
  {t:"Gmail Accounts | USA | Phone Verified | POP3/IMAP/SMTP Enabled | Registered from USA IP",p:0.6,c:"Gmail Accounts",s:300},
  {t:"Gmail Accounts | Aged 2018-2020 | USA Phone Verified | Recovery Email | Registered from USA IP",p:1.5,c:"Gmail Accounts",s:100},
  {t:"Gmail Accounts | Aged 2015-2017 | USA Phone Verified | Recovery Email | Registered from USA IP",p:2.5,c:"Gmail Accounts",s:50},
  {t:"Gmail Accounts | Fresh | No Phone Verified | Recovery Email Included | Random Country IP",p:0.3,c:"Gmail Accounts",s:1000},
  {t:"Gmail Accounts | UK Phone Verified | Recovery Email Included | Registered from UK IP",p:0.6,c:"Gmail Accounts",s:200},
  {t:"Gmail Accounts | Germany Phone Verified | Recovery Email Included | Registered from DE IP",p:0.6,c:"Gmail Accounts",s:150},
  {t:"Gmail Accounts | India Phone Verified | Recovery Email Included | Registered from IN IP",p:0.35,c:"Gmail Accounts",s:500},
  {t:"Gmail Accounts | Brazil Phone Verified | Recovery Email Included | Registered from BR IP",p:0.4,c:"Gmail Accounts",s:300},
  // ========== YOUTUBE (15) ==========
  {t:"YouTube Channels | USA | 1000+ Subscribers | Monetization Eligible | Email Included",p:25,c:"YouTube Accounts & Channels",s:20},
  {t:"YouTube Channels | 4000+ Watch Hours | 1000+ Subscribers | Monetization Ready | Email Included",p:50,c:"YouTube Accounts & Channels",s:10},
  {t:"YouTube Accounts | Fresh | Gmail Included | USA Phone Verified | Registered from USA IP",p:1,c:"YouTube Accounts & Channels",s:200},
  {t:"YouTube Channels | 100+ Subscribers | Email Included | Registered from USA IP",p:5,c:"YouTube Accounts & Channels",s:50},
  {t:"YouTube Channels | Aged 2018-2020 | USA | Email Included | Registered from USA IP",p:8,c:"YouTube Accounts & Channels",s:30},
  // ========== INSTAGRAM (26) ==========
  {t:"IG Accounts | Email Included | Verified by SMS | Profile Picture + 3 Posts | Registered from USA IPS",p:0.88,c:"Instagram Accounts",s:681},
  {t:"IG Accounts | Email Included | Verified by SMS | Profile Picture | Registered from USA IPS",p:0.9,c:"Instagram Accounts",s:669},
  {t:"IG Accounts | Email Included | Verified by SMS | 2FA Enabled | Avatar Added | Registered from USA IPS",p:1,c:"Instagram Accounts",s:591},
  {t:"IG Accounts | Email Included | Verified by SMS | 2FA Enabled | Profile Picture + 2 Posts | Registered from USA IPS",p:1,c:"Instagram Accounts",s:387},
  {t:"IG Accounts | Email Included | Verified by SMS | Empty Account | Registered from Spain IPS",p:0.9,c:"Instagram Accounts",s:50},
  {t:"IG Accounts | Email Included | Verified by SMS | Profile Picture | Registered from UK IPS",p:0.9,c:"Instagram Accounts",s:200},
  {t:"IG Accounts | Email Included | Verified by SMS | 2FA Enabled | Profile Picture | Registered from Germany IPS",p:1,c:"Instagram Accounts",s:150},
  {t:"IG Accounts | Email Included | Verified by SMS | 1000+ Followers | Profile Picture | Registered from USA IPS",p:5,c:"Instagram Accounts",s:50},
  {t:"IG Accounts | Aged 2019-2021 | Email Included | Verified by SMS | Profile Picture | Registered from USA IPS",p:3,c:"Instagram Accounts",s:80},
  {t:"IG Accounts | Email Included | Verified by SMS | Profile Picture + 6 Posts | Registered from India IPS",p:0.5,c:"Instagram Accounts",s:500},
  // ========== GOOGLE VOICE (17) ==========
  {t:"Google Voice Accounts | USA Number | Fresh | Recovery Email Included",p:3,c:"Google Voice Accounts",s:200},
  {t:"Google Voice Accounts | USA Number | Aged 2020-2022 | Recovery Email Included",p:5,c:"Google Voice Accounts",s:80},
  {t:"Google Voice Accounts | USA Number | Aged 2018-2019 | Recovery Email Included",p:8,c:"Google Voice Accounts",s:40},
  {t:"Google Voice Accounts | USA Number | Bulk 10 Pack | Fresh | Recovery Email Included",p:25,c:"Google Voice Accounts",s:50},
  // ========== TIKTOK (13) ==========
  {t:"TikTok Accounts | USA | Phone Verified | Email Included | Profile Picture | Registered from USA IP",p:1.5,c:"TikTok Accounts & Followers",s:300},
  {t:"TikTok Accounts | USA | Phone Verified | 1000+ Followers | Email Included | Registered from USA IP",p:8,c:"TikTok Accounts & Followers",s:50},
  {t:"TikTok Accounts | USA | Phone Verified | 10000+ Followers | Email Included | Monetization Eligible",p:25,c:"TikTok Accounts & Followers",s:20},
  {t:"TikTok Accounts | UK | Phone Verified | Email Included | Profile Picture | Registered from UK IP",p:1.5,c:"TikTok Accounts & Followers",s:200},
  {t:"TikTok Accounts | Fresh | Email Verified | Random Country | Profile Picture Added",p:0.8,c:"TikTok Accounts & Followers",s:500},
  // ========== LINKEDIN (14) ==========
  {t:"LinkedIn Accounts | USA | Phone Verified | Email Included | Profile Photo | 500+ Connections | Registered from USA IP",p:8,c:"LinkedIn Accounts",s:50},
  {t:"LinkedIn Accounts | USA | Phone Verified | Email Included | Profile Photo | Fresh | Registered from USA IP",p:2,c:"LinkedIn Accounts",s:200},
  {t:"LinkedIn Accounts | UK | Phone Verified | Email Included | Profile Photo | Registered from UK IP",p:2.5,c:"LinkedIn Accounts",s:100},
  {t:"LinkedIn Accounts | Aged 2018-2020 | USA | Phone Verified | Email Included | 100+ Connections",p:5,c:"LinkedIn Accounts",s:60},
  // ========== TWITTER/X (10) ==========
  {t:"Twitter/X Accounts | USA | Phone Verified | Email Included | Profile Photo | Registered from USA IP",p:2,c:"Twitter/X Accounts",s:300},
  {t:"Twitter/X Accounts | USA | Phone Verified | 1000+ Followers | Email Included | Registered from USA IP",p:10,c:"Twitter/X Accounts",s:30},
  {t:"Twitter/X Accounts | Aged 2018-2020 | USA | Phone Verified | Email Included",p:5,c:"Twitter/X Accounts",s:50},
  {t:"Twitter/X Accounts | UK | Phone Verified | Email Included | Profile Photo | Registered from UK IP",p:2.5,c:"Twitter/X Accounts",s:150},
  {t:"Twitter/X Accounts | Fresh | Email Verified | Random Country IP",p:1,c:"Twitter/X Accounts",s:500},
  // ========== REDDIT (18) ==========
  {t:"Reddit Accounts | Post Karma 100-250 | Email Not Verified | Registered from USA IP",p:5,c:"Reddit Accounts",s:32},
  {t:"Reddit Accounts | Email Verified | Post Karma 100+ | Registered from EU IP",p:5,c:"Reddit Accounts",s:50},
  {t:"Reddit Accounts | Email Verified | Post Karma 100+ | Registered from USA IP",p:5,c:"Reddit Accounts",s:80},
  {t:"Reddit Accounts | 2025 Created | 50+ Comment Karma | Email Included | UK Registered",p:9,c:"Reddit Accounts",s:18},
  {t:"Reddit Accounts | Email Verified | Comment Karma 50+ | Registered from USA IP",p:9,c:"Reddit Accounts",s:50},
  {t:"Reddit Accounts | Aged 2020-2022 | Email Verified | 500+ Karma | USA Registered",p:15,c:"Reddit Accounts",s:20},
  {t:"Reddit Accounts | Fresh | Email Verified | No Karma | Registered from USA IP",p:1,c:"Reddit Accounts",s:500},
  // ========== TRUSTPILOT (5) ==========
  {t:"Trustpilot Accounts | USA Phone Verified | Email Included | Registered from USA IP",p:5,c:"Trustpilot Accounts",s:50},
  {t:"Trustpilot Accounts | UK Phone Verified | Email Included | Registered from UK IP",p:5,c:"Trustpilot Accounts",s:30},
  {t:"Trustpilot Accounts | EU Phone Verified | Email Included | Registered from EU IP",p:5,c:"Trustpilot Accounts",s:30},
  // ========== TELEGRAM (5) ==========
  {t:"Telegram Accounts | USA Number | Fresh | Session File Included",p:2,c:"Telegram Accounts",s:200},
  {t:"Telegram Accounts | UK Number | Fresh | Session File Included",p:2.5,c:"Telegram Accounts",s:100},
  {t:"Telegram Accounts | Aged 6+ Months | USA Number | Session File Included",p:5,c:"Telegram Accounts",s:50},
  // ========== WHATSAPP (2) ==========
  {t:"WhatsApp Accounts | USA Number | Fresh | Ready to Use",p:3,c:"WhatsApp Accounts",s:100},
  {t:"WhatsApp Accounts | UK Number | Fresh | Ready to Use",p:3.5,c:"WhatsApp Accounts",s:50},
  // ========== CASHAPP (6) ==========
  {t:"CashApp Accounts | USA | BTC Enabled | Email & Phone Verified | SSN Verified",p:15,c:"CashApp Accounts",s:30},
  {t:"CashApp Accounts | USA | BTC Enabled | Email Verified | Registered from USA IP",p:8,c:"CashApp Accounts",s:50},
  {t:"CashApp Accounts | USA | Fresh | Email Verified | No BTC | Registered from USA IP",p:3,c:"CashApp Accounts",s:100},
  // ========== INDEED (6) ==========
  {t:"Indeed Accounts | USA | Email Verified | Resume Uploaded | Registered from USA IP",p:3,c:"Indeed Accounts",s:100},
  {t:"Indeed Accounts | UK | Email Verified | Resume Uploaded | Registered from UK IP",p:3.5,c:"Indeed Accounts",s:50},
  {t:"Indeed Employer Accounts | USA | Email & Phone Verified | Company Profile Setup",p:10,c:"Indeed Accounts",s:20},
  // ========== DISCORD (6) ==========
  {t:"Discord Accounts | Email Verified | Token Included | Aged 1+ Month | Random Country",p:0.5,c:"Discord Accounts",s:500},
  {t:"Discord Accounts | Phone Verified | Email Included | Token Included | USA Number",p:1.5,c:"Discord Accounts",s:200},
  {t:"Discord Accounts | Aged 2020-2022 | Email & Phone Verified | Token Included",p:3,c:"Discord Accounts",s:80},
  {t:"Discord Accounts | Nitro Boost | Email & Phone Verified | Token Included",p:5,c:"Discord Accounts",s:30},
  // ========== SNAPCHAT (6) ==========
  {t:"Snapchat Accounts | USA | Phone Verified | Email Included | Profile Set | Registered from USA IP",p:2,c:"Snapchat Accounts",s:150},
  {t:"Snapchat Accounts | UK | Phone Verified | Email Included | Profile Set | Registered from UK IP",p:2.5,c:"Snapchat Accounts",s:80},
  {t:"Snapchat Accounts | Fresh | Email Verified | Random Country IP",p:1,c:"Snapchat Accounts",s:300},
  // ========== QUORA (6) ==========
  {t:"Quora Accounts | Email Verified | Profile Set | Registered from USA IP",p:1.5,c:"Quora Accounts",s:200},
  {t:"Quora Accounts | 1000+ Followers | Email Verified | Profile Set | USA Registered",p:10,c:"Quora Accounts",s:20},
  {t:"Quora Accounts | Aged 2019-2021 | Email Verified | Profile Set | USA Registered",p:5,c:"Quora Accounts",s:50},
  // ========== PINTEREST (6) ==========
  {t:"Pinterest Accounts | USA | Email Verified | Profile Photo | 5+ Boards | Registered from USA IP",p:1.5,c:"Pinterest Accounts",s:200},
  {t:"Pinterest Accounts | USA | Email Verified | 1000+ Followers | Profile Set",p:8,c:"Pinterest Accounts",s:30},
  {t:"Pinterest Accounts | Business Account | USA | Email Verified | Profile Set",p:3,c:"Pinterest Accounts",s:80},
  // ========== DATING (15) ==========
  {t:"Bumble Dating Accounts | USA | Phone Verified | Profile Set | Male | Registered from USA IP",p:5,c:"Bumble Dating Accounts",s:30},
  {t:"Bumble Dating Accounts | USA | Phone Verified | Profile Set | Female | Registered from USA IP",p:5,c:"Bumble Dating Accounts",s:30},
  {t:"Badoo Dating Accounts | Email Verified | Profile Photo | Male | Registered from USA IP",p:3,c:"Badoo Dating Accounts",s:50},
  {t:"Badoo Dating Accounts | Email Verified | Profile Photo | Female | Registered from USA IP",p:3,c:"Badoo Dating Accounts",s:50},
  {t:"Grindr Dating Accounts | Email Verified | Profile Set | USA Registered",p:4,c:"Grindr Dating Accounts",s:30},
  {t:"MeetMe Dating Accounts | Email Verified | Profile Set | USA Registered",p:3,c:"MeetMe Dating Accounts",s:50},
  {t:"Tinder Accounts | Phone Verified | USA Number | Profile Photo | Male",p:6,c:"Dating App Accounts",s:30},
  {t:"Tinder Accounts | Phone Verified | USA Number | Profile Photo | Female",p:6,c:"Dating App Accounts",s:30},
  // ========== NETFLIX & STREAMING (8) ==========
  {t:"Netflix Accounts | Premium 4K UHD | 1 Month | Private Profile | Email Included",p:3,c:"Netflix Accounts & Gift Cards",s:200},
  {t:"Netflix Gift Card | $25 USD | USA Region | Digital Code",p:20,c:"Netflix Accounts & Gift Cards",s:50},
  {t:"Netflix Gift Card | $50 USD | USA Region | Digital Code",p:40,c:"Netflix Accounts & Gift Cards",s:30},
  // ========== APPLE & GIFT CARDS (20) ==========
  {t:"Apple ID Accounts | USA | Phone Verified | Email Included | Registered from USA IP",p:3,c:"Apple",s:100},
  {t:"Apple Gift Card | $10 USD | USA Region | Digital Code",p:8,c:"Apple ID & Gift Cards",s:50},
  {t:"Apple Gift Card | $25 USD | USA Region | Digital Code",p:20,c:"Apple ID & Gift Cards",s:30},
  {t:"Apple Gift Card | $50 USD | USA Region | Digital Code",p:40,c:"Apple ID & Gift Cards",s:20},
  {t:"Google Play Gift Card | $10 USD | USA Region | Digital Code",p:8,c:"Google Play Gift Cards",s:50},
  {t:"Google Play Gift Card | $25 USD | USA Region | Digital Code",p:20,c:"Google Play Gift Cards",s:30},
  {t:"Google Play Gift Card | $50 USD | USA Region | Digital Code",p:40,c:"Google Play Gift Cards",s:20},
  {t:"Amazon Gift Card | $10 USD | USA Region | Digital Code",p:8,c:"Amazon Gift Cards",s:50},
  {t:"Amazon Gift Card | $25 USD | USA Region | Digital Code",p:20,c:"Amazon Gift Cards",s:30},
  {t:"PlayStation Gift Card | $10 USD | USA Region | Digital Code",p:8,c:"PlayStation Gift Cards",s:50},
  {t:"PlayStation Gift Card | $25 USD | USA Region | Digital Code",p:20,c:"PlayStation Gift Cards",s:30},
  {t:"Steam Gift Card | $10 USD | Global Region | Digital Code",p:8,c:"Steam Gift Cards",s:50},
  {t:"Steam Gift Card | $20 USD | Global Region | Digital Code",p:16,c:"Steam Gift Cards",s:30},
  // ========== VPN & PROXY (12) ==========
  {t:"Mobile Proxies | USA | 4G/LTE | Rotating | Unlimited Bandwidth | 30 Days",p:30,c:"Mobile Proxies",s:50},
  {t:"Mobile Proxies | USA | 4G/LTE | Static IP | 30 Days",p:25,c:"Mobile Proxies",s:50},
  {t:"NordVPN Premium | 1 Year Subscription | Email Included | Instant Delivery",p:5,c:"VPN Premium",s:100},
  {t:"ExpressVPN Premium | 1 Year Subscription | Email Included | Instant Delivery",p:6,c:"VPN Premium",s:80},
  {t:"Surfshark VPN Premium | 2 Year Subscription | Email Included | Instant Delivery",p:4,c:"VPN Premium",s:100},
  // ========== VPS / RDP (6) ==========
  {t:"Windows VPS / RDP | USA | 2 vCPU | 4GB RAM | 50GB SSD | 30 Days",p:15,c:"Windows VPS / RDP Server",s:30},
  {t:"Windows VPS / RDP | USA | 4 vCPU | 8GB RAM | 100GB SSD | 30 Days",p:25,c:"Windows VPS / RDP Server",s:20},
  {t:"Windows VPS / RDP | EU | 2 vCPU | 4GB RAM | 50GB SSD | 30 Days",p:15,c:"Windows VPS / RDP Server",s:30},
  // ========== OUTLOOK / EMAIL (9) ==========
  {t:"Outlook / Hotmail Accounts | USA | Phone Verified | Recovery Email Included | Registered from USA IP",p:0.5,c:"Outlook Email Accounts",s:500},
  {t:"Outlook / Hotmail Accounts | Aged 2018-2020 | USA | Phone Verified | Recovery Email",p:2,c:"Outlook Email Accounts",s:100},
  {t:"Protonmail Accounts | Email Verified | Recovery Email Included | Premium Features",p:3,c:"Protonmail Accounts",s:50},
  {t:"Protonmail Accounts | Fresh | Email Verified | Free Plan | Random Country",p:1,c:"Protonmail Accounts",s:200},
  // ========== AMAZON (6) ==========
  {t:"Amazon Accounts | USA | Phone Verified | Email Included | Prime Eligible | Registered from USA IP",p:5,c:"Amazon Accounts",s:50},
  {t:"Amazon Accounts | USA | Aged Buyer Account | Phone Verified | Email Included",p:8,c:"Amazon Accounts",s:30},
  {t:"Amazon Accounts | UK | Phone Verified | Email Included | Registered from UK IP",p:5,c:"Amazon Accounts",s:40},
  // ========== CRAIGSLIST (3) ==========
  {t:"Craigslist Accounts | USA | Phone Verified | Email Included | Ready to Post",p:5,c:"Craigslist Ads Accounts",s:30},
  {t:"Craigslist Accounts | USA | Aged 1+ Year | Phone Verified | Email Included",p:10,c:"Craigslist Ads Accounts",s:15},
  // ========== ETSY (1) ==========
  {t:"Etsy Accounts | USA | Email & Phone Verified | Shop Ready | Registered from USA IP",p:10,c:"Etsy-accounts",s:20},
  // ========== EBAY (2) ==========
  {t:"eBay Accounts | USA | Phone Verified | Email Included | Seller Ready | Registered from USA IP",p:8,c:"eBay Accounts",s:30},
  {t:"eBay Accounts | UK | Phone Verified | Email Included | Seller Ready | Registered from UK IP",p:8,c:"eBay Accounts",s:20},
  // ========== SPOTIFY (2) ==========
  {t:"Spotify Premium | 1 Year Subscription | Email Included | Instant Delivery",p:5,c:"Spotify Accounts",s:100},
  {t:"Spotify Premium | 6 Months Subscription | Email Included | Instant Delivery",p:3,c:"Spotify Accounts",s:150},
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find().lean();
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    // Delete existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    let created = 0;
    let skipped = 0;

    for (const raw of rawProducts) {
      const slug = categoryMap[raw.c];
      if (!slug || !catMap[slug]) {
        console.log(`  Skipped: No category for "${raw.c}" (slug: ${slug})`);
        skipped++;
        continue;
      }

      const priceWithMarkup = markup(raw.p);
      const details = extractDetails(raw.t);
      const title = seoTitle(raw.t, raw.c);
      const description = seoDescription(raw.t, raw.c, priceWithMarkup);
      const shortDescription = shortDesc(raw.t, raw.c);

      const product = new Product({
        title,
        description,
        shortDescription,
        category: catMap[slug],
        price: priceWithMarkup,
        stockCount: raw.s || 50,
        minQuantity: 1,
        maxQuantity: Math.min(raw.s || 50, 100),
        deliveryType: 'manual',
        isActive: true,
        isFeatured: raw.p >= 5,
        accountDetails: {
          region: details.region,
          verification: details.verification,
          format: details.format,
          features: details.features,
        },
      });

      await product.save();
      created++;
    }

    console.log(`\nDone! Created ${created} products, skipped ${skipped}`);
    console.log(`All prices have 30% markup applied`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
