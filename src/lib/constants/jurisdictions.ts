export const CANONICAL_ORTHODOX_JURISDICTIONS = [
  { id: 'ecumenical', label: 'Ecumenical Patriarchate' },
  { id: 'antiochian', label: 'Antiochian Orthodox' },
  { id: 'rocor', label: 'Russian Orthodox Church Outside Russia (ROCOR)' },
  { id: 'oca', label: 'Orthodox Church in America (OCA)' },
  { id: 'serbian', label: 'Serbian Orthodox Church' },
  { id: 'bulgarian', label: 'Bulgarian Orthodox Church' },
  { id: 'romanian', label: 'Romanian Orthodox Church' },
  { id: 'georgian', label: 'Georgian Orthodox Church' },
  { id: 'greek', label: 'Greek Orthodox Archdiocese' },
  { id: 'albanian', label: 'Albanian Orthodox Church' },
  { id: 'czech_slovak', label: 'Orthodox Church of Czech Lands and Slovakia' },
  { id: 'polish', label: 'Polish Orthodox Church' },
  { id: 'alexandrian', label: 'Greek Orthodox Patriarchate of Alexandria' },
  { id: 'jerusalem', label: 'Greek Orthodox Patriarchate of Jerusalem' },
  { id: 'cyprus', label: 'Church of Cyprus' },
  { id: 'finland', label: 'Orthodox Church of Finland' },
  { id: 'ocu', label: 'Orthodox Church of Ukraine (OCU)' },
  { id: 'uoc', label: 'Ukrainian Orthodox Church (UOC)' },
] as const;

export const OTHER_CHRISTIAN_JURISDICTIONS = [
  { id: 'inquirer', label: 'Inquirer / Catechumen' },
  { id: 'roman_catholic', label: 'Roman Catholic' },
  { id: 'protestant', label: 'Protestant' },
  { id: 'oriental_orthodox', label: 'Oriental Orthodox' },
] as const;

export type JurisdictionId =
  | (typeof CANONICAL_ORTHODOX_JURISDICTIONS)[number]['id']
  | (typeof OTHER_CHRISTIAN_JURISDICTIONS)[number]['id'];

export function getJurisdictionLabel(id: string): string {
  const all = [...CANONICAL_ORTHODOX_JURISDICTIONS, ...OTHER_CHRISTIAN_JURISDICTIONS];
  return all.find(j => j.id === id)?.label ?? id;
}
