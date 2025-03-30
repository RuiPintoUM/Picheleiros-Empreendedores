import requests
import pandas as pd
from datetime import datetime, timedelta

# Defina suas variáveis
api_key = 'CG-nhDPpWntaUHRqR4p8f7Zk8AD'
headers = {'x-cg-pro-api-key': api_key}
start_date = '2020-08-29'
end_date = '2025-03-27'

# Função para converter data para timestamp
def date_to_timestamp(date_str):
    return int(datetime.strptime(date_str, '%Y-%m-%d').timestamp())

# Obter dados do market cap global
def get_global_market_cap(start_date, end_date):
    url = f'https://pro-api.coingecko.com/api/v3/global/market_cap_chart/range?vs_currency=usd&from={date_to_timestamp(start_date)}&to={date_to_timestamp(end_date)}'
    response = requests.get(url, headers=headers)
    data = response.json()
    print(data)
    return data['market_cap']

# Obter dados do market cap do USDC
def get_usdc_market_cap(start_date, end_date):
    url = f'https://api.coingecko.com/api/v3/coins/usdc/market_chart/range?vs_currency=usd&from={date_to_timestamp(start_date)}&to={date_to_timestamp(end_date)}'
    response = requests.get(url)
    data = response.json()
    print(data)
    return data['market_caps']

# Processar os dados
global_market_cap = get_global_market_cap(start_date, end_date)
usdc_market_cap = get_usdc_market_cap(start_date, end_date)

# Converter para DataFrame
df_global = pd.DataFrame(global_market_cap, columns=['timestamp', 'global_market_cap'])
df_usdc = pd.DataFrame(usdc_market_cap, columns=['timestamp', 'usdc_market_cap'])

# Converter timestamp para data
df_global['date'] = pd.to_datetime(df_global['timestamp'], unit='ms').dt.date
df_usdc['date'] = pd.to_datetime(df_usdc['timestamp'], unit='ms').dt.date

# Mesclar os DataFrames
df = pd.merge(df_global[['date', 'global_market_cap']], df_usdc[['date', 'usdc_market_cap']], on='date')

# Salvar como CSV
df.to_csv('usdc_dominance.csv', index=False)
print("CSV exportado com sucesso: usdc_dominance.csv")
