const { default: slugify } = require("slugify");
const { Comment } = require("../models/Comment");
const {User} = require("../models/User")
const { Post, validatePost } = require("../models/Post");
const {Category} = require("../models/Category")
const asyncHandler = require("express-async-handler");

// GET ALL POSTS REQUEST
const getAllPosts = asyncHandler(async (req, res) => {
  const searchBy = req.query.searchBy || "";
  const sortBy = req.query.sortBy || "";
  const filterBy = req.query.filterBy || "";
  const authorId = req.query.authorId || "";
  const categoryId = req.query.categoryId || "";
  const limit = parseInt(req.query.limit) || 3;

  let searchQuery = { title: { $regex: searchBy, $options: "i" } };
  if (filterBy) {
    if (filterBy === "popular") {
      searchQuery.popular = true;
    }
  }
  // ADD FILTER BY AUTHOR
  if (authorId) {
    searchQuery.author = authorId;
  }
  // ADD FILTER BY CATEGORY
  if (categoryId) {
    searchQuery.categories = { $in: [categoryId] };
  }

  let sortQuery = { createdAt: -1 };
  if (sortBy) {
    if (sortBy === "title") {
      sortQuery = { title: 1 };
    } else if (sortBy === "title desc") {
      sortQuery = { title: -1 };
    } else if (sortBy === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sortBy === "views") {
      sortQuery = { views: -1 };
    } else if (sortBy === "likes") {
      sortQuery = { likes: -1 };
    }
  }

  const totalPosts = await Post.countDocuments(searchQuery);
  const allPosts = await Post.countDocuments();

  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const lastMonthPosts = await Post.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  // Calculate one week ago
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const lastWeekPosts = await Post.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  let posts = await Post.find(searchQuery)
    .sort(sortQuery)
    .limit(limit)
    // POPULATING AUTHOR FIELD WITH USERNAME
    .populate("author", "_id slug username profile")
    .populate("categories", "_id slug name");

  // Populate comments count for each post
  posts = await Promise.all(
    posts.map(async (post) => {
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      return { ...post.toObject(), commentsCount };
    })
  );

  res.status(200).send({
    posts,
    totalPosts,
    allPosts,
    lastWeekPosts,
    lastMonthPosts,
  });
});

// Function to get total likes and views
const getTotalLikesAndViews = async (req, res) => {
  try {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastMonthResult = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: null,
          lastMonthLikes: { $sum: "$likes" },
          lastMonthViews: { $sum: "$views" },
        },
      },
    ]);

    const lastWeekResult = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: null,
          lastWeekLikes: { $sum: "$likes" },
          lastWeekViews: { $sum: "$views" },
        },
      },
    ]);

    const result = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" },
          totalViews: { $sum: "$views" },
        },
      },
    ]);
 
    // Extracting total likes and views from results
    const { totalLikes, totalViews } = result[0];
    const { lastMonthLikes, lastMonthViews } = lastMonthResult[0];
    const { lastWeekLikes, lastWeekViews } = lastWeekResult[0];

    res.status(200).send({
      totalLikes,
      totalViews,
      lastWeekLikes,
      lastWeekViews,
      lastMonthLikes,
      lastMonthViews,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};

// GET SINGLE POST REQUEST
const getSinglePost = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const post = await Post.findOne({slug})
    .populate("author", "_id profile username slug")
    .populate("categories", "_id name slug");

  if (!post) return res.status(400).send({ message: "No post found!" });
  const commentsCount = await Comment.countDocuments({ postId: post._id });
  res.status(200).send({
    post,
    commentsCount,
  });
});

// CREATE REQUEST
const createPost = asyncHandler(async (req, res) => {
  const { title, author, categories } = req.body;

  const { error } = validatePost(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  // Generate slug based on title and author information
  const authorDoc = await User.findById(author); // Assuming you have a User model
  const authorName = authorDoc ? authorDoc.username : "unknown"; // Use 'unknown' if author is not found
  const titleSlug = slugify(title, { lower: true });
  const authorSlug = slugify(authorName, { lower: true });
  const slug = `${titleSlug}__${authorSlug}`;

  // DUPLICATE CHECK
  let post = await Post.findOne({ slug });
  if (post)
    return res
      .status(400)
      .send({ message: "Post with same Title & Author already exists!" });
    
  post = new Post({ ...req.body, slug });
  await post.save();

   // Increase noOfPosts in author collection
   await User.findByIdAndUpdate(author, { $inc: { noOfPosts: 1 } });

   // Increase noOfPosts in each category collection
   await Promise.all(
     categories.map(async (categoryId) => {
       await Category.findByIdAndUpdate(categoryId, { $inc: { noOfPosts: 1 } });
     })
   );

  res.status(200).send({ message: "Post created successfully!", post});
});

// UPDATE REQUEST
const updatePost = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { title, author, categories: newCategories } = req.body;

  const { error } = validatePost(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let post = await Post.findOne({ title, author, slug: { $ne: slug } });
  if (post)
    return res.status(400).send({
      message: "Could not update! Post with same author already exists!",
    });

  // Generate the new slug based on updated title and author
  const authorDoc = await User.findById(author);
  const authorName = authorDoc ? authorDoc.username : "unknown"; // Use 'unknown' if author is not found
  const titleSlug = slugify(title, { lower: true });
  const authorSlug = slugify(authorName, { lower: true });
  const newSlug = `${titleSlug}__${authorSlug}`;

  // Find the existing post
  post = await Post.findOne({ slug });
  if (!post) return res.status(400).send({ message: "Post not found!" });

  // Calculate the difference in categories
  const oldCategories = post.categories.map(String);
  const categoriesToAdd = newCategories.filter(cat => !oldCategories.includes(cat));
  const categoriesToRemove = oldCategories.filter(cat => !newCategories.includes(cat));

  // Update post with new slug and other fields
  post = await Post.findOneAndUpdate(
    { slug },
    { ...req.body, slug: newSlug },
    { new: true }
  );
  
  if (!post) return res.status(400).send({ message: "Post not found!" });

  // Update noOfPosts for added categories
  await Promise.all(
    categoriesToAdd.map(async categoryId => {
      await Category.findByIdAndUpdate(categoryId, { $inc: { noOfPosts: 1 } });
    })
  );

  // Update noOfPosts for removed categories
  await Promise.all(
    categoriesToRemove.map(async categoryId => {
      await Category.findByIdAndUpdate(categoryId, { $inc: { noOfPosts: -1 } });
    })
  );

  res.status(200).send({ message: "Post updated successfully!", post });
});

// DELETE REQUEST
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(400).send({ message: "Post not found!" });

  // ONLY OWNER & ADMIN ALLOWED
  if (req.user.id !== post.author.toString() && req.user.roles.indexOf("Admin") === -1) {
    return res
      .status(403)
      .send({ message: "You are not allowed to delete this post!" });
  }

  const {author, categories} = post;

  // Delete all comments associated with the post
  await Comment.deleteMany({ postId: id });

  // Delete the post itself
  await Post.findByIdAndDelete(id);

  // Decrease noOfPosts in User model for the author
  await User.findByIdAndUpdate(author, { $inc: { noOfPosts: -1 } });

  // Decrease noOfPosts in Category model for each category
  await Promise.all(
    categories.map(async (categoryId) => {
      await Category.findByIdAndUpdate(categoryId, { $inc: { noOfPosts: -1 } });
    })
  );

  res.status(200).send({ message: "Post deleted successfully!" });
});

const likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const userLikeIndex = post.likedBy.indexOf(req.user.id);
  if (userLikeIndex === -1) {
    post.likes += 1;
    post.likedBy.push(req.user.id);
    await post.save();
    res.status(200).send({ message: "You've appreciated this post! ❤️" });
  } else {
    post.likes -= 1;
    post.likedBy.splice(userLikeIndex, 1);
    await post.save();
    res
      .status(200)
      .send({ message: "Like removed! Your interaction matters! 🙌" });
  }
});

const viewPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.views += 1;
  if (post.views >= 50 && !post.popular) {
    post.popular = true;
  }
  await post.save();

  res.status(200).json({ message: "Post viewed successfully" });
});

const addSlugToPosts = async () => {
  try {
    // Fetch all posts
    const posts = await Post.find();

    // Iterate over posts and update them with slug
    for (const post of posts) {
      const authorDoc = await User.findById(post.author); // Assuming you have a User model
      const authorName = authorDoc ? authorDoc.username : "unknown"; // Use 'unknown' if author is not found
      const titleSlug = slugify(post.title, { lower: true });
      const authorSlug = slugify(authorName, { lower: true });
      const slug = `${titleSlug}__${authorSlug}`;

      // Update post with slug
      await Post.updateOne({ _id: post._id }, { $set: { slug } });
    }

    console.log("Slugs added to all posts successfully!");
  } catch (error) {
    console.error("Error adding slugs to posts:", error);
  }
};


module.exports = {
  createPost,
  getAllPosts,
  getTotalLikesAndViews,
  getSinglePost,
  updatePost,
  deletePost,
  likePost,
  viewPost,
};
