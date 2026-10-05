# Vértice Imóveis

Site imobiliário responsivo com 30 anúncios fictícios, fotografias reais e ilustrativas, filtros combinados e 30 páginas individuais.

## Executar

Requer Node.js 20 ou superior. Não há dependências externas para instalar.

```bash
npm run build
npm run dev
```

Abra `http://localhost:3000`. Os arquivos finais são gerados em `dist/`.

## Catálogo

Os cadastros estão em `data/properties.json`. Há 21 exemplos de venda e 9 de locação, em São Paulo, Campinas, Santos, Sorocaba e Barueri. Incluem casas, casas em condomínio, apartamentos, studios, coberturas, terrenos e salas comerciais.

O catálogo permite combinar cidade, bairro dependente da cidade, tipo, finalidade, preços mínimo/máximo, área mínima/máxima, quartos, suítes, banheiros, vagas, características e código/palavra-chave. Há ordenação, paginação e filtros preservados na URL.

As páginas individuais incluem código, descrição, galeria ampliável, valores de condomínio/IPTU, características, informações de localização, formulário validado e contato por WhatsApp.

## Configurar o corretor

Em `data/site.json`, substitua `whatsapp: null` pelo número completo somente com dígitos, incluindo país e DDD. Exemplo de formato: `55` + DDD + número. Altere o nome da equipe em `realtor`.

Depois execute `npm run build` e publique novamente. Os botões passam a abrir diretamente o WhatsApp do corretor com o código e o link do imóvel. O formulário prepara uma mensagem com os dados preenchidos para o visitante conferir e enviar no WhatsApp. Não há envio automático, armazenamento de leads ou servidor de e-mail.

Enquanto o número não está configurado, aparece um diálogo para copiar a mensagem, com indicação explícita de demonstração. Nenhuma mensagem é enviada e nenhum dado de contato é armazenado.

Para uso comercial, substitua os exemplos, atualize os dados da marca no gerador e adapte a política de privacidade ao responsável pelo site. Os banners e avisos de demonstração foram mantidos intencionalmente nesta entrega.

## Publicar na Vercel

Importe o repositório na Vercel ou utilize a CLI autenticada:

```bash
vercel --prod
```

O `vercel.json` configura o build `npm run build`, a pasta `dist`, URLs sem `.html` e cabeçalhos básicos. As fotos verificadas são baixadas durante o build na Vercel para a própria CDN do site. Se um download falhar, a página conserva a URL original verificada do Unsplash.

## Fotografias

`data/photos.json` preserva as páginas de origem, fotógrafos, licença e URLs exatas. São 20 fotografias de profissionais com licença gratuita do Unsplash. As imagens são ilustrativas e não correspondem aos anúncios fictícios nem necessariamente ao mesmo imóvel.

## Validação

Build e sintaxe JavaScript passaram. Os 30 códigos/páginas, filtros combinados por localização, preço, área, quartos e características, pesquisa por código e totais de venda/locação foram verificados. A infraestrutura local não disponibilizou um navegador executável nem acesso direto ao CDN de imagens; a inspeção visual e o carregamento das fotos devem ser confirmados na publicação.

## Prévia em um arquivo

`node preview.mjs` produz uma prévia HTML navegável, com os mesmos anúncios, filtros e páginas. Ela carrega as fotografias e fontes dos provedores originais e precisa de internet. O arquivo não substitui a publicação na Vercel.
