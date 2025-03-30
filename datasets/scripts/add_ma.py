import pandas as pd

# Carrega o dataset existente
df = pd.read_csv("basket_with_rsi.csv")

# Garante que a coluna Date esteja em formato de data
df["Date"] = pd.to_datetime(df["Date"])

# Ordena por data (só por segurança)
df = df.sort_values("Date")

# Calcula a média móvel de 14 dias com base na coluna Close
df["MA_14"] = df["Close"].rolling(window=14).mean()

# Salva o novo dataset
df.to_csv("basket_with_rsi_and_ma14.csv", index=False)

print("✅ Coluna MA_14 adicionada com sucesso! Arquivo salvo como 'basket_with_rsi_and_ma14.csv'")
