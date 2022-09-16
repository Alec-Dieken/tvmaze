"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // console.log(`https://api.tvmaze.com/search/shows?q=${searchTerm}`);
  let res = await axios.get(
    `https://api.tvmaze.com/search/shows?q=${searchTerm}`
  );
  // console.log(res.data);

  let shows = res.data.map(function (v) {
    let { id, name, summary, image } = v.show;
    return { id, name, summary, image };
  });
  // console.log(res.data);
  return shows;
  
}

/** Given list of shows, create markup for each and add to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${
                show.image.medium
                  ? show.image.medium
                  : "https://tinyurl.com/tv-missing"
              }" 
              alt=${show.name} 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);

  $('#search-query').val('')
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$("#shows-list").on("click", async function (e) {
  if (e.target.nodeName === "BUTTON") {
    let id =
      e.target.parentNode.parentNode.parentNode.getAttribute("data-show-id");
    let episodes = await getEpisodesOfShow(id);
    populateEpisodes(episodes);
  }
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  let res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = res.data.map(function (v) {
    let { id, name, season, number } = v;
    return { id, name, season, number };
  });

  return episodes;
}

// This function takes in an array of episode objects and adds their info to new list elements, which
// are then appended to the #episodes-list UL
function populateEpisodes(episodes) {
  $episodesArea.show();
  $("#episodes-list").empty();
  for (let v of episodes) {
    const $episode = $(`
    <li>${v.name}, (season ${v.season}, episode ${v.number})</li>
    `);

    $("#episodes-list").append($episode);
  }
}
