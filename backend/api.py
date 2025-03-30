from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from predict import predict_year  # Importe o script (assumindo que está em predict_year.py)
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/api/predict', methods=['POST'])
def predict_year_endpoint():
    try:
        year = request.json.get("year", 2024)  # Ano padrão: 2024
        
        # Definir caminhos fixos
        model_path = "model/modelo_xgb.pkl"
        scaler_path = "model/scaler.pkl"
        data_path = "datasets/build/basquet_com_ME.csv"
        
        # Fazer previsões para o ano
        resultados = predict_year(model_path, data_path, scaler_path, year)
        
        # Converter para formato JSON
        return jsonify(resultados.to_dict(orient="records"))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/crypto/<symbol>", methods=["GET"])
def get_crypto(symbol):
    file_path = f"datasets/raw/{symbol.upper()}_USD_2020_2025_Daily.csv"
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"Arquivo {symbol} não encontrado."}), 404

    df = pd.read_csv(file_path)
    return jsonify(df.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True)