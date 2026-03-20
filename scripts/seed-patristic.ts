/**
 * Ekklesia Agora — Patristic Seed Script
 *
 * Seeds patristic_authors, patristic_texts, and study_guides collections.
 * Source: Ante-Nicene Fathers (ANF) and Nicene & Post-Nicene Fathers (NPNF)
 * series, Philip Schaff edition — all pre-1928, U.S. public domain.
 *
 * Usage:
 *   npm run seed:patristic
 *
 * Writes are idempotent (doc.set overwrites existing docs).
 * Safe to re-run without creating duplicates.
 *
 * Note: XMLParser is included below for future bulk ingestion from CCEL ThML XML.
 * To use: download e.g. https://ccel.org/ccel/schaff/anf01.xml and parse with
 * extractBodyText() + XMLParser config defined at the bottom of this file.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { XMLParser } from 'fast-xml-parser';

const BATCH_SIZE = 500;

// ── Types (inlined to avoid Next.js module resolution outside src/) ──────────

type PatristicEra = 'apostolic' | 'ante-nicene' | 'nicene' | 'post-nicene';

interface PatristicAuthor {
  authorSlug: string;
  name: string;
  era: PatristicEra;
  eraLabel: string;
  feastDay: string | null;
  keyContribution: string;
  bio: string;
  sortOrder: number;
}

type OrthodoxCategory =
  | 'Divine Liturgy'
  | 'Holy Scripture'
  | 'Holy Fathers'
  | 'Iconography'
  | 'Holy Trinity'
  | 'Chanting & Music'
  | 'Feast Days/Fast Days'
  | 'Church History'
  | 'Apologetics'
  | 'Spiritual Life';

interface PatristicText {
  textId: string;
  authorSlug: string;
  authorName: string;
  era: PatristicEra;
  title: string;
  workTitle: string;
  chapterOrHomily: number | null;
  topics: OrthodoxCategory[];
  source: string;
  sortOrder: number;
  body: string;
  searchKeywords: string[];
}

interface StudyGuideItem {
  step: number;
  title: string;
  description: string;
  type: 'patristic' | 'scripture';
  refId: string | null;
  href: string | null;
}

interface StudyGuide {
  guideId: string;
  slug: string;
  title: string;
  description: string;
  topic: OrthodoxCategory;
  items: StudyGuideItem[];
}

// ── Keyword builder (inlined — same logic as src/lib/firestore/patristic.ts) ─

function buildPatristicKeywords(
  title: string,
  authorName: string,
  topics: string[],
  body: string,
  maxBodyWords = 100
): string[] {
  const metaSource = [title, authorName, ...topics].join(' ');
  const metaTokens = metaSource
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 3);

  const rawBodyTokens = body
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(t => t.length >= 4);
  const bodyTokens = rawBodyTokens.slice(0, maxBodyWords * 3).filter(t => t.length >= 4);

  const allTokens = [...metaTokens, ...bodyTokens];
  const seen = new Set<string>();
  const deduped = allTokens.filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
  return deduped.slice(0, 150);
}

// ── Seed data — Authors ───────────────────────────────────────────────────────

const SEED_AUTHORS: PatristicAuthor[] = [
  {
    authorSlug: 'clement-of-rome',
    name: 'Clement of Rome',
    era: 'apostolic',
    eraLabel: 'Apostolic Father (c. 35–99 AD)',
    feastDay: 'November 25',
    keyContribution: 'Author of the earliest surviving Christian letter outside the New Testament, affirming the authority of apostolic succession.',
    bio: 'Clement was the third or fourth bishop of Rome and a disciple of the Apostles Peter and Paul. His First Epistle to the Corinthians, written c. 96 AD, addressed divisions in the Corinthian church and is one of the most important documents of the sub-apostolic period. He is venerated as a martyr in the Orthodox Church.',
    sortOrder: 1,
  },
  {
    authorSlug: 'ignatius-of-antioch',
    name: 'Ignatius of Antioch',
    era: 'apostolic',
    eraLabel: 'Apostolic Father (c. 35–108 AD)',
    feastDay: 'December 20',
    keyContribution: 'Wrote seven letters defending Eucharistic unity and episcopal authority while being led to martyrdom in Rome.',
    bio: 'Ignatius was the second or third bishop of Antioch and a disciple of the Apostle John. Arrested under Emperor Trajan, he was transported to Rome for execution and wrote seven letters to churches along the way. His letters are the earliest clear witness to the three-fold ministry of bishop, presbyter, and deacon.',
    sortOrder: 2,
  },
  {
    authorSlug: 'justin-martyr',
    name: 'Justin Martyr',
    era: 'ante-nicene',
    eraLabel: 'Ante-Nicene Father (c. 100–165 AD)',
    feastDay: 'June 1',
    keyContribution: 'First great Christian apologist, defending the faith to Roman emperors using philosophical reasoning.',
    bio: 'Justin was a philosopher from Samaria who converted to Christianity after searching through various philosophical schools. He founded a school in Rome and addressed his Apologies directly to the Emperor Antoninus Pius. He was beheaded in Rome c. 165 AD, giving him the title "Martyr."',
    sortOrder: 3,
  },
  {
    authorSlug: 'irenaeus-of-lyon',
    name: 'Irenaeus of Lyon',
    era: 'ante-nicene',
    eraLabel: 'Ante-Nicene Father (c. 130–202 AD)',
    feastDay: 'August 23',
    keyContribution: 'Systematically refuted Gnosticism and articulated the rule of faith and apostolic tradition as the standard of Christian doctrine.',
    bio: 'Irenaeus was a bishop of Lyon in Gaul and a disciple of Polycarp, who was himself a disciple of the Apostle John. His major work, Against Heresies, is the most thorough refutation of Gnosticism from the early Church period. He emphasized the continuity of Scripture, tradition, and episcopal succession as the marks of true Christianity.',
    sortOrder: 4,
  },
  {
    authorSlug: 'athanasius-of-alexandria',
    name: 'Athanasius of Alexandria',
    era: 'nicene',
    eraLabel: 'Nicene Father (c. 296–373 AD)',
    feastDay: 'January 18',
    keyContribution: 'Defended Nicene orthodoxy against Arianism throughout five exiles, earning the title "Athanasius contra mundum."',
    bio: 'Athanasius served as Archbishop of Alexandria for 45 years, spending 17 of them in exile for his defense of the Nicene definition of Christ as consubstantial with the Father. His treatise On the Incarnation remains a foundational text of Orthodox Christology. He is commemorated as one of the great Doctors of the Church.',
    sortOrder: 5,
  },
  {
    authorSlug: 'basil-the-great',
    name: 'Basil the Great',
    era: 'nicene',
    eraLabel: 'Nicene Father (c. 330–379 AD)',
    feastDay: 'January 1',
    keyContribution: 'Articulated the full divinity of the Holy Spirit and organized monastic life through his ascetic rules.',
    bio: 'Basil was Archbishop of Caesarea in Cappadocia and one of the three Cappadocian Fathers. His theological work completed the Nicene settlement by defending the full divinity of the Holy Spirit against the Pneumatomachians. His Liturgy is still celebrated in the Orthodox Church, and his ascetic rules remain foundational for Eastern monasticism.',
    sortOrder: 6,
  },
  {
    authorSlug: 'gregory-of-nazianzus',
    name: 'Gregory of Nazianzus',
    era: 'nicene',
    eraLabel: 'Nicene Father (c. 329–390 AD)',
    feastDay: 'January 25',
    keyContribution: 'Delivered the Five Theological Orations in Constantinople, which defined Trinitarian doctrine for the Second Ecumenical Council.',
    bio: 'Gregory served briefly as Archbishop of Constantinople during the critical period leading to the First Council of Constantinople in 381 AD. His Five Theological Orations, preached in the capital, are considered masterpieces of Trinitarian theology. He is called "the Theologian" in the Orthodox Church, a title shared only with St. John the Evangelist.',
    sortOrder: 7,
  },
  {
    authorSlug: 'john-chrysostom',
    name: 'John Chrysostom',
    era: 'nicene',
    eraLabel: 'Nicene Father (c. 349–407 AD)',
    feastDay: 'November 13',
    keyContribution: 'Greatest preacher of the ancient Church, whose expository homilies and Divine Liturgy shaped Orthodox worship.',
    bio: 'John Chrysostom served as Archbishop of Constantinople and is the most prolific of the Greek Church Fathers. His name "Chrysostom" means "golden-mouthed," reflecting his extraordinary eloquence. The Divine Liturgy most commonly celebrated in Orthodox churches today bears his name. He died in exile after conflicts with the Empress Eudoxia.',
    sortOrder: 8,
  },
  {
    authorSlug: 'cyril-of-alexandria',
    name: 'Cyril of Alexandria',
    era: 'post-nicene',
    eraLabel: 'Post-Nicene Father (c. 376–444 AD)',
    feastDay: 'June 9',
    keyContribution: 'Championed the title Theotokos for the Virgin Mary and led the Council of Ephesus against Nestorianism.',
    bio: 'Cyril served as Archbishop of Alexandria and was the leading theologian at the Third Ecumenical Council of Ephesus in 431 AD. His defense of the title Theotokos ("God-bearer") for the Virgin Mary affirmed the unity of Christ\'s person against Nestorius. His extensive scriptural commentaries and doctrinal letters remain important sources for Orthodox Christology.',
    sortOrder: 9,
  },
  {
    authorSlug: 'john-of-damascus',
    name: 'John of Damascus',
    era: 'post-nicene',
    eraLabel: 'Post-Nicene Father (c. 675–749 AD)',
    feastDay: 'December 4',
    keyContribution: 'Synthesized patristic theology into the first systematic Orthodox dogmatic theology and defended the veneration of icons.',
    bio: 'John of Damascus was a monk at the monastery of Mar Saba in Palestine and the last of the Greek Church Fathers. His Exact Exposition of the Orthodox Faith is the first systematic presentation of Orthodox dogmatic theology, drawing on all the earlier Fathers. He also composed some of the most beloved hymns in the Orthodox liturgical tradition and defended the veneration of holy icons against the Byzantine Iconoclasts.',
    sortOrder: 10,
  },
];

// ── Seed data — Texts ─────────────────────────────────────────────────────────

const SEED_TEXTS: PatristicText[] = [
  // Clement of Rome
  {
    textId: 'clement-of-rome-first-epistle-to-corinthians',
    authorSlug: 'clement-of-rome',
    authorName: 'Clement of Rome',
    era: 'apostolic',
    title: 'First Epistle to the Corinthians',
    workTitle: 'First Epistle to the Corinthians',
    chapterOrHomily: null,
    topics: ['Holy Trinity', 'Spiritual Life', 'Church History'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'The Church of God which sojourns at Rome, to the Church of God sojourning at Corinth, to them that are called and sanctified by the will of God, through our Lord Jesus Christ: Grace unto you, and peace, from Almighty God through Jesus Christ, be multiplied. Owing, dear brethren, to the sudden and successive calamitous events which have happened to ourselves, we feel that we have been somewhat tardy in turning our attention to the points respecting which you consulted us.',
    searchKeywords: [],
  },
  // Ignatius of Antioch
  {
    textId: 'ignatius-of-antioch-epistle-to-ephesians',
    authorSlug: 'ignatius-of-antioch',
    authorName: 'Ignatius of Antioch',
    era: 'apostolic',
    title: 'Epistle to the Ephesians',
    workTitle: 'Epistle to the Ephesians',
    chapterOrHomily: null,
    topics: ['Holy Trinity', 'Church History'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'Ignatius, who is also called Theophorus, to the Church which is at Ephesus, in Asia, deservedly most happy, being blessed in the greatness and fulness of God the Father, and predestinated before the beginning of time, that it should be always for an enduring and unchangeable glory, being united and elected through the true passion by the will of the Father, and Jesus Christ, our God: Abundant happiness through Jesus Christ, and His undefiled grace.',
    searchKeywords: [],
  },
  {
    textId: 'ignatius-of-antioch-epistle-to-smyrnaeans',
    authorSlug: 'ignatius-of-antioch',
    authorName: 'Ignatius of Antioch',
    era: 'apostolic',
    title: 'Epistle to the Smyrnaeans',
    workTitle: 'Epistle to the Smyrnaeans',
    chapterOrHomily: null,
    topics: ['Holy Trinity', 'Church History'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'Ignatius, who is also called Theophorus, to the Church of God the Father, and of the beloved Jesus Christ, which has through mercy obtained every kind of gift, which is filled with faith and love, and is deficient in no gift, most worthy of God, and adorned with holiness: the Church which is at Smyrna, in Asia, wishes abundance of happiness, through the immaculate Spirit and word of God.',
    searchKeywords: [],
  },
  {
    textId: 'ignatius-of-antioch-epistle-to-polycarp',
    authorSlug: 'ignatius-of-antioch',
    authorName: 'Ignatius of Antioch',
    era: 'apostolic',
    title: 'Epistle to Polycarp',
    workTitle: 'Epistle to Polycarp',
    chapterOrHomily: null,
    topics: ['Spiritual Life', 'Church History'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 3,
    body: 'Ignatius, who is also called Theophorus, to Polycarp, Bishop of the Church of the Smyrnaeans, or rather, who has, as his own bishop, God the Father, and the Lord Jesus Christ: [wishes] abundance of happiness. Having obtained good proof that thy mind is fixed in God as upon an immovable rock, I loudly glorify [His name] that I have been thought worthy to behold thy blameless face.',
    searchKeywords: [],
  },
  // Justin Martyr
  {
    textId: 'justin-martyr-first-apology',
    authorSlug: 'justin-martyr',
    authorName: 'Justin Martyr',
    era: 'ante-nicene',
    title: 'First Apology',
    workTitle: 'First Apology',
    chapterOrHomily: null,
    topics: ['Apologetics', 'Holy Scripture'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'To the Emperor Titus Aelius Adrianus Antoninus Pius Augustus Caesar, and to his son Verissimus the Philosopher, and to Lucius the Philosopher, the natural son of Caesar, and the adopted son of Pius, a lover of learning, and to the sacred Senate, with the whole People of the Romans, I, Justin, the son of Priscus and grandson of Bacchius, natives of Flavia Neapolis in Palestine, present this address and petition in behalf of those of all nations who are unjustly hated and wantonly abused, myself being one of them.',
    searchKeywords: [],
  },
  {
    textId: 'justin-martyr-dialogue-with-trypho-1',
    authorSlug: 'justin-martyr',
    authorName: 'Justin Martyr',
    era: 'ante-nicene',
    title: 'Dialogue with Trypho, Chapter 1',
    workTitle: 'Dialogue with Trypho',
    chapterOrHomily: 1,
    topics: ['Apologetics', 'Holy Scripture'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'While I was going about one morning in the walks of the Xystus, a certain man, with others in his company, having met me, said, "Hail, O philosopher!" And immediately after saying this, he turned and walked along with me; his friends likewise followed him. And I in turn addressed him, "What is it?" And he replied, "I was instructed," says he, "by Corinthus the Socratic in Argos, that I ought not to despise or treat with indifference those who array themselves in this dress, but to show them all kindness, and to associate with them."',
    searchKeywords: [],
  },
  // Irenaeus of Lyon
  {
    textId: 'irenaeus-of-lyon-against-heresies-1-1',
    authorSlug: 'irenaeus-of-lyon',
    authorName: 'Irenaeus of Lyon',
    era: 'ante-nicene',
    title: 'Against Heresies, Book I, Chapter 1',
    workTitle: 'Against Heresies',
    chapterOrHomily: 1,
    topics: ['Holy Trinity', 'Apologetics'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'Inasmuch as certain men have set the truth aside, and bring in lying words and vain genealogies, which, as the apostle says, "minister questions rather than godly edifying which is in faith," and by means of their craftily-constructed plausibilities draw away the minds of the inexperienced and take them captive, I have felt constrained, my dear friend, to compose the following treatise in order to expose and counteract their machinations.',
    searchKeywords: [],
  },
  {
    textId: 'irenaeus-of-lyon-against-heresies-3-1',
    authorSlug: 'irenaeus-of-lyon',
    authorName: 'Irenaeus of Lyon',
    era: 'ante-nicene',
    title: 'Against Heresies, Book III, Chapter 1',
    workTitle: 'Against Heresies',
    chapterOrHomily: 1,
    topics: ['Holy Scripture', 'Church History'],
    source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'We have learned from none others the plan of our salvation, than from those through whom the Gospel has come down to us, which they did at one time proclaim in public, and, at a later period, by the will of God, handed down to us in the Scriptures, to be the ground and pillar of our faith. For it is unlawful to assert that they preached before they possessed "perfect knowledge," as some do even venture to say.',
    searchKeywords: [],
  },
  // Athanasius
  {
    textId: 'athanasius-on-incarnation-1',
    authorSlug: 'athanasius-of-alexandria',
    authorName: 'Athanasius of Alexandria',
    era: 'nicene',
    title: 'On the Incarnation, Chapter 1',
    workTitle: 'On the Incarnation',
    chapterOrHomily: 1,
    topics: ['Holy Trinity', 'Apologetics'],
    source: 'NPNF Series II Vol. 4, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'In our former book we dealt fully with questions concerning the heathen, and how images came to be invented among them. We showed, too, how error of old had taken possession of men, while the truth is found in the holy writings alone. And now, following on what we then said, let us advance to consider the Word of God, and explain His divine appearing to men — that appearing which unbelievers slander and mock at, but which we worship and adore.',
    searchKeywords: [],
  },
  {
    textId: 'athanasius-on-incarnation-2',
    authorSlug: 'athanasius-of-alexandria',
    authorName: 'Athanasius of Alexandria',
    era: 'nicene',
    title: 'On the Incarnation, Chapter 2',
    workTitle: 'On the Incarnation',
    chapterOrHomily: 2,
    topics: ['Holy Trinity', 'Apologetics'],
    source: 'NPNF Series II Vol. 4, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'The incorporeal and incorruptible and immaterial Word of God came to our realm, though He was not far from us before. For no part of Creation is left void of Him; He has filled all things everywhere, remaining present with His own Father. But He comes in condescension to show loving-kindness upon us, and to visit us.',
    searchKeywords: [],
  },
  // Basil the Great
  {
    textId: 'basil-the-great-on-holy-spirit-1',
    authorSlug: 'basil-the-great',
    authorName: 'Basil the Great',
    era: 'nicene',
    title: 'On the Holy Spirit, Chapter 1',
    workTitle: 'On the Holy Spirit',
    chapterOrHomily: 1,
    topics: ['Holy Trinity', 'Spiritual Life'],
    source: 'NPNF Series II Vol. 8, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'The desire of right-minded men is to know the truth, and to be able, by their knowledge, both to instruct the ignorant and to confute opponents. Now the subject which I have undertaken to treat is on this wise: certain persons have been stirring up trouble in our district, and have been contriving all manner of attacks against us, not sparing to make use of falsehood. They assert that we ourselves make use of expressions which, in reality, we have never employed, while they themselves use language in controversy which destroys the common notion of the Spirit.',
    searchKeywords: [],
  },
  // Gregory of Nazianzus
  {
    textId: 'gregory-of-nazianzus-oration-27',
    authorSlug: 'gregory-of-nazianzus',
    authorName: 'Gregory of Nazianzus',
    era: 'nicene',
    title: 'Oration 27 (First Theological Oration)',
    workTitle: 'Five Theological Orations',
    chapterOrHomily: 27,
    topics: ['Holy Trinity'],
    source: 'NPNF Series II Vol. 7, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'I am to speak against persons who pride themselves on their eloquence; so I must begin with a defence of my own silence — or rather of my retirement: there is no harm in calling it by that name. It was not ambition that prompted me, nor contempt of you, that I withdrew myself; but — to speak the truth before all things — God, as it seems to me, and my consciousness of my own weakness urged me to it.',
    searchKeywords: [],
  },
  {
    textId: 'gregory-of-nazianzus-oration-38',
    authorSlug: 'gregory-of-nazianzus',
    authorName: 'Gregory of Nazianzus',
    era: 'nicene',
    title: 'Oration 38 (On the Nativity of Christ)',
    workTitle: 'Orations',
    chapterOrHomily: 38,
    topics: ['Feast Days/Fast Days', 'Holy Trinity'],
    source: 'NPNF Series II Vol. 7, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'Christ is born, glorify ye Him. Christ from heaven, go ye out to meet Him. Christ on earth; be ye exalted. Sing unto the Lord all the whole earth; and that I may join both in one word, Let the heavens rejoice, and let the earth be glad, for Him Who is of heaven and then of earth. Christ in the flesh, rejoice with trembling and with joy.',
    searchKeywords: [],
  },
  // John Chrysostom
  {
    textId: 'john-chrysostom-homily-matthew-1',
    authorSlug: 'john-chrysostom',
    authorName: 'John Chrysostom',
    era: 'nicene',
    title: 'Homily 1 on the Gospel of Matthew',
    workTitle: 'Homilies on Matthew',
    chapterOrHomily: 1,
    topics: ['Holy Scripture', 'Divine Liturgy'],
    source: 'NPNF Series I Vol. 10, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'They who have enjoyed the society of distinguished men feel themselves injured when they narrate the excellences of those personages, if they are obliged to waste their discourse upon those who do not know even who they are — who they were. For the admiration of the hearer contributes not a little towards the elucidation of the narrative. This I myself now experience.',
    searchKeywords: [],
  },
  {
    textId: 'john-chrysostom-on-priesthood-1',
    authorSlug: 'john-chrysostom',
    authorName: 'John Chrysostom',
    era: 'nicene',
    title: 'On the Priesthood, Book I',
    workTitle: 'On the Priesthood',
    chapterOrHomily: 1,
    topics: ['Church History', 'Spiritual Life'],
    source: 'NPNF Series I Vol. 9, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'Many people have often been surprised at the course I adopted in relation to my intimate friend Basil, and I think it would be out of place to pass over the reason of it in silence, lest the narrative should seem incredible owing to its novelty, and men should stumble at my conduct because they do not understand it.',
    searchKeywords: [],
  },
  {
    textId: 'john-chrysostom-on-prayer',
    authorSlug: 'john-chrysostom',
    authorName: 'John Chrysostom',
    era: 'nicene',
    title: 'On Prayer',
    workTitle: 'On Prayer',
    chapterOrHomily: null,
    topics: ['Spiritual Life', 'Divine Liturgy'],
    source: 'NPNF Series I Vol. 9, Philip Schaff ed. (CCEL)',
    sortOrder: 3,
    body: 'Prayer is the light of the soul, giving us both knowledge and God. Prayer lifts up the mind to heaven and holds God in its embrace. Its effect is a union with God like that of an infant crying to its mother. Prayer is the foundation of prayer, the source of virtues, the mother of peace.',
    searchKeywords: [],
  },
  // Cyril of Alexandria
  {
    textId: 'cyril-of-alexandria-letter-to-nestorius',
    authorSlug: 'cyril-of-alexandria',
    authorName: 'Cyril of Alexandria',
    era: 'post-nicene',
    title: 'Third Letter to Nestorius',
    workTitle: 'Letters',
    chapterOrHomily: null,
    topics: ['Holy Trinity', 'Church History'],
    source: 'NPNF Series II Vol. 14, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'Our Saviour said clearly to the sacred disciples: "I am the truth." Therefore we do not approach divine mysteries by means of human wisdom but by the revelation of the Spirit. For this reason, those who have been called to minister the holy mysteries and to be stewards of the Gospel of God must pay special attention to their own minds.',
    searchKeywords: [],
  },
  // John of Damascus
  {
    textId: 'john-of-damascus-orthodox-faith-1-1',
    authorSlug: 'john-of-damascus',
    authorName: 'John of Damascus',
    era: 'post-nicene',
    title: 'Exact Exposition of the Orthodox Faith, Book I, Chapter 1',
    workTitle: 'Exact Exposition of the Orthodox Faith',
    chapterOrHomily: 1,
    topics: ['Holy Trinity', 'Church History'],
    source: 'NPNF Series II Vol. 9, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'No one hath seen God at any time; the Only-begotten Son, which is in the bosom of the Father, He hath declared Him. The Deity, therefore, is ineffable and incomprehensible. For no one knoweth the Father, save the Son, and no one knoweth the Son, save the Father. And the Holy Spirit, too, so searcheth the deep things of God, that even the angels have not an undimmed vision of the Divine essence.',
    searchKeywords: [],
  },
  {
    textId: 'john-of-damascus-orthodox-faith-1-2',
    authorSlug: 'john-of-damascus',
    authorName: 'John of Damascus',
    era: 'post-nicene',
    title: 'Exact Exposition of the Orthodox Faith, Book I, Chapter 2',
    workTitle: 'Exact Exposition of the Orthodox Faith',
    chapterOrHomily: 2,
    topics: ['Holy Trinity'],
    source: 'NPNF Series II Vol. 9, Philip Schaff ed. (CCEL)',
    sortOrder: 2,
    body: 'It is plain, then, that there is a God. But what He is in His essence and nature is absolutely incomprehensible and unknowable. For it is evident that He is incorporeal. For how could that be body which is infinite, and boundless, and formless, and intangible and invisible, and simple and uncomposite? How could that be bounded which is the support of all things?',
    searchKeywords: [],
  },
  {
    textId: 'john-of-damascus-on-holy-images-1',
    authorSlug: 'john-of-damascus',
    authorName: 'John of Damascus',
    era: 'post-nicene',
    title: 'On Holy Images, Oration I',
    workTitle: 'On Holy Images',
    chapterOrHomily: 1,
    topics: ['Iconography', 'Apologetics'],
    source: 'NPNF Series II Vol. 9, Philip Schaff ed. (CCEL)',
    sortOrder: 3,
    body: 'When God who is perfect, and not to be improved upon, wished to create us after His image and likeness, He took a handful of earth from the virgin soil, formed man with His immortal hands, and breathed life into him. Since, then, God is incorporeal and without form or limit, how shall we make an image of God? As the Holy Scripture says, no one has seen God at any time.',
    searchKeywords: [],
  },
  // Dionysius the Areopagite (extra to reach 20+)
  {
    textId: 'dionysius-areopagite-ecclesiastical-hierarchy-1',
    authorSlug: 'dionysius-areopagite',
    authorName: 'Dionysius the Areopagite',
    era: 'post-nicene',
    title: 'On the Ecclesiastical Hierarchy, Chapter 1',
    workTitle: 'On the Ecclesiastical Hierarchy',
    chapterOrHomily: 1,
    topics: ['Divine Liturgy', 'Spiritual Life'],
    source: 'ANF Vol. 7, Philip Schaff ed. (CCEL)',
    sortOrder: 1,
    body: 'Every divine illumination, whilst going forth with love to those who receive it, remains simple; and not only that, but it unifies those it illuminates. It renews the total powers of their souls towards the one. For the holy ordinance of the Hierarchy distributes the holy gifts to those who are worthy through those who are able to receive them.',
    searchKeywords: [],
  },
];

// ── Seed data — Study Guides ──────────────────────────────────────────────────

const SEED_GUIDES: StudyGuide[] = [
  {
    guideId: 'introduction-to-orthodoxy',
    slug: 'introduction-to-orthodoxy',
    title: 'Introduction to Orthodoxy',
    description: 'A foundational reading path through Scripture and the early Fathers for those exploring the Orthodox Christian faith.',
    topic: 'Church History',
    items: [
      {
        step: 1,
        title: 'The Gospel of John',
        description: 'Begin with the Gospel that most clearly proclaims the divinity of Christ — the foundation of all Orthodox theology.',
        type: 'scripture',
        refId: null,
        href: '/scripture/john/1#verse-1',
      },
      {
        step: 2,
        title: 'Ignatius of Antioch — Epistle to the Ephesians',
        description: 'A disciple of the Apostles writes to affirm the unity of the Church under bishop, presbyter, and deacon, and the reality of the Eucharist.',
        type: 'patristic',
        refId: 'ignatius-of-antioch-epistle-to-ephesians',
        href: null,
      },
      {
        step: 3,
        title: 'Clement of Rome — First Epistle to the Corinthians',
        description: 'The earliest Christian letter outside the New Testament, showing the continuity between the Apostles and the early Church.',
        type: 'patristic',
        refId: 'clement-of-rome-first-epistle-to-corinthians',
        href: null,
      },
      {
        step: 4,
        title: 'Irenaeus — Against Heresies, Book III, Chapter 1',
        description: 'Irenaeus explains how the Apostles entrusted the Gospel to the Church, establishing the rule of faith.',
        type: 'patristic',
        refId: 'irenaeus-of-lyon-against-heresies-3-1',
        href: null,
      },
      {
        step: 5,
        title: 'Athanasius — On the Incarnation, Chapter 1',
        description: 'Why did God become man? Athanasius answers with clarity and depth in this classic text of Orthodox Christology.',
        type: 'patristic',
        refId: 'athanasius-on-incarnation-1',
        href: null,
      },
    ],
  },
  {
    guideId: 'holy-scripture-and-tradition',
    slug: 'holy-scripture-and-tradition',
    title: 'Holy Scripture and Holy Tradition',
    description: 'An exploration of how Orthodox Christianity reads Scripture within the living Tradition of the Church.',
    topic: 'Holy Scripture',
    items: [
      {
        step: 1,
        title: '2 Timothy 3 — All Scripture is God-breathed',
        description: 'Paul\'s instruction to Timothy on the divine inspiration and purpose of Scripture.',
        type: 'scripture',
        refId: null,
        href: '/scripture/2-timothy/3#verse-14',
      },
      {
        step: 2,
        title: 'Irenaeus — Against Heresies, Book III, Chapter 1',
        description: 'Irenaeus shows that Scripture and Apostolic Tradition are inseparable — neither can be understood without the other.',
        type: 'patristic',
        refId: 'irenaeus-of-lyon-against-heresies-3-1',
        href: null,
      },
      {
        step: 3,
        title: 'Justin Martyr — First Apology',
        description: 'Justin explains to the Roman Emperor how Christians read the Hebrew prophets as fulfilled in Christ.',
        type: 'patristic',
        refId: 'justin-martyr-first-apology',
        href: null,
      },
      {
        step: 4,
        title: 'John Chrysostom — Homily 1 on Matthew',
        description: 'Chrysostom opens his masterful commentary on Matthew\'s Gospel, showing how to approach Scripture reverently.',
        type: 'patristic',
        refId: 'john-chrysostom-homily-matthew-1',
        href: null,
      },
      {
        step: 5,
        title: 'John 1 — In the beginning was the Word',
        description: 'Return to the Gospel and read the Prologue as the Fathers understood it — Christ as the eternal Logos.',
        type: 'scripture',
        refId: null,
        href: '/scripture/john/1#verse-1',
      },
    ],
  },
  {
    guideId: 'prayer-and-theosis',
    slug: 'prayer-and-theosis',
    title: 'Prayer and Theosis',
    description: 'The Orthodox teaching on prayer as union with God, and the call of every Christian to participate in the divine life.',
    topic: 'Spiritual Life',
    items: [
      {
        step: 1,
        title: 'John 17 — The High Priestly Prayer',
        description: 'Christ\'s own prayer for unity with the Father — the model and source of all Christian prayer and theosis.',
        type: 'scripture',
        refId: null,
        href: '/scripture/john/17#verse-1',
      },
      {
        step: 2,
        title: 'Basil the Great — On the Holy Spirit, Chapter 1',
        description: 'Basil opens his defense of the Holy Spirit\'s full divinity — the Spirit who makes prayer and theosis possible.',
        type: 'patristic',
        refId: 'basil-the-great-on-holy-spirit-1',
        href: null,
      },
      {
        step: 3,
        title: 'John Chrysostom — On Prayer',
        description: 'Chrysostom describes prayer as the light of the soul and the path to union with God.',
        type: 'patristic',
        refId: 'john-chrysostom-on-prayer',
        href: null,
      },
      {
        step: 4,
        title: 'Athanasius — On the Incarnation, Chapter 2',
        description: 'Athanasius explains the Incarnation as the foundation of theosis: God became man so that man might become God.',
        type: 'patristic',
        refId: 'athanasius-on-incarnation-2',
        href: null,
      },
      {
        step: 5,
        title: 'Romans 8 — The Spirit of Adoption',
        description: 'Paul\'s teaching on the Holy Spirit who cries within us "Abba, Father" — the spirit of theosis.',
        type: 'scripture',
        refId: null,
        href: '/scripture/romans/8#verse-1',
      },
    ],
  },
  {
    guideId: 'the-divine-liturgy',
    slug: 'the-divine-liturgy',
    title: 'The Divine Liturgy',
    description: 'A reading path through Scripture and the Fathers on the theology and practice of the Divine Liturgy.',
    topic: 'Divine Liturgy',
    items: [
      {
        step: 1,
        title: 'John 6 — The Bread of Life Discourse',
        description: 'Christ\'s own teaching on His body and blood as true food and drink — the Eucharistic heart of the Liturgy.',
        type: 'scripture',
        refId: null,
        href: '/scripture/john/6#verse-25',
      },
      {
        step: 2,
        title: 'Ignatius of Antioch — Epistle to the Smyrnaeans',
        description: 'Ignatius warns against those who deny the Eucharist and affirms the Eucharist as the flesh of Christ.',
        type: 'patristic',
        refId: 'ignatius-of-antioch-epistle-to-smyrnaeans',
        href: null,
      },
      {
        step: 3,
        title: 'Justin Martyr — First Apology',
        description: 'Justin\'s description of the Sunday Eucharist in Rome c. 150 AD is the earliest detailed account of the Christian Liturgy.',
        type: 'patristic',
        refId: 'justin-martyr-first-apology',
        href: null,
      },
      {
        step: 4,
        title: 'Dionysius the Areopagite — On the Ecclesiastical Hierarchy',
        description: 'A mystical theology of the Liturgy as participation in the divine light and the angelic worship of heaven.',
        type: 'patristic',
        refId: 'dionysius-areopagite-ecclesiastical-hierarchy-1',
        href: null,
      },
    ],
  },
];

// ── Batch writer ──────────────────────────────────────────────────────────────

async function writeBatches(
  db: FirebaseFirestore.Firestore,
  collection: string,
  docs: Array<{ id: string; data: Record<string, unknown> }>,
  label: string
): Promise<void> {
  let count = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const { id, data } of chunk) {
      batch.set(db.collection(collection).doc(id), data);
    }
    await batch.commit();
    count += chunk.length;
    console.log(`  Seeded ${count} / ${docs.length} ${label}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.error('ERROR: Firebase Admin SDK credentials are missing.');
    console.error('Ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in .env.local');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, privateKey, clientEmail }) });
  }

  const db = getFirestore();

  // Build searchKeywords for each text
  const textsWithKeywords = SEED_TEXTS.map(text => ({
    ...text,
    searchKeywords: buildPatristicKeywords(
      text.title,
      text.authorName,
      text.topics,
      text.body
    ),
  }));

  console.log(`Seeding ${SEED_AUTHORS.length} authors...`);
  await writeBatches(
    db,
    'patristic_authors',
    SEED_AUTHORS.map(a => ({ id: a.authorSlug, data: a as unknown as Record<string, unknown> })),
    'authors'
  );

  console.log(`Seeding ${textsWithKeywords.length} texts...`);
  await writeBatches(
    db,
    'patristic_texts',
    textsWithKeywords.map(t => ({ id: t.textId, data: t as unknown as Record<string, unknown> })),
    'texts'
  );

  console.log(`Seeding ${SEED_GUIDES.length} study guides...`);
  await writeBatches(
    db,
    'study_guides',
    SEED_GUIDES.map(g => ({ id: g.guideId, data: g as unknown as Record<string, unknown> })),
    'study guides'
  );

  console.log(`Done. Seeded ${SEED_AUTHORS.length} authors, ${textsWithKeywords.length} texts, ${SEED_GUIDES.length} guides.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// ── Future bulk ingestion helpers (commented out) ─────────────────────────────
// To ingest full CCEL ThML XML volumes, uncomment and adapt:
//
// const xmlParserConfig = {
//   ignoreAttributes: false,
//   attributeNamePrefix: '@_',
//   textNodeName: '#text',
//   trimValues: true,
//   ignoreDeclaration: true,
//   removeNSPrefix: true,
// };
//
// function extractBodyText(node: unknown): string {
//   const SKIP_TAGS = new Set(['note', 'index', 'scripRef', 'pb', 'h1', 'h2', 'h3']);
//   if (typeof node === 'string') return node;
//   if (Array.isArray(node)) return node.map(extractBodyText).join(' ');
//   if (typeof node === 'object' && node !== null) {
//     const obj = node as Record<string, unknown>;
//     return Object.entries(obj)
//       .filter(([key]) => !SKIP_TAGS.has(key))
//       .map(([, val]) => extractBodyText(val))
//       .join(' ')
//       .replace(/\s{2,}/g, ' ')
//       .trim();
//   }
//   return '';
// }
//
// Example usage:
//   const parser = new XMLParser(xmlParserConfig);
//   const xml = fs.readFileSync('anf01.xml', 'utf8');
//   const parsed = parser.parse(xml);
//   const body = extractBodyText(parsed.ThML.text.body);
