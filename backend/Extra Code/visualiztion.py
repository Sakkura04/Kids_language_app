import matplotlib.pyplot as plt
import seaborn as sns

# Data for visualizations
keywords = [
    "Natural Language Processing",
    "Speech Therapy",
    "Child Development",
    "Language Delay",
    "Automatic Speech Recognition",
]
frequencies = [12, 8, 7, 5, 10]

databases = ["IEEE Xplore Digital Library", "ACM Digital Library", "Google Scholar"]
papers = [720, 679, 211]

# Visualization 1: Bar Chart for Keyword Frequency
plt.figure(figsize=(10, 6))
plt.pie(
    frequencies,
    labels=keywords,
    autopct="%1.1f%%",
    startangle=140,
    colors=sns.color_palette("pastel"),
)
# plt.title("Frequency of Key Terms in Literature Review")
# plt.xlabel("Keywords")
# plt.ylabel("Frequency")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("frequency-key-terms.png")
plt.show()
# Visualization 2: Pie Chart for Papers Distribution
plt.figure(figsize=(8, 8))
plt.pie(
    papers,
    labels=databases,
    autopct="%1.1f%%",
    startangle=140,
    colors=sns.color_palette("pastel"),
)
plt.title("")
plt.savefig("Distrib-paper-across-dbs.png")
plt.show()
