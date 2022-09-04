import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import ImageFinder from './imgFinder.js';
import Notiflix from 'notiflix';

const refs = {
  searchFormEl: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

let limit = 0;
let loadedImages = 0;

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionsDelay: 250,
});

const imageFinder = new ImageFinder();

refs.searchFormEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';

  const searchValue = e.target.elements.searchQuery.value.trim();
  if (!searchValue.length) return;

  limit = 0;
  loadedImages = 0;

  imageFinder.resetPage();
  imageFinder.query = searchValue;

  try {
    const data = await imageFinder.fetchImg();
    if (!data.total) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    renderImages(data.hits);
    limit = data.totalHits;
    loadedImages = data.hits.length;
    Notiflix.Notify.success(`Horray! We found ${data.totalHits} images`);
    simpleLightBox.refresh();
    window.addEventListener('scroll', onScrollLoad);
  } catch (error) {
    Notiflix.Notify.failure(error);
  }
}

function onScrollLoad() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (clientHeight + scrollTop >= scrollHeight) {
    getMoreImages();
  }
}

async function getMoreImages() {
  if (limit <= loadedImages) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    window.removeEventListener('scroll', onScrollLoad);
    return;
  }

  imageFinder.incrementPage();
  try {
    const { total, hits, totalHits } = await imageFinder.fetchImg();
    loadedImages += hits.length;

    if (total === totalHits) {
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
      );
      window.removeEventListener('scroll', onScrollLoad);
      return;
    }

    renderImages(hits);

    const { height: cardHeight } =
      refs.gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    simpleLightBox.refresh();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(error);
  }
}

function renderImages(images) {
  const markup = images.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `
      <a href="${largeImageURL}" class="gallery__link">
      <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" data-large=${largeImageURL} loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b class= "">Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b class= "">Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b class= "">Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b class= "">Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>
       `;
    }
  );

  const preparedMarkup = markup.join('');
  refs.gallery.insertAdjacentHTML('beforeend', preparedMarkup);
}
