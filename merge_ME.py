import pandas as pd

# Carregar datasets
basquet = pd.read_csv("basket_with_rsi_and_ma14.csv")

major_events = pd.read_csv("datasets/crypto_major_events.csv")

# Garantir que as datas estão em datetime
basquet['Data'] = pd.to_datetime(basquet['Date'], format='%Y-%m-%d')
major_events['Date'] = pd.to_datetime(major_events['Data'], format='%Y-%m-%d')

# Adicionar coluna 'ME' ao dataset basquet (1 se for um evento major, 0 caso contrário)
basquet['ME'] = basquet['Data'].isin(major_events['Data']).astype(int)

if basquet['ME'].sum() > 0:
    if major_events['Impacto'].equals("Moderado"):
        basquet['ME_Impact'] = 1
    elif major_events['Impacto'].equals("Alto"):
        basquet['ME_Impact'] = 2
    elif major_events['Impacto'].equals("Muito Alto"):
        basquet['ME_Impact'] = 3
else:
    basquet['ME_Impact'] = 0
        
        


# Salvar novo dataset atualizado, se necessário
basquet.to_csv("basquet_com_ME.csv", index=False)

# Verificar resultado rapidamente
print(basquet.head(10))