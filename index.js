import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

const app = express();
var listaProdutos = [];

app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 15
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function estaAutenticado(requisicao, resposta, proximo) {
    if (requisicao.session?.logado) {
        proximo();
    } else {
        resposta.redirect("/login");
    }
}

app.get('/', estaAutenticado, (req, res) => {
    res.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/">Menu</a>
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Cadastro
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/produto">Produto</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="/listaProdutos">Listar Produtos</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="container mt-5">
                    <h2>Sistema de Cadastro de Produtos</h2>
                    <p>Bem-vindo, <strong>${req.session.nomeUsuario}</strong>! Utilize o menu acima para acessar as funcionalidades.</p>
                    <a href="/produto" class="btn btn-primary mt-2">Cadastrar Produto</a>
                    <a href="/listaProdutos" class="btn btn-secondary mt-2">Lista de Produtos</a>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
    res.end();
});

app.get("/login", (requisicao, resposta) => {
    const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <main class="form-signin w-100 m-auto">
                        <form action="/login" method="POST">
                            <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>
                            <div class="form-floating mb-2">
                                <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                                <label for="email">Email</label>
                            </div>
                            <div class="form-floating mb-2">
                                <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
                                <label for="senha">Senha</label>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control" id="nomeUsuario" name="nomeUsuario" placeholder="Seu nome">
                                <label for="nomeUsuario">Nome do usuário</label>
                            </div>
                            <button class="btn btn-primary w-100 py-2" type="submit">Login</button>
                            <p class="mt-4 text-body-secondary">Último acesso: ${ultimoAcesso}</p>
                        </form>
                    </main>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
    resposta.end();
});

app.post("/login", (requisicao, resposta) => {
    const email = requisicao.body.email;
    const senha = requisicao.body.senha;
    const nomeUsuario = requisicao.body.nomeUsuario;

    if (email == "admin@teste.com.br" && senha == "admin") {
        requisicao.session.logado = true;
        requisicao.session.nomeUsuario = nomeUsuario || "Usuário";

        const dataUltimoAcesso = new Date();
        resposta.cookie("ultimoAcesso", dataUltimoAcesso.toLocaleString("pt-BR"), {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        resposta.redirect("/");
    } else {
        resposta.write(`
            <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Login</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body class="d-flex align-items-center py-4 bg-body-tertiary">
                    <div class="container w-50">
                        <main class="form-signin w-100 m-auto">
                            <form action="/login" method="POST">
                                <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>
                                <div class="form-floating mb-2">
                                    <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com" value="${email}">
                                    <label for="email">Email</label>
                                </div>
                                <div class="form-floating mb-2">
                                    <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
                                    <label for="senha">Senha</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="nomeUsuario" name="nomeUsuario" placeholder="Seu nome" value="${nomeUsuario}">
                                    <label for="nomeUsuario">Nome do usuário</label>
                                </div>
                                <span>
                                    <p class="text-danger">Email ou senha inválidos!</p>
                                </span>
                                <button class="btn btn-primary w-100 py-2" type="submit">Login</button>
                            </form>
                        </main>
                    </div>
                </body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </html>
        `);
        resposta.end();
    }
});

app.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");
});

app.get("/produto", estaAutenticado, (requisicao, resposta) => {
    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Cadastro de Produto</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/">Menu</a>
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Cadastro
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/produto">Produto</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="/listaProdutos">Listar Produtos</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="container mt-5">
                    <form method="POST" action="/produto" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Produto</h3>
                        </legend>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="codigoBarras">Código de Barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="descricao">Descrição do Produto</label>
                            <input type="text" class="form-control" id="descricao" name="descricao">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="precoCusto">Preço de Custo (R$)</label>
                            <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="precoVenda">Preço de Venda (R$)</label>
                            <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="dataValidade">Data de Validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="qtdEstoque">Quantidade em Estoque</label>
                            <input type="number" class="form-control" id="qtdEstoque" name="qtdEstoque">
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="nomeFabricante">Nome do Fabricante</label>
                            <input type="text" class="form-control" id="nomeFabricante" name="nomeFabricante">
                        </div>
                        <div class="row mt-3">
                            <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
    resposta.end();
});

app.post("/produto", estaAutenticado, (requisicao, resposta) => {
    const codigoBarras   = requisicao.body.codigoBarras;
    const descricao      = requisicao.body.descricao;
    const precoCusto     = requisicao.body.precoCusto;
    const precoVenda     = requisicao.body.precoVenda;
    const dataValidade   = requisicao.body.dataValidade;
    const qtdEstoque     = requisicao.body.qtdEstoque;
    const nomeFabricante = requisicao.body.nomeFabricante;

    if (!codigoBarras || !descricao || !precoCusto || !precoVenda || !dataValidade || !qtdEstoque || !nomeFabricante) {
        let html = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Cadastro de Produto</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/">Menu</a>
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Cadastro
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/produto">Produto</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="/listaProdutos">Listar Produtos</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="container mt-5">
                    <form method="POST" action="/produto" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Produto</h3>
                        </legend>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="codigoBarras">Código de Barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" value="${codigoBarras}">`;
        if (!codigoBarras) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe o Código de Barras</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="descricao">Descrição do Produto</label>
                            <input type="text" class="form-control" id="descricao" name="descricao" value="${descricao}">`;
        if (!descricao) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe a Descrição do Produto</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="precoCusto">Preço de Custo (R$)</label>
                            <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto" value="${precoCusto}">`;
        if (!precoCusto) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe o Preço de Custo</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="precoVenda">Preço de Venda (R$)</label>
                            <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda" value="${precoVenda}">`;
        if (!precoVenda) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe o Preço de Venda</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="dataValidade">Data de Validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade" value="${dataValidade}">`;
        if (!dataValidade) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe a Data de Validade</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="qtdEstoque">Quantidade em Estoque</label>
                            <input type="number" class="form-control" id="qtdEstoque" name="qtdEstoque" value="${qtdEstoque}">`;
        if (!qtdEstoque) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe a Quantidade em Estoque</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-2">
                            <label class="colFormLabel" for="nomeFabricante">Nome do Fabricante</label>
                            <input type="text" class="form-control" id="nomeFabricante" name="nomeFabricante" value="${nomeFabricante}">`;
        if (!nomeFabricante) {
            html += `<div class="alert alert-danger mt-1" role="alert">Por favor informe o Nome do Fabricante</div>`;
        }
        html += `
                        </div>
                        <div class="row mt-3">
                            <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>`;

        resposta.write(html);
        resposta.end();
    } else {
        listaProdutos.push({
            "codigoBarras": codigoBarras,
            "descricao": descricao,
            "precoCusto": precoCusto,
            "precoVenda": precoVenda,
            "dataValidade": dataValidade,
            "qtdEstoque": qtdEstoque,
            "nomeFabricante": nomeFabricante
        });
        resposta.redirect("/listaProdutos");
    }
});

app.get("/listaProdutos", estaAutenticado, (requisicao, resposta) => {
    const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Lista de Produtos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/">Menu</a>
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Cadastro
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/produto">Produto</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="/listaProdutos">Listar Produtos</a></li>
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="container mt-5">
                    <h3>Produtos Cadastrados</h3>
                    <p class="text-muted">Último acesso ao sistema: <strong>${ultimoAcesso}</strong></p>
                    <table class="table table-striped table-hover table-bordered mt-3">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">Id</th>
                                <th scope="col">Código de Barras</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Preço de Custo</th>
                                <th scope="col">Preço de Venda</th>
                                <th scope="col">Data de Validade</th>
                                <th scope="col">Qtd Estoque</th>
                                <th scope="col">Fabricante</th>
                            </tr>
                        </thead>
                        <tbody>
    `);

    for (let i = 0; i < listaProdutos.length; i++) {
        const produto = listaProdutos[i];
        const dataFormatada = new Date(produto.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR');
        resposta.write(`
            <tr>
                <td>${i + 1}</td>
                <td>${produto.codigoBarras}</td>
                <td>${produto.descricao}</td>
                <td>R$ ${parseFloat(produto.precoCusto).toFixed(2)}</td>
                <td>R$ ${parseFloat(produto.precoVenda).toFixed(2)}</td>
                <td>${dataFormatada}</td>
                <td>${produto.qtdEstoque}</td>
                <td>${produto.nomeFabricante}</td>
            </tr>
        `);
    }

    resposta.write(`
                        </tbody>
                    </table>
                    <a href="/produto" class="btn btn-primary">Continuar cadastrando...</a>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
    resposta.end();
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});