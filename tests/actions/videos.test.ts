describe('createVideo', () => {
  test.todo('creates video doc with status pending_review');
  test.todo('rejects if title is empty');
  test.todo('rejects invalid category');
  test.todo('sets searchKeywords from title, description, tags');
  test.todo('sets all uploader denormalized fields from profile');
});

describe('updateVideoStatus', () => {
  test.todo('rejects callers with roleLevel < 2');
  test.todo('sets status to published on approve');
  test.todo('sets status to rejected with reason');
  test.todo('sets status to changes_requested with moderator note');
  test.todo('writes moderation notification to uploader');
});

describe('likeVideo', () => {
  test.todo('creates like subcollection doc and increments likeCount');
  test.todo('removes like and decrements likeCount on toggle');
});

describe('incrementViewCount', () => {
  test.todo('increments viewCount by 1 using FieldValue.increment');
});
