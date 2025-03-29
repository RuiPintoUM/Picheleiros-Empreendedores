import pandas as pd

# Load the dataset
df = pd.read_csv("basket_with_fng.csv")
df["Date"] = pd.to_datetime(df["Date"])

# Calculate gain and loss temporarily
gain = df["Price_diff"].apply(lambda x: x if x > 0 else 0)
loss = df["Price_diff"].apply(lambda x: -x if x < 0 else 0)

# Calculate rolling averages
window = 14
avg_gain = gain.rolling(window=window).mean()
avg_loss = loss.rolling(window=window).mean()

# Compute RSI
rs = avg_gain / avg_loss
df["RSI"] = 100 - (100 / (1 + rs))

# Keep only necessary columns
df = df[["Date", "Close", "Open", "Price_diff", "fng_value", "RSI"]]

# Save to CSV
df.to_csv("basket_with_rsi.csv", index=False)
print("✅ 'basket_with_rsi.csv' saved successfully!")
