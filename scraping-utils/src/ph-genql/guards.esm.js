
var Query_possibleTypes = ['Query']
export var isQuery = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isQuery"')
  return Query_possibleTypes.includes(obj.__typename)
}



var Collection_possibleTypes = ['Collection']
export var isCollection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isCollection"')
  return Collection_possibleTypes.includes(obj.__typename)
}



var TopicableInterface_possibleTypes = ['Collection','Post']
export var isTopicableInterface = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isTopicableInterface"')
  return TopicableInterface_possibleTypes.includes(obj.__typename)
}



var TopicConnection_possibleTypes = ['TopicConnection']
export var isTopicConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isTopicConnection"')
  return TopicConnection_possibleTypes.includes(obj.__typename)
}



var PageInfo_possibleTypes = ['PageInfo']
export var isPageInfo = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isPageInfo"')
  return PageInfo_possibleTypes.includes(obj.__typename)
}



var TopicEdge_possibleTypes = ['TopicEdge']
export var isTopicEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isTopicEdge"')
  return TopicEdge_possibleTypes.includes(obj.__typename)
}



var Topic_possibleTypes = ['Topic']
export var isTopic = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isTopic"')
  return Topic_possibleTypes.includes(obj.__typename)
}



var PostConnection_possibleTypes = ['PostConnection']
export var isPostConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isPostConnection"')
  return PostConnection_possibleTypes.includes(obj.__typename)
}



var PostEdge_possibleTypes = ['PostEdge']
export var isPostEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isPostEdge"')
  return PostEdge_possibleTypes.includes(obj.__typename)
}



var Post_possibleTypes = ['Post']
export var isPost = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isPost"')
  return Post_possibleTypes.includes(obj.__typename)
}



var VotableInterface_possibleTypes = ['Post','Comment']
export var isVotableInterface = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isVotableInterface"')
  return VotableInterface_possibleTypes.includes(obj.__typename)
}



var VoteConnection_possibleTypes = ['VoteConnection']
export var isVoteConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isVoteConnection"')
  return VoteConnection_possibleTypes.includes(obj.__typename)
}



var VoteEdge_possibleTypes = ['VoteEdge']
export var isVoteEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isVoteEdge"')
  return VoteEdge_possibleTypes.includes(obj.__typename)
}



var Vote_possibleTypes = ['Vote']
export var isVote = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isVote"')
  return Vote_possibleTypes.includes(obj.__typename)
}



var User_possibleTypes = ['User']
export var isUser = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isUser"')
  return User_possibleTypes.includes(obj.__typename)
}



var CollectionConnection_possibleTypes = ['CollectionConnection']
export var isCollectionConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isCollectionConnection"')
  return CollectionConnection_possibleTypes.includes(obj.__typename)
}



var CollectionEdge_possibleTypes = ['CollectionEdge']
export var isCollectionEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isCollectionEdge"')
  return CollectionEdge_possibleTypes.includes(obj.__typename)
}



var UserConnection_possibleTypes = ['UserConnection']
export var isUserConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isUserConnection"')
  return UserConnection_possibleTypes.includes(obj.__typename)
}



var UserEdge_possibleTypes = ['UserEdge']
export var isUserEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isUserEdge"')
  return UserEdge_possibleTypes.includes(obj.__typename)
}



var CommentConnection_possibleTypes = ['CommentConnection']
export var isCommentConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isCommentConnection"')
  return CommentConnection_possibleTypes.includes(obj.__typename)
}



var CommentEdge_possibleTypes = ['CommentEdge']
export var isCommentEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isCommentEdge"')
  return CommentEdge_possibleTypes.includes(obj.__typename)
}



var Comment_possibleTypes = ['Comment']
export var isComment = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isComment"')
  return Comment_possibleTypes.includes(obj.__typename)
}



var Media_possibleTypes = ['Media']
export var isMedia = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMedia"')
  return Media_possibleTypes.includes(obj.__typename)
}



var ProductLink_possibleTypes = ['ProductLink']
export var isProductLink = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isProductLink"')
  return ProductLink_possibleTypes.includes(obj.__typename)
}



var Goal_possibleTypes = ['Goal']
export var isGoal = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoal"')
  return Goal_possibleTypes.includes(obj.__typename)
}



var MakerProject_possibleTypes = ['MakerProject']
export var isMakerProject = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerProject"')
  return MakerProject_possibleTypes.includes(obj.__typename)
}



var MakerGroup_possibleTypes = ['MakerGroup']
export var isMakerGroup = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerGroup"')
  return MakerGroup_possibleTypes.includes(obj.__typename)
}



var GoalConnection_possibleTypes = ['GoalConnection']
export var isGoalConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalConnection"')
  return GoalConnection_possibleTypes.includes(obj.__typename)
}



var GoalEdge_possibleTypes = ['GoalEdge']
export var isGoalEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalEdge"')
  return GoalEdge_possibleTypes.includes(obj.__typename)
}



var MakerGroupConnection_possibleTypes = ['MakerGroupConnection']
export var isMakerGroupConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerGroupConnection"')
  return MakerGroupConnection_possibleTypes.includes(obj.__typename)
}



var MakerGroupEdge_possibleTypes = ['MakerGroupEdge']
export var isMakerGroupEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerGroupEdge"')
  return MakerGroupEdge_possibleTypes.includes(obj.__typename)
}



var Viewer_possibleTypes = ['Viewer']
export var isViewer = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isViewer"')
  return Viewer_possibleTypes.includes(obj.__typename)
}



var MakerProjectConnection_possibleTypes = ['MakerProjectConnection']
export var isMakerProjectConnection = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerProjectConnection"')
  return MakerProjectConnection_possibleTypes.includes(obj.__typename)
}



var MakerProjectEdge_possibleTypes = ['MakerProjectEdge']
export var isMakerProjectEdge = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMakerProjectEdge"')
  return MakerProjectEdge_possibleTypes.includes(obj.__typename)
}



var Mutation_possibleTypes = ['Mutation']
export var isMutation = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isMutation"')
  return Mutation_possibleTypes.includes(obj.__typename)
}



var GoalCheerPayload_possibleTypes = ['GoalCheerPayload']
export var isGoalCheerPayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalCheerPayload"')
  return GoalCheerPayload_possibleTypes.includes(obj.__typename)
}



var Error_possibleTypes = ['Error']
export var isError = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isError"')
  return Error_possibleTypes.includes(obj.__typename)
}



var GoalCheerUndoPayload_possibleTypes = ['GoalCheerUndoPayload']
export var isGoalCheerUndoPayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalCheerUndoPayload"')
  return GoalCheerUndoPayload_possibleTypes.includes(obj.__typename)
}



var GoalCreatePayload_possibleTypes = ['GoalCreatePayload']
export var isGoalCreatePayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalCreatePayload"')
  return GoalCreatePayload_possibleTypes.includes(obj.__typename)
}



var GoalMarkAsCompletePayload_possibleTypes = ['GoalMarkAsCompletePayload']
export var isGoalMarkAsCompletePayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalMarkAsCompletePayload"')
  return GoalMarkAsCompletePayload_possibleTypes.includes(obj.__typename)
}



var GoalMarkAsIncompletePayload_possibleTypes = ['GoalMarkAsIncompletePayload']
export var isGoalMarkAsIncompletePayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalMarkAsIncompletePayload"')
  return GoalMarkAsIncompletePayload_possibleTypes.includes(obj.__typename)
}



var GoalUpdatePayload_possibleTypes = ['GoalUpdatePayload']
export var isGoalUpdatePayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isGoalUpdatePayload"')
  return GoalUpdatePayload_possibleTypes.includes(obj.__typename)
}



var UserFollowPayload_possibleTypes = ['UserFollowPayload']
export var isUserFollowPayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isUserFollowPayload"')
  return UserFollowPayload_possibleTypes.includes(obj.__typename)
}



var UserFollowUndoPayload_possibleTypes = ['UserFollowUndoPayload']
export var isUserFollowUndoPayload = function(obj) {
  if (!obj || !obj.__typename) throw new Error('__typename is missing in "isUserFollowUndoPayload"')
  return UserFollowUndoPayload_possibleTypes.includes(obj.__typename)
}
