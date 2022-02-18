const API = "https://api.github.com/users/";

async function doSearch() {
  const response = await fetch(API + 'juanwmedia')
  const data = await response.json()
  console.log(data)
}

const app = Vue.createApp({
  data() {
    return {
      message: "Hello Vue!",
    };
  },
});

