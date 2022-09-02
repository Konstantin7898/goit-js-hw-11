import axios from 'axios';
// import Notiflix from 'notiflix';

class ImageFinder {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchImg() {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '29655105-0ec8c7c50c5a5672170fa9f4c';

    try {
      const res = await axios.get(
        `${BASE_URL}/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40`
      );
      return res.data;
    } catch (error) {
      Notiflix.Notify.failure('Some error occured');

      return null;
    }
  }

  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

export default ImageFinder;
