// Quick tags live inside the note itself as #words, so they travel with
// the note through export and import and need no new storage field.

export interface NoteTag {
  id: string;
  label: string;
}

export const NOTE_TAGS: NoteTag[] = [
  { id: 'sweet', label: 'Sweet' },
  { id: 'too-sweet', label: 'Too sweet' },
  { id: 'sour', label: 'Sour' },
  { id: 'fruity', label: 'Fruity' },
  { id: 'fizzy', label: 'Fizzy' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'buy-again', label: 'Would buy again' },
  { id: 'never-again', label: 'Never again' },
];

/** `#id` as a whole word: `#sweet` is not found inside `#too-sweet` or `#sweetest`. */
function tagPattern(id: string): RegExp {
  return new RegExp(`(^|\\s)#${id}(?=\\s|$)`, 'i');
}

export function hasNoteTag(note: string, id: string): boolean {
  return tagPattern(id).test(note);
}

/** Adds the tag at the end of the note, or removes it if it is there. */
export function toggleNoteTag(note: string, id: string): string {
  if (hasNoteTag(note, id)) {
    return note.replace(tagPattern(id), '$1').replace(/[ \t]{2,}/g, ' ').trim();
  }
  const text = note.trimEnd();
  return text === '' ? `#${id}` : `${text} #${id}`;
}
