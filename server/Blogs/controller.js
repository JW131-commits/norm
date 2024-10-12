const Blog = require("./blog");
const fs = require("fs");
const path = require("path");

const createBlog = async (req, res) => {
  const { title, description, category, date, imageUrl } = req.body;
  let imagePath = '';

  if (req.file) {
    imagePath = `/image/Blogs/${req.file.filename}`;
  } else if (imageUrl) {
    imagePath = imageUrl;
  }

  if (
    title.length > 2 &&
    description.length > 2 &&
    category.length > 2 &&
    (req.file || imageUrl)
  ) {
    await new Blog({
      title,
      category,
      description,
      date,
      Image: imagePath,
      user: req.user._id,
    }).save();
    res.redirect(`/myblogs/${req.user._id}`);
  } else {
    res.redirect("/new?error=1");
  }
};

const editBlog = async (req, res) => {
  const { id, title, description, category, date, imageUrl } = req.body;
  const blog = await Blog.findById(id);

  let imagePath = '';
  if (req.file) {
    imagePath = `/image/Blogs/${req.file.filename}`;
    fs.unlinkSync(path.join(__dirname, "../../../public" + blog.Image));
  } else if (imageUrl) {
    imagePath = imageUrl;
  } else {
    imagePath = blog.Image;
  }

  if (
    title.length > 2 &&
    description.length > 2 &&
    category.length > 2
  ) {
    await Blog.findByIdAndUpdate(id, {
      title,
      category,
      description,
      date,
      Image: imagePath,
      user: req.user._id,
    });
    res.redirect(`/myblogs/${req.user._id}`);
  } else {
    res.redirect(`/edit/${id}?error=1`);
  }
};

const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    if (blog.Image.startsWith('/image/Blogs/')) {
      fs.unlinkSync(path.join(__dirname, "../../../public" + blog.Image));
    }
    await Blog.deleteOne({ _id: req.params.id });
    res.status(200).send("ok");
  } else {
    res.status(404).send("Not Found");
  }
};

module.exports = {
  createBlog,
  editBlog,
  deleteBlog,
};
