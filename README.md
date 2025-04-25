# ODONTOCRIM - Backend

Este é o backend do sistema **ODONTOCRIM**, uma plataforma de gestão de casos forenses odontológicos. Esta aplicação foi desenvolvida em Node.js com Express, conectada ao banco de dados MongoDB.

---

## Tecnologias utilizadas

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (autenticação)
- Multer (upload de arquivos)
- Dotenv (variáveis de ambiente)

---

## Como rodar o backend localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/seuusuario/odontocrim.git
cd odontocrim/backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar arquivo `.env`
Crie um arquivo `.env` na pasta `backend` 

### 4. Rodar o servidor
```bash
npm run dev
# ou
node server.js
```

Servidor iniciará em: `http://localhost:5000`

---

## Estrutura de pastas principal

```
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── uploads/         # Imagens e documentos enviados
├── .env             # Configurações secretas
├── server.js
```

---

## Funcionalidades principais

- Cadastro e autenticação de usuários (admin, perito, assistente)
- Proteção de rotas com base no tipo de usuário
- Cadastro de casos e evidências
- Upload de imagens de evidências
- Geração e controle de relatórios forenses

---

## Observações de segurança
- Apenas administradores podem:
  - Cadastrar outros usuários
  - Visualizar todos os usuários
  - Visualizar qualquer relatório
- Peritos podem ver apenas seus casos e relatórios vinculados

---

## Contato

Para dúvidas ou colaborações:
- Dev:
- José Fernando
- Marcello Henrique
- Glewbber Spindola
- Gabriel Ernandes
- Laís Amorim

