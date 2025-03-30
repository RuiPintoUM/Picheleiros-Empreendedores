from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from predict import predict_year  # Importe o script (assumindo que está em predict_year.py)

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

if __name__ == "__main__":
    app.run(debug=True)