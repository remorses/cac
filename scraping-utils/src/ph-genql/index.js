import {
  linkTypeMap,
  createClient as createClientOriginal,
  generateGraphqlOperation,
  assertSameVersion,
} from '@genql/runtime'
import types from './types.esm'
var typeMap = linkTypeMap(types)
export * from './guards.esm'

export var version = '2.9.0'
assertSameVersion(version)

export var createClient = function(options) {
  options = options || {}
  var optionsCopy = {
    url: 'https://ph-graph-api-explorer.herokuapp.com/graphql',
    queryRoot: typeMap.Query,
    mutationRoot: typeMap.Mutation,
    subscriptionRoot: typeMap.Subscription,
  }
  for (var name in options) {
    optionsCopy[name] = options[name]
  }
  return createClientOriginal(optionsCopy)
}

export const enumCommentsOrder = {
  NEWEST: 'NEWEST',
  VOTES_COUNT: 'VOTES_COUNT',
}

export const enumCollectionsOrder = {
  NEWEST: 'NEWEST',
  FOLLOWERS_COUNT: 'FOLLOWERS_COUNT',
  FEATURED_AT: 'FEATURED_AT',
}

export const enumGoalsOrder = {
  COMPLETED_AT: 'COMPLETED_AT',
  DUE_AT: 'DUE_AT',
  NEWEST: 'NEWEST',
}

export const enumMakerGroupsOrder = {
  LAST_ACTIVE: 'LAST_ACTIVE',
  MEMBERS_COUNT: 'MEMBERS_COUNT',
  GOALS_COUNT: 'GOALS_COUNT',
  NEWEST: 'NEWEST',
}

export const enumPostsOrder = {
  FEATURED_AT: 'FEATURED_AT',
  VOTES: 'VOTES',
  RANKING: 'RANKING',
  NEWEST: 'NEWEST',
}

export const enumTopicsOrder = {
  NEWEST: 'NEWEST',
  FOLLOWERS_COUNT: 'FOLLOWERS_COUNT',
}

export var generateQueryOp = function(fields) {
  return generateGraphqlOperation('query', typeMap.Query, fields)
}
export var generateMutationOp = function(fields) {
  return generateGraphqlOperation('mutation', typeMap.Mutation, fields)
}
export var generateSubscriptionOp = function(fields) {
  return generateGraphqlOperation('subscription', typeMap.Subscription, fields)
}
export var everything = {
  __scalar: true,
}
