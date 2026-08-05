# Link Hub — página de perfil para criadores

Template de página única para streamers e influenciadores. Reúne links, redes,
estatísticas e contato comercial em um endereço só, com dois modos de leitura:
um para o público e outro para marcas que estão avaliando um patrocínio.

Cliente atual deste repositório: **Thimagroo**.

## O que ele resolve

Uma página de links comum atende bem o fã e mal a marca. Aqui a mesma URL tem um
alternador **Sou fã / Sou marca** no topo: no modo fã os links vêm primeiro; no
modo marca sobem os dados de audiência, os formatos de parceria e o contato.
Nenhuma URL extra para divulgar, nenhum PDF para caçar no e-mail.

Outras características:

- Estático puro. Sem build, sem framework, sem dependência para instalar.
- Bilíngue PT/EN, detectando o idioma do navegador.
- Números da prova social animados, com formatação por idioma (300 mi / 300M).
- Sete paletas prontas, trocadas com uma linha.
- Cada rede social liga e desliga com um booleano.
- Responsivo, com foco visível no teclado e `prefers-reduced-motion` respeitado.

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
│   ├── icons/              PNGs das redes sociais (ver icons/README.md)
│   └── img/avatar.jpg      Foto de perfil
└── README.md
```

A separação é proposital: para atender um novo cliente você copia o repositório,
edita `config/profile.js`, troca `assets/img/avatar.jpg` e publica. Nem `main.js`
nem `style.css` precisam ser tocados.

## Rodando localmente

Abrir o `index.html` direto no navegador funciona — os scripts são clássicos, não
módulos ES, justamente para não esbarrar em CORS no protocolo `file://`.

Para um servidor local, com recarregamento mais previsível:

```bash
python3 -m http.server 8000
# depois: http://localhost:8000
```

## Personalizando

### Trocar a cor

Em `config/profile.js`:

```js
theme: "vermelho",   // azul | vermelho | amarelo | verde | roxo | laranja | branco
```

Para criar uma cor nova, adicione um bloco em `config/theme.js` com `accent`,
`accentSoft`, `onAccent` e `glow`. Atenção ao `onAccent`: é a cor do texto sobre
o botão principal, então precisa ter contraste com o `accent`.

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
  langSwitch: true,   // botão PT / EN
  brandMode: true,    // alternador Sou fã / Sou marca
  counters: true,     // números animados
  liveStatus: true,   // selo de ao vivo
  grain: true,        // textura de fundo
}
```

### Ícones

Os PNGs ficam em `assets/icons/`. Enquanto um arquivo não existir, o card mostra
um monograma ("TW", "YT") no lugar — a página não quebra. Ver
`assets/icons/README.md` para especificação e onde baixar os oficiais.

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

Cloudflare Pages, plano gratuito: banda ilimitada, SSL e proteção contra DDoS
inclusos. Como o projeto é estático, não há etapa de build.

1. Conecte o repositório em Cloudflare Pages
2. Build command: *(vazio)*
3. Output directory: `/`
4. Aponte o domínio em Custom domains

O plano Hobby da Vercel é uma alternativa técnica, mas veda uso comercial — se a
página for de um cliente pagante, ou se usa o Pages ou se assina o Vercel Pro.

## Pendências

- [ ] Adicionar os PNGs oficiais em `assets/icons/`
- [ ] Confirmar os números marcados com `TODO` em `config/profile.js`
- [ ] Gerar `assets/img/og.png` (1200×630) para o preview em links
- [ ] Preencher os dados reais de audiência do modo marca
- [ ] Decidir o domínio e registrá-lo no CPF/CNPJ do criador

## Licença

Uso privado. Definir licença antes de tornar o repositório público.
