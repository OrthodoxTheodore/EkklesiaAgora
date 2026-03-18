// Stubs for AGRA-01, AGRA-09, CAT-01
describe('Post Server Actions', () => {
  test.todo('createPost creates a post document in Firestore');
  test.todo('createPost fans out to follower userFeed subcollections');
  test.todo('createPost validates category is one of ORTHODOX_CATEGORIES');
  test.todo('deletePost removes post and all subcollection data');
  test.todo('editPost updates text and marks isEdited true');
  test.todo('createPost builds searchKeywords from lowercased text tokens');
});
