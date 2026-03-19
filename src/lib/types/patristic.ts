import type { OrthodoxCategory } from '@/lib/constants/categories';

export type PatristicEra = 'apostolic' | 'ante-nicene' | 'nicene' | 'post-nicene';

export interface PatristicText {
  textId: string;            // e.g., "ignatius-ephesians" or "chrysostom-homily-matthew-1"
  authorSlug: string;        // FK to patristic_authors, e.g., "ignatius-of-antioch"
  authorName: string;        // Denormalized: "Ignatius of Antioch"
  era: PatristicEra;
  title: string;             // e.g., "Epistle to the Ephesians"
  workTitle: string;         // Parent work title if chapter: "Homilies on Matthew"
  chapterOrHomily: number | null; // null for standalone works, 1-N for chapters
  topics: OrthodoxCategory[];
  source: string;            // e.g., "ANF Vol. 1, Philip Schaff ed. (CCEL)"
  sortOrder: number;
  body: string;              // Full text stripped of XML markup
  searchKeywords: string[];  // title + authorName + topics + ~100 significant body words
}

export interface PatristicAuthor {
  authorSlug: string;        // doc ID, e.g., "ignatius-of-antioch"
  name: string;
  era: PatristicEra;
  eraLabel: string;          // Display: "Apostolic Father (c. 35-108 AD)"
  feastDay: string | null;   // e.g., "December 20 (OC)"
  keyContribution: string;   // One-sentence summary
  bio: string;               // 2-4 sentence biography
  sortOrder: number;
}

export interface StudyGuideItem {
  step: number;
  title: string;
  description: string;
  type: 'patristic' | 'scripture';
  refId: string | null;      // patristic_texts textId OR null for scripture
  href: string | null;       // null for patristic; "/scripture/john/1#verse-1" for scripture
}

export interface StudyGuide {
  guideId: string;           // doc ID, e.g., "introduction-to-orthodoxy"
  slug: string;              // URL slug (same as guideId)
  title: string;
  description: string;
  topic: OrthodoxCategory;
  items: StudyGuideItem[];
}
