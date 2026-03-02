# Plan — Next Session

## Completed (this session)
- Verb tense UI: TenseSelector + VerbSelector components (scroll tabs + chips)
- CSS specificity fix: active tab green background works on all selections
- 7 new grammar topics: verbs-regular (10 tenses), verbs-irregular (14 verbs × 5 tenses), ser-estar, passive, direct-object, indirect-object, reflexive
- 2 new grammar topics: adverbs (תואר הפועל 🏋️), prepositional-pronouns (כינויי גוף + יחס 🧩)
- Screenshots 2+3 merged into subjuntivo tense (futuro do subjuntivo + imperfeito combo)
- Screenshot 4 (estar pra) merged into ser-estar → presente
- Various content fixes: infinitivo hints, futuro table simplified, imperativo uses falar, topic renames, note splits

---

## Task 1 — Songs grammar links (with deep linking)

### Step 1 — Add URL search-param support to `GrammarTopicPage.jsx`
- Import `useSearchParams` from react-router-dom
- On mount, read `?tense=<id>&verb=<id>` and use as initial state (falling back to first tense/verb)
- Example URL: `/grammar/verbs-irregular?verb=ter&tense=presente`

### Step 2 — Extend songs.json `grammar_notes` schema
Add optional fields per entry:
```json
{
  "topic_id": "verbs-irregular",
  "verb_id": "ter",
  "tense_id": "presente",
  "label_he": "פועל חריג — ter"
}
```

### Step 3 — Update song page link component
Build href as `/grammar/<topic_id>?tense=<tense_id>&verb=<verb_id>` when those fields are present.

### Step 4 — Map songs grammar_notes to topic IDs
95 notes with `topic_id: null` across 23 songs. ~65 mappable to existing topics.

| Label pattern | → topic_id | tense_id / verb_id |
|---|---|---|
| זמן הווה / הווה — | `verbs-regular` | `presente` |
| הווה מתמשך — gerúndio | `verbs-regular` | `gerundio` |
| עתיד קרוב — ir + פועל | `verbs-regular` | `futuro` |
| ציווי — | `verbs-regular` | `imperativo` |
| עבר מתמשך / imperfeito | `verbs-regular` | `preterito-imperfeito` |
| זמן עבר (regular) | `verbs-regular` | `preterito-perfeito` |
| פועל חריג — ter/ser/ver/ir/dar/vir/dizer/fazer | `verbs-irregular` | `presente`, verb_id = verb |
| זמן עבר — ser/estar/ir/vir/dar | `verbs-irregular` | `preterito-perfeito`, verb_id |
| ser ב- / estar ב- / tem = יש / estar pra | `ser-estar` | tense as appropriate |
| ser + particípio / sou feito / פועל סביל | `passive` | — |
| פועל רפלקסיבי | `reflexive` | — |
| כינוי גוף — מושא (me = אותי) | `direct-object` | — |
| כינוי גוף — מושא (me = לי) | `indirect-object` | — |
| כינוי גוף אחרי מילת יחס | `prepositional-pronouns` | — |
| תואר הפועל | `adverbs` | — |
| משפט תנאי — se / subjuntivo | `verbs-regular` | `subjuntivo` |
| עתיד מותנה — se + שורש / quando | `verbs-regular` | `subjuntivo` |
| מילית יחס + יידוע (em+a=na, de+o=do) | `contractions` | — |

### Remaining nulls (leave for later)
sim להדגשה, nascer pra, deveria, ficar + gerúndio, começar a — no matching topic yet

---

## Task 2 — Songs: search / filter

Add a search input at the top of the songs list page.
- Filters songs in real time by title (PT or HE) as the user types
- If no results, show a friendly empty state
- Input is RTL-aware (Hebrew keyboard friendly)
- No backend needed — filter the in-memory songs array

---

## Task 3 — Songs: show/hide translation toggle

On the song page, add a button to reveal or hide the Hebrew translation of the lyrics.
- Default state: translation hidden (encourages active listening/reading)
- Button label changes: "הצג תרגום" / "הסתר תרגום"
- Toggle applies per-song (state lives in the song page component)
- Translation lines are already in the lyrics data — just conditionally render them
