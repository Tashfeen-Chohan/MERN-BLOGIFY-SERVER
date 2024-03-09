const { Comment, validateComment } = require("../models/Comment");
const asyncHandler = require("express-async-handler");

// GET ALL COMMENTS
const getAllComments = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || ""
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10;

  // SORTING
  let sortQuery = {createdAt: -1}
  if (sortBy){
    if (sortBy === "oldest"){
      sortQuery = {createdAt: 1}
    } else if (sortBy === "likes"){
      sortQuery = {likes: -1}
    }
  }

  const now = new Date()
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  )
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const lastMonth = await Comment.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });
  const lastWeek = await Comment.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  // PAGINATION
  const totalComments = await Comment.countDocuments();
  const totalPages = Math.ceil(totalComments / limit);
  const skip = (page - 1) * limit;
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  const comments = await Comment.find()
  .sort(sortQuery)
  .skip(skip)
  .limit(limit)
  .populate("userId", "username")
  .populate("postId", "_id slug title");

  res.status(200).send({ 
    comments, 
    totalComments,
    lastMonth,
    lastWeek,
    totalPages,
    page,
    limit,
    nextPage,
    prevPage 
  });
});

// GET POST COMMENTS
const getPostComments = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || "";
  const limit = parseInt(req.query.limit) || 3;

  let sortQuery = { createdAt: -1 };
  if (sortBy) {
    if (sortBy === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sortBy === "top") {
      sortQuery = { likes: -1 };
    }
  }

  const comments = await Comment.find({ postId: req.params.postId })
    .sort(sortQuery)
    .limit(limit)
    // POPULATING USER FIELD WITH ID, USERNAME, PROFILE
    .populate("userId", "_id username profile")
    .populate("postId", "author");

  const totalComments = await Comment.countDocuments({
    postId: req.params.postId,
  });
  res.status(200).send({
    comments,
    totalComments,
  });
});

// CREATE COMMENT
const createComment = asyncHandler(async (req, res) => {
  const { error } = validateComment(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const comment = new Comment(req.body);
  await comment.save();
  res.status(200).send({ message: "Comment published successfully!" });
});

// LIKE COMMENT
const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(400).send({ message: "Comment not found!" });

  const userLikeIndex = comment.likedBy.indexOf(req.user.id);
  if (userLikeIndex === -1) {
    comment.likes += 1;
    comment.likedBy.push(req.user.id);
    await comment.save();
    res.status(200).send({ message: "You've appreciated this comment! ❤️" });
  } else {
    comment.likes -= 1;
    comment.likedBy.splice(userLikeIndex, 1);
    await comment.save();
    res.status(200).send({ message: "Like removed from the comment!" });
  }
});

// EDIT COMMENT
const editComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(200).send({ message: "Comment not found!" });

  if (comment.userId.toString() !== req.user.id) {
    return res
      .status(403)
      .send({ message: "You are not allowed to edit this comment!" });
  }

  comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { content: req.body.content },
    { new: true }
  );

  res.status(200).send({ message: "Comment edited successfully!" });
});

// DELETE COMMENT
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(400).send({ message: "Comment not found!" });

  // ONLY OWNER , POST PUBLISHER && ADMIN ALLOWED
  // if (
  //   comment.userId.toString() !== req.user.id &&
  //   comment.postId.author.toString() !== req.user.id &&
  //   req.user.roles.indexOf("Admin") === -1
  // ) {
  //   return res
  //     .status(403)
  //     .send({ message: "You are not allowed to delete this comment" });
  // }

  await Comment.findByIdAndDelete(req.params.commentId);
  res.status(200).send({ message: "Comment deleted successfully!" });
});

module.exports = {
  getAllComments,
  getPostComments,
  createComment,
  likeComment,
  editComment,
  deleteComment,
};
