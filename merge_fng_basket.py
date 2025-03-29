import pandas as pd

# 1. Carregar o basket.csv
basket_df = pd.read_csv("basket.csv")

# 2. Garantir que os nomes das colunas estejam limpos e padronizados
basket_df.columns = basket_df.columns.str.strip().str.capitalize()

# 3. Calcular a diferença entre Close e Open
basket_df["Price_diff"] = basket_df["Close"] - basket_df["Open"]

# 4. Carregar o FNG
fng_df = pd.read_csv("datasets/fng_cleaned.csv")

# 5. Converter datas
basket_df["Date"] = pd.to_datetime(basket_df["Date"])
fng_df["date"] = pd.to_datetime(fng_df["date"])

# 6. Renomear coluna para fazer o merge
fng_df.rename(columns={"date": "Date"}, inplace=True)

# 7. Merge por data
merged_df = pd.merge(basket_df, fng_df, on="Date", how="left")

# 8. Salvar resultado
merged_df.to_csv("basket_with_fng.csv", index=False)
print("✅ Arquivo salvo como 'basket_with_fng.csv'")
