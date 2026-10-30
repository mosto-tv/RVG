import express from 'express';
import { properties } from '../data/properties.js';
import { projects } from '../data/projects.js';
import { agents } from '../data/agents.js';
import { locations } from '../data/locations.js';
import { toInt } from '../lib/validate.js';

export const catalogRouter = express.Router();

const withAgent = (property) => ({
  ...property,
  agentProfile: agents.find((a) => a.slug === property.agent) || null,
});

const priceBounds = (() => {
  const prices = properties.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
})();

catalogRouter.get('/properties/meta', (_req, res) => {
  const cityCounts = new Map();
  const typeCounts = new Map();
  for (const p of properties) {
    cityCounts.set(p.city, (cityCounts.get(p.city) || 0) + 1);
    typeCounts.set(p.type, (typeCounts.get(p.type) || 0) + 1);
  }
  res.json({
    cities: [...cityCounts.entries()].sort().map(([name, count]) => ({ name, count })),
    types: [...typeCounts.entries()].sort().map(([name, count]) => ({ name, count })),
    price: priceBounds,
    size: {
      min: Math.min(...properties.map((p) => p.size)),
      max: Math.max(...properties.map((p) => p.size)),
    },
    total: properties.length,
  });
});

catalogRouter.get('/properties', (req, res) => {
  const {
    q = '',
    location = '',
    type = '',
    minPrice,
    maxPrice,
    beds,
    baths,
    minSize,
    sort = 'featured',
    page = '1',
    limit = '9',
    featured,
    agent = '',
  } = req.query;

  const search = String(q).trim().toLowerCase();
  const city = String(location).trim().toLowerCase();
  const propertyType = String(type).trim().toLowerCase();
  const minP = toInt(minPrice, null);
  const maxP = toInt(maxPrice, null);
  const minBeds = toInt(beds, null);
  const minBaths = toInt(baths, null);
  const minSqft = toInt(minSize, null);

  let items = properties.filter((p) => {
    if (search) {
      const haystack = `${p.title} ${p.city} ${p.neighborhood} ${p.country} ${p.type} ${p.headline}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (city && p.city.toLowerCase() !== city) return false;
    if (propertyType && p.type.toLowerCase() !== propertyType) return false;
    if (minP !== null && p.price < minP) return false;
    if (maxP !== null && p.price > maxP) return false;
    if (minBeds !== null && p.beds < minBeds) return false;
    if (minBaths !== null && p.baths < minBaths) return false;
    if (minSqft !== null && p.size < minSqft) return false;
    if (featured === 'true' && !p.featured) return false;
    if (agent && p.agent !== String(agent).trim()) return false;
    return true;
  });

  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
    newest: (a, b) => b.year - a.year,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    popularity: (a, b) => b.rating - a.rating,
  };
  items = [...items].sort(sorters[sort] || sorters.featured);

  const perPage = Math.min(Math.max(toInt(limit, 9), 1), 48);
  const current = Math.max(toInt(page, 1), 1);
  const total = items.length;
  const start = (current - 1) * perPage;

  res.json({
    items: items.slice(start, start + perPage).map(withAgent),
    total,
    page: current,
    pages: Math.max(Math.ceil(total / perPage), 1),
    hasMore: start + perPage < total,
  });
});

catalogRouter.get('/properties/:id', (req, res) => {
  const property = properties.find((p) => p.id === req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'That residence is no longer listed.', code: 'NOT_FOUND' });
  }
  const related = properties
    .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
    .slice(0, 3)
    .map(withAgent);
  res.json({ property: withAgent(property), related });
});

catalogRouter.get('/agents', (_req, res) => {
  res.json({
    items: agents.map((agent) => ({
      ...agent,
      listings: properties.filter((p) => p.agent === agent.slug)
        .map((p) => ({ id: p.id, title: p.title, city: p.city, price: p.price, image: p.image })),
    })),
  });
});

catalogRouter.get('/projects', (req, res) => {
  const status = String(req.query.status || '').trim().toLowerCase();
  const items = status ? projects.filter((p) => p.status.toLowerCase() === status) : projects;
  res.json({ items, statuses: [...new Set(projects.map((p) => p.status))] });
});

catalogRouter.get('/projects/:slug', (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) return res.status(404).json({ error: 'Project not found.', code: 'NOT_FOUND' });
  res.json({ project });
});

catalogRouter.get('/locations', (_req, res) => {
  res.json({ items: locations });
});

export const allProperties = properties;
