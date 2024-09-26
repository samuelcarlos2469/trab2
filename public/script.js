//igual os filmes no MovieManiax, igual a tarefa no trab de virtualização
//só q aqui mais fácil, já q tem poucos dados de origem
function salvarAtribuicao(event) {
  event.preventDefault();

  const livroId = document.getElementById("livro-id").value;
  const autor = document.getElementById("autor").value;
  const editora = document.getElementById("editora").value;
  const genero = document.getElementById("genero").value;

  const dadosLivro = {
    autor: autor,
    editora: editora,
    genero: genero,
  };

  fetch(`/livro/${livroId}/atribuir`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosLivro),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = `/livro/${livroId}`;
      } else {
        console.error("Erro ao atribuir ao livro.");
      }
    })
    .catch((error) => {
      console.error("Erro na req:", error);
    });
}
