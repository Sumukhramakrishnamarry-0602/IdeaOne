const assert = require('assert');
const handler = require('../api/contact');

(async () => {
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  const req = {
    method: 'POST',
    body: {
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      interest: 'tech',
      message: 'Hello from the test suite'
    }
  };

  let statusCode = 0;
  let payload;
  const res = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
    end() {}
  };

  await handler(req, res);

  assert.strictEqual(statusCode, 200, 'expected a successful response when MongoDB is not configured');
  assert.strictEqual(payload.success, true, 'expected the handler to acknowledge the submission');

  if (originalUri === undefined) {
    delete process.env.MONGODB_URI;
  } else {
    process.env.MONGODB_URI = originalUri;
  }

  console.log('contact handler regression test passed');
})();
