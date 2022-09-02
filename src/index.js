import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import ImageFinder from './imgFinder.js';
import Notiflix from 'notiflix';

const refs = {
  searchFormEl: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

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

  imageFinder.searchQuery = searchValue;
  const data = await imageFinder.fetchImg();
  if (!data) return;

  console.log({ data });

  // if la la la
  renderImages(data.hits);
  // const { totalHits, hits, total } = await fetchImg(searchQuery);
  // e.target.reset();
}

function onScrollLoad() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (clientHeight + scrollTop >= scrollHeight) {
    toGetImages();
  }
}

function toGetImages() {
  imageFinder
    .fetchImg()
    .then(({ total, totalHits, hits }) => {
      if (hits.length === 0 && totalHits === 0 && total === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        insertMarkup(hits);

        if (imageFinder.page === 1) {
          if (!isEventListenerOnScroll) {
            window.addEventListener('scroll', onScrollLoad);
            isEventListenerOnScroll = true;
          }

          Notiflix.Notify.success(`Horray! We found ${totalHits} images`);
        } else {
          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
          });
        }

        if (total === totalHits) {
          Notiflix.Notify.info(
            `We're sorry, but you've reached the end of search results.`
          );
          window.removeEventListener('scroll', onScrollLoad);
          isEventListenerOnScroll = false;
        }
        refs.searchFormEl.incrementPage();
        simpleLightBox.refresh();
      }
    })
    .catch(() => {
      Notiflix.Notify.failure('Oops, something went wrong');
    })
    .finally(() => {
      refs.searchFormEl.reset();
    });
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
      <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" data-large=${largeImageURL} loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
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
