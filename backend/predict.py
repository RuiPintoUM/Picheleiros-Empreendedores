import sys
import joblib
import pandas as pd
from datetime import timedelta
import json

# Parâmetro vindo do Node/front-end (dias a prever)
days = int(sys.argv[1]) if len(sys.argv) > 1 else 7

# Carregar modelo e dados
modelo = joblib.load("model/modelo_previsao.pkl")
dados = pd.read_csv("datasets/build/basquet_com_ME.csv")
dados['Data'] = pd.to_datetime(dados['Data'])

# Obter última linha válida (entrada para previsão)
entrada = dados[["Open", "fng_value", "Price_diff", "RSI", "MA_14", "ME"]].select_dtypes(include=['number']).iloc[-1:].copy()
last_real_value = entrada["Open"].values[0]

previsoes = []

for i in range(days):
    nome_dia = f"Dia {i}"

    if i == 0:
        previsoes.append({
            "name": nome_dia,
            "atual": round(float(last_real_value), 2),
            "previsto": None
        })
    else:
        pred = modelo.predict(entrada)[0]
        previsoes.append({
            "name": nome_dia,
            "atual": None,
            "previsto": round(float(pred), 2)
        })

        # Simular avanço no tempo atualizando o valor "Open"
        entrada = entrada.copy()
        entrada["Open"].iloc[0] = pred

print(json.dumps(previsoes))
