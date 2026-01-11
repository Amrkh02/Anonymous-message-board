const mongoose = require("mongoose");
const Message = require("../models/message").Message;

exports.postThread = async (req, res, next) => {
  try {
    const board = req.params.board;

    await Message.create({
      board,
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    });

    return res.redirect(`/b/${board}`);
  } catch (err) {
    return res.json("error");
  }
};

exports.getThread = async (req, res) => {
  try {
    const board = req.params.board;
    const threads = await Message.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean()
      .exec();

    if (!threads) return res.json("error");

    const sanitized = threads.map(t => {
      const sortedReplies = (t.replies || [])
        .slice()
        .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
        .slice(0, 3)
        .map(r => ({ _id: r._id, text: r.text, created_on: r.created_on }));

      return {
        _id: t._id,
        board: t.board,
        text: t.text,
        created_on: t.created_on,
        bumped_on: t.bumped_on,
        replycount: t.replies ? t.replies.length : 0,
        replies: sortedReplies
      };
    });

    return res.json(sanitized);
  } catch (err) {
    return res.json("error");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const deletedThread = await Message.findById(req.body.thread_id);
    if (!deletedThread) return res.json("error");

    if (req.body.delete_password === deletedThread.delete_password) {
      await deletedThread.delete();
      return res.send("success");
    }

    return res.send("incorrect password");
  } catch (err) {
    return res.json("error");
  }
};

exports.putThread = async (req, res) => {
  try {
    const updateThread = await Message.findById(req.body.thread_id);
    if (!updateThread) return res.json("error");

    updateThread.reported = true;
    await updateThread.save();
    return res.send("success");
  } catch (err) {
    return res.json("error");
  }
};
