import chai from "chai";
import request from "supertest";
import app from "./server.js";
import User from "./models/User.js";

const expect = chai.expect;

describe("User Registration", () => {
  it("should register a new user", async () => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      id: "1234567890",
      userImage: "user.jpg",
    };

    const res = await request(app).post("/new/user").send(newUser).expect(201);

    expect(res.body).to.have.property("username", newUser.username);
    expect(res.body).to.have.property("email", newUser.email);
    expect(res.body).to.have.property("id", newUser.id);
    expect(res.body).to.have.property("userImage", newUser.userImage);
  }).timeout(10000);

  it("should return existing user if email already exists", async () => {
    const existingUser = {
      username: "existinguser",
      email: "existinguser@example.com",
      id: "9876543210",
      userImage: "existing-user.jpg",
    };

    await User.create(existingUser);

    const res = await request(app)
      .post("/new/user")
      .send(existingUser)
      .expect(200);

    expect(res.body).to.have.property("username", existingUser.username);
    expect(res.body).to.have.property("email", existingUser.email);
    expect(res.body).to.have.property("id", existingUser.id);
    expect(res.body).to.have.property("userImage", existingUser.userImage);
  }).timeout(10000);
});
