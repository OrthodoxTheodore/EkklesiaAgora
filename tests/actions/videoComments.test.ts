describe('createVideoComment', () => {
  test.todo('creates comment in videos/{id}/comments subcollection');
  test.todo('increments commentCount on video doc');
  test.todo('rejects empty comment text');
});

describe('deleteVideoComment', () => {
  test.todo('deletes comment and decrements commentCount');
  test.todo('rejects if caller is not comment author');
});
