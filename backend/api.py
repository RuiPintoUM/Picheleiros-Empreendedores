from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
import os
from flask import send_file


app = Flask(__name__)
CORS(app)


@app.route("/api/crypto/<symbol>", methods=["GET"])
def get_crypto(symbol):
    file_path = f"datasets/raw/{symbol.upper()}_USD_2020_2025_Daily.csv"
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"Arquivo {symbol} não encontrado."}), 404

    df = pd.read_csv(file_path)
    return jsonify(df.to_dict(orient="records"))


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        days = request.json.get("days", 7)

        # Carregar modelo e dados
        modelo = joblib.load("model/modelo_previsao.pkl")
        dados = pd.read_csv("datasets/build/basquet_com_ME.csv")
        dados['Data'] = pd.to_datetime(dados['Data'])

        previsoes = []
        entrada = dados[["Open", "fng_value", "Price_diff", "RSI", "MA_14", "ME"]].select_dtypes(include=['number']).iloc[-1:].copy()
        last_real_value = entrada["Open"].values[0]

        for i in range(days):
            nome_dia = f"Dia {i}"
            if i == 0:
                previsoes.append({"name": nome_dia, "atual": round(float(last_real_value), 2), "previsto": None})
            else:
                pred = modelo.predict(entrada)[0]
                previsoes.append({"name": nome_dia, "atual": None, "previsto": round(float(pred), 2)})

        return jsonify(previsoes)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
