# Ícones das redes sociais

Coloque aqui os PNGs, com estes nomes exatos (é o que `config/platforms.js`
espera):

```
twitch.png     youtube.png    instagram.png   tiktok.png
kick.png       x.png          discord.png     telegram.png
whatsapp.png   spotify.png    email.png       store.png      link.png
```

## Especificação

- **Formato:** PNG com fundo transparente
- **Dimensão:** 128 × 128 px (exibido a 22 px; o excedente é para telas retina)
- **Cor:** versão monocromática branca funciona melhor no fundo escuro. A cor da
  marca já aparece no brilho da borda no hover, definido em `platforms.js`.
- **Margem:** deixe ~10% de respiro nas bordas para os ícones ficarem
  opticamente do mesmo tamanho entre si — logos quadrados (Instagram) parecem
  maiores que circulares (Discord) quando ocupam a mesma caixa.

Enquanto um arquivo não existir, o card mostra automaticamente um monograma
("TW", "YT") no lugar. Nada quebra, então dá para publicar e completar depois.

## Onde conseguir

Cada plataforma mantém uma página oficial de recursos de marca com os arquivos e
as regras de uso. Vale baixar de lá em vez de pegar em banco de ícones aleatório:
os logos são marcas registradas e cada empresa define o que pode ou não ser feito
com eles — em geral proíbem alterar proporção, aplicar efeitos ou usar de um jeito
que sugira parceria oficial. Procure por "brand guidelines" ou "press kit" no
rodapé de cada site.

Alternativa prática para monocromático: **Simple Icons** (simpleicons.org) reúne
os logos em SVG sob licença permissiva. Como aqui usamos PNG, é só exportar cada
SVG a 128 px na cor branca.

## Se preferir SVG no lugar de PNG

Funciona sem alterar código: troque a extensão nos caminhos de
`config/platforms.js`. A vantagem do PNG é ser à prova de bala em webview de
Instagram e TikTok, que é de onde vem quase todo o tráfego dessa página — foi por
isso que ficou como padrão.
