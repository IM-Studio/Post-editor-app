 const app = Vue.createApp({
  el: '#app',
  data() {
    return {
      posts: [],
      title: [],
      body: [],
      loading: false,
      submitting: false,
      editPostId: false,
      postLimit: 100,
      pageNumber: 1,
      requestURL: "",
      verifiedURL: "",
      noData: true,
      defaultApiUrl: "https://jsonplaceholder.typicode.com/posts"
    }
  },
    methods: {
    updateUrl(){
        if(document.getElementById("requestURL").value.length){

           let search_params = new URL(document.getElementById("requestURL").value).searchParams;

               if(search_params.has('_limit')) {
                 this.postLimit = parseInt(search_params.get('_limit'));
                  document.getElementById("postLimit").value = ""+search_params.get('_limit');
                }

                if(search_params.has('_page')) {
                  this.pageNumber = parseInt(search_params.get('_page'));
                  document.getElementById("pageNumber").value = ""+search_params.get('_page');
                 }
        }
    },

    fetchPosts(page) {
      let pageIndex = parseInt(page);

      this.updateUrl();

      if((parseInt(this.pageNumber) + pageIndex) > 0){
        this.requestURL = document.getElementById("requestURL").value;
        this.loading = true;

        axios.get(this.requestURL, {
          params: {
          _limit: this.postLimit,
          _page:   parseInt(this.pageNumber) + pageIndex
          }
        })
        .then((response) =>  {
          if(response.status === 200){

          if(response.data.length){
            this.posts = response.data;
          }
          else{
            this.posts = [{}];
            this.posts[0] = response.data;
          }

          this.verifiedURL = this.requestURL;
          this.noData = false;
          this.pageNumber = parseInt(this.pageNumber) + pageIndex;
          //  console.log("Limit: " + this.postLimit + " page " + this.pageNumber);
        }
        else { this.noData = true; }
    })
    .catch(() => {
        this.noData = true;   //  console.log("BAD URL");
      })
    .then(() => {this.loading = false});
    }
  },

  editPost(id, newTitle, newBody) {
      this.submitting = true;

      if(this.requestURL.indexOf("?") > -1){
        this.verifiedURL = this.requestURL.slice(0, this.requestURL.indexOf("?"));
        this.verifiedURL += "/"+id;
      }
      else if(this.posts.length > 1){
  //      console.log("Check length " + this.posts.length);
        this.verifiedURL += "/"+id;
      }

      axios.patch(this.verifiedURL, {
         title: newTitle,
         body: newBody
      })
        .then(response => {
        // console.log(response.data); 
        })
        .catch((error) => {
        //  console.log("error "); console.log(error);
        })
        .then(() => {
          this.editPostId = null;
          this.submitting = false;
        })
      },
  },
  mounted: function() {
    document.getElementById("requestURL").value = this.defaultApiUrl;
  },
  template:  `
  <div v-if='loading || submitting' id='loading'><i class="fa fa-spinner"></i> </div>

  <div id="searchbar">
    <input id='requestURL' v-on:keyup.enter='fetchPosts(0)' autofocus/>
    <button id='getPosts' @click='fetchPosts(0)'>  GET  </button>
  </div>

  <div id="controls">

    Limit: <input type='number' min='1' max='999' id='postLimit'  v-on:keyup.enter='fetchPosts(0)' v-model='postLimit'/> |

    Page: <i class="fa fa-chevron-left prev-page" @click='fetchPosts(-1)'></i>
      <input type='number' min='1' max='99' id='pageNumber' v-on:keyup.enter='fetchPosts(0)' v-model='pageNumber'/>
      <i class="fa fa-chevron-right next-page" @click='fetchPosts(1)'></i>

  </div>


  <div v-if='noData' id='noData'> <i class='fa fa-info-circle'></i> No data found.</div>
  <div v-else id='posts-container'>

  <div class='post' v-for='post in posts' @click='editPostId = post.id'>

      <div v-if='editPostId === post.id'>
        <button @click='editPost(post.id)'><i class="fa fa-save"></i></button>
        <div class='post-title'> <input class="new-title" v-on:keyup.enter='editPost(post.id, post.title, post.body)' v-model='post.title' /> </div>
        <div class='post-body'> <textarea rows='6' v-on:keyup.enter='editPost(post.id, post.title, post.body)' v-model='post.body' /> </div>
      </div>

      <div v-else>
        <button class='edit-icon' @click='editPostId = post.id'><i class="fa fa-pencil"></i></button>
        <div class='post-title'>  {{ post.title }} </div>
        <div class='post-body mob-hidden'>  {{ post.body }} </div>
      </div>

    </div>
   </div>`
});

const vm = app.mount('#app');
