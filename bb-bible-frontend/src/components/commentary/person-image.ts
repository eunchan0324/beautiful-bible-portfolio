const PERSON_CODES_WITH_IMAGES = new Set([
  'abraham',
  'moses',
  'david',
  'mary',
  'paul',
  'peter',
  'joseph',
  'jacob',
  'noah',
  'sarah',
  'joshua',
  'solomon',
  'elijah',
  'daniel',
  'john-baptist',
  'timothy',
]);

export function getPersonImageStyle(personCode: string) {
  if (!PERSON_CODES_WITH_IMAGES.has(personCode)) {
    return undefined;
  }

  return {
    backgroundImage: `url(/images/persons/${personCode}.webp)`,
  };
}
