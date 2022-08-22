const API = 'https://api.github.com/users/';

const requestMaxTimeMs = 3000;

const app = Vue.createApp({
  data() {
    return {
      search: null,
      result: null,
      error: null,
      favorites: new Map(),
    };
  },
  created() {
    const savedFavorites = JSON.parse(window.localStorage.getItem('favorites'));
    if (savedFavorites?.length) {
      const favorites = new Map(
        savedFavorites.map((favorite) => [favorite.login, favorite])
      );
      this.favorites = favorites;
    }
  },
  computed: {
    isFavorite() {
      return this.favorites.has(this.result.login);
    },
    allFavorites() {
      return Array.from(this.favorites.values());
    },
  },
  methods: {
    async doSearch() {
      const foundInFavorites = this.favorites.get(this.search);

      const shouldRequestAgain = (() => {
        if (!!foundInFavorites) {
          const { lastRequest } = foundInFavorites;
          return (
            new Date().getTime() - new Date(lastRequest).getTime() >
            requestMaxTimeMs
          );
        }
        return false;
      })(); // IIFE

      if (!!foundInFavorites && !shouldRequestAgain) {
        console.log('Found and we use the cached version');
        return (this.result = foundInFavorites);
      }

      await this.doRequest()
      if (foundInFavorites) foundInFavorites.lastRequest = new Date();
    },

    async doRequest() {
      try {
        console.log('Not found or cached version is too old');
        this.result = this.error = null;
        const response = await fetch(API + this.search);
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();
        this.result = data;
      } catch (error) {
        this.error = error;
      } finally {
        this.search = null;
      }
    },

    addFavorite() {
      this.result.lastRequest = new Date();
      this.favorites.set(this.result.login, this.result);
      this.updateStorage();
    },

    removeFavorite() {
      this.favorites.delete(this.result.login);
      this.updateStorage();
    },

    showFavorite(favorite) {
      this.result = favorite;
    },

    checkFavorite(id) {
      return this.result?.login === id
    },

    updateStorage() {
      window.localStorage.setItem(
        'favorites',
        JSON.stringify(this.allFavorites)
      );
    },
  },
});


