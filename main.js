const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Blog = require('./public/js/blog');
const User = require('./public/js/user');
const app = express();
const PORT = 5050;

mongoose.connect('mongodb://localhost:27017/blogs');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.get("/", async (req, res) => {
  try {
    const { catId, search, page = 1 } = req.query;
    const blogsPerPage = 3;

    let filter = {};
    if (catId) {
      filter.category = catId;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const totalBlogs = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .skip((page - 1) * blogsPerPage)
      .limit(blogsPerPage);

    const totalPages = Math.ceil(totalBlogs / blogsPerPage);

    res.render("index", { blogs, totalPages, currentPage: page, search, catId });
  } catch (err) {
    res.status(500).send("Ошибка при загрузке блогов");
  }
});

app.get("/myblogs", async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { title: new RegExp(search, 'i') } : {};
    const blogs = await Blog.find(query);
    res.render("myblogs", { blogs, search });
  } catch (err) {
    res.status(500).send("Ошибка при загрузке блогов");
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    await Blog.findByIdAndDelete(blogId);
    res.redirect("/myblogs");
  } catch (err) {
    res.status(500).send("Ошибка при удалении блога");
  }
});

app.get("/auth", (req, res) => {
  res.render("authorization", { search: '' });
});

app.get("/reg", (req, res) => {
  res.render("registration", { search: '' });
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.send('success');
    } else {
      res.send('Неправильный email или пароль');
    }
  } catch (err) {
    res.status(500).send('Ошибка при авторизации');
  }
});

app.post("/reg", async (req, res) => {
  const { email, fullName, password, confirmPassword } = req.body;
  if (password === confirmPassword) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.send('Пользователь с таким email уже существует');
        return;
      }
      const newUser = new User({ email, fullName, password });
      await newUser.save();
      res.send('success');
    } catch (err) {
      res.status(400).send('Ошибка при регистрации');
    }
  } else {
    res.send("Пароли не совпадают");
  }
});

app.get("/post", (req, res) => {
  res.render("post");
});

app.get("/post_auth", (req, res) => {
  res.render("post_auth");
});

app.get("/new", (req, res) => {
  const search = req.query.search || '';
  res.render("new_post", { search });
});

app.post("/new", upload.single('image'), async (req, res) => {
  const { title, description, category, imageType, imageUrl } = req.body;

  let image;
  if (imageType === 'file') {
    if (req.file) {
      image = `/img/${req.file.filename}`;
    } else {
      return res.status(400).send('Файл изображения не выбран');
    }
  } else if (imageType === 'url') {
    image = imageUrl;
  } else {
    return res.status(400).send('Не выбран тип изображения');
  }

  const newBlog = new Blog({ title, description, category, image });
  try {
    await newBlog.save();
    res.redirect('/myblogs');
  } catch (err) {
    res.status(400).send('Не удалось сохранить блог в базе данных');
  }
});


app.get("/edit/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const search = req.query.search || '';
    res.render("edit_post", { blog, search });
  } catch (err) {
    res.status(500).send("Ошибка при загрузке формы редактирования");
  }
});

app.post("/edit/:id", upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const blog = await Blog.findById(req.params.id);

    blog.title = title;
    blog.description = description;
    blog.category = category;

    if (req.file) {
      blog.image = `/img/${req.file.filename}`;
    }

    await blog.save();
    res.redirect('/myblogs');
  } catch (err) {
    res.status(400).send('Ошибка при сохранении изменений');
  }
});

app.get("/blog-details/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const search = req.query.search || '';
    if (!blog) {
      return res.status(404).send("Блог не найден");
    }
    res.render("blog_details", { blog, search });
  } catch (err) {
    res.status(500).send("Ошибка при загрузке блога");
  }
});


app.get("/post/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const search = req.query.search || '';
    if (!blog) {
      return res.status(404).send("Блог не найден");
    }
    res.render("blog_details", { blog, search });
  } catch (err) {
    res.status(500).send("Ошибка при загрузке блога");
  }
});

app.listen(PORT, () => {
  console.log(`Listen ${PORT}`);
});
