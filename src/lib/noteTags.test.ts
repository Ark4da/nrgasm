import { describe, expect, it } from 'vitest';
import { hasNoteTag, toggleNoteTag } from './noteTags';

describe('note tags', () => {
  it('adds a tag to an empty note', () => {
    expect(toggleNoteTag('', 'sweet')).toBe('#sweet');
  });

  it('adds a tag after the text, on the same line', () => {
    expect(toggleNoteTag('Great with ice', 'buy-again')).toBe('Great with ice #buy-again');
  });

  it('removes a tag that is there, wherever it is', () => {
    expect(toggleNoteTag('#sweet Great with ice #sour', 'sweet')).toBe('Great with ice #sour');
    expect(toggleNoteTag('Nice #sour', 'sour')).toBe('Nice');
  });

  it('does not confuse a tag with a longer one', () => {
    expect(hasNoteTag('#too-sweet', 'sweet')).toBe(false);
    expect(toggleNoteTag('#too-sweet', 'sweet')).toBe('#too-sweet #sweet');
  });

  it('finds tags case-insensitively', () => {
    expect(hasNoteTag('Lovely #Sweet', 'sweet')).toBe(true);
  });
});
