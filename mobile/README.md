# Vértice Imóveis — versão mobile

Versão independente, feita a partir da Vértice web. Mantém os mesmos 30 imóveis, fotografias, códigos e regras de filtro. A interface foi refeita para celular, com navegação inferior, áreas de toque amplas, filtros em painel inferior, preloader, galeria e contato acessível na página do imóvel.

Este projeto fica em `mobile/`, na branch `mobile` do repositório. Os arquivos da versão web permanecem na raiz e a branch `main` não foi alterada.

## Funcionalidades

- Busca por código, cidade, bairro e título; compra ou aluguel; tipo de imóvel.
- Faixas de preço e área; mínimo de quartos, suítes, banheiros e vagas; combinação de comodidades como piscina, jardim, academia e churrasqueira.
- Ordenação, carregamento de mais imóveis e estados sem resultados.
- Página individual com código, características, descrição, galeria ampliada, compartilhamento, imóveis relacionados e retorno à busca.
- Cadastro e login locais, conta de demonstração sem senha, favoritos por conta, edição do nome e histórico de pedidos.
- Formulário validado com telefone brasileiro e consentimento, que registra o pedido na conta local.

## Dados locais

As contas, sessões, favoritos e pedidos ficam no `localStorage` deste navegador, com o esquema `vertice.mobile.accounts.v1`. Senhas de teste são armazenadas como hashes PBKDF2 com salt individual. Cadastro e login com senha exigem HTTPS ou localhost. A conta de demonstração também funciona na prévia HTTP.

Este modo é uma demonstração funcional, sem autenticação de servidor, recuperação de senha ou sincronização entre aparelhos. Use senhas e contatos de teste. Os pedidos locais não notificam a imobiliária; a interface informa isso antes e depois do registro. Limpar os dados do navegador remove as contas locais.

Os imóveis, valores e características são fictícios. As fotografias são reais, ilustrativas, provenientes do Unsplash; a galeria inclui os créditos. O catálogo vem de `src/data/properties.json` e os dados da imobiliária, de `src/data/site.json`.

O WhatsApp abre uma mensagem com o código e o link do imóvel. Para abrir diretamente a conversa com o corretor, preencha `whatsapp` em `src/data/site.json`, no formato internacional, por exemplo `5511999999999`. Enquanto o número não estiver cadastrado, o WhatsApp permite escolher um contato e o app explica essa configuração.

## Executar

Use Node.js 22.13 ou superior.

```bash
cd mobile
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm test
pnpm build
pnpm preview
```

Também é possível instalar com `npm install` e usar `npm run dev`, `npm test` e `npm run build`. Não são necessárias variáveis de ambiente.

## Publicar separadamente na Vercel

Importe `leoelevamktt/vertice-imoveis` em **um projeto novo**, selecione a branch **mobile** como Production Branch e configure:

| Campo | Valor |
|---|---|
| Root Directory | `mobile` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.x ou superior |

O `vercel.json` inclui as rotas diretas para busca, conta, favoritos e imóveis. O build gera os arquivos de entrada dessas páginas, com títulos e descrições de cada imóvel. Use um domínio diferente do projeto web existente.

## Verificação

`npm test` verifica cadastro, login, sessão, senhas inválidas, e-mails duplicados, isolamento de favoritos e pedidos entre contas, validação do formulário, hashes de senha, combinação de filtros e URLs de busca. `npm run build` verifica TypeScript e gera a publicação estática.

A interface foi verificada no navegador em viewport mobile, incluindo busca combinada, favoritos persistentes após recarregar, página do imóvel, galeria e histórico de interesse local.
