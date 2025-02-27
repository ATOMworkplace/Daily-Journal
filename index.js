require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Serve static files from the "public" folder
app.use(express.static(__dirname + "/public"));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using connection string from .env
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose Schema and Model
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});
const BlogPost = mongoose.model("BlogPost", postSchema);

// Static content for about and contact pages
const aboutContent =
  "Our mission is to nurture creativity, encourage introspection, and foster meaningful connections through the power of words. Whether you're an aspiring writer seeking to pen your first entry or a seasoned blogger looking for a fresh audience, we invite you to be a part of our thriving community. Together, we can build a tapestry of thoughts and ideas, weaving a collective narrative that celebrates the beauty of the human experience. So, join us on this enriching journey, where your voice finds its home, and together, let's create a vibrant tapestry of shared wisdom and inspiration.";
const contactContent =
  "We love hearing from our community! If you have any questions, suggestions, or simply want to say hello, don't hesitate to reach out to us. We're here to listen and connect. Thank you for being a part of our journey. Your presence makes this daily journal and blog website a warm and inviting space for everyone. Let's keep the conversations flowing and the creativity thriving!";

// Routes
app.get("/", (req, res) => {
  BlogPost.find()
    .then((posts) => {
      res.render("home", { posts: posts });
    })
    .catch((err) => console.error(err));
});

app.get("/contact", (req, res) => {
  res.render("contact", { Contactcontent: contactContent, aboutcontent: aboutContent });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.get("/blogs", (req, res) => {
  BlogPost.find()
    .then((posts) => {
      res.render("blogs", { blogs: posts });
    })
    .catch((err) => console.error(err));
});

app.post("/compose", (req, res) => {
  const post = new BlogPost({
    title: req.body.Title_text,
    content: req.body.compose_text
  });
  post
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.error(err));
});

app.get("/blogs/:postId", (req, res) => {
  const requestedPostId = req.params.postId;
  BlogPost.findOne({ _id: requestedPostId })
    .then((post) => {
      if (post) {
        res.render("post", {
          Posttitle: post.title,
          PostContent: post.content
        });
      } else {
        res.status(404).send("Post not found.");
      }
    })
    .catch((err) => console.error(err));
});

app.post("/delete", (req, res) => {
  const postId = req.body.del_btn_1;
  BlogPost.findByIdAndRemove(postId)
    .then(() => res.redirect("/blogs"))
    .catch((err) => console.error(err));
});

// Start the server on the port defined in .env or default to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
