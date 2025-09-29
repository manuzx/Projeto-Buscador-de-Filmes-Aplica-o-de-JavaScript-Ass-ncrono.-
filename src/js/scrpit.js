// Importa a chave da API de um arquivo separado para manter o código organizado.
import { chaveApi } from "./dados.js";

// 1. Obter referências aos elementos HTML com os quais vamos interagir.
const campoFilmesInput = document.getElementById("campoFilmes");
const buscarFilmesBtn = document.getElementById("buscarFilmes");
const inforFilmesDiv = document.getElementById("inforFilmes");

// 2. Adicionar um "ouvinte de evento" que aciona a função de busca quando o botão é clicado.
buscarFilmesBtn.addEventListener("click", buscarFilme);

// 3. Define a função principal que busca e exibe os dados do filme.
// Usamos 'async' para poder usar 'await' e lidar com a requisição de forma mais limpa.
async function buscarFilme() {
  // Pega o valor (o texto) do campo de input no momento do clique.
  const nomeDoFilme = campoFilmesInput.value;

  // Se o campo estiver vazio, avisa o usuário e para a função.
  if (nomeDoFilme.trim() === "") {
    inforFilmesDiv.innerHTML = "<p>Por favor, digite o nome de um filme.</p>";
    return;
  }

  // Monta a URL da API com o nome do filme e sua chave.
  // Usamos 's=' para buscar uma lista de filmes em vez de 't=' para um único título.
  const url = `http://www.omdbapi.com/?s=${nomeDoFilme}&apikey=${chaveApi}`;
  try {
    // 4. Faz a requisição à API e espera a resposta.
    const response = await fetch(url);
    // Converte a resposta em formato JSON e espera a conversão terminar.
    const data = await response.json();

    // 5. Verifica se a API encontrou algum resultado.
    if (data.Response === "True") {
      inforFilmesDiv.innerHTML = "<p>Carregando detalhes...</p>"; // Mensagem de carregamento

      // 6. Cria um array de "promessas". Cada promessa é uma busca pelos detalhes de um filme.
      // O método .map() cria um novo array baseado no array data.Search.
      const promessasDeDetalhes = data.Search.map((filme) => {
        const urlDetalhes = `http://www.omdbapi.com/?i=${filme.imdbID}&apikey=${chaveApi}`;
        // Retornamos a promessa do fetch, que será resolvida para o formato JSON.
        return fetch(urlDetalhes).then((res) => res.json());
      });

      // 7. Usa Promise.all para esperar que TODAS as promessas (buscas) sejam resolvidas.
      // 'filmesComDetalhes' será um array com os dados completos de todos os filmes.
      const filmesComDetalhes = await Promise.all(promessasDeDetalhes);

      // 8. Gera o HTML para todos os filmes de uma vez e atualiza a tela.
      // Usamos .map() de novo para transformar cada objeto de filme em um bloco de HTML
      // e .join('') para juntar tudo em uma única string.
      inforFilmesDiv.innerHTML = filmesComDetalhes
        .map(
          (detalhesFilme) => `
          <div class="filme">
            <h2>${detalhesFilme.Title} (${detalhesFilme.Year})</h2>
            <img src="${detalhesFilme.Poster}" alt="Pôster de ${detalhesFilme.Title}" style="max-width: 200px;" />
            <p><strong>Sinopse:</strong> ${detalhesFilme.Plot}</p>
          </div>
        `
        )
        .join("");
    } else {
      // Se não encontrou nenhum filme, exibe uma mensagem de erro.
      inforFilmesDiv.innerHTML = `<p>Filme não encontrado. Tente novamente.</p>`;
    }
  } catch (error) {
    // Se ocorrer um erro de rede, exibe uma mensagem de erro no console e para o usuário.
    console.error("Erro ao buscar filme:", error);
    inforFilmesDiv.innerHTML = `<p>Ocorreu um erro na comunicação com o servidor.</p>`;
  }
}
