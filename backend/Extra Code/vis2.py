import matplotlib.pyplot as plt
import seaborn as sns

search_queries = [
    "NLP Language Delay",
    "NLP and Child Development",
    "Automatic Assessment of Language Ability",
    "Child Language Development and NLP",
    "Speech Therapy AND Digital Tools",
    "Assistive Technologies AND Child Language Delays",
    "ASR AND Language Delay and Child Development",
    "ASR AND Speech Disorders in Children",
    "NLP AND Speech Therapy - Children",
    "NLP AND Special Education - Children",
    "Machine Learning in Early Reading Education",
    "Decoding Skills in Early Reading",
    "NLP in Reading Decoding",
    "Enhanced Reading Tools (ACM)",
    "Parent-Child Reading (ACM)",
]

total_results = [
    236,
    184,
    1,
    13,
    4,
    1,
    4,
    9,
    17,
    6,
    5,
    0,
    3,
    362,
    159,
]  # 0 for not specified


# Visualization: Bar Chart for Total Search Results

plt.figure(figsize=(12, 10))

sns.barplot(x=total_results, y=search_queries, palette="muted")

plt.title("Total Search Results for Each Search Query")

plt.xlabel("Total Results")

plt.ylabel("Search Queries")

plt.tight_layout()

plt.show()
