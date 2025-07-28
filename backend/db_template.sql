-- This file holds the sqlite3 queries used to create the database that is used
-- by the WordPreprocessor class in preprocessor.py.

create table age_of_acquisition (word text, occur_total integer, occur_num integer, freq_pm real, rating_mean real, rating_stddev real, dunno real);
create table concreteness (word text, bigram integer, conc_mean real, conc_stddev real, unknown integer, total integer, pct_known real, subtlex integer, dom_pos text);
create table unigram_count (word text, lemma text, frequency integer);

create index word_for_aoa on age_of_acquisition(word);
create index word_for_concreteness on concreteness(word);
create index word_for_unigram_count on unigram_count(word);
create index lemma_for_unigram_count on unigram_count(lemma);

.separator ","
.import data/age_of_acquisition.csv age_of_acquisition
.import data/concreteness.csv concreteness
.import data/unigrams_list.csv unigram_count
