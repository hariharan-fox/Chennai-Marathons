const supabase = require('../lib/supabase');

// Dynamically generates sitemap.xml from whatever is currently approved in
// the database — so it's always accurate as races are added, with no
// separate step needed to "regenerate" anything.
module.exports = async (req, res) => {
  const baseUrl = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host);

  const { data, error } = await supabase
    .from('listings')
    .select('id, submitted_at')
    .eq('status', 'approved');

  if (error) {
    res.status(500).send('Error generating sitemap');
    return;
  }

  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/tamil-nadu', changefreq: 'daily', priority: '0.8' },
    { loc: '/india', changefreq: 'daily', priority: '0.8' },
    { loc: '/list-your-event', changefreq: 'monthly', priority: '0.5' }
  ];

  const listingUrls = (data || []).map(function (row) {
    return {
      loc: '/listing/' + row.id,
      lastmod: row.submitted_at ? row.submitted_at.slice(0, 10) : undefined,
      changefreq: 'weekly',
      priority: '0.7'
    };
  });

  const all = staticUrls.concat(listingUrls);

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    all.map(function (u) {
      return '  <url>\n' +
        '    <loc>' + baseUrl + u.loc + '</loc>\n' +
        (u.lastmod ? '    <lastmod>' + u.lastmod + '</lastmod>\n' : '') +
        '    <changefreq>' + u.changefreq + '</changefreq>\n' +
        '    <priority>' + u.priority + '</priority>\n' +
        '  </url>\n';
    }).join('') +
    '</urlset>';

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
};
