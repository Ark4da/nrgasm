import { useRef, useState } from 'react';
import type { Region } from '../../types/can';
import type { Availability, CatalogFilters, SortKey, TriedFilter } from '../../lib/filters';
import { activeFilterCount, hasActiveFilters } from '../../lib/filters';
import { isRating } from '../../lib/validate';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filters: CatalogFilters;
  lines: string[];
  /** How many cans the current filters show, for the phone panel's button. */
  resultCount: number;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
}

const TRIED_OPTIONS: { value: TriedFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tried', label: 'Tried' },
  { value: 'untried', label: 'Not tried' },
  { value: 'want', label: 'Want to try' },
];

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'current', label: 'On sale' },
  { value: 'all', label: 'All' },
  { value: 'discontinued', label: 'Discontinued' },
];

const ANY_REGION = '';
const REGION_OPTIONS: { value: Region | typeof ANY_REGION; label: string }[] = [
  { value: ANY_REGION, label: 'All' },
  { value: 'EU', label: 'Europe' },
  { value: 'US', label: 'US' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'catalog', label: 'Catalog order' },
  { value: 'name', label: 'Name' },
  { value: 'caffeine', label: 'Most caffeine' },
  { value: 'sugar', label: 'Least sugar' },
  { value: 'rating', label: 'My rating' },
  { value: 'recent', label: 'Recently changed' },
];

interface ChoiceGroupProps<T extends string> {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Radio buttons that look like chips. A generic: T is the union of allowed values. */
function ChoiceGroup<T extends string>({ legend, name, options, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const ALL_LINES = '';

interface FilterGroupsProps {
  /** Keeps radio names unique: the groups render inline and in the phone panel. */
  idPrefix: string;
  filters: CatalogFilters;
  lines: string[];
  onChange: (filters: CatalogFilters) => void;
}

function FilterGroups({ idPrefix, filters, lines, onChange }: FilterGroupsProps) {
  const lineOptions = [{ value: ALL_LINES, label: 'All' }, ...lines.map((line) => ({ value: line, label: line }))];

  return (
    <div className={styles.groups}>
      <ChoiceGroup
        legend="Line"
        name={`${idPrefix}-line`}
        options={lineOptions}
        value={filters.line ?? ALL_LINES}
        onChange={(line) => onChange({ ...filters, line: line === ALL_LINES ? null : line })}
      />
      <div className={styles.row}>
        <ChoiceGroup
          legend="Status"
          name={`${idPrefix}-tried`}
          options={TRIED_OPTIONS}
          value={filters.tried}
          onChange={(tried) => onChange({ ...filters, tried })}
        />
        <ChoiceGroup
          legend="Show"
          name={`${idPrefix}-show`}
          options={AVAILABILITY_OPTIONS}
          value={filters.availability}
          onChange={(availability) => onChange({ ...filters, availability })}
        />
        <ChoiceGroup
          legend="Region"
          name={`${idPrefix}-region`}
          options={REGION_OPTIONS}
          value={filters.region ?? ANY_REGION}
          onChange={(region) => onChange({ ...filters, region: region === ANY_REGION ? null : region })}
        />
        <label className={styles.selectLabel}>
          <span className={styles.legend}>Rating</span>
          <select
            className={styles.select}
            value={filters.minRating ?? ''}
            onChange={(event) => {
              const rating = Number(event.target.value);
              onChange({ ...filters, minRating: isRating(rating) ? rating : null });
            }}
          >
            <option value="">Any</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars and up</option>
            <option value="3">3 stars and up</option>
            <option value="2">2 stars and up</option>
            <option value="1">Rated</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export function FilterBar({ filters, lines, resultCount, onChange, onReset }: FilterBarProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const count = activeFilterCount(filters);

  function openPanel() {
    setPanelOpen(true);
    dialog.current?.showModal();
  }

  return (
    <div className={styles.bar}>
      {/* Stays under the header while the list scrolls */}
      <div role="search" className={styles.top}>
        <label className={styles.search}>
          <span className="visually-hidden">Search cans</span>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            className={styles.input}
            placeholder="Search by name, line, or flavor"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </label>

        <label className={`${styles.sortLabel} ${filters.sort !== 'catalog' ? styles.sortActive : ''}`}>
          <span className="visually-hidden">Sort by</span>
          <svg className={styles.sortIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5" />
          </svg>
          <select
            className={`${styles.select} ${styles.sort}`}
            value={filters.sort}
            onChange={(event) => {
              const sort = SORT_OPTIONS.find((option) => option.value === event.target.value)?.value;
              if (sort) onChange({ ...filters, sort });
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button type="button" className={styles.filtersButton} onClick={openPanel} aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" aria-hidden="true" className={styles.filtersIcon}>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {count > 0 && <span className={styles.badge}>{count}<span className="visually-hidden"> active</span></span>}
        </button>
      </div>

      {/* Wide screens: the groups are always visible */}
      <div className={styles.inline}>
        <FilterGroups idPrefix="inline" filters={filters} lines={lines} onChange={onChange} />
        {hasActiveFilters(filters) && (
          <button type="button" className={styles.reset} onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>

      {/* Phones: the same groups in a bottom sheet */}
      <dialog
        ref={dialog}
        className={styles.sheet}
        aria-labelledby="filters-title"
        onClose={() => setPanelOpen(false)}
        // A click on the backdrop lands on the dialog itself
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className={styles.sheetHeader}>
          <h2 id="filters-title" className={styles.sheetTitle}>Filters</h2>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>
            <span className="visually-hidden">Close filters</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {panelOpen && <FilterGroups idPrefix="sheet" filters={filters} lines={lines} onChange={onChange} />}
        <div className={styles.sheetFooter}>
          <button type="button" className={styles.reset} onClick={onReset} disabled={count === 0}>
            Clear filters
          </button>
          <button type="button" className={styles.apply} onClick={() => dialog.current?.close()}>
            Show {resultCount} {resultCount === 1 ? 'can' : 'cans'}
          </button>
        </div>
      </dialog>
    </div>
  );
}
