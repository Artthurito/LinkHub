# Link Hub — página de perfil para criadores

Template de página única para streamers e influenciadores. Reúne links, redes,
estatísticas e contato comercial em um endereço só — para o fã e para a marca
que está avaliando um patrocínio.

Cliente atual deste repositório: **Thimagroo**.

## O que ele resolve

Uma página de links comum atende bem o fã e mal a marca. Aqui tudo vive na mesma
rolagem, na ordem em que cada público desiste: primeiro a Twitch em destaque,
depois as redes sociais, e só então os números de audiência, os formatos de
parceria e o contato comercial. O fã encontra o que quer no topo; a marca
continua descendo e acha o mídia kit. Nenhuma URL extra para divulgar, nenhum
PDF para caçar no e-mail.

Outras características:

- Estático puro. Sem build, sem framework, sem dependência para instalar.
- Bilíngue PT/EN, detectando o idioma do navegador.
- Números da prova social animados ao entrar na tela, com formatação por idioma
  (300 mi / 300M).
- Sete paletas prontas, trocadas com uma linha.
- Cada rede social liga e desliga com um booleano.
- Responsivo de verdade: um só CSS atende celular e desktop, com foco visível no
  teclado e `prefers-reduced-motion` respeitado.

## Estrutura

```
.
├── index.html              Esqueleto. Só metadados (title, og:) mudam por cliente.
├── config/
│   ├── profile.js          ⭐ O ÚNICO ARQUIVO QUE MUDA POR CLIENTE
│   ├── theme.js            Paletas disponíveis (azul, vermelho, amarelo...)
│   ├── platforms.js        Catálogo de redes: ícone, monograma, cor de marca
│   └── i18n.js             Textos da interface em PT e EN
├── assets/
│   ├── css/style.css       Estilo. As cores vêm de variáveis CSS injetadas.
│   ├── js/main.js          Lê as configs e monta a página. Não tem conteúdo.
│   ├── js/background.js    Partículas do fundo. Independente do resto.
│   ├── icons/              PNGs das redes sociais (ver icons/README.md)
│   └── img/                avatar.jpg (perfil) e og.png (preview de link)
├── robots.txt
├── sitemap.xml
└── README.md
```

A separação é proposital: para atender um novo cliente você copia o repositório,
edita `config/profile.js`, troca `assets/img/avatar.jpg` e publica. Nem `main.js`
nem `style.css` precisam ser tocados.

## Rodando localmente

Abrir o `index.html` direto no navegador funciona — os scripts são clássicos, não
módulos ES, justamente para não esbarrar em CORS no protocolo `file://`.

Para um servidor local, com recarregamento mais previsível — qualquer uma das
opções abaixo, conforme o que já estiver instalado:

```bash
npx serve .                  # Node
python -m http.server 8000   # Python (no Windows o comando é "python", não "python3")
```

Depois abra o endereço que o comando imprimir (`http://localhost:3000` no caso
do `npx serve`, `http://localhost:8000` no do Python).

## Personalizando

### Trocar a cor

Em `config/profile.js`:

```js
theme: "vermelho",   // azul | vermelho | amarelo | verde | roxo | laranja | branco
```

Para criar uma cor nova, adicione um bloco em `config/theme.js` com `accent`,
`accentSoft`, `onAccent` e `glow`. Atenção ao `onAccent`: é a cor do texto sobre
o botão principal, então precisa ter contraste com o `accent`.

A linha de progresso do topo tem controle próprio, logo abaixo do `theme`:

```js
progressColor: "accent",   // "accent" | "bone" | qualquer cor CSS
```

`accent` deixa a linha na cor do tema, igual aos botões — é o padrão. `bone`
volta ao monocromático, útil quando o tema já é muito saturado.

### Ligar e desligar redes

Cada link tem um `enabled`. Marcado como `false`, ele simplesmente não é
renderizado — não é escondido com CSS, não existe no HTML final.

```js
{ enabled: false, platform: "x", url: "", subtitle: "@thimagroo" },
```

Grupos inteiros também aceitam `enabled: false`, útil para seções que ainda não
têm conteúdo (cortes, patrocinadores).

### Ligar e desligar funcionalidades

```js
features: {
  langSwitch: true,     // botão PT / EN
  brandSection: true,   // seções de audiência e formatos de parceria
  counters: true,       // números animados
  liveStatus: true,     // selo de ao vivo
  grain: true,          // textura de fundo
  particles: true,      // partículas em movimento no fundo
}
```

### O fundo

São quatro camadas fixas, todas transparentes ao clique: a malha quadriculada
(`html::before`, com máscara radial para não ficar marcada nas bordas), as
partículas em canvas (`assets/js/background.js`), o grão e o brilho do tema.
A densidade das partículas acompanha a área da tela, então o celular desenha
menos que o desktop, e a animação para quando a aba sai de foco.

Quem tem "reduzir movimento" ligado no sistema recebe as partículas paradas e os
contadores já no valor final — vale saber disso ao testar, porque a página vai
parecer estática sem estar quebrada.

### Ícones

Os PNGs já estão em `assets/icons/` — os das marcas vêm do Simple Icons (CC0),
exportados em branco a 128 px. Se um arquivo faltar, o card cai para um
monograma ("TW", "YT") e a página não quebra. Ver `assets/icons/README.md` para
a especificação e como adicionar uma rede nova.

## SEO

O que está montado:

- Título, descrição, `canonical`, `robots` e o par Open Graph / Twitter Card
  completos em `index.html`. Ficam estáticos de propósito: WhatsApp, Discord,
  Telegram e Instagram leem o HTML cru e **não executam JavaScript**, então
  metatag gerada por JS não apareceria no preview deles.
- `assets/img/og.png` (1200×630) com foto, nome e os dois números principais.
- Dados estruturados JSON-LD (`ProfilePage` + `Person`) gerados em `main.js` a
  partir do `profile.js`. O `sameAs` sai da lista de links, então ligar ou
  desligar uma rede atualiza o schema junto — é o que diz ao Google que os
  perfis são da mesma pessoa.
- `robots.txt` e `sitemap.xml`.
- `h1` e descrição escritos no HTML e só depois reescritos pelo JS no idioma
  certo, para que a página tenha conteúdo mesmo sem JavaScript.
- Hierarquia de títulos correta: `h1` do nome, `h2` por seção, `h3` nos grupos.

Não há `hreflang`: PT e EN vivem na mesma URL, e `hreflang` exige uma URL
distinta por idioma. O par correto nesse caso é `og:locale` + `og:locale:alternate`,
que é o que está aplicado.

### Ao trocar de domínio

A URL aparece em dois arquivos:

1. `index.html` — o `<link rel="canonical">`, o `og:url` e as duas referências
   de imagem (`og:image`, `twitter:image`)
2. `sitemap.xml` e `robots.txt`

O JSON-LD não precisa de ajuste: ele lê a URL do `canonical` em tempo de
execução.

## Status "ao vivo" real

Hoje `live.isLive` é manual em `config/profile.js`. Para automatizar é preciso
consultar a API da Twitch, e isso **não pode ser feito no navegador**: exporia o
Client Secret. O caminho é uma função serverless (Cloudflare Worker) que consulta
a API, guarda a resposta em cache por ~60s e devolve um JSON simples. No cliente:

```js
fetch("/api/live")
  .then((r) => r.json())
  .then((d) => { document.body.dataset.live = String(d.isLive); });
```

Enquanto isso não existe, o site funciona normalmente com o valor manual.

## Publicação

Hospedagem atual: **Vercel**. Como o projeto é estático, não há etapa de build.

1. Importe o repositório na Vercel
2. Framework Preset: *Other*
3. Build command e Output directory: *(vazios)*
4. O domínio `.com` entra depois em Settings → Domains

Atenção ao plano: o **Hobby da Vercel veda uso comercial**. Enquanto a página é
portfólio pessoal, tudo certo. Se virar entrega para um criador que paga pelo
trabalho, é preciso assinar o Pro ou migrar para o Cloudflare Pages, cujo plano
gratuito permite uso comercial e ainda dá banda ilimitada.

## Pendências

- [x] Adicionar os PNGs oficiais em `assets/icons/`
- [x] Gerar `assets/img/og.png` (1200×630) para o preview em links
- [ ] Confirmar os números marcados com `TODO` em `config/profile.js`
- [ ] Registrar o domínio `.com` e atualizar a URL nos dois arquivos (ver SEO)
- [ ] Cadastrar o site no Google Search Console após publicar

## Licença

Uso privado. Definir licença antes de tornar o repositório público.
