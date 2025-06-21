I have a few SEO optimized JSON-LD structured data for a website.

Blog Detail Page:

<script type="application/ld+json">

{

  "@context": "https://schema.org",

  "@type": "BlogPosting",

  "headline": "{{Title}}",

  "description": "{{Description}}",

  "datePublished": "{{Date}}",

  "url": "https://jet.framer.website/blog/{{Slug}}"

}

</script>

Updates Detail Page:

<script type="application/ld+json">

{

  "@context": "https://schema.org",

  "@type": "TechArticle",

  "headline": "{{Title}}",

  "description": "{{Description}}",

  "datePublished": "{{Date}}",

  "url": "https://jet.framer.website/updates/{{Slug}}"

}

</script>

Careers Detail Page:

<script type="application/ld+json">

{

  "@context": "https://schema.org",

  "@type": "JobPosting",

  "title": "{{Role}}",

  "description": "{{Description}}",

  "hiringOrganization": {

    "@type": "Organization",

    "name": "Jet",

    "sameAs": "https://jet.framer.website"

  },

  "jobLocation": {

    "@type": "Place",

    "address": {

      "@type": "PostalAddress",

      "addressLocality": "{{Location}}"

    }

  },

  "industry": "{{Department}}",

  "url": "https://jet.framer.website/careers/{{Slug}}"

}

</script>

About Page:

<script type="application/ld+json">

{

  "@context": "https://schema.org",

  "@type": "AboutPage",

  "name": "About Jet",

  "url": "https://jet.framer.website/about",

  "description": "Learn about Jet's mission to make the web faster and simpler for everyone. Meet our team and discover what drives us."

}

</script>

Contact Page:

<script type="application/ld+json">

{

  "@context": "https://schema.org",

  "@type": "ContactPage",

  "name": "Contact Jet",

  "url": "https://jet.framer.website/contact",

  "description": "Get in touch with Jet for support, sales, partnerships, or general inquiries."

}

</script>

Please return a corrected version of them where you replace the company name in titles and descriptions, and the root domain in urls.

[Company name] = (Example: TaskyFlow)
[Domain name] = (Example: https://taskyflow.com/)
