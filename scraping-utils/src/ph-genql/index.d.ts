import {
  FieldsSelection,
  GraphqlOperation,
  ClientOptions,
  Observable,
} from '@genql/runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
export * from './schema'
import {
  QueryRequest,
  QueryPromiseChain,
  Query,
  MutationRequest,
  MutationPromiseChain,
  Mutation,
} from './schema'
export declare const createClient: (options?: ClientOptions) => Client
export declare const everything: { __scalar: boolean }
export declare const version: string

export interface Client {
  wsClient?: SubscriptionClient

  query<R extends QueryRequest>(
    request: R & { __name?: string },
  ): Promise<FieldsSelection<Query, R>>

  mutation<R extends MutationRequest>(
    request: R & { __name?: string },
  ): Promise<FieldsSelection<Mutation, R>>

  chain: {
    query: QueryPromiseChain

    mutation: MutationPromiseChain
  }
}

export type QueryResult<fields extends QueryRequest> = FieldsSelection<
  Query,
  fields
>

export declare const generateQueryOp: (
  fields: QueryRequest & { __name?: string },
) => GraphqlOperation
export type MutationResult<fields extends MutationRequest> = FieldsSelection<
  Mutation,
  fields
>

export declare const generateMutationOp: (
  fields: MutationRequest & { __name?: string },
) => GraphqlOperation

export declare const enumCommentsOrder: {
  readonly NEWEST: 'NEWEST'
  readonly VOTES_COUNT: 'VOTES_COUNT'
}

export declare const enumCollectionsOrder: {
  readonly NEWEST: 'NEWEST'
  readonly FOLLOWERS_COUNT: 'FOLLOWERS_COUNT'
  readonly FEATURED_AT: 'FEATURED_AT'
}

export declare const enumGoalsOrder: {
  readonly COMPLETED_AT: 'COMPLETED_AT'
  readonly DUE_AT: 'DUE_AT'
  readonly NEWEST: 'NEWEST'
}

export declare const enumMakerGroupsOrder: {
  readonly LAST_ACTIVE: 'LAST_ACTIVE'
  readonly MEMBERS_COUNT: 'MEMBERS_COUNT'
  readonly GOALS_COUNT: 'GOALS_COUNT'
  readonly NEWEST: 'NEWEST'
}

export declare const enumPostsOrder: {
  readonly FEATURED_AT: 'FEATURED_AT'
  readonly VOTES: 'VOTES'
  readonly RANKING: 'RANKING'
  readonly NEWEST: 'NEWEST'
}

export declare const enumTopicsOrder: {
  readonly NEWEST: 'NEWEST'
  readonly FOLLOWERS_COUNT: 'FOLLOWERS_COUNT'
}
