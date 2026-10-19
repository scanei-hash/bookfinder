const formPesquisa = document.getElementById("formPesquisa");
const campoTitulo = document.getElementById("titulo");
const campoAutor = document.getElementById("autor");
const campoAssunto = 
                document.getElementById("assunto");
const listaLivros = document.getElementById("listaLivros");
const mensagem = document.getElementById("mensagem");

// Pesquisa livros na Open Library
formPesquisa.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const autor = campoAutor.value.trim();
    const assunto = campoAssunto.value.trim();

    if (!titulo && !autor && !assunto) {
        mensagem.textContent = "Digite um título ou nome de autor.";
        listaLivros.innerHTML = "";
        return;
    }

    listaLivros.innerHTML = "";
    mensagem.textContent = "Pesquisando livros...";

    try {
        let url;

if (assunto && !titulo && !autor) {
    url = `https://openlibrary.org/subjects/${encodeURIComponent(
        assunto.toLowerCase().trim().replace(/\s+/g, "_")
    )}.json?limit=12`;
} else {
    const parametros = new URLSearchParams();

    if (titulo) {
        parametros.set("title", titulo);
    }

    if (autor) {
        parametros.set("author", autor);
    }

    if (assunto) {
        parametros.set("subject", assunto);
    }

    parametros.set("limit", "12");

    url = `https://openlibrary.org/search.json?${parametros.toString()}`;
}

const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const dados = await resposta.json();

const livros = dados.docs || dados.works || [];

if (livros.length === 0) {
    mensagem.textContent = "Nenhum livro encontrado.";
    return;
}

mensagem.textContent =
    `${livros.length} livro(s) encontrado(s).`;

livros.forEach(function (livro) {
            const cartao = document.createElement("article");
            cartao.className = "livro";

            const tituloLivro = document.createElement("h3");
            tituloLivro.textContent = livro.title || "Título não informado";

            const autorLivro = document.createElement("p");
            autorLivro.textContent =
    "Autor(es): " +
    (
        livro.author_name
            ? livro.author_name.join(", ")
            : livro.authors
                ? livro.authors.map(function (autor) {
                    return autor.name;
                }).join(", ")
                : "Não informado"
    );

            const anoLivro = document.createElement("p");
            anoLivro.textContent =
                "Ano de publicação: " +
                (livro.first_publish_year || "Não informado");

            const botaoDetalhes = document.createElement("button");
            botaoDetalhes.type = "button";
            botaoDetalhes.textContent = "Ver detalhes";

            botaoDetalhes.addEventListener("click", function () {
                consultarDetalhes(livro.key, cartao);
            });

            cartao.append(
                tituloLivro,
                autorLivro,
                anoLivro,
                botaoDetalhes
            );

            listaLivros.appendChild(cartao);
        });

    } catch (erro) {
        mensagem.textContent =
            "Ocorreu um erro ao consultar os livros. Tente novamente.";

        console.error("Erro na pesquisa:", erro);
    }
});

// Consulta os detalhes de uma obra específica
async function consultarDetalhes(chave, cartao) {
    const areaDetalhes = document.createElement("div");
    areaDetalhes.className = "detalhes-livro";
    areaDetalhes.textContent = "Carregando detalhes...";

    const detalhesAntigos = cartao.querySelector(".detalhes-livro");

    if (detalhesAntigos) {
        detalhesAntigos.remove();
        return;
    }

    cartao.appendChild(areaDetalhes);

    try {
        const resposta = await fetch(
            `https://openlibrary.org${chave}.json`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar os detalhes.");
        }

        const livro = await resposta.json();

        areaDetalhes.replaceChildren();

        const titulo = document.createElement("h4");
        titulo.textContent = "Detalhes da obra";

        const descricao = document.createElement("p");

        let textoDescricao = livro.description;

        if (typeof textoDescricao === "object" && textoDescricao !== null) {
            textoDescricao = textoDescricao.value;
        }

        descricao.textContent =
            "Descrição: " +
            (textoDescricao || "Descrição não disponível.");

        const assuntos = document.createElement("p");
        assuntos.textContent =
            "Assuntos: " +
            (livro.subjects
                ? livro.subjects.slice(0, 5).join(", ")
                : "Não informados");

        areaDetalhes.append(titulo, descricao, assuntos);

    } catch (erro) {
        areaDetalhes.textContent =
            "Não foi possível carregar os detalhes desta obra.";

        console.error("Erro nos detalhes:", erro);
    }
}