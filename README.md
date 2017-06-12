# Commercial 2

Commercial 2 é uma versão atualizada do sistema Commercial - Gestor de vendas.

## Instalação

Após clonar o projeto, rodar os seguintes comandos

```sh
npm install

bower install
```

## Build

Primeiro é preciso compilar o código fonte usando o Gulp. O projeto compilado é copiado para a pasta `<projeto>/www`

```sh
# compila o codigo fonte
gulp build
```

### Build para MacOS

Cria o app dentro da pasta `<projeto>/releases/Commercial-darwin-x64`

```sh
# gera o app para MacOS
npm run build-mac
```

### Build para Windows

Cria o app dentro da pasta `<projeto>/releases/Commercial-win32-x64`

```sh
# gera o app para Windows
npm run build-win
```