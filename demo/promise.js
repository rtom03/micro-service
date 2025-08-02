const posts = [
  { title: "Post One", body: "This is post One" },
  { title: "Post Two", body: "This is post Two" },
];

const getPosts = () => {
  setTimeout(() => {
    let output = "";
    posts.forEach((post) => {
      return (output += `<li>${post.title}</li>`);
    });
    document.body.innerHTML = output;
    console.log(output);
  }, 500);
};

const createPost = (post) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      posts.push(post);
      let error = false;

      if (!error) {
        resolve();
      }
      reject("Something went wrong");
    }, 2000);
  });
};

let post = { title: "Post Three", body: "This is post three" };

createPost(post)
  .then(getPosts)
  .catch((err) => {
    console.log(err);
  });
