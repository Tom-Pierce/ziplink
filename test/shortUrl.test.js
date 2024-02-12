const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const ShortUrl = require("../models/shortUrl");
const User = require("../models/user");

chai.use(chaiHttp);
const expect = chai.expect;

describe("short url tests", async () => {
  let urlKey;
  let cookies;
  before(async () => {
    // clear database from previous tests
    await ShortUrl.deleteMany({}).exec();
    await User.deleteMany({}).exec();

    const res = await chai.request(app).post("/api/auth/local/signup").send({
      email: "example@gmail.com",
      password: "ThisIsAValidPassword123",
      confirmPassword: "ThisIsAValidPassword123",
    });
    cookies = res.header["set-cookie"];
  });

  it("should not accept an invalid URL", async () => {
    const res = await chai
      .request(app)
      .post("/api/url")
      .send({ url: "thisIsNotAValidURL" });

    expect(res).to.have.status(400);
    expect(res.body.errors[0].msg).to.equal(
      "Please provide a valid URL to shorten"
    );
  });

  it("should return a key when a valid url is sent", async () => {
    const res = await chai
      .request(app)
      .post("/api/url")
      .send({ url: "https://twitch.tv" })
      .set("Cookie", cookies);

    expect(res).to.have.status(201);
    expect(res.body.key).to.match(new RegExp("^[0-9a-zA-Z]{8}$"));
    urlKey = res.body.key;
  });

  it("should return 404 if an invalid key is sent", async () => {
    const res = await chai
      .request(app)
      .get(`/api/12345678`)
      .set("Cookie", cookies);
    expect(res).to.have.status(404);
  });

  it("should return the original URL", async () => {
    const res = await chai
      .request(app)
      .get(`/api/${urlKey}`)
      .set("Cookie", cookies);
    expect(res).to.have.status(200);
    expect(res.body.url).to.equal("https://twitch.tv");
  });

  it("should return the number of clicks a URL has gotten", async () => {
    const res = await chai
      .request(app)
      .get(`/api/clicks/${urlKey}`)
      .set("Cookie", cookies);
    expect(res).to.have.status(200);
    expect(res.body.clicks).to.equal(1);

    // simulate a second click to check it is updating
    await chai.request(app).get(`/api/${urlKey}`);
    const res2 = await chai
      .request(app)
      .get(`/api/clicks/${urlKey}`)
      .set("Cookie", cookies);
    expect(res2).to.have.status(200);
    expect(res2.body.clicks).to.equal(2);
  });

  it("should return 404 if an invalid key is sent with clicks", async () => {
    const res = await chai
      .request(app)
      .get(`/api/clicks/12345678`)
      .set("Cookie", cookies);
    expect(res).to.have.status(404);
  });

  it("should return the custom url key when sent", async () => {
    const res = await chai
      .request(app)
      .post("/api/url")
      .send({ url: "https://twitch.tv", customKey: "thisIsACustomURL" })
      .set("Cookie", cookies);
    expect(res).to.have.status(201);
    expect(res.body.key).to.equal("thisIsACustomURL");
  });

  it("should respond with 409 if the same custom url key is used twice", async () => {
    const res = await chai
      .request(app)
      .post("/api/url")
      .send({ url: "https://twitch.tv", customKey: "thisIsACustomURL" })
      .set("Cookie", cookies);
    expect(res).to.have.status(409);
    expect(res.body.msg).to.equal("Custom URL already in use by another user");
  });

  it("should return the users ziplinks", async () => {
    const res = await chai
      .request(app)
      .get("/api/user/ziplinks")
      .set("Cookie", cookies);
    expect(res.body.zipLinks).to.be.an("array").of.length(2);
    res.body.zipLinks.forEach((zipLink) => {
      expect(zipLink).to.haveOwnProperty("key");
      expect(zipLink).to.haveOwnProperty("url");
      expect(zipLink).to.haveOwnProperty("visits");
      expect(zipLink).to.haveOwnProperty("lastVisit");
    });
  });
});
