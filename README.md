# Minhas metas — calculadora de vendas

Projeto estático em HTML, CSS e JavaScript puro. Funciona offline, sem instalação, dependências, backend ou etapa de compilação.

## Abrir
Extraia o ZIP e abra `index.html` no navegador. Mantenha `styles.css` e `script.js` na mesma pasta.

## Regras implementadas
- Vendas abaixo da meta: comissão de 1,5% sobre todo o valor vendido.
- Vendas iguais ou superiores à meta: 2% sobre todo o valor vendido.
- Vendas iguais ou superiores ao desafio principal: 2,5% sobre todo o valor vendido, substituindo os 2%.
- Desafio principal: meta acrescida de 5% por padrão. É possível alterar o percentual ou digitar diretamente o valor do desafio.
- Editar o valor diretamente ativa o modo personalizado, preservado ao alterar a meta. Editar o percentual volta ao modo automático.
- Desafios EVA: qualquer quantidade de categorias, cada uma com nome, percentual mínimo e vendas da categoria. O objetivo usa o **total efetivamente vendido**, não o valor fixo da meta/desafio. EVA não modifica a comissão.
- Uma categoria não pode exceder o total vendido. As categorias não são somadas para validação, pois podem se sobrepor.
- Com zero vendas, os desafios EVA ficam pendentes.
- Dinheiro é comparado em centavos. Objetivos EVA com frações de centavo são arredondados para cima, para garantir a participação mínima.
- Valores podem ser informados como `32500`, `32.500,00` ou `32500.00`.
- Os dados ficam somente na página e são apagados ao recarregar/fechar. Não há envio de informações nem armazenamento local.

## Exemplo
Meta: R$ 31.000,00. Acréscimo: 5%. Desafio automático: R$ 32.550,00.
Para usar R$ 32.500,00, edite diretamente o valor do desafio.
Com R$ 32.500,00 vendidos e desafio personalizado de R$ 32.500,00:
- Comissão: 2,5%, total de R$ 812,50.
- Skincare (2%): objetivo R$ 650,00. Vendas de R$ 2.000,00 atingem o desafio.
- Perfumaria (55%): objetivo R$ 17.875,00.

## Publicar no GitHub Pages
Coloque `index.html`, `styles.css` e `script.js` juntos na raiz do repositório. Configure o GitHub Pages para publicar essa pasta. Os caminhos são relativos e também funcionam quando o site está em uma subpasta de domínio. Nenhum build é necessário.

## Arquivos
- `index.html`: estrutura da interface e modelo dos desafios EVA.
- `styles.css`: visual responsivo para celular e computador.
- `script.js`: leitura dos valores, validações, comissão e desafios.

Calculadora independente; as regras representam as informações fornecidas para este projeto, devendo ser conferidas conforme sua política de comissionamento.
