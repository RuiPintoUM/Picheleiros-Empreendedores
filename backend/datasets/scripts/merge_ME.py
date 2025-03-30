import pandas as pd

# Carregar datasets
basquet = pd.read_csv("../build/basket_with_rsi_and_ma14.csv")

major_events = pd.read_csv("../raw/crypto_major_events.csv")

# Garantir que as datas estão em datetime
basquet['Data'] = pd.to_datetime(basquet['Date'], format='%Y-%m-%d')
major_events['Data'] = pd.to_datetime(major_events['Data'], format='%Y-%m-%d')

# Mapear impacto para valores numéricos
impact_map = {'Moderado': 1, 'Alto': 2, 'Muito Alto': 3}
major_events['ME_Impact'] = major_events['Impacto'].map(impact_map)

# Merge com base na data
basquet = basquet.merge(
    major_events[['Data', 'ME_Impact']],
    on='Data',
    how='left'
)

# Adicionar flag ME (1 se for evento, 0 caso contrário)
basquet['ME'] = basquet['ME_Impact'].notna().astype(int)

# Preencher os NaN da coluna ME_Impact com 0
basquet['ME_Impact'] = basquet['ME_Impact'].fillna(0).astype(int)

basquet.drop(columns=['Data'], inplace=True)

# Salvar novo dataset atualizado, se necessário
basquet.to_csv("../build/basquet_com_ME.csv", index=False)

# Verificar resultado rapidamente
print(basquet.head(10))