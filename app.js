const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// combo express+pug igual no projeto do Douglas
app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// para armazenamento sem bd, testado, tanto q nesse arquivo vai ter o q testei
const livrosFilePath = path.join(__dirname, "livros.json");
let livrosCache = []; // Armazenar livros na memória

function lerLivros() {
  try {
    return JSON.parse(fs.readFileSync(livrosFilePath, "utf-8"));
  } catch (error) {
    console.error("Erro na leitura do JSON", error);
    return [];
  }
}

function salvarLivros(livros) {
  try {
    fs.writeFileSync(livrosFilePath, JSON.stringify(livros, null, 2));
  } catch (error) {
    console.error("Erro em salvar no JSON", error);
  }
}

app.get("/", async (req, res) => {
  try {
    const resposta = await fetch("http://54.208.149.127:4000/livros");
    const data = await resposta.json();

    livrosCache = data.livros.map((titulo, index) => ({
      id: index + 1,
      titulo,
    }));

    const respostaAutores = await fetch("http://54.208.149.127:4000/autores");
    const autoresData = await respostaAutores.json();
    const autores = autoresData.autores || [];

    const respostaEditoras = await fetch("http://54.208.149.127:4000/editoras");
    const editorasData = await respostaEditoras.json();
    const editoras = editorasData.editoras || [];

    const respostaGeneros = await fetch("http://54.208.149.127:4000/generos");
    const generosData = await respostaGeneros.json();
    const generos = generosData.generos || [];

    res.render("index", { livros: livrosCache, autores, editoras, generos });
  } catch (error) {
    console.error("Erro em buscar livros", error);
    res.status(500).send("Erro em buscar livros");
  }
});

app.get("/livro/:id", async (req, res) => {
  const id = req.params.id;

  const respostaLivros = await fetch("http://54.208.149.127:4000/livros");
  const livrosData = await respostaLivros.json();

  const livros = livrosData.livros.map((titulo, index) => ({
    id: index + 1,
    titulo: titulo,
  }));

  const livro = livros.find((l) => l.id === parseInt(id));

  let livrosStorage = lerLivros();
  let livroLocal = livrosStorage.find((l) => l.id === id.toString());

  if (livroLocal) {
    livro.autor = livroLocal.autor || "Não atribuído";
    livro.editora = livroLocal.editora || "Não atribuído";
    livro.genero = livroLocal.genero || "Não atribuído";
  }

  const respostaAutores = await fetch("http://54.208.149.127:4000/autores");
  const autoresData = await respostaAutores.json();
  const autores = autoresData.autores;

  const respostaEditoras = await fetch("http://54.208.149.127:4000/editoras");
  const editorasData = await respostaEditoras.json();
  const editoras = editorasData.editoras;

  const respostaGeneros = await fetch("http://54.208.149.127:4000/generos");
  const generosData = await respostaGeneros.json();
  const generos = generosData.generos;

  res.render("livro", { livro, autores, editoras, generos });
});

// att
app.post("/livro/:id/atribuir", express.json(), (req, res) => {
  const id = req.params.id;
  const { autor, editora, genero } = req.body;

  let livrosStorage = lerLivros();

  let livroLocal = livrosStorage.find((l) => l.id === id);

  if (livroLocal) {
    livroLocal.autor = autor;
    livroLocal.editora = editora;
    livroLocal.genero = genero;
  } else {
    livroLocal = { id: id, autor, editora, genero };
    livrosStorage.push(livroLocal);
  }

  salvarLivros(livrosStorage);

  res.redirect(`/livro/${id}`);
});

app.get("/filtrar", async (req, res) => {
  const { autor, editora, genero } = req.query;

  const respostaAutores = await fetch("http://54.208.149.127:4000/autores");
  const autoresData = await respostaAutores.json();
  const autores = autoresData.autores || [];

  const respostaEditoras = await fetch("http://54.208.149.127:4000/editoras");
  const editorasData = await respostaEditoras.json();
  const editoras = editorasData.editoras || [];

  const respostaGeneros = await fetch("http://54.208.149.127:4000/generos");
  const generosData = await respostaGeneros.json();
  const generos = generosData.generos || [];

  let livrosFiltrados = livrosCache.map((livro) => {
    const livroLocal = lerLivros().find((l) => l.id === livro.id.toString());
    return {
      ...livro,
      autor: livroLocal ? livroLocal.autor : "Não atribuído",
      editora: livroLocal ? livroLocal.editora : "Não atribuído",
      genero: livroLocal ? livroLocal.genero : "Não atribuído",
    };
  });

  if (autor) {
    livrosFiltrados = livrosFiltrados.filter((livro) => livro.autor === autor);
  }
  if (editora) {
    livrosFiltrados = livrosFiltrados.filter(
      (livro) => livro.editora === editora
    );
  }
  if (genero) {
    livrosFiltrados = livrosFiltrados.filter(
      (livro) => livro.genero === genero
    );
  }

  res.render("index", {
    autores,
    editoras,
    generos,
    livros: livrosFiltrados.length > 0 ? livrosFiltrados : [],
  });
});

app.listen(PORT, () => {
  console.log(`Rodando http://localhost:${PORT}`);
});
