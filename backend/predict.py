import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

def predict_year(model_path, data_path, scaler_path, year=2024):
    """
    Prevê os valores de 'Close' para um ano específico usando as features disponíveis.
    
    Args:
        model_path (str): Caminho para o arquivo .pkl do modelo treinado
        data_path (str): Caminho para o arquivo CSV com os dados históricos
        scaler_path (str): Caminho para o arquivo .pkl do scaler treinado
        year (int): Ano para o qual fazer as previsões (padrão: 2024)
    
    Returns:
        pd.DataFrame: DataFrame com datas, valores reais (se disponíveis) e previstos
    """
    try:
        # Carregar o modelo treinado
        modelo = joblib.load(model_path)
        
        # Carregar o scaler treinado
        scaler = joblib.load(scaler_path)
        
        # Carregar os dados históricos
        dados = pd.read_csv(data_path)
        dados['Date'] = pd.to_datetime(dados['Date'])  # Ajustar nome da coluna conforme seu CSV
        
        # Filtrar os dados para o ano especificado
        dados_year = dados[dados['Date'].dt.year == year].copy()
        if dados_year.empty:
            raise ValueError(f"Nenhum dado encontrado para o ano {year}.")
        
        # Definir as features usadas no modelo
        features = ["Open", "fng_value", "Price_diff", "RSI", "MA_14", "ME", "ME_Impact"]
        numeric_features = [f for f in features if f != "ME"]  # Excluir "ME" do escalamento
        
        # Separar as features e o target real (se disponível)
        X = dados_year[features].select_dtypes(include=['number']).copy()
        y_real = dados_year["Close"].copy() if "Close" in dados_year.columns else None
        
        # Separar "ME" antes do escalamento
        me_values = X[["ME"]].copy()
        
        # Escalar as features numéricas contínuas
        X_scaled = scaler.transform(X[numeric_features])
        X_scaled = pd.DataFrame(X_scaled, columns=numeric_features, index=X.index)
        
        # Adicionar "ME" e "ME_Impact" de volta sem escalamento
        X_scaled["ME"] = me_values.values
        X_scaled["ME_Impact"] = X["ME_Impact"].values
        
        # Fazer previsões para todo o ano
        y_pred = modelo.predict(X_scaled)
        
        # Criar DataFrame com os resultados
        results = pd.DataFrame({
            "Date": dados_year["Date"],
            "Close_Previsto": np.round(y_pred, 2)
        })
        if y_real is not None:
            results["Close_Real"] = np.round(y_real.values, 2)
        
        return results
    
    except Exception as e:
        raise Exception(f"Erro ao fazer previsões: {str(e)}")

def plot_predictions(results):
    """
    Plota os valores reais e previstos de 'Close' ao longo do tempo.
    
    Args:
        results (pd.DataFrame): DataFrame com as colunas 'Date', 'Close_Real' (opcional) e 'Close_Previsto'
    """
    plt.figure(figsize=(12, 6))
    if "Close_Real" in results.columns:
        plt.plot(results["Date"], results["Close_Real"], label="Real", color="blue", linewidth=2)
    plt.plot(results["Date"], results["Close_Previsto"], label="Previsto", color="orange", linewidth=2)
    plt.title(f"Previsão de 'Close' para o Ano {results['Date'].dt.year.iloc[0]}")
    plt.xlabel("Data")
    plt.ylabel("Preço de Fechamento")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# Exemplo de uso
if __name__ == "__main__":
    # Caminhos para o modelo, scaler e dados
    MODEL_PATH = "model/modelo_xgb.pkl"  # Ajuste conforme o nome do seu modelo
    SCALER_PATH = "model/scaler.pkl"     # Ajuste conforme o caminho do scaler
    DATA_PATH = "datasets/build/basquet_com_ME.csv"
    
    # Ano para prever
    YEAR = 2024
    
    try:
        # Fazer previsões para o ano especificado
        resultados = predict_year(MODEL_PATH, DATA_PATH, SCALER_PATH, year=YEAR)
        
        # Exibir os primeiros resultados
        print(resultados.head())
        
        # Plotar os resultados
        plot_predictions(resultados)
        
        # Salvar os resultados em um CSV, se desejar
        resultados.to_csv(f"previsoes_{YEAR}.csv", index=False)
        print(f"Resultados salvos em 'previsoes_{YEAR}.csv'")
        
    except Exception as e:
        print(e)