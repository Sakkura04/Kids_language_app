import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load the data
unigram_df = pd.read_csv("data/unigrams_list.csv")
age_of_acquisition_df = pd.read_csv("data/age_of_acquisition.csv")
concreteness_df = pd.read_csv("data/concreteness.csv")

# Merge the dataframes on 'word'
merged_df = pd.merge(unigram_df, age_of_acquisition_df, on="word", how="inner")
merged_df = pd.merge(
    merged_df, concreteness_df[["word", "conc_mean"]], on="word", how="inner"
)

print(merged_df.head())


def plot_relationships(df, x, y, title):
    plt.figure(figsize=(10, 6))
    plt.scatter(df[x], df[y], alpha=0.5)
    plt.title(title)
    plt.xlabel(x)
    plt.ylabel(y)
    plt.show()


# Visualize the relationship between word frequency and age of acquisition rating mean
plot_relationships(
    merged_df, "frequency", "rating_mean", "Frequency vs Age of Acquisition Rating Mean"
)

# Visualize the relationship between word frequency and concreteness mean
plot_relationships(
    merged_df, "frequency", "conc_mean", "Frequency vs Concreteness Mean"
)


merged_df["log_frequency"] = np.log1p(merged_df["frequency"])

# Now, re-plot using log_frequency
plot_relationships(
    merged_df,
    "log_frequency",
    "rating_mean",
    "Log Frequency vs Age of Acquisition Rating Mean",
)
plot_relationships(
    merged_df, "log_frequency", "conc_mean", "Log Frequency vs Concreteness Mean"
)
