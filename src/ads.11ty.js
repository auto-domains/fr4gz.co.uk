// Generates /ads.txt only when an AdSense publisher ID is configured.
export const data = {
  eleventyExcludeFromCollections: true,
  eleventyComputed: {
    permalink: (data) => (data.site.adsense.client ? "/ads.txt" : false),
  },
};

export function render({ site }) {
  const publisher = site.adsense.client.replace(/^ca-/, "");
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
}
