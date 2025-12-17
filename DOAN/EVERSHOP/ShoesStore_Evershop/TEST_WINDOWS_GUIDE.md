# Guia para Rodar Testes no Windows

## ⚠️ Problema
No Windows PowerShell, o comando `npm test` falhava com erro:
```
'ALLOW_CONFIG_MUTATIONS' is not recognized as an internal or external command
```

Isso ocorre porque Windows PowerShell não suporta sintaxe Unix de variáveis de ambiente.

## ✅ Solução

Instalamos `cross-env` que compatibiliza variáveis de ambiente entre plataformas.

### Passo 1: Instalar Dependências
```bash
npm install
```

### Passo 2: Compilar TypeScript
```bash
npm run compile
```

### Passo 3: Rodar Testes
```bash
npm test
```

## 📋 Comandos de Teste

### Rodar todos os testes do EverShop
```bash
npm test
```

### Rodar teste específico
```bash
npm test -- util.jwt.test.js
```

### Rodar com mais detalhes
```bash
npm test -- --verbose
```

### Rodar em modo watch (reexecuta ao salvar)
```bash
npm test -- --watch
```

### Rodar testes E2E (Cypress) do módulo auth
```bash
npm run test:e2e:ui
```

## 🧪 Testes Disponíveis

EverShop tem 27 unit tests incluindo:

| Área | Quantidade |
|------|-----------|
| Middleware | 7 |
| Utils | 8 |
| Router | 2 |
| CMS Services | 2 |
| Widget Manager | 1 |
| Cronjob | 1 |
| Webpack | 1 |
| Components | 1 |
| **Total** | **27** |

## 🔧 O Que Mudou

**Antes (Linux/Mac only):**
```json
"test": "ALLOW_CONFIG_MUTATIONS=true NODE_OPTIONS=--experimental-vm-modules node_modules/jest/bin/jest.js"
```

**Depois (Windows + Linux/Mac):**
```json
"test": "cross-env ALLOW_CONFIG_MUTATIONS=true NODE_OPTIONS=--experimental-vm-modules jest"
```

**Novo pacote adicionado:**
```json
"cross-env": "^7.0.3"
```

## 🎯 Fluxo Completo

```bash
# 1. Clonar/estar no diretório do projeto
cd DOAN/EVERSHOP/ShoesStore_Evershop

# 2. Instalar dependências
npm install

# 3. Compilar código TypeScript
npm run compile

# 4. Rodar testes
npm test

# Output esperado:
# PASS  packages/evershop/src/lib/util/tests/unit/util.merge.test.js
# PASS  packages/evershop/src/lib/util/tests/unit/util.assign.test.js
# ...
# Tests: 27 passed, 27 total
```

## 🐛 Troubleshooting

### Erro: "cross-env not found"
**Solução**: Rode `npm install` novamente

### Erro: "Jest not found"
**Solução**: Rode `npm run compile` antes de `npm test`

### Erro: "Cannot find tests"
**Razão**: Os testes precisam ser compilados para a pasta `dist/`
**Solução**: `npm run compile && npm test`

### PowerShell vs CMD vs Git Bash
Todos funcionam agora com `cross-env`:
```bash
# PowerShell
npm test

# CMD
npm test

# Git Bash
npm test

# Todos funcionam igual! ✅
```

## 📊 Monitorando Testes

### Modo Watch (reexecuta ao mudar código)
```bash
npm test -- --watch
```

### Coverage (cobertura de testes)
```bash
npm test -- --coverage
```

### Specific test file
```bash
npm test -- middleware.test.js
```

## 📝 Próximas Etapas

1. ✅ Instalar `npm install`
2. ✅ Compilar `npm run compile`
3. ✅ Rodar testes `npm test`
4. ✅ Ver resultados
5. ✅ Adicionar novos testes conforme necessário

## 🔗 Referências

- [Jest Docs](https://jestjs.io/)
- [cross-env NPM](https://www.npmjs.com/package/cross-env)
- [EverShop Docs](https://evershop.io/)

---

**Dúvidas?** Verifique os testes em:
- `packages/evershop/src/lib/**/tests/unit/`
- `packages/evershop/src/modules/*/tests/unit/`

Todos os testes agora funcionam no Windows! ✅
