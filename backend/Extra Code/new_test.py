import matplotlib.pyplot as plt
import pandas as pd

# Load the CSV file
file_path = "NLP in Reading Improvement and Assessment - Sheet1(3).csv"
papers_data = pd.read_csv(file_path)

# Extracting publication years from the dataset
publication_years = papers_data["year"].value_counts().sort_index()

# Extracting the count of papers with children's involvement
children_involved_count = (
    papers_data["# participants-participants profile"]
    .str.contains("children|pupils|students", case=False, na=False)
    .value_counts()
)

# Creating a bar graph for publication years
plt.figure(figsize=(10, 6))
publication_years.plot(kind="bar", color="skyblue")
plt.title("")
plt.xlabel("Year")
plt.ylabel("Number of Papers")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("distribution_of_papers_by_year.png")
plt.show()

# Creating a pie chart for children's involvement
plt.figure(figsize=(8, 8))
children_involved_count.plot(
    kind="pie",
    labels=["Children Involved", "No Children Involved"],
    autopct="%1.1f%%",
    startangle=140,
    colors=["lightgreen", "lightcoral"],
)
plt.title("")
plt.ylabel("")  # Hide the y-label
plt.savefig("children_involvement_pie_chart.png")
plt.show()
