const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const ShortUrl = require("../models/shortUrl");
const User = require("../models/user");

chai.use(chaiHttp);
const expect = chai.expect;

describe("auth tests", () => {
  let cookies;
  before(async () => {
    // clear database from previous tests
    await ShortUrl.deleteMany({}).exec();
    await User.deleteMany({}).exec();
  });

  it("should respond with 404 and errors if user email or password do not fit requirements", async () => {
    const res = await chai.request(app).post("/api/auth/local/signup").send({
      email: "thisisnotavalidemail",
      password: "pwd",
      confirmPassword: "notTheSamePwd",
    });
    expect(res).to.have.status(400);
    expect(res.body).to.be.an("array").of.length(5);
    expect(res.body[0]).to.equal("Please provide a valid email");
    expect(res.body[1]).to.equal("Password must be at least 8 characters long");
    expect(res.body[2]).to.equal("Password must contain an uppercase letter");
    expect(res.body[3]).to.equal("Password must contain a number");
    expect(res.body[4]).to.equal("Passwords don't match");
  });

  it("should create a user and respond with 201", async () => {
    const res = await chai.request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAValidPassword123",
      confirmPassword: "ThisIsAValidPassword123",
    });
    expect(res.status).to.equal(201);
    const user = await User.findOne({ email: "example@gmail.com" });
    expect(user).to.be.an("object");
    expect(user.email).to.equal("example@gmail.com");
  });

  it("should respond with 400 if email is already in use", async () => {
    const res = await chai.request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAValidPassword123",
      confirmPassword: "ThisIsAValidPassword123",
    });

    expect(res.status).to.equal(400);
    expect(res.body[0]).to.equal("Email is already in use");
  });

  it("should respond with 200 and send `connect-sid` cookie", async () => {
    const res = await chai.request(app).post("/api/auth/local/login").send({
      email: "example@gmail.com",
      password: "ThisIsAValidPassword123",
    });
    expect(res.status).to.equal(200);
    expect(res.header["set-cookie"][0]).to.be.a("string");

    // save cookies for later user
    cookies = res.header["set-cookie"];
  });

  it("should respond with 401 if the login email is incorrect", async () => {
    const res = await chai.request(app).post("/api/auth/local/login").send({
      email: "incorrect@gmail.com",
      password: "ThisIsAValidPassword123",
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal(
      "No account found with that email address"
    );
  });

  it("should respond with 401 if the login password is incorrect", async () => {
    const res = await chai.request(app).post("/api/auth/local/login").send({
      email: "example@gmail.com",
      password: "IncorrectPassword",
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Email or password incorrect");
  });

  it("should return true if cookies are sent", async () => {
    const res = await chai
      .request(app)
      .get("/api/auth/isAuthenticated")
      .set("Cookie", cookies);
    expect(res.body.authenticated).to.equal(true);
  });

  it("should return false if cookies are not sent", async () => {
    const res = await chai.request(app).get("/api/auth/isAuthenticated");
    expect(res.body.authenticated).to.equal(false);
  });

  it("should return user info", async () => {
    const res = await chai
      .request(app)
      .get("/api/auth/userInfo")
      .set("Cookie", cookies);

    expect(res.body.success).to.equal(true);
    expect(res.body.user).to.be.an("object");
    expect(res.body.user.email).to.equal("example@gmail.com");
    expect(res.body.user.accountType).to.equal("local");
  });

  it("should should expire the `connect-sid` cookie if the user logs out", async () => {
    const logoutRes = await chai
      .request(app)
      .get("/api/auth/logout")
      .set("Cookie", cookies);

    expect(logoutRes.status).to.equal(200);

    const loggedOutRes = await chai
      .request(app)
      .get("/api/auth/isAuthenticated")
      .set("Cookie", cookies);
    expect(loggedOutRes.body.authenticated).to.equal(false);
  });
});
