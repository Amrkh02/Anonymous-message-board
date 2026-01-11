const mongoose = require("mongoose");
const Message = require("../models/message").Message;

exports.postReply = async (req, res, next) => {
  try {
    const board = req.params.board;
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.json("error");

    thread.bumped_on = new Date();
    thread.replies.push({
      text: req.body.text,
      created_on: new Date(),
      delete_password: req.body.delete_password,
      reported: false
    });

    await thread.save();
    return res.redirect(`/b/${board}/${req.body.thread_id}`);
  } catch (err) {
    return res.json("error");
  }
};

exports.getReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.query.thread_id);
    if (!thread) return res.json("error");

    // remove sensitive fields
    const threadObj = thread.toObject();
    threadObj.delete_password = undefined;
    threadObj.reported = undefined;
    threadObj.replycount = threadObj.replies ? threadObj.replies.length : 0;

    if (threadObj.replies && threadObj.replies.length) {
      threadObj.replies = threadObj.replies.map(r => ({
        _id: r._id,
        text: r.text,
        created_on: r.created_on
      }));
    }

    return res.json(threadObj);
  } catch (err) {
    return res.json("error");
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.json("error");

    const reply = thread.replies.id(req.body.reply_id);
    if (!reply) return res.json("error");

    if (reply.delete_password === req.body.delete_password) {
      reply.text = "[deleted]";
      await thread.save();
      return res.send("success");
    }

    return res.send("incorrect password");
  } catch (err) {
    return res.json("error");
  }
};

exports.putReply = async (req, res) => {
  try {
    const thread = await Message.findById(req.body.thread_id);
    if (!thread) return res.json("error");

    const reply = thread.replies.id(req.body.reply_id);
    if (!reply) return res.json("error");

    reply.reported = true;
    await thread.save();
    return res.send("success");
  } catch (err) {
    return res.json("error");
  }
};
