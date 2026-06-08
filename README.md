# AI Overviewing Your Health — Notebooks Reference

Analysis of AI Overview behavior in Google health searches across four countries (US, UK, Australia, India) and comparison with Baidu.

---

## Data Files

| File | Description |
|---|---|
| `data/us.csv` | Raw Google scrape — United States (120 queries) |
| `data/uk.csv` | Raw Google scrape — United Kingdom (120 queries) |
| `data/australia.csv` | Raw Google scrape — Australia (120 queries) |
| `data/india.csv` | Raw Google scrape — India (120 queries) |
| `data/baidu.csv` | Raw Baidu scrape — China (120 queries, bilingual) |
| `data/all_google.csv` | Preprocessed Google data, all four countries combined (480 rows) |
| `data/platform_combined.csv` | Google + Baidu combined (240 rows) |

### Key columns in `all_google.csv`

| Column | Description |
|---|---|
| `location` | Country (United States / United Kingdom / Australia / India) |
| `query` | Search query string |
| `has_ai_overview` | Boolean — did the query return an AI Overview? |
| `all_items` | List of bullet points from the AI Overview text |
| `all_references` | List of `{title, link, source}` dicts cited in the AI Overview |
| `cited_sources` | Subset of references cited inline in the overview |
| `paa_questions` | People Also Ask questions returned alongside the result |
| `section` | Health category: `common_conditions`, `controversial`, `legally_variable`, `tcm` |
| `topic` | Specific health topic: cancer, diabetes, hypertension, depression, hantavirus, long_covid, acupuncture, cupping, herbal, abortion, hiv, gender_affirming |

---

## Notebooks

---

### `scrape/00_scrape_google.ipynb`

**Purpose:** Collect Google search results for 120 health queries across multiple countries via SerpAPI.

**Inputs:**
- Hard-coded query list (120 queries × 12 health topics)
- SerpAPI credentials (api_key variable)
- `locations` parameter (e.g., `['Nigeria']`, repeated per country)

**Key logic:**
- `query_serpapi(location, query, api_key)` — sends a SerpAPI request with `hl=en`
- `parse_ai_overview(ai_overview)` — extracts bullet-point items, inline cited sources, and all references from the raw SerpAPI `ai_overview` block
- `extract_paa(results)` — pulls People Also Ask questions
- `run_pipeline_for_queries(queries, api_key, locations)` — loops all queries × locations with 1.5s delay, handles errors gracefully

**Outputs:**
- `<country>.csv` (e.g., `india.csv`, `uk.csv`) — one row per query with columns: `location`, `query`, `has_ai_overview`, `all_items`, `cited_sources`, `all_references`, `paa_questions`

---

### `scrape/00_scrape_baidu.ipynb`

**Purpose:** Collect Baidu search results for the same 120 health queries translated to Chinese.

**Inputs:**
- Same 120 queries as Google scrape, translated to Chinese (`query_zh`)
- Baidu API credentials

**Key logic:**
- Parallel English (`query_en`) and Chinese (`query_zh`) query columns
- Extracts AI-equivalent overview content (`all_items`) and references from Baidu's result structure

**Outputs:**
- `data/baidu.csv` — one row per query with bilingual columns (`query_en`, `query_zh`) and AI content fields

---

### `code/01_preprocess.ipynb`

**Purpose:** Combine country-level CSVs into unified analysis tables, assign topic and section labels to every query, and merge Google with Baidu.

**Inputs:**
- `data/us.csv` (as `google.csv`)
- `data/uk.csv`, `data/australia.csv`, `data/india.csv`
- `data/baidu.csv`

**Key logic:**
- `TOPIC_MAP` — dict of 120 query strings → 12 topic labels (e.g., `"breast cancer"` → `"cancer"`)
- `SECTION_MAP` — dict of topic → section (e.g., `"cancer"` → `"common_conditions"`)
- Adds `platform` column (`"google"` / `"baidu"`) and `location = "china"` for Baidu rows
- Recomputes `has_ai_overview` from `all_items` presence for Baidu rows (Baidu lacks a direct boolean)
- `pd.concat()` to produce Google-only (4-country) and Google+Baidu combined tables

**Outputs:**
- `data/df.csv` — combined Google + Baidu table (238 rows), used by downstream notebooks

---

### `code/02_basic_analysis.ipynb`

**Purpose:** Core comparative analysis of Google vs Baidu on AI overview rates, citation volume, source types, and citation locality.

**Inputs:**
- `data/df.csv` (238 rows, Google + Baidu)

**Key logic:**
- `_classify_source(url)` — regex-based classifier assigning each URL to: `institutional`, `academic`, `health_platform`, `encyclopedia`, or `lay`
- `_classify_locality(url)` — classifies each URL as `chinese` (`.cn`, Baidu domains) or `western`
- `_domain(url)` — extracts bare domain from URL
- `_parse_refs(row)` — explodes `all_references` JSON into flat reference rows
- Builds `all_refs` (flat reference table, 1,365 rows) and joins per-query summary counts back to `combined`

**Outputs (figures):**
- `fig_ai_overview_rate.png` — AI overview return rate by section × platform
- `fig_ref_scatter_errorbars.png` — mean citations per query by section (dot plot with error bars)
- `fig_source_type_dist.png` — stacked bar: source type proportions by platform
- `fig_locality.png` — citation locality (chinese vs western) by platform
- `fig_heatmap_western.png`, `fig_heatmap_chinese.png` — locality by topic heatmaps
- `fig_top_domains_google.png`, `fig_top_domains_baidu.png` — top 15 cited domains per platform

---

### `code/02_framing_analysis_baidu.ipynb`

**Purpose:** Compare how Google and Baidu frame health content on specificity, TCM stance, medical referrals, and safety warnings using LLM-coded scores.

**Inputs:**
- `data/content_coded.csv` — pre-coded framing data (166 rows, both platforms)

**Framing dimensions (all probability scores 0–1):**
- `specificity_low / medium / high` — level of clinical detail
- `tcm_pro / tcm_skeptical / tcm_not_applicable` — stance toward Traditional Chinese Medicine
- `referral_to_medical_profession` — whether the content recommends seeing a doctor
- `emergency_referral` — whether the content directs to emergency services
- `safety_warning_present / absent` — presence of explicit safety warnings

**Key logic:**
- Groups by `[section, platform]` and `[topic, platform]` to compute mean framing scores
- Divergence matrices: `(Baidu − Google)` per section, `(Google − Baidu)` per topic

**Outputs (figures):**
- `fig1_specificity.png` — overall specificity distribution + high specificity by topic
- `fig2_tcm_stance.png` — TCM stance overall + pro-TCM by topic
- `fig3_referrals_safety.png` — medical referral, emergency referral, safety warning by topic
- `fig4_heatmap_section.png` — platform divergence heatmap by section (Baidu − Google)
- `fig5_heatmap_topic.png` — platform divergence heatmap by topic (Google − Baidu)
- `fig6_section_metrics.png` — grouped bars for all metrics by section
- `fig7_section_radar.png` — radar chart profiles per section

---

### `code/03_zero_shot.ipynb`

**Purpose:** Zero-shot LLM coding of AI Overview content across all Google rows using a local Llama 3 model (Ollama).

**Inputs:**
- `data/all_google.csv` (478 rows; filtered to `has_ai_overview == True` → 318 rows)
- Ollama running locally at `http://127.0.0.1:11434` with `llama3:latest`

**Key logic:**
- `SYSTEM_PROMPT` — structured annotation prompt with 5 dimensions: specificity, TCM stance, medical referral, emergency referral, safety warning. Instructs model to return valid JSON regardless of input language (handles Chinese content)
- `build_prompt(all_items)` — joins the `all_items` bullet list into plain text, injects into prompt template
- `ollama_chat(prompt, model, silent)` — streams token output from Ollama `/api/generate` endpoint
- `parse_ollama_response(raw)` — strips markdown fences, parses JSON; returns `{}` on failure
- `code_response(query, platform, all_items)` — orchestrates one row: build → call → parse → flatten to column dict
- `run_coding_pipeline(df)` — iterates all rows with 0.5s delay, catches per-row errors

**Outputs:**
- `data/all_google_zero_shot.csv` — original columns plus 10 framing score columns and `raw_response`

---

### `code/04_ai_overview_predictor.ipynb`

**Purpose:** Predict whether a health query returns an AI Overview using gradient-boosted trees, then explain drivers with SHAP.

**Inputs:**
- `data/all_google.csv` (478 rows across 4 countries)

**Features engineered:**

| Feature | Type | Description |
|---|---|---|
| `section` | Categorical | Health category |
| `topic` | Categorical | Specific health topic |
| `location` | Categorical | Country |
| `first_word` | Categorical | First word of query (phrasing proxy) |
| `word_count` | Numeric | Number of words |
| `char_count` | Numeric | Number of characters |
| `is_question` | Binary | Starts with interrogative/modal word |
| `has_verb` | Binary | Contains action/state verb |

**Key logic:**
- Target: `has_ai_overview.astype(int)` (66.5% positive)
- Model: `CatBoostClassifier` with native categorical encoding — `depth=4`, `learning_rate=0.05`, `l2_leaf_reg=5`, `iterations=500`, `early_stopping_rounds=50`
- Evaluation: 5-fold stratified CV with out-of-fold (OOF) predictions; reports AUC-ROC and Average Precision
- SHAP: `full_model.get_feature_importance(full_pool, type="ShapValues")` — last column (bias term) dropped; produces `(478, 8)` SHAP matrix in log-odds units
- `shap_by_category(feature, ...)` — plots mean SHAP value per category value

**Results:**
- OOF AUC: 0.881 ± 0.025 | OOF AP: 0.926 ± 0.024 | OOF Accuracy: 82.8%
- Top SHAP drivers: `first_word` (0.935) > `topic` (0.465) > `section` (0.342) > `location` (0.150)

**Outputs (figures):**
- `eda_rates.png` — AI overview rate by section, topic, and country
- `cv_performance.png` — ROC curve, precision-recall curve, confusion matrix
- `feature_importance.png` — CatBoost PredictionValuesChange importance
- `shap_beeswarm.png` — SHAP beeswarm summary
- `shap_bar.png` — mean |SHAP| per feature
- `shap_by_category.png` — mean SHAP by section, topic, and country
- `shap_heatmap.png` — section × country interaction heatmap (combined SHAP)
- `prob_distribution.png` — OOF probability distributions + boxplot by section

---

### `code/05_bert.ipynb`

**Purpose:** Sentiment analysis and topic modeling on AI Overview text from US Google queries, comparing classical vs BERT-based approaches.

**Inputs:**
- `data/df.csv` — filtered to `has_ai_overview == True` and `location == "United States"` (89 rows)

**Key logic:**

*Sentiment:*
- VADER: `SentimentIntensityAnalyzer().polarity_scores(text)` → `compound` score in [−1, +1]
- BERT: `pipeline('sentiment-analysis')` using `distilbert-base-uncased-finetuned-sst-2-english` (truncated to 500 chars for 512-token limit); signed score = `score` if POSITIVE else `−score`
- Pearson correlation between VADER compound and signed BERT score: **r = 0.20**

*Topic modeling:*
- LDA: `gensim.LdaModel` with 10 topics; preprocessing via NLTK stopword removal + Porter stemming + `doc2bow`; visualized with pyLDAvis
- BERTopic: `BERTopic(min_topic_size=2)` on raw `all_items` strings; produces 6 coherent topics

**Outputs:**
- In-notebook: pyLDAvis interactive visualization, BERTopic topic info table
- No files written to disk

---

### `code/06_classify_sources.ipynb`

**Purpose:** Classify every cited reference by source type and locality using a domain lookup table; add per-query summary counts back to the main dataframes.

**Inputs:**
- `data/df.csv` (Google + Baidu combined)

**Key logic:**
- `DOMAIN_LOOKUP` — 50+ domain-to-(source_type, locality) mappings covering major health institutions, journals, platforms, and encyclopedias in both Western and Chinese contexts
- `extract_domain(url)` — strips `www.` / `m.` prefixes via `urlparse`
- `classify_source(ref)` — exact then suffix-match lookup, falls back to `("unknown", "unknown")`
- `explode_references(df)` — builds flat reference table (one row per cited URL)
- `add_ref_summary(df, refs_df)` — aggregates per-query counts of `num_refs`, `num_institutional`, `num_academic`, `num_health_platform`, `num_encyclopedia`, `num_lay`, `num_unknown`, `num_western`, `num_chinese`, `num_global`

**Outputs:**
- `google_classified.csv` — Google rows with reference summary columns appended
- `baidu_classified.csv` — Baidu rows with reference summary columns appended
- `all_refs_classified.csv` — flat reference table (Google: 998 refs, Baidu: 367 refs)

---

### `code/07_google_ai_overview_analysis.ipynb`

**Purpose:** Cross-country comparison of Google AI Overview return rates, citation depth, top cited domains, and domain overlap.

**Inputs:**
- `data/all_google.csv` (478 rows)

**Key logic:**
- `safe_parse(val)` — `ast.literal_eval` with fallback for `all_references` column
- `extract_domain(url)` — strips `www.` prefix via `urlparse`
- Builds flat `(location, domain)` table from AI overview rows only
- Jaccard overlap matrix on top-30 cited domains per country: `|A ∩ B| / |A ∪ B|`

**Results:**
- AI overview rates: AU 68.3%, IN 66.7%, UK 67.5%, US 63.6%
- Mean citations per overview: US 13.3, AU/UK ~12.5, IN 12.2
- 10 domains appear in top-30 for all four countries: `who.int`, `cdc.gov`, `mayoclinic.org`, `cancer.gov`, `ncbi.nlm.nih.gov`, `hopkinsmedicine.org`, `my.clevelandclinic.org`, `en.wikipedia.org`, `pmc.ncbi.nlm.nih.gov`, `youtube.com`

**Outputs (figures):**
- `fig_ai_rate_country.png` — overall rate + rate by section × country
- `fig_citations_country.png` — mean citations + violin distribution by country
- `fig_citations_section_topic.png` — mean citations by section and by topic
- `fig_top_domains_country.png` — top 8 cited domains per country (2×2 grid)
- `fig_domain_overlap.png` — Jaccard similarity heatmap

---

### `code/07_localized_domains.ipynb`

**Purpose:** Measure what share of domains cited in Google AI Overviews use country-specific TLDs (localization) per country and per health section.

**Inputs:**
- `data/all_google.csv` (478 rows)

**Localization rules:**

| Country | Localized TLDs |
|---|---|
| Australia | `.au` |
| India | `.in` |
| United Kingdom | `.uk`, `.scot` |
| United States | `.gov`, `.edu` (proxy — `.us` is rarely used) |

**Key logic:**
- `is_localized(domain, country)` — checks if domain ends with any of the country's localized suffixes
- Builds flat `(country, section, domain, localized)` table (4,080 domain-mention rows)
- Per-query localization share: sorts queries high→low to show whether localization is consistent or driven by outliers

**Results:**
- Localization rates: AU 48.2%, UK 41.3%, US 22.7%, IN 2.3%
- Top localized domain: AU → `healthdirect.gov.au` (79), UK → `nhs.uk` (109), US → `cdc.gov` (47), IN → `maxhealthcare.in` (7)
- India's low rate is a methodology artifact — Indian health sites predominantly use `.com`

**Outputs (figures):**
- `localized_overview.png` — localized vs non-localized share by country
- `localized_per_country.png` — top localized and non-localized domains per country (4×2 grid)
- `localized_by_section.png` — localization rate by section × country
- `localized_per_query.png` — per-query stacked bars sorted by localization share
- `localized_heatmap.png` — section × country localization rate heatmap

---

### `code/08_topics.ipynb`

**Purpose:** BERTopic topic modeling on AI Overview content for both Google (English) and Baidu (Chinese), using a multilingual sentence encoder.

**Inputs:**
- `data/df.csv` — split into `google_df` (120 rows) and `baidu_df` (120 rows)

**Key logic:**
- `extract_text(raw)` — joins `all_items` list into a single string per row
- Embedding model: `paraphrase-multilingual-MiniLM-L12-v2` (handles English and Chinese)
- `make_topic_model(n_neighbors, n_components, min_cluster_size)` — configures BERTopic with UMAP + HDBSCAN + CountVectorizer (unigrams + bigrams, `max_features=5000`)
- `section_topic_table(topic_ids, sections, model)` — reports top-3 BERTopic clusters by doc count for each section
- `plot_section_heatmap(...)` — heatmap: section × topic_id, colored by share within section, annotated with doc count
- `plot_top_keywords_by_section(...)` — bar chart of c-TF-IDF keyword scores for the dominant topic per section

**Results:**
- Google: 13 topics from 89 valid documents
- Baidu: 14 topics from 77 valid documents (Chinese keyword labels)

**Outputs (figures):**
- `fig_bertopic_google_sections.png` — section × topic heatmap for Google
- `fig_bertopic_baidu_sections.png` — section × topic heatmap for Baidu
- `fig_bertopic_google_keywords.png` — top keywords per section (Google)
- `fig_bertopic_baidu_keywords.png` — top keywords per section (Baidu)

---

### `code/09_framing_analysis_google.ipynb`

**Purpose:** Compare how Google AI Overviews frame health content across the four countries on specificity, medical guidance, and TCM stance; includes statistical tests.

**Inputs:**
- `data/all_google_zero_shot.csv` (316 rows — AI overview rows only, with LLM-coded framing scores from `03_zero_shot.ipynb`)

**Framing dimensions:** same 10 columns as produced by `03_zero_shot.ipynb`

**Key logic:**
- Radar chart: 5-spoke profile per country (high specificity, medical referral, emergency referral, safety warning, low specificity)
- Specificity stacked bars + section × country breakdown
- TCM analysis filtered to `section == "tcm"` (cupping, acupuncture, herbal topics)
- Sensitive topic deep-dives: abortion, gender-affirming care, HIV, depression — 4 framing dimensions side by side
- Statistical tests:
  - Kruskal-Wallis H-test across all 4 locations per dimension
  - Pairwise Mann-Whitney U with Bonferroni correction (42 tests)
  - Result: no dimension shows statistically significant cross-country difference at α = 0.05

**Results summary (mean values across countries):**

| Dimension | US | UK | AU | IN |
|---|---|---|---|---|
| High Specificity | 0.118 | 0.124 | 0.126 | 0.122 |
| Medical Referral | 0.683 | 0.671 | 0.652 | 0.695 |
| Safety Warning | 0.623 | 0.638 | 0.686 | 0.674 |
| TCM Pro (TCM only) | 0.342 | 0.357 | 0.409 | 0.418 |

**Outputs (figures, saved to `figures/`):**
- `01_coverage_overview.png` — query count heatmap + bar chart by section
- `02_radar_overall.png` — framing radar chart per country
- `03_specificity.png` — specificity distribution + high specificity by section
- `04_guidance.png` — medical referral and safety warning by location and section
- `05_tcm_analysis.png` — TCM stance stacked bars + pro-TCM by topic
- `06_framing_heatmaps.png` — all dimensions × location heatmap + specificity × topic heatmap
- `07_sensitive_topics.png` — framing of abortion, gender-affirming care, HIV, depression
- `08_section_comparison.png` — high specificity, medical referral, safety warning by section × location
- `09_pairwise_pvalues.png` — Bonferroni p-value heatmaps (rendered only for significant dimensions)
