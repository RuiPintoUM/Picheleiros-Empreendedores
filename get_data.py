import yfinance as yf
import pandas as pd
import os

# Criar a pasta 'datasets' se não existir
os.makedirs("datasets", exist_ok=True)

# Baixar dados diários do MKT entre 28/03/2021 e 28/03/2025
MKT = yf.download("MKT-USD", start="2020-08-29", end="2025-03-28", interval="1d")

# Resetar índice para ter a coluna 'Date'
MKT.reset_index(inplace=True)

# Salvar em CSV dentro da pasta 'datasets'
MKT.to_csv("datasets/MKT_USD_2020_2025_Daily.csv", index=False)

# Mostrar as primeiras linhas
print(MKT.head())
