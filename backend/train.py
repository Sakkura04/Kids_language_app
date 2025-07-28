import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error


# Assuming the first column in each CSV is the word and it's consistently named.
# Load datasets
concrete = pd.read_csv(
    "./data/concrete.csv",
    header=None,
    names=["word", "concrete_score", "other_features", "A", "B", "C", "D", "E", "F"],
)
age_of_acquisition = pd.read_csv(
    "./data/age_of_acquisition.csv",
    header=None,
    names=[
        "word",
        "age_mean",
        "age_median",
        "frequency",
        "concreteness",
        "understandability",
        "G",
    ],
)
training_data = pd.read_csv("./data/training_data.csv")
unigrams_list = pd.read_csv(
    "./data/unigrams_list.csv", header=None, names=["word", "frequency"]
)

# Merging dataframes on 'word'
df = training_data.merge(concrete[["word", "concrete_score"]], on="word", how="left")
df = df.merge(
    age_of_acquisition[["word", "age_mean", "concreteness"]], on="word", how="left"
)
df = df.merge(unigrams_list, on="word", how="left")

# Assuming the 'label' column in training_data.csv is our target variable representing word complexity


# Dropping non-numeric and target variable columns to get feature matrix X
X = df.drop(["word", "sentence", "index", "label"], axis=1)

# Filling missing values with the mean of the column
X = X.fillna(X.mean())

# Target variable
y = df["label"]

# Splitting the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Standardizing features by removing the mean and scaling to unit variance
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# Training a Random Forest Regressor
regressor = RandomForestRegressor(n_estimators=100, random_state=42)
regressor.fit(X_train_scaled, y_train)

# Predicting the Test set results
y_pred = regressor.predict(X_test_scaled)

# Evaluating the performance of the regression model
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")


# Save the model
joblib.dump(regressor, "word_complexity_regressor.pkl")

# Save the scaler
joblib.dump(scaler, "scaler.pkl")


# To load and predict with the model
regressor_loaded = joblib.load("word_complexity_regressor.pkl")
scaler_loaded = joblib.load("scaler.pkl")

# Example: predict the complexity of a new word
# new_word_features = [...]
# new_word_features_scaled = scaler_loaded.transform([new_word_features])
# complexity = regressor_loaded.predict(new_word_features_scaled)
# print(complexity)
