import pandas as pd
from pymongo import MongoClient
from xgboost import XGBClassifier
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle
from bson import ObjectId

# Conexão com o MongoDB
MONGO_URI = "mongodb+srv://Fernando:nando123@cluster0.tjezx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["test"]
colecao_casos = db["casos"]
colecao_vitimas = db["vitimas"]

# Coleta dos dados
dados = list(colecao_casos.find({}, {"_id": 0}))

# Preparação dos dados com validação de vítimas
lista = []
for d in dados:
    if isinstance(d.get("vitimas"), list) and len(d["vitimas"]) > 0:
        vitima_id = d["vitimas"][0]
        
        # Busca a vítima na coleção
        vitima = colecao_vitimas.find_one({"_id": ObjectId(vitima_id)})

        if vitima and all(k in vitima for k in ["idade", "corEtnia"]):
            lista.append({
                "idade": vitima["idade"],
                "cor": vitima["corEtnia"],
                "local": d.get("local", "desconhecido"),
                "titulo": d.get("titulo", "desconhecido")
            })

# Criar DataFrame
df = pd.DataFrame(lista)

# Verificação de dados suficientes
if df.empty:
    raise ValueError("Sem dados de vítimas válidas para treinar o modelo.")

# Exibir primeiros registros
print("Amostra dos dados de treino:")
print(df.head())

# Separação de variáveis
X = df[["idade", "cor", "local"]]
y = df["titulo"]

# Codificação do alvo
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Pré-processamento (todas categóricas)
categorical_features = ["idade", "cor", "local"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ]
)

# Pipeline de ML
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", XGBClassifier(use_label_encoder=False, eval_metric='mlogloss'))
])

# Treinamento
pipeline.fit(X, y_encoded)

# Salvar o modelo e o encoder
with open("model.pkl", "wb") as f:
    pickle.dump({
        "pipeline": pipeline,
        "label_encoder": label_encoder
    }, f)

print("✅ Modelo treinado e salvo com sucesso em model.pkl")
