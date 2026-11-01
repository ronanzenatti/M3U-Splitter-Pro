# 📺 M3U Splitter Pro

> Divisor, Organizador e Categorizador Inteligente de Listas IPTV (M3U / M3U8).  
> **100% Client-Side** — Roda inteiramente no navegador do usuário, com suporte a listas gigantes de **100 MB+ (300.000+ itens)**. Pronto para deploy na **Vercel**.

---

## ⚡ Principais Recursos

- **Categorização Automática (Zero IA)**:
  - Identifica deterministicamente **📺 Canais de TV Ao Vivo**, **🎬 Filmes (VOD)** e **🍿 Séries & Novelas (VOD)** usando padrões de rotas Xtream Codes (`/movie/`, `/series/`, live streams) e tags `group-title`.
- **Entrada Flexível de Listas**:
  - **📁 Arquivo Local**: Arraste e solte ou selecione qualquer arquivo `.m3u` ou `.m3u8`.
  - **🔗 Link do GitHub / URL Web**: Cole o link direto de um arquivo no GitHub (ex: `github.com/.../blob/master/lista.m3u8`). O app converte e baixa automaticamente no navegador, **sem precisar de Git instalado no computador**.
- **Controle Total de Seleção**:
  - Botão global para **Marcar Todas** e **Desmarcar Todas**.
  - Botão rápido por seção (Canais, Filmes, Séries).
  - *Toggle switch* individual animado para cada categoria.
  - Botão dedicado **Limpar Filtro** e busca em tempo real.
- **Exportação em Pacote ZIP**:
  - Gera arquivos `.m3u8` separados por categoria organizados em pastas (`Canais/`, `Filmes/`, `Series/`).
  - Opção para gerar arquivos mestres unificados (`00_TODOS_CANAIS.m3u8`, `00_TODOS_FILMES.m3u8`, etc.).
- **Privacidade & Desempenho Extremo**:
  - Seus dados e credenciais de IPTV **nunca saem do seu computador**.
  - O processamento de 300.000 linhas leva menos de 2 segundos.
  - Zero limites de upload ou custos com servidores.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** & **Vanilla CSS3** (Dark Glassmorphism, Google Fonts *Plus Jakarta Sans* e *JetBrains Mono*).
- **Vanilla JavaScript (ES6+)**: Algoritmo de parsing em chunks e Streams para leitura assíncrona.
- **JSZip**: Compactador ZIP embarcado localmente (funciona 100% offline).

---

## 🚀 Como Hospedar na Vercel

Por ser uma aplicação 100% estática e processar tudo no navegador:

### Opção 1: Pelo Painel Web da Vercel
1. Suba este repositório para a sua conta no **GitHub**.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Selecione o repositório e clique em **"Deploy"**.

### Opção 2: Pela Linha de Comando (Vercel CLI)
```bash
npx vercel
```

---

## 💻 Como Rodar Localmente

Basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Brave, Safari) ou rodar um servidor estático local:

```bash
# Com Python:
python -m http.server 8080

# Com Node.js / npx:
npx serve .
```

---

## 📄 Licença

MIT License. Desenvolvido para máxima performance e conveniência.
