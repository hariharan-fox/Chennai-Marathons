const supabase = require('../lib/supabase');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('ad_banners').select('*').order('slot');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const banners = req.body || [];
    for (const b of banners) {
      const { error } = await supabase
        .from('ad_banners')
        .update({
          title: b.title || '',
          body: b.body || '',
          image_url: b.imageUrl || '',
          link_url: b.linkUrl || '',
          cta_text: b.ctaText || 'Advertise Here'
        })
        .eq('slot', b.slot);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
