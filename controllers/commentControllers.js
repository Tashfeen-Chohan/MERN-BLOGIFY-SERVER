const { Comment, validateComment } = require("../models/Comment");
const asyncHandler = require("express-async-handler");

// GET ALL COMMENTS
const getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find();
  res.status(200).send(comments);
});

// GET POST COMMENTS
const getPostComments = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || ""
  const limit = parseInt(req.query.limit) || 3

  let sortQuery = {createdAt : -1}
  if (sortBy){
    if (sortBy === "oldest"){
      sortQuery = {createdAt: 1}
    } else if (sortBy === "top"){
      sortQuery = {likes: -1}
    }
  }

  const comments = await Comment.find({ postId: req.params.postId })
    .sort(sortQuery)
    .limit(limit)
    // POPULATING USERID FIELD WITH ID, USERNAME, PROFILE
    .populate("userId", "_id username profile");

  const totalComments = await Comment.countDocuments({postId: req.params.postId});
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
    res.status(200).send({ message:  "You've appreciated this comment! ❤️" });
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

  // if (comment.userId !== req.user.id) {
  //   return res
  //     .status(403)
  //     .send({ message: "You are not allowed to edit this comment!" });
  // }

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

  // ONLY OWNER & ADMIN ALLOWED
  if (
    comment.userId !== req.user.id &&
    req.user.roles.indexOf("Admin") === -1
  ) {
    return res
      .status(403)
      .send({ message: "You are not allowed to delete this comment" });
  }

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
