const supabase = require('../lib/supabase');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const wantAll = req.query.all === 'true';

    if (wantAll) {
      if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { data, error } = await supabase.from('listings').select('*').order('event_date');
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('event_date');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    const required = ['eventName', 'date', 'area', 'distances', 'organizerName', 'organizerPhone', 'organizerEmail'];
    for (const f of required) {
      if (!b[f] || (Array.isArray(b[f]) && b[f].length === 0)) {
        return res.status(400).json({ error: 'Missing field: ' + f });
      }
    }
    // city/state are optional — public submissions default to Chennai/Tamil Nadu
    // via the database column defaults set in migrations/002-add-city-state.sql.
    const insertRow = {
      event_name: b.eventName,
      event_date: b.date,
      area: b.area,
      distances: b.distances,
      description: b.description || '',
      organizer_name: b.organizerName,
      organizer_phone: b.organizerPhone,
      organizer_email: b.organizerEmail,
      website: b.website || '',
      status: 'pending'
    };
    if (b.city) insertRow.city = b.city;
    if (b.state) insertRow.state = b.state;

    const { data, error } = await supabase.from('listings').insert(insertRow).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
