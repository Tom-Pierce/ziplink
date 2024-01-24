const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

const ShortUrl = require("../models/shortUrl");

chai.use(chaiHttp);
const expect = chai.expect;

describe("short url tests", () => {
  let urlKey;
  before(async () => {
    // clear database from previous tests
    await ShortUrl.deleteMany({}).exec();
  });
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
    .send({ url: "https://twitch.tv" });

  expect(res).to.have.status(201);
  expect(res.body.key).to.match(new RegExp("^[0-9a-zA-Z]{8}$"));
  urlKey = res.body.key;
});

it("should return the original URL", async () => {
  const res = await chai.request(app).get(`/api/${urlKey}`);
  expect(res).to.have.status(200);
  expect(res.body.url).to.equal("https://twitch.tv");
});
