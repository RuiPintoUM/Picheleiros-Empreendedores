import sys
import joblib
import pandas as pd
from datetime import timedelta
import json

# Parâmetro vindo do Node
days = int(sys.argv[1]) if len(sys.argv) > 1 else 7

# Carregar modelo e dados
modelo = joblib.load("model/modelo_previsao.pkl")
dados = pd.read_csv("datasets/build/basquet_com_ME.csv")
dados['Data'] = pd.to_datetime(dados['Data'])

# Prever dias à frente
previsoes = []
ultima_data = dados['Data'].iloc[-1]
entrada = dados[["Open", "fng_value", "Price_diff", "RSI", "MA_14", "ME"]].select_dtypes(include=['number']).iloc[-1:].copy()
last_real_value = entrada["Open"].values[0]

# Histórico simulado + previsões
for i in range(days):
    nome_dia = f"Dia {i}"
    if i == 0:
        previsoes.append({"name": nome_dia, "atual": round(float(last_real_value), 2), "previsto": None})
    else:
        pred = modelo.predict(entrada)[0]
        previsoes.append({"name": nome_dia, "atual": None, "previsto": round(float(pred), 2)})

# Enviar como JSON
print(json.dumps(previsoes))