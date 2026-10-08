// Site-wide settings. Any value read from process.env can be set as an
// environment variable in Cloudflare Pages (Settings > Environment variables)
// instead of editing this file. Set a value to an empty string to turn it off.
const env = process.env;

export default {
  name: "FR4GZ",
  domain: "fr4gz.co.uk",
  url: (env.SITE_URL || "https://fr4gz.co.uk").replace(/\/$/, ""),
  title: "Frag Movies, FPS Slang and Fragging History",
  description:
    "What frag means in gaming, plus classic frag movies, famous esports plays, an FPS slang glossary and the history of fragging from Doom to Valorant.",
  lang: "en-GB",
  email: "domains@replies.co.uk",
  year: new Date().getFullYear(),
  version: Date.now().toString(36),

  // Date the YouTube videos in videos.js were last checked as embeddable.
  videosChecked: "2026-10-08",

  // The "domain for sale" banner and enquiry page. The Zoho form ID comes from
  // the form's embed code (the part after /formperma/).
  sale: {
    enabled: true,
    path: "/domain-for-sale/",
    zohoForm: "O_c_XkB2NncsZvhCkUn2BiWvMSAdqSrgAGjn3m8UJcM",
    zohoUrl: "https://forms.zohopublic.eu/configservices/form/Domainnames/formperma/",
  },

  // Google Analytics 4 measurement ID (G-XXXXXXXXXX).
  analytics: {
    ga4: env.GA4_ID ?? "G-Y2117HMGEF",
  },

  // Google Ads tag ID (AW-XXXXXXXXXX), used for conversion tracking and
  // remarketing if you run Google Ads campaigns that point at this site.
  googleAds: {
    conversionId: env.GOOGLE_ADS_ID ?? "",
  },

  // Google AdSense. Set the publisher ID (ca-pub-XXXXXXXXXXXXXXXX) to load
  // AdSense (Auto ads work with this alone) and generate /ads.txt. Add ad unit
  // slot IDs to place manual ad units in the positions below.
  adsense: {
    client: env.ADSENSE_CLIENT ?? "",
    slots: {
      listing: env.ADSENSE_SLOT_LISTING ?? "", // home and videos pages, between video groups
      article: env.ADSENSE_SLOT_ARTICLE ?? "", // glossary and history pages, within the article
    },
  },

  // Google Consent Mode v2. Defaults all Google storage to "denied" until a
  // consent management platform (for example Google's own Privacy and
  // messaging CMP in AdSense) records the visitor's choice. Required for
  // serving personalised ads to UK and EEA visitors.
  consentMode: true,
};
