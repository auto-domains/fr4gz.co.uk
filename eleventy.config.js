import videoGroups from "./src/_data/videoGroups.js";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(value) {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

// Removes empty values so structured data only contains real information.
function stripEmpty(value) {
  if (Array.isArray(value)) {
    const items = value.map(stripEmpty).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value instanceof Date) return isoDate(value);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = stripEmpty(item);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    const keys = Object.keys(out);
    return keys.length && !(keys.length === 1 && keys[0] === "@type") ? out : undefined;
  }
  return value === null || value === undefined || value === "" || value === false ? undefined : value;
}

function breadcrumbs(id, items) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item })),
  };
}

function faqPage(id, faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
  };
}

function videoList(videos) {
  return {
    "@type": "ItemList",
    numberOfItems: videos.length,
    itemListElement: videos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      name: video.title,
    })),
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/_headers": "_headers",
    "src/favicon.svg": "favicon.svg",
    "node_modules/@fontsource/chakra-petch/files/chakra-petch-latin-{400,600,700}-normal.woff2": "assets/fonts",
    "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-{400,500}-normal.woff2": "assets/fonts",
  });

  // Give h2 and h3 headings in markdown an id so pages can link to sections.
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ typographer: false });
    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if ((token.tag === "h2" || token.tag === "h3") && !token.attrGet("id")) {
        const text = tokens[idx + 1].children
          .filter((child) => child.type === "text" || child.type === "code_inline")
          .map((child) => child.content)
          .join("");
        token.attrSet("id", slugify(text));
      }
      return self.renderToken(tokens, idx, options);
    };
  });

  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("isoDate", isoDate);
  eleventyConfig.addFilter("readableDate", (value) => {
    const date = toDate(value);
    return date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
  });

  eleventyConfig.addFilter("byGroup", (videos, key) => videos.filter((v) => v.group === key));
  eleventyConfig.addFilter("groupByKey", (key) => videoGroups.find((g) => g.key === key));

  // Glossary terms grouped by first letter, for the A to Z index.
  eleventyConfig.addFilter("byLetter", (terms) => {
    const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, "en-GB"));
    const letters = new Map();
    for (const term of sorted) {
      const first = term.term[0].toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      if (!letters.has(letter)) letters.set(letter, []);
      letters.get(letter).push(term);
    }
    return [...letters].map(([letter, items]) => ({ letter, items }));
  });

  eleventyConfig.addFilter("toc", (html) =>
    [...String(html).matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({ id: m[1], text: m[2] })),
  );
  eleventyConfig.addFilter("splitContent", (html, nth = 2) => {
    const source = String(html);
    let index = -1;
    let from = 0;
    for (let i = 0; i < nth; i++) {
      index = source.indexOf("<h2", from);
      if (index === -1) return [source, ""];
      from = index + 3;
    }
    return [source.slice(0, index), source.slice(index)];
  });

  // Structured data (JSON-LD).
  eleventyConfig.addFilter("jsonLd", (data) => JSON.stringify(stripEmpty(data)).replace(/</g, "\\u003c"));

  eleventyConfig.addFilter("homeSchema", (videos, d) => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${d.site.url}/#website`,
        url: `${d.site.url}/`,
        name: d.site.name,
        alternateName: d.site.domain,
        description: d.site.description,
        inLanguage: d.site.lang,
      },
      { "@type": "WebPage", "@id": `${d.site.url}/`, name: d.title, description: d.description, isPartOf: { "@id": `${d.site.url}/#website` } },
      faqPage(`${d.site.url}/#faq`, d.faqs),
    ],
  }));

  eleventyConfig.addFilter("videosSchema", (videos, d) => {
    const pageUrl = d.site.url + d.page.url;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": pageUrl,
          url: pageUrl,
          name: d.heading,
          description: d.description,
          isPartOf: { "@id": `${d.site.url}/#website` },
          mainEntity: videoList(videos),
        },
        breadcrumbs(`${pageUrl}#breadcrumb`, [
          ["Home", `${d.site.url}/`],
          [d.heading, pageUrl],
        ]),
      ],
    };
  });

  eleventyConfig.addFilter("glossarySchema", (terms, d) => {
    const pageUrl = d.site.url + d.page.url;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "DefinedTermSet",
          "@id": `${pageUrl}#terms`,
          name: d.heading,
          description: d.description,
          url: pageUrl,
          hasDefinedTerm: terms.map((t) => ({
            "@type": "DefinedTerm",
            name: t.term,
            description: t.def,
            url: `${pageUrl}#${slugify(t.term)}`,
          })),
        },
        breadcrumbs(`${pageUrl}#breadcrumb`, [
          ["Home", `${d.site.url}/`],
          [d.heading, pageUrl],
        ]),
      ],
    };
  });

  eleventyConfig.addFilter("articleSchema", (d) => {
    const pageUrl = d.site.url + d.page.url;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${pageUrl}#article`,
          headline: d.heading,
          description: d.description,
          url: pageUrl,
          inLanguage: d.site.lang,
          dateModified: d.updated,
          isPartOf: { "@id": `${d.site.url}/#website` },
          publisher: { "@type": "Organization", name: d.site.name, url: `${d.site.url}/` },
        },
        breadcrumbs(`${pageUrl}#breadcrumb`, [
          ["Home", `${d.site.url}/`],
          [d.heading, pageUrl],
        ]),
      ],
    };
  });
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    output: "_site",
  },
  markdownTemplateEngine: false,
  htmlTemplateEngine: "njk",
  templateFormats: ["md", "njk", "11ty.js"],
};
