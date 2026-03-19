describe('createChannelApplication', () => {
  test.todo('creates channel doc with status pending_approval');
  test.todo('rejects if channel handle already taken');
  test.todo('accepts personal and institutional types');
});

describe('approveChannel', () => {
  test.todo('sets status to approved with approver uid and timestamp');
  test.todo('rejects callers with roleLevel < 2');
});

describe('subscribeChannel', () => {
  test.todo('creates subscriber doc and increments subscriberCount');
  test.todo('unsubscribe removes doc and decrements subscriberCount');
});
