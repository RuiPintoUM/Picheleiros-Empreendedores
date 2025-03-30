import pandas as pd
import os

# Alocações por cripto (em percentual decimal)
allocations = {
    "BTC": 0.50,
    "ETH": 0.16,
    "XRP": 0.08,
    "BNB": 0.06,
    "SOL": 0.05,
    "DOGE": 0.04,
    "ADA": 0.04,
    "TRX": 0.03,
    "TON": 0.02,
    "LINK": 0.02
}

# Pasta com os arquivos
data_path = "datasets"

# DataFrame inicial
basket_df = None

# Processar cada ativo
for ticker, weight in allocations.items():
    filename = f"{ticker}_USD_2020_2025_Daily.csv"
    filepath = os.path.join(data_path, filename)

    # Ler arquivo
    df = pd.read_csv(filepath)

    # Garantir que colunas necessárias estão presentes
    if "Date" not in df.columns or "Close" not in df.columns or "Open" not in df.columns:
        print(f"⚠️ Arquivo {filename} está faltando colunas necessárias.")
        continue

    # Selecionar apenas as colunas necessárias antes do merge
    df = df[["Date", "Open", "Close"]]
    
    # Formatar dados
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce") * weight
    df["Open"] = pd.to_numeric(df["Open"], errors="coerce") * weight
    
    # Renomear colunas
    df.rename(columns={
        "Close": f"{ticker}_Close",
        "Open": f"{ticker}_Open"
    }, inplace=True)

    # Merge com o acumulador
    if basket_df is None:
        basket_df = df
    else:
        basket_df = pd.merge(basket_df, df, on="Date", how="inner")

# Calcular os valores do "basket"
basket_df["Close"] = basket_df.filter(like="_Close").sum(axis=1)
basket_df["Open"] = basket_df.filter(like="_Open").sum(axis=1)

# Exportar resultado
basket_df[["Date", "Close", "Open"]].to_csv("basket.csv", index=False)
print("✅ Arquivo 'basket.csv' gerado com sucesso!")