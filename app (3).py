from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from pymongo import MongoClient, UpdateOne
from dataclasses import dataclass
import random
from datetime import datetime, timedelta
import uuid
import bcrypt
import pickle
from collections import defaultdict
import pandas as pd

app = Flask(__name__)
CORS(app)

# MongoDB Connection
MONGO_URI = "mongodb+srv://Fernando:nando123@cluster0.tjezx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["test"]

@dataclass
class Usuario:
    nome: str
    email: str
    senha: str
    tipo: str
    ativo: bool = True
    createdAt: str = datetime.now().isoformat()

    def to_dict(self):
        return {
            "nome": self.nome,
            "email": self.email,
            "senha": self.senha,
            "tipo": self.tipo,
            "ativo": self.ativo,
            "createdAt": self.createdAt
        }

def gerar_usuarios_aleatorios(qtd=20):
    nomes = ["Ana", "Bruno", "Carlos", "Daniela", "Eduarda", "Felipe", "Gabriel", "Helena", "Igor", "Juliana", "Lucas",
             "Marina", "Nicolas", "Olivia", "Paulo", "Renata", "Samuel", "Tatiane", "Vinicius", "Yasmin"]
    
    sobrenomes = ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Lima", "Carvalho", "Almeida", "Rocha", "Martins", 
                  "Ferreira", "Gomes", "Barros", "Mendes", "Cavalcante"]
    tipos = ["perito", "assistente", "administrador"]

    usuarios = []
    emails_usados = set()

    for _ in range(qtd):
        nome = random.choice(nomes)
        sobrenome = random.choice(sobrenomes)
        
        # Gerar email único
        base_email = f"{nome.lower()}.{sobrenome.lower()}"
        email = f"{base_email}@email.com"
        contador = 1
        while email in emails_usados:
            email = f"{base_email}{contador}@email.com"
            contador += 1
        
        tipo = random.choice(tipos)
        senha_clara = f"{nome[0].lower()}{sobrenome.lower()}123"
        senha_hash = bcrypt.hashpw(senha_clara.encode('utf-8'), bcrypt.gensalt()).decode()

        usuarios.append({
            "nome": f"{nome} {sobrenome}",
            "email": email,
            "senha": senha_hash,
            "tipo": tipo,
            "ativo": True,
            "createdAt": datetime.now().isoformat()
        })
        emails_usados.add(email)

    return usuarios

def gerar_dados_aleatorios(n=200):
    titulos = ["Homicídio", "Roubo a banco", "Furto qualificado", "Tráfico de drogas", "Assalto à mão armada",
               "Lesão corporal grave", "Sequestro", "Estupro", "Violência doméstica", "Furto simples",
               "Roubo de veículo", "Crime ambiental", "Crime cibernético", "Lavagem de dinheiro", "Fraude bancária"]
     
    descricoes = ["Caso investigado pela delegacia regional.", "Crime ocorrido em via pública.", "Suspeitos em fuga.", "Ocorrência com evidências coletadas no local.", 
        "Testemunhas foram ouvidas na cena do crime.", "Suspeito foi identificado através de câmeras de segurança.",
        "Ocorreu confronto com a polícia.", "Crime cometido em horário noturno.",
        "Registro de danos materiais durante o crime.", "Vítima socorrida e encaminhada ao hospital.",
        "Caso com participação de gangue local.", "Investigação segue em sigilo.",
        "Denúncia anônima auxiliou na investigação.", "Material apreendido para perícia.",
        "Suspeito preso em flagrante."
                    ]
    locais = ["Rua Augusta, São Paulo", "Avenida Atlântica, Rio de Janeiro", "Rua da Aurora, Recife",
        "Avenida Afonso Pena, Belo Horizonte", "Rua XV de Novembro, Curitiba", "Rua dos Andradas, Porto Alegre",
        "Rua Paes Cabral, Recife", "Avenida Beira-Mar, Fortaleza", "Rua Sergipe, Goiânia",
        "Rua Antônio Carlos, Brasília", "Rua Pará, Belém", "Rua Barão de Jaguara, Campinas", "Rua Guilherme Araujo, Recife",
        "Rua das Palmeiras, Manaus", "Rua General Osório, Florianópolis", "Rua Oscar Freire", "São Paulo",
        "Avenida Paulista", "São Paulo", "Rua das Laranjeiras", "Rio de Janeiro", "Rua da Consolação", "São Paulo",
        "Rua Chile", "Salvador", "Rua dos Timbiras", "Belo Horizonte", "Rua Padre Cacique", "Porto Alegre",
        "Rua Frei Caneca", "São Paulo", "Rua Senador Pompeu", "Fortaleza", "Rua Gonçalves Dias", "Curitiba",
        "Avenida Sete de Setembro, Salvador", "Rua 24 de Outubro, Porto Alegre", "Rua Santa Luzia, Rio de Janeiro",
        "Rua Fernando Corrêa da Costa, Campo Grande", "Rua São Bento, São Paulo", "Avenida João Pessoa, Porto Alegre",
        "Rua Dr. Arnaldo, São Paulo", "Avenida Rio Branco, Rio de Janeiro", "Rua Barão do Rio Branco, Curitiba",
        "Rua Carlos Gomes, Salvador", "Rua João Suassuna, João Pessoa", "Rua Frei Miguelinho, Natal",
        "Avenida Epitácio Pessoa, João Pessoa", "Rua João Pessoa, Belém", "Rua Marechal Deodoro, Maceió", "Rua Desembargador Motta, Curitiba",
        "Rua Dom Pedro II, Teresina", "Rua Professor Moraes, Belo Horizonte", "Rua Barão do Triunfo, Porto Alegre",
        "Rua do Lavradio, Rio de Janeiro", "Rua Benjamin Constant, Florianópolis", "Rua Conde de Bonfim, Rio de Janeiro",
        "Rua Tapajós, Manaus", "Rua 13 de Maio, Campinas", "Rua Franscico de Paula Machado, Recife"
    ]
    status_opcoes = ["Aberto", "Em andamento", "Fechado"]

    peritos = list(db.usuarios.find({"tipo": "perito"}, {"_id": 1}))
    if not peritos:
        raise Exception("Nenhum perito encontrado no banco de dados!")

    casos = []
    vitimas = []
    num_casos_usados = set()
    nics_usados = set()
    hoje = datetime.now()

    for _ in range(n):
        # Datas aleatórias
        data_abertura = hoje - timedelta(days=random.randint(0, 180))
        data_ocorrido = data_abertura - timedelta(days=random.randint(0, 10))
        data_fechamento = data_abertura + timedelta(days=random.randint(1, 120)) if random.random() > 0.3 else None

        # Número de caso único
        while True:
            numero_caso = f"CASO-{uuid.uuid4().hex[:6].upper()}"
            if numero_caso not in num_casos_usados:
                num_casos_usados.add(numero_caso)
                break

        # Criar caso
        caso = {
            "numeroCaso": numero_caso,
            "titulo": random.choice(titulos),
            "descricao": random.choice(descricoes),
            "status": random.choice(status_opcoes),
            "peritoResponsavel": random.choice(peritos)["_id"],
            "dataAbertura": data_abertura,
            "dataFechamento": data_fechamento,
            "dataOcorrido": data_ocorrido,
            "local": random.choice(locais),
            "vitimas": [],  # Será preenchido depois
            "evidencias": []
        }
        casos.append(caso)

        # Criar 1-3 vítimas por caso
        for _ in range(random.randint(1, 3)):
            # Criar NIC único para a vítima
            while True:
                nic = f"NIC-{uuid.uuid4().hex[:8].upper()}"
                if nic not in nics_usados:
                    nics_usados.add(nic)
                    break
            vitima = {
                "nic": nic,
                "nome": f"Vitima-{random.choice(['A', 'B', 'C'])}",
                "genero": random.choice(["Masculino", "Feminino", "Nao Informado"]),
                "idade": random.choice(["Bebe", "Crianca", "Adolescente", "Adulta", "Idosa"]),
                "corEtnia": random.choice(["Branca", "Parda", "Preta", "Amarela", "Indigena"]),
                "numeroCaso": numero_caso  # Temporário
            }
            vitimas.append(vitima)

    return casos, vitimas

def inserir_dados_com_relacionamentos():
    print("""Função que cuida da inserção correta com relacionamentos""")
    print("Limpando dados antigos...")
    db.usuarios.delete_many({})
    db.casos.delete_many({})
    db.vitimas.delete_many({})

    print("Criando usuários...")
    usuarios = gerar_usuarios_aleatorios()
    db.usuarios.insert_many(usuarios)

    print("Gerando casos e vítimas...")
    casos, vitimas = gerar_dados_aleatorios()

    print("Inserindo casos...")
    resultado_casos = db.casos.insert_many(casos)
    caso_id_map = {c["numeroCaso"]: c["_id"] for c in casos}

    print("Preparando vítimas...")
    for vitima in vitimas:
        vitima["caso"] = caso_id_map[vitima["numeroCaso"]]  # Substitui por ObjectId
        del vitima["numeroCaso"]

    print("Inserindo vítimas...")
    resultado_vitimas = db.vitimas.insert_many(vitimas)

    print("Atualizando casos com referências às vítimas...")
    vitimas_por_caso = defaultdict(list)
    for vitima in vitimas:
        vitimas_por_caso[vitima["caso"]].append(vitima["_id"])

    bulk_operations = [
        UpdateOne(
            {"_id": caso_id},
            {"$set": {"vitimas": vitima_ids}}
        )
        for caso_id, vitima_ids in vitimas_por_caso.items()
    ]
    if bulk_operations:
        db.casos.bulk_write(bulk_operations)

    print("Concluído!")

# Rotas da API
@app.route('/api/casos', methods=['GET'])
def listar_casos():
    casos = list(db.casos.find({}, {"_id": 0}))
    return jsonify(casos), 200

@app.route('/api/casos/<numeroCaso>', methods=['GET'])
def buscar_caso(numeroCaso):
    caso = db.casos.find_one({"numeroCaso": numeroCaso}, {"_id": 0})
    if not caso:
        abort(404, "Caso não encontrado")
    return jsonify(caso), 200


@app.route('/api/associacoes', methods=['GET'])
def associacoes():
    # Buscar todos os casos com vítimas
    documentos = list(db.casos.find({}))

    if not documentos:
        return jsonify({"message": "Sem dados na coleção casos"}), 400

    lista = []
    for caso in documentos:
        vitimas = caso.get("vitimas", [])
        for vitima_id in vitimas:
            # Buscar dados da vítima pelo _id
            vitima = db.vitimas.find_one({"_id": vitima_id})
            if vitima:
                lista.append({
                    "idade": vitima.get("idade"),
                    "etnia": vitima.get("corEtnia"),
                    "localizacao": caso.get("local"),
                    "tipo_do_caso": caso.get("titulo")
                })

    if not lista:
        return jsonify({"message": "Sem dados para associação"}), 400

    # Criar dataframe pandas para análises futuras
    df = pd.DataFrame(lista).dropna()

    try:
        X = df[["idade", "etnia", "localizacao"]]
        # Aqui pode entrar alguma análise ou processamento futuro

        return jsonify({
            "message": "Endpoint pronto para implementar análise",
            "dados": X.to_dict(orient="records")
        }), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao processar dados: {str(e)}"}), 500
    
    
@app.route('/api/predizer-crime', methods=['POST'])
def predizer_crime():
    try:
        dados = request.get_json()
        idade = dados.get("idade")
        cor = dados.get("cor")
        local = dados.get("local")

        if not all([idade, cor, local]):
            return jsonify({"erro": "Campos obrigatórios: idade, cor, local"}), 400

        # Carrega modelo
        with open("model.pkl", "rb") as f:
            model_data = pickle.load(f)
            pipeline = model_data["pipeline"]
            label_encoder = model_data["label_encoder"]

        X_novo = pd.DataFrame([{
            "idade": idade,
            "cor": cor,
            "local": local
        }])

        y_pred = pipeline.predict(X_novo)
        crime_previsto = label_encoder.inverse_transform(y_pred)[0]

        return jsonify({"titulo_previsto": crime_previsto}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@app.route('/api/modelo/coeficientes', methods=['GET'])
def coeficientes_modelo():
    try:
        # Carregar modelo
        with open("model.pkl", "rb") as f:
            model_data = pickle.load(f)
            modelo = model_data["pipeline"]

        # Pega o pré-processador e classificador do pipeline
        preprocessor = modelo.named_steps['preprocessor']
        classifier = modelo.named_steps['classifier']

        # Pega nomes das features após OneHotEncoding
        cat_encoder = preprocessor.named_transformers_['cat']
        cat_features = cat_encoder.get_feature_names_out(preprocessor.transformers_[0][2])
        numeric_features = preprocessor.transformers_[1][2]
        all_features = list(cat_features) + list(numeric_features)

        # Pega importâncias das features do classificador (ex: XGBoost)
        importancias = classifier.feature_importances_

        features_importances = {
            feature: float(importance)
            for feature, importance in zip(all_features, importancias)
        }

        return jsonify(features_importances), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    inserir_dados_com_relacionamentos()
    app.run(debug=True)