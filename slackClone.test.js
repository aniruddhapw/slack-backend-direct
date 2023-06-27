import chai from "chai";
import chaiHttp from "chai-http";
import app from "./server.js"; // Update the path accordingly
import Conversation from "./models/Conversation.js";
import mongoose from "mongoose";
chai.use(chaiHttp);
const expect = chai.expect;

describe("Slack Clone API", () => {
  // Test the root endpoint
  describe("GET /", () => {
    it('should return "hello guyssss"', (done) => {
      chai
        .request(app)
        .get("/")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal("hello guyssss");
          done();
        });
    });
  });

  // Test the /get/userList endpoint
  describe("GET /get/userList", () => {
    it("should return a list of users", async () => {
      const res = await chai.request(app).get("/get/userList");

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    }).timeout(5000);
  });

  // Test the /conversations/:id endpoint
  describe("DELETE /conversations/:id", () => {
    it("should delete a conversation", (done) => {
      // Create a new conversation and get its ID
      const newConversation = new Conversation({
        name: "Test Conversation",
        members: [],
        conversationType: "group",
        messages: [],
      });
      newConversation.save().then((conversation) => {
        chai
          .request(app)
          .delete(`/conversations/${conversation._id}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property(
              "message",
              "Conversation deleted successfully"
            );
            done();
          });
      });
    }).timeout(5000);

    it("should return an error if conversation not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await chai
        .request(app)
        .delete(`/conversations/${nonExistentId}`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Conversation not found");
    });
  });
});
