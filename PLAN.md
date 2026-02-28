# Estrela Guia — Implementation Plan

## What We're Building
A Hebrew-language platform for learning Portuguese, targeting Hebrew speakers (heavy Capoeira student audience).
Static site: React + Vite + Sass + JSON data → GitHub Pages.

---

## Stage 1 — Project Setup + Home Page ✅ DONE
- Vite + React scaffold, Sass architecture, RTL layout
- Home page with 4 category cards (vocabulary, grammar, sentence completion, songs)
- Header + NavMenu components

---

## Stage 2 — Vocabulary Section ✅ DONE

### What was built
- **VocabularyPage** — grid of category pills, "בחן את עצמך" CTA
- **VocabCategoryPage** — learning mode: flip cards, prev/next navigation, swipe gestures, dots progress indicator, sticky header, scroll-to-top on mount
- **VocabQuizPage** — full quiz system:
  - Setup screen: multi-select categories, word count (10/20/30/all), deselect all
  - Quiz phase: random PT↔HE direction per card, slide animation on mark, flip animation on reveal
  - Results screen: score, praise message, confetti (≥70%), retry wrong words button
  - Recap phase: drill wrong words until all correct, returns to results
  - Per-category quiz: skips setup screen entirely (skipSetup flag via router state)
  - Mark buttons outside card, hidden until answer revealed
  - Answer background neutral (not green — green is reserved for "correct" button)

### Data: `src/data/vocabulary.json`
Array of categories: `[{ id, titleHe, icon, words: [{ pt, he }] }]`
15 categories: kitchen, numbers, ordinals, colors, family, places, verbs, time, weekdays, months, seasons, animals, plants, fruits, nature, emotions.

---

## Stage 3 — Grammar Section ✅ DONE

### What was built
- **GrammarPage** — grid of topic cards (icon, title, tagline)
- **GrammarTopicPage** — 3 phases: learn (explanation + examples) → quiz → results (+ optional recap wrong)
- **TopicBlock / BlockTable** — renders paragraph, note, table blocks; mixed LTR/RTL per column
- Quiz card: question shows sentence + optional base form + instruction; flip reveals filled sentence + HE translation
- Same animateCard/flipCard/results pattern as vocabulary

### Data: `src/data/grammar-topics.json`
- 3 topics: יידוע (articles), שמות תואר (adjectives), שייכות (possession)
- Sentence schema: `{ id, blank_pt, answer, instruction, translation, base? }`
- Explanation blocks: `{ type: "paragraph"|"table"|"note", he, ... }`

---

## Stage 4 — Songs Section 🔄 IN PROGRESS (2 / 6+ songs done)

### What was built
- **SongsPage** — stacked LTR list of song buttons with green left-border accent
- **SongDetailPage** — 4-phase page (detail / quiz / recap / results):
  - Lyrics in verse groups, stacked on mobile / side-by-side on tablet
  - Grammar notes split into ✨ חדש / 🔄 תזכורת; marked words highlighted; links to `/grammar/:topicId` or "בקרוב" badge
  - Word quiz: random PT↔HE per card; Sentence quiz: PT → flip → HE
  - Exit button (✕ יציאה) in progress bar on all quiz/recap phases

### Data: `src/data/songs.json`
Song schema: `{ id, title, type, media_url, lyrics[][], grammar_notes[], vocab[], sentences[] }`

### Remaining: add 4 songs from PDF
See **Songs — Status** table below.

---

## Stage 5 — Complete Grammar Topics ← NEXT AFTER SONGS

Add all grammar topics listed in **Grammar Topics — Missing** table below.
Same infrastructure already in place — just add entries to `grammar-topics.json`.

---

## Stage 6 — Sentence Completion

Fill-in-the-blank and translation exercises spanning multiple grammar topics.
Homepage card shows "בקרוב" badge until implemented.

---

## Routing Structure
```
/                         → Home
/vocabulary               → VocabularyPage
/vocabulary/quiz          → VocabQuizPage        (quiz inline)
/vocabulary/:categoryId   → VocabCategoryPage
/grammar                  → GrammarPage
/grammar/:topicId         → GrammarTopicPage     (quiz inline)
/songs                    → SongsPage
/songs/:songId            → SongDetailPage       (quiz inline)
/sentences                → SentencesPage        (coming soon)
```

---

## Mixed LTR/RTL — Critical Pattern

The site is `dir="rtl"` (Hebrew). Portuguese text must be wrapped:

```jsx
<span dir="ltr" lang="pt">ginga</span>
// Hebrew label + Portuguese word in same line:
<p>המשמעות של <span dir="ltr" lang="pt">ginga</span> היא נדנדה</p>
```

Table cells with Portuguese content need `dir="ltr"` on the `<td>` or inner span.

---

## Songs — Status

> Partial list — identified from class 1 PDF (68 pages). More songs likely exist.

| # | Title | Data | Media |
|---|-------|------|-------|
| 1 | Mandei caiar meu sobrado | ✅ | ✅ [link](https://capoeira.cafe/mandei-caiar-meu-sobrado-mestre-boa-voz/) |
| 2 | Veja Veja | ✅ | ✅ [link](https://www.youtube.com/watch?v=W3lkrq3jFEU&t=21s) |
| 3 | Tava lá em casa | ⬜ | ⬜ |
| 4 | É jogo praticado na terra de São Salvador | ⬜ | ⬜ |
| 5 | Marinheiro só | ⬜ | ⬜ |
| 6 | Eu Vou Encontrar Só | ⬜ | ⬜ |
| … | (more from PDF — to be identified) | ⬜ | ⬜ |

---

## Grammar Topics — Missing (not yet in grammar-topics.json)

Topics encountered in songs/content but not yet implemented:

| Topic | First seen in | Notes |
|-------|--------------|-------|
| זמן הווה | Mandei caiar (lembra) | Present tense — regular -ar/-er/-ir conjugation |
| זמן עבר | Mandei caiar (viveu, morreu) | Past tense (pretérito perfeito) — regular verbs |
| פעלים חריגים | Veja Veja (veja=ver, tem=ter) | ser, estar, ter, ir, ver, vir, poder, fazer |
| ser vs estar | — | Both = "to be"; usage rules |
| מילית היחס + יידוע | — | Contractions: em+o=no, de+o=do, a+o=ao, por+o=pelo |
| הקטנה / הגדלה | — | Diminutives (-inho/-inha) and augmentatives (-ão/-ona) |
| פעלים רפלקסיביים | — | Reflexive verbs (se chamar, se levantar…) |
| מושא עקיף | — | Verb prepositions (gostar de, precisar de, ir a…) |

---

## Design Conventions (established)
- Animations: slide (translateX) for next/prev, flip (rotateY) for reveal
- Mark buttons (right/wrong) outside the card, `visibility: hidden` until revealed
- Answer background: neutral `$bg` / `$border` — green is reserved for "correct" button
- Sticky page headers: `position: sticky; top: $header-height; background: $bg; z-index: 10`
- Results screen: always shown immediately after quiz; recap wrong words is opt-in via button
- `animLock` ref prevents concurrent animations
