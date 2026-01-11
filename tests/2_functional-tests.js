const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId = "";
let testThreadId2 = "";
let testReplyId = "";

suite("Functional Tests", function() {
  suite("Thread test", () => {
    test("Creating 2 new thread", async () => {
      const res1 = await chai
        .request(server)
        .post("/api/threads/test4")
        .send({
          board: "test4",
          test: "testText",
          delete_password: "valid password"
        });
      assert.equal(res1.status, 200);

      const res2 = await chai
        .request(server)
        .post("/api/threads/test4")
        .send({
          board: "test4",
          test: "testText",
          delete_password: "valid password"
        });
      assert.equal(res2.status, 200);
    });

    test("Viewing the 10 most recent threads with 3 replies each", async () => {
      const res = await chai.request(server).get("/api/threads/test4");
      assert.equal(res.status, 200);
      assert.isBelow(res.body.length, 11);
      assert.isBelow(res.body[0].replies.length, 4);
      assert.isArray(res.body);
      testThreadId = String(res.body[0]._id);
      testThreadId2 = String(res.body[1]._id);
    });

    test("Deleting a thread with the incorrect password", async () => {
      const res = await chai
        .request(server)
        .delete("/api/threads/test4")
        .send({
          delete_password: "invalid password",
          thread_id: testThreadId
        });
      assert.equal(res.status, 200);
      assert.equal(res.text, "incorrect password");
    });

    test("Deleting a thread with the correct password", async () => {
      const res = await chai
        .request(server)
        .delete("/api/threads/test4")
        .send({
          delete_password: "valid password",
          thread_id: testThreadId2
        });
      assert.equal(res.status, 200);
      assert.equal(res.text, "success");
    });

    test("Reporting a thread", async () => {
      const res = await chai
        .request(server)
        .put("/api/threads/test4")
        .send({ thread_id: testThreadId });
      assert.equal(res.status, 200);
      assert.equal(res.text, "success");
    });
  });

  suite("Reply test", () => {
    test("Creating a new reply", async () => {
      const res = await chai
        .request(server)
        .post("/api/replies/test4")
        .send({
          thread_id: testThreadId,
          text: "test text",
          delete_password: "valid password"
        });
      assert.equal(res.status, 200);
    });

    test("Viewing a single thread with all replies", async () => {
      const res = await chai
        .request(server)
        .get("/api/replies/test4")
        .query({ thread_id: testThreadId });
      assert.equal(res.status, 200);
      assert.isArray(res.body.replies);
      testReplyId = res.body.replies[0]._id;
    });

    test("Reporting a reply", async () => {
      const res = await chai
        .request(server)
        .put("/api/replies/test4")
        .send({ thread_id: testThreadId, reply_id: testReplyId });
      assert.equal(res.status, 200);
      assert.equal(res.text, "success");
    });

    test("Deleting a reply with the incorrect password", async () => {
      const res = await chai
        .request(server)
        .delete("/api/replies/test4")
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: "invalid password"
        });
      assert.equal(res.status, 200);
      assert.equal(res.text, "incorrect password");
    });

    test("Deleting a reply with the correct password", async () => {
      const res = await chai
        .request(server)
        .delete("/api/replies/test4")
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: "valid password"
        });
      assert.equal(res.status, 200);
      assert.equal(res.text, "success");
    });
  });
});
