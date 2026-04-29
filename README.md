# Projeto Nexus

O **Projeto Nexus** é um sistema de gestão interno, customizado e escalável. A plataforma tem como objetivo centralizar e otimizar o fluxo de trabalho de uma empresa, abrangendo desde o controle de inventário de produtos e serviços até o gerenciamento de clientes e a geração automatizada de orçamentos em formato PDF.

O sistema possui uma interface moderna, focada na usabilidade, adotando um visual **Dark Mode de alto contraste** para proporcionar uma experiência de usuário premium e profissional.

## 🚀 Funcionalidades Principais

- **🔒 Autenticação Segura:** Sistema de login com rotas protegidas, garantindo que apenas usuários autorizados tenham acesso aos dados da empresa.
- **👥 Gestão de Clientes:** Cadastro, edição, exclusão e visualização de dados de clientes, permitindo um acompanhamento ágil.
- **📦 Controle de Estoque (Inventário):**
  - Gerenciamento de produtos físicos (com controle de quantidade em estoque) e serviços (como "Mão de Obra", que não possuem limite de estoque).
  - Organização por categorias, com busca e filtragem aprimoradas.
- **📝 Geração de Orçamentos (Propostas):**
  - Criação dinâmica de orçamentos associando clientes, produtos e serviços.
  - Cálculo automático de subtotais e totais.
  - Validação inteligente de estoque durante a inclusão de itens.
- **📄 Exportação Profissional para PDF:**
  - Geração automática do orçamento em um documento PDF polido e estruturado.
  - Agrupamento de itens por categoria.
  - Inclusão do logotipo da empresa, informações do projeto, dados do cliente e um bloco para assinatura.
- **🎨 UI/UX Premium:** Design focado em "Dark Mode", com navegação fluida, menus retráteis (Sidebar) e componentes interativos.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas e ferramentas modernas do ecossistema front-end e de backend as a service:

- **Frontend:**
  - [React 19](https://react.dev/) - Biblioteca para construção de interfaces de usuário.
  - [Vite](https://vitejs.dev/) - Ferramenta de build e servidor de desenvolvimento ultra-rápido.
  - [Tailwind CSS v4](https://tailwindcss.com/) - Framework CSS utility-first para estilização rápida e responsiva.
  - [React Router DOM](https://reactrouter.com/) - Gerenciamento das rotas e navegação da aplicação.
  - [Lucide React](https://lucide.dev/) - Biblioteca de ícones bonitos e consistentes.
- **Backend as a Service (BaaS):**
  - [Google Firebase](https://firebase.google.com/) - Utilizado para Autenticação (Auth), Banco de Dados em tempo real (Firestore) e armazenamento de arquivos (Storage).
- **Geração de Relatórios:**
  - [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Bibliotecas poderosas para a geração de arquivos PDF diretamente no navegador.

## ⚙️ Estrutura do Projeto

A arquitetura do projeto foi desenhada para ser modular, separando a lógica de negócio (serviços do Firebase) dos componentes visuais (React Components).

```text
src/
├── components/    # Componentes reutilizáveis (Layout, Sidebar, Cards, etc.)
├── config/        # Configurações globais (Firebase, etc.)
├── pages/         # Páginas da aplicação (Login, Dashboard, Clientes, Estoque, Orçamentos)
├── services/      # Lógica de integração e comunicação com o Firestore (CRUD)
├── App.jsx        # Configuração principal de Rotas
└── index.css      # Estilos globais e tokens do Tailwind
```

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM, Yarn ou PNPM
- Conta no Firebase com um projeto configurado (Auth, Firestore, Storage)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/Projeto-Nexus.git
   cd Projeto-Nexus
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   Abra seu navegador e acesse `http://localhost:5173`.
