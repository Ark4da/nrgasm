import type { CatalogFilters, TriedFilter } from '../../lib/filters';
import { hasActiveFilters } from '../../lib/filters';
import { isRating } from '../../lib/validate';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filters: CatalogFilters;
  lines: string[];
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
}

const TRIED_OPTIONS: { value: TriedFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tried', label: 'Tried' },
  { value: 'untried', label: 'Not tried' },
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

export function FilterBar({ filters, lines, onChange, onReset }: FilterBarProps) {
  const lineOptions = [{ value: ALL_LINES, label: 'All' }, ...lines.map((line) => ({ value: line, label: line }))];

  return (
    <div role="search" className={styles.bar}>
      <div className={styles.searchRow}>
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

      <div className={styles.groups}>
        <ChoiceGroup
          legend="Line"
          name="line"
          options={lineOptions}
          value={filters.line ?? ALL_LINES}
          onChange={(line) => onChange({ ...filters, line: line === ALL_LINES ? null : line })}
        />
        <ChoiceGroup
          legend="Status"
          name="tried"
          options={TRIED_OPTIONS}
          value={filters.tried}
          onChange={(tried) => onChange({ ...filters, tried })}
        />
        {hasActiveFilters(filters) && (
          <button type="button" className={styles.reset} onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
