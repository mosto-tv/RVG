import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid2X2, List, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { useFetch } from '../lib/useFetch.js';
import { api, priceFmt, shortPrice } from '../lib/api.js';
import { categoryLabel, cityLabel } from '../lib/labels.js';
import { CATEGORY_ORDER } from '../components/CategoryGrid.jsx';

const BED_OPTIONS = ['Any', '2+', '4+', '8+', '16+', '32+'];
const BATH_OPTIONS = ['Any', '15+', '30+', '45+', '60+'];
const SORTS = [
  { value: 'featured', label: 'ویژه' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price-asc', label: 'درآمد: کم به زیاد' },
  { value: 'price-desc', label: 'درآمد: زیاد به کم' },
  { value: 'popularity', label: 'محبوب‌ترین' },
];
const PRICE_BANDS = [
  { label: 'زیر ۵ هزار', min: '', max: '5000' },
  { label: '۵ تا ۱۵ هزار', min: '5000', max: '15000' },
  { label: 'بیش از ۱۵ هزار', min: '15000', max: '' },
];

const PAGE_SIZE = 6;

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const view = params.get('view') || 'grid';
  const sort = params.get('sort') || 'featured';

  const query = useMemo(() => {
    const entries = {};
    for (const key of ['q', 'location', 'type', 'minPrice', 'maxPrice', 'beds', 'baths', 'minSize', 'agent']) {
      const value = params.get(key);
      if (value) entries[key] = value;
    }
    entries.sort = sort;
    entries.page = page;
    entries.limit = PAGE_SIZE;
    return entries;
  }, [params, sort, page]);

  const { data, loading, error } = useFetch(`/properties${api.query(query)}`, [api.query(query)]);
  const meta = useFetch('/properties/meta');
  const agents = useFetch('/agents');

  useEffect(() => {
    setPage(1);
  }, [params.toString()]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (view !== 'grid') next.set('view', view);
    setParams(next, { replace: true });
  };

  const agentName = useMemo(() => {
    const slug = params.get('agent');
    if (!slug) return '';
    return agents.data?.items?.find((agent) => agent.slug === slug)?.name || slug;
  }, [params, agents.data]);

  const activeFilters = useMemo(() => {
    const chips = [];
    const add = (key, label) => {
      const value = params.get(key);
      if (!value) return;
      chips.push({ key, label });
    };
    add('q', `«${params.get('q')}»`);
    add('location', cityLabel(params.get('location')));
    add('type', categoryLabel(params.get('type')));
    if (params.get('minPrice') || params.get('maxPrice')) {
      const min = params.get('minPrice');
      const max = params.get('maxPrice');
      chips.push({
        key: 'price',
        label: `${min ? shortPrice(Number(min)) : 'بدون حداقل'} – ${max ? shortPrice(Number(max)) : 'بدون سقف'}`,
      });
    }
    if (params.get('beds')) chips.push({ key: 'beds', label: `${params.get('beds')}+ بازیکن` });
    if (params.get('baths')) chips.push({ key: 'baths', label: `${params.get('baths')}+ دقیقه` });
    if (params.get('minSize'))
      chips.push({ key: 'minSize', label: `${Number(params.get('minSize')).toLocaleString()}+ اعتبار` });
    if (agentName) chips.push({ key: 'agent', label: agentName });
    return chips;
  }, [params, agentName]);

  const removeFilter = (key) => {
    const next = new URLSearchParams(params);
    if (key === 'price') {
      next.delete('minPrice');
      next.delete('maxPrice');
    } else {
      next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const hasMore = Boolean(data?.hasMore);

  const Filters = (
    <div className={`filters${mobileFilters ? '' : ' filters--collapsed'}`}>
      <div className="filters__head">
        <span className="filters__title">فیلترها</span>
        <button className="filters__clear" onClick={clearAll}>
          پاک کردن همه
        </button>
      </div>

      <div className="filters__group">
        <span className="filters__label">محله</span>
        <div className="filters__options">
          {(meta.data?.cities || []).map((city) => (
            <button
              key={city.name}
              className={`filter-pill${params.get('location') === city.name ? ' is-active' : ''}`}
              onClick={() => update('location', params.get('location') === city.name ? '' : city.name)}
            >
              {cityLabel(city.name)} ({city.count})
            </button>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">دسته‌بندی</span>
        <div className="filters__options">
          {CATEGORY_ORDER.map((type) => (
            <button
              key={type}
              className={`filter-pill${params.get('type') === type ? ' is-active' : ''}`}
              onClick={() => update('type', params.get('type') === type ? '' : type)}
            >
              {categoryLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">درآمد</span>
        <div className="filters__options">
          {PRICE_BANDS.map((band) => {
            const active = params.get('minPrice') === band.min && params.get('maxPrice') === band.max;
            return (
              <button
                key={band.label}
                className={`filter-pill${active ? ' is-active' : ''}`}
                onClick={() => {
                  if (active) {
                    removeFilter('price');
                    return;
                  }
                  const next = new URLSearchParams(params);
                  band.min ? next.set('minPrice', band.min) : next.delete('minPrice');
                  band.max ? next.set('maxPrice', band.max) : next.delete('maxPrice');
                  setParams(next, { replace: true });
                }}
              >
                {band.label}
              </button>
            );
          })}
        </div>
        <div className="price-row">
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="حداقل $"
            value={params.get('minPrice') || ''}
            onChange={(event) => update('minPrice', event.target.value)}
            aria-label="کمترین درآمد"
          />
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="حداکثر $"
            value={params.get('maxPrice') || ''}
            onChange={(event) => update('maxPrice', event.target.value)}
            aria-label="بیشترین درآمد"
          />
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">بازیکنان</span>
        <div className="filters__options">
          {BED_OPTIONS.map((option) => {
            const value = option === 'Any' ? '' : option.replace('+', '');
            return (
              <button
                key={option}
                className={`filter-pill${(params.get('beds') || '') === value ? ' is-active' : ''}`}
                onClick={() => update('beds', value)}
              >
                {option === 'Any' ? 'همه' : option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">مدت سشن</span>
        <div className="filters__options">
          {BATH_OPTIONS.map((option) => {
            const value = option === 'Any' ? '' : option.replace('+', '');
            return (
              <button
                key={option}
                className={`filter-pill${(params.get('baths') || '') === value ? ' is-active' : ''}`}
                onClick={() => update('baths', value)}
              >
                {option === 'Any' ? 'همه' : option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filters__group">
        <span className="filters__label">کمترین اعتبار</span>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          placeholder="مثلاً ۴۰۰۰"
          value={params.get('minSize') || ''}
          onChange={(event) => update('minSize', event.target.value)}
          aria-label="کمترین اعتبار"
        />
      </div>

      {meta.data && (
        <p className="form-note">
          بازه درآمد {priceFmt(meta.data.price.min)} – {priceFmt(meta.data.price.max)} · {meta.data.total} امکان
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>امکانات</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>زندگی در لس سانتوس</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              {total > 0 ? `${total} امکان فعال روی سرور` : 'شهر را با سبک بازی خودتان هماهنگ کنید'} — درخواست‌های
              وایت‌لیست حداکثر تا ۴۸ ساعت بررسی می‌شوند.
            </p>
          </div>
          <div className="results-bar__tools">
            <button className="btn btn--outline btn--sm filter-toggle-mobile" onClick={() => setMobileFilters((v) => !v)}>
              <SlidersHorizontal size={14} /> {mobileFilters ? 'بستن فیلترها' : 'فیلترها'}
            </button>
            <select
              className="input"
              value={sort}
              onChange={(event) => update('sort', event.target.value)}
              aria-label="ترتیب نمایش امکانات"
              style={{ maxWidth: 200 }}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="view-toggle" role="group" aria-label="حالت نمایش">
              <button
                className={view === 'grid' ? 'is-active' : ''}
                onClick={() => update('view', 'grid')}
                aria-label="نمایش شبکه‌ای"
              >
                <Grid2X2 size={15} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => update('view', 'list')}
                aria-label="نمایش فهرستی"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="shell listings-layout">
        <div style={{ display: mobileFilters ? 'block' : undefined }}>{Filters}</div>

        <div>
          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((chip) => (
                <span key={chip.key} className="active-filter">
                  {chip.label}
                  <button onClick={() => removeFilter(chip.key)} aria-label={`حذف فیلتر ${chip.label}`}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button className="filters__clear" onClick={clearAll} style={{ alignSelf: 'center' }}>
                پاک کردن همه فیلترها
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-row">
              <span className="loading-row__bar" />
              در حال بارگذاری امکانات
            </div>
          )}

          {error && (
            <div className="form-alert form-alert--error">
              {error.message} <button onClick={() => window.location.reload()}>تلاش دوباره</button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="empty-state">
              <span className="empty-state__icon">
                <SlidersHorizontal size={20} />
              </span>
              <h3>هیچ امکانی با این فیلترها پیدا نشد</h3>
              <p>
                بازه درآمد را گسترده‌تر کنید یا یکی از فیلترها را بردارید. تیم ما هم می‌تواند سیستم‌هایی پیشنهاد دهد
                که با سبک بازی شما هماهنگ باشد.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn--sm" onClick={clearAll}>
                  پاک کردن همه فیلترها
                </button>
                <Link to="/contact" className="btn btn--outline btn--sm">
                  پرسش از تیم
                </Link>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className={`results-grid${view === 'list' ? ' results-grid--list' : ''}`}>
              {items.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="load-more">
              <button className="btn btn--outline" onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
                {loading ? 'در حال بارگذاری' : 'نمایش امکانات بیشتر'}
              </button>
              <span className="form-note">
                نمایش {items.length} از {total}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
