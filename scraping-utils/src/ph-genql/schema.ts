import {FieldsSelection,Observable} from '@genql/runtime'

export type Scalars = {
    Boolean: boolean,
    String: string,
    ID: string,
    Int: number,
    DateTime: any,
    Float: number,
}


/** The query root for Product Hunt API V2 schema */
export interface Query {
    /** Look up a Collection(only published). */
    collection?: Collection
    /** Look up Collections by various parameters. */
    collections: CollectionConnection
    /** Look up a Comment. */
    comment?: Comment
    /** Look up a Goal. */
    goal?: Goal
    /** Look up Goals by various parameters. */
    goals: GoalConnection
    /** Look up a MakerGroup. */
    makerGroup?: MakerGroup
    /** Look up MakerGroups by various parameters. */
    makerGroups: MakerGroupConnection
    /** Look up a Post. */
    post?: Post
    /** Look up Posts by various parameters. */
    posts: PostConnection
    /** Look up a Topic. */
    topic?: Topic
    /** Look up Topics by various parameters. */
    topics: TopicConnection
    /** Look up a User. */
    user?: User
    /** Top level scope for currently authenticated user. Includes `goals`, `makerGroups`, `makerProjects` & `user` fields. */
    viewer?: Viewer
    __typename: 'Query'
}


/** A collection of posts. */
export interface Collection {
    /** Cover image for the collection. */
    coverImage?: Scalars['String']
    /** Identifies the date and time when collection was created. */
    createdAt: Scalars['DateTime']
    /** Description of the collection in plain text. */
    description?: Scalars['String']
    /** Identifies the date and time when collection was featured. */
    featuredAt?: Scalars['DateTime']
    /** Number of users following the collection. */
    followersCount: Scalars['Int']
    /** ID of the collection. */
    id: Scalars['ID']
    /** Whether the viewer is following the collection or not. */
    isFollowing: Scalars['Boolean']
    /** Name of the collection. */
    name: Scalars['String']
    /** Lookup posts which are part of the collection. */
    posts: PostConnection
    /** Tagline of the collection. */
    tagline: Scalars['String']
    /** Look up topics that are associated with the object. */
    topics: TopicConnection
    /** Public URL of the goal. */
    url: Scalars['String']
    /** User who created the collection. */
    user: User
    /** ID of User who created the collection. */
    userId: Scalars['ID']
    __typename: 'Collection'
}


/** An object that can have topics associated with it. */
export type TopicableInterface = (Collection | Post) & { __isUnion?: true }


/** The connection type for Topic. */
export interface TopicConnection {
    /** A list of edges. */
    edges: TopicEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'TopicConnection'
}


/** Information about pagination in a connection. */
export interface PageInfo {
    /** When paginating forwards, the cursor to continue. */
    endCursor?: Scalars['String']
    /** When paginating forwards, are there more items? */
    hasNextPage: Scalars['Boolean']
    /** When paginating backwards, are there more items? */
    hasPreviousPage: Scalars['Boolean']
    /** When paginating backwards, the cursor to continue. */
    startCursor?: Scalars['String']
    __typename: 'PageInfo'
}


/** An edge in a connection. */
export interface TopicEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Topic
    __typename: 'TopicEdge'
}


/** A topic. */
export interface Topic {
    /** Identifies the date and time when topic was created. */
    createdAt: Scalars['DateTime']
    /** Description of the topic. */
    description: Scalars['String']
    /** Number of users who are following the topic. */
    followersCount: Scalars['Int']
    /** ID of the topic. */
    id: Scalars['ID']
    /** Image of the topic. */
    image?: Scalars['String']
    /** Whether the viewer is following the topic or not. */
    isFollowing: Scalars['Boolean']
    /** Name of the topic. */
    name: Scalars['String']
    /** Number of posts that are part of the topic. */
    postsCount: Scalars['Int']
    /** URL friendly slug of the topic. */
    slug: Scalars['String']
    /** Public URL of the topic. */
    url: Scalars['String']
    __typename: 'Topic'
}


/** The connection type for Post. */
export interface PostConnection {
    /** A list of edges. */
    edges: PostEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'PostConnection'
}


/** An edge in a connection. */
export interface PostEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Post
    __typename: 'PostEdge'
}


/** A post. */
export interface Post {
    /** Lookup collections which the Post is part of. */
    collections: CollectionConnection
    /** Lookup comments on the Post. */
    comments: CommentConnection
    /** Number of comments made on the Post. */
    commentsCount: Scalars['Int']
    /** Identifies the date and time when the Post was created. */
    createdAt: Scalars['DateTime']
    /** Description of the Post in plain text. */
    description?: Scalars['String']
    /** Identifies the date and time when the Post was featured. */
    featuredAt?: Scalars['DateTime']
    /** ID of the Post. */
    id: Scalars['ID']
    /** Whether the viewer has added the Post to one of their collections. */
    isCollected: Scalars['Boolean']
    /** Whether the Viewer has voted for the object or not. */
    isVoted: Scalars['Boolean']
    /** Users who are marked as makers of the Post. */
    makers: User[]
    /** Media items for the Post. */
    media: Media[]
    /** Name of the Post. */
    name: Scalars['String']
    /** Additional product links */
    productLinks: ProductLink[]
    /** Count of review for the Post */
    reviewsCount: Scalars['Int']
    /** Aggregate review rating for the Post. */
    reviewsRating: Scalars['Float']
    /** URL friendly slug of the Post. */
    slug: Scalars['String']
    /** Tagline of the Post. */
    tagline: Scalars['String']
    /** Thumbnail media object of the Post. */
    thumbnail?: Media
    /** Look up topics that are associated with the object. */
    topics: TopicConnection
    /** URL of the Post on Product Hunt. */
    url: Scalars['String']
    /** User who created the Post. */
    user: User
    /** ID of User who created the Post. */
    userId: Scalars['ID']
    votes: VoteConnection
    /** Number of votes that the object has currently. */
    votesCount: Scalars['Int']
    /** URL that redirects to the Post's website. */
    website: Scalars['String']
    __typename: 'Post'
}


/** An object which users can vote for. */
export type VotableInterface = (Post | Comment) & { __isUnion?: true }


/** The connection type for Vote. */
export interface VoteConnection {
    /** A list of edges. */
    edges: VoteEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'VoteConnection'
}


/** An edge in a connection. */
export interface VoteEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Vote
    __typename: 'VoteEdge'
}


/** A vote. */
export interface Vote {
    /** Identifies the date and time when Vote was created. */
    createdAt: Scalars['DateTime']
    /** ID of the Vote. */
    id: Scalars['ID']
    /** User who created the Vote. */
    user: User
    /** ID of User who created the Vote. */
    userId: Scalars['ID']
    __typename: 'Vote'
}


/** A user. */
export interface User {
    /** Cover image of the user. */
    coverImage?: Scalars['String']
    /** Identifies the date and time when user was created. */
    createdAt: Scalars['DateTime']
    /** Look up collections that the user is following. */
    followedCollections: CollectionConnection
    /** Look up other users who are following the user. */
    followers: UserConnection
    /** Look up other users who are being followed by the user. */
    following: UserConnection
    /** Headline text of the user. */
    headline?: Scalars['String']
    /** ID of the user. */
    id: Scalars['ID']
    /** Whether the viewer is following the user or not. */
    isFollowing: Scalars['Boolean']
    /** Whether the user is an accepted maker or not. */
    isMaker: Scalars['Boolean']
    /** Whether the user is same as the viewer of the API. */
    isViewer: Scalars['Boolean']
    /** Look up posts that the user has made. */
    madePosts: PostConnection
    /** Name of the user. */
    name: Scalars['String']
    /** Profile image of the user. */
    profileImage?: Scalars['String']
    /** Look up posts that the user has submitted. */
    submittedPosts: PostConnection
    /** Twitter username of the user. */
    twitterUsername?: Scalars['String']
    /** Public URL of the user's profile */
    url: Scalars['String']
    /** Username of the user. */
    username: Scalars['String']
    /** Look up posts that the user has voted for. */
    votedPosts: PostConnection
    /** URL for the user's website */
    websiteUrl?: Scalars['String']
    __typename: 'User'
}


/** The connection type for Collection. */
export interface CollectionConnection {
    /** A list of edges. */
    edges: CollectionEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'CollectionConnection'
}


/** An edge in a connection. */
export interface CollectionEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Collection
    __typename: 'CollectionEdge'
}


/** The connection type for User. */
export interface UserConnection {
    /** A list of edges. */
    edges: UserEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'UserConnection'
}


/** An edge in a connection. */
export interface UserEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: User
    __typename: 'UserEdge'
}


/** The connection type for Comment. */
export interface CommentConnection {
    /** A list of edges. */
    edges: CommentEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'CommentConnection'
}


/** An edge in a connection. */
export interface CommentEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Comment
    __typename: 'CommentEdge'
}


/** A comment posted by a User. */
export interface Comment {
    /** Body of the comment. */
    body: Scalars['String']
    /** Identifies the date and time when comment was created. */
    createdAt: Scalars['DateTime']
    /** ID of the comment. */
    id: Scalars['ID']
    /** Whether the Viewer has voted for the object or not. */
    isVoted: Scalars['Boolean']
    /** Comment on which this comment was posted(null in case of top level comments). */
    parent?: Comment
    /** ID of Comment on which this comment was posted(null in case of top level comments). */
    parentId?: Scalars['ID']
    /** Lookup comments that were posted on the comment itself. */
    replies: CommentConnection
    /** Public URL of the comment. */
    url: Scalars['String']
    /** User who posted the comment. */
    user: User
    /** ID of User who posted the comment. */
    userId: Scalars['ID']
    votes: VoteConnection
    /** Number of votes that the object has currently. */
    votesCount: Scalars['Int']
    __typename: 'Comment'
}

export type CommentsOrder = 'NEWEST' | 'VOTES_COUNT'


/** A media object. */
export interface Media {
    /** Type of media object. */
    type: Scalars['String']
    /** Public URL for the media object. Incase of videos this URL represents thumbnail generated from video. */
    url: Scalars['String']
    /** Video URL of the media object. */
    videoUrl?: Scalars['String']
    __typename: 'Media'
}


/** Product link from a post. */
export interface ProductLink {
    type: Scalars['String']
    url: Scalars['String']
    __typename: 'ProductLink'
}

export type CollectionsOrder = 'NEWEST' | 'FOLLOWERS_COUNT' | 'FEATURED_AT'


/** A goal created by maker. */
export interface Goal {
    /** Number of cheers on the Goal. */
    cheerCount: Scalars['Int']
    /** Identifies the date and time when goal was marked as completed. */
    completedAt?: Scalars['DateTime']
    /** Identifies the date and time when goal was created. */
    createdAt: Scalars['DateTime']
    /** Whether the goal is user's current goal or not. */
    current: Scalars['Boolean']
    /** Identifies the date and time until the goal is user's current goal. */
    currentUntil?: Scalars['DateTime']
    /** Identifies the date and time when goal is due. */
    dueAt?: Scalars['DateTime']
    /** Total time spent in focus mode in seconds, starts at 0 */
    focusedDuration: Scalars['Int']
    /** Maker group to which the goal belongs to. */
    group: MakerGroup
    /** ID of Maker group to which the goal belongs to. */
    groupId: Scalars['ID']
    /** ID of the goal. */
    id: Scalars['ID']
    /** Whether the Viewer has cheered the goal or not. */
    isCheered: Scalars['Boolean']
    /** Maker project to which the goal belongs to. */
    project?: MakerProject
    /** Title of the goal in plain text */
    title: Scalars['String']
    /** Public URL of the goal. */
    url: Scalars['String']
    /** User who created the goal. */
    user: User
    /** ID of User who created the goal. */
    userId: Scalars['ID']
    __typename: 'Goal'
}


/** A maker project. */
export interface MakerProject {
    /** ID of the MakerProject. */
    id: Scalars['ID']
    /** Image of the MakerProject. */
    image?: Scalars['String']
    /** Whether the MakerProject owner is looking for other makers or not. */
    lookingForOtherMakers: Scalars['Boolean']
    /** ID of the MakerProject. */
    name: Scalars['String']
    /** Tagline of the MakerProject. */
    tagline: Scalars['String']
    /** URL of the MakerProject. */
    url: Scalars['String']
    __typename: 'MakerProject'
}


/** A group of makers, also known as Spaces on PH. */
export interface MakerGroup {
    /** Description of the MakerGroup. */
    description: Scalars['String']
    /** Number of goals that have been created in the MakerGroup. */
    goalsCount: Scalars['Int']
    /** ID of the MakerGroup. */
    id: Scalars['ID']
    /** Whether Viewer is member of the MakerGroup or not. */
    isMember: Scalars['Boolean']
    /** Number of users who are part of the MakerGroup. */
    membersCount: Scalars['Int']
    /** Name of the MakerGroup. */
    name: Scalars['String']
    /** Tagline of the MakerGroup. */
    tagline: Scalars['String']
    /** URL of the MakerGroup. */
    url: Scalars['String']
    __typename: 'MakerGroup'
}


/** The connection type for Goal. */
export interface GoalConnection {
    /** A list of edges. */
    edges: GoalEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'GoalConnection'
}


/** An edge in a connection. */
export interface GoalEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Goal
    __typename: 'GoalEdge'
}

export type GoalsOrder = 'COMPLETED_AT' | 'DUE_AT' | 'NEWEST'


/** The connection type for MakerGroup. */
export interface MakerGroupConnection {
    /** A list of edges. */
    edges: MakerGroupEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'MakerGroupConnection'
}


/** An edge in a connection. */
export interface MakerGroupEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: MakerGroup
    __typename: 'MakerGroupEdge'
}

export type MakerGroupsOrder = 'LAST_ACTIVE' | 'MEMBERS_COUNT' | 'GOALS_COUNT' | 'NEWEST'

export type PostsOrder = 'FEATURED_AT' | 'VOTES' | 'RANKING' | 'NEWEST'

export type TopicsOrder = 'NEWEST' | 'FOLLOWERS_COUNT'


/** Top level scope for the user in whose context the API is running. */
export interface Viewer {
    /** Look up goals of the viewer. */
    goals: GoalConnection
    /** Look up maker groups the viewer is accepted member of. */
    makerGroups: MakerGroupConnection
    /** Look up maker projects the viewer is a maintainer(either created or maintained by) of. */
    makerProjects: MakerProjectConnection
    /** User who is the viewer of the API. */
    user: User
    __typename: 'Viewer'
}


/** The connection type for MakerProject. */
export interface MakerProjectConnection {
    /** A list of edges. */
    edges: MakerProjectEdge[]
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    /** Total number of objects returned from this query */
    totalCount: Scalars['Int']
    __typename: 'MakerProjectConnection'
}


/** An edge in a connection. */
export interface MakerProjectEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: MakerProject
    __typename: 'MakerProjectEdge'
}

export interface Mutation {
    /** Cheer a Goal as Viewer. Returns the cheered Goal */
    goalCheer: GoalCheerPayload
    /** Cheer a Goal as Viewer. Returns the cheered Goal */
    goalCheerUndo: GoalCheerUndoPayload
    /** Create a Goal for Viewer. Returns the created Goal. */
    goalCreate: GoalCreatePayload
    /** Marks a Goal as complete. Returns the updated Goal */
    goalMarkAsComplete: GoalMarkAsCompletePayload
    /** Marks a Goal as incomplete. Returns the updated Goal. */
    goalMarkAsIncomplete: GoalMarkAsIncompletePayload
    /** Update a Goal's `due_at`, `title`, `group` fields. Returns the updated Goal. */
    goalUpdate: GoalUpdatePayload
    /** Follow a User as Viewer. Returns the followed User. */
    userFollow: UserFollowPayload
    /** Stop following a User as Viewer. Returns the un-followed User. */
    userFollowUndo: UserFollowUndoPayload
    __typename: 'Mutation'
}


/** Autogenerated return type of GoalCheer */
export interface GoalCheerPayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalCheerPayload'
}

export interface Error {
    /** Field for which the error occurred. */
    field: Scalars['String']
    /** Error message. */
    message: Scalars['String']
    __typename: 'Error'
}


/** Autogenerated return type of GoalCheerUndo */
export interface GoalCheerUndoPayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalCheerUndoPayload'
}


/** Autogenerated return type of GoalCreate */
export interface GoalCreatePayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalCreatePayload'
}


/** Autogenerated return type of GoalMarkAsComplete */
export interface GoalMarkAsCompletePayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalMarkAsCompletePayload'
}


/** Autogenerated return type of GoalMarkAsIncomplete */
export interface GoalMarkAsIncompletePayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalMarkAsIncompletePayload'
}


/** Autogenerated return type of GoalUpdate */
export interface GoalUpdatePayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: Goal
    __typename: 'GoalUpdatePayload'
}


/** Autogenerated return type of UserFollow */
export interface UserFollowPayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: User
    __typename: 'UserFollowPayload'
}


/** Autogenerated return type of UserFollowUndo */
export interface UserFollowUndoPayload {
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: Scalars['String']
    errors: Error[]
    node?: User
    __typename: 'UserFollowUndoPayload'
}


/** The query root for Product Hunt API V2 schema */
export interface QueryRequest{
    /** Look up a Collection(only published). */
    collection?: [{
    /** ID for the object. */
    id?: (Scalars['ID'] | null),
    /** URL friendly slug for the object. */
    slug?: (Scalars['String'] | null)},CollectionRequest] | CollectionRequest
    /** Look up Collections by various parameters. */
    collections?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Collections that have the Post with the given ID. */
    postId?: (Scalars['ID'] | null),
    /** Select Collections that are created by User with the given ID. */
    userId?: (Scalars['ID'] | null),
    /** Select Collections that have been featured or not featured depending on given value. */
    featured?: (Scalars['Boolean'] | null),
    /** Define order for the Collections. */
    order?: (CollectionsOrder | null)},CollectionConnectionRequest] | CollectionConnectionRequest
    /** Look up a Comment. */
    comment?: [{
    /** ID for the object. */
    id: Scalars['ID']},CommentRequest]
    /** Look up a Goal. */
    goal?: [{
    /** ID for the object. */
    id: Scalars['ID']},GoalRequest]
    /** Look up Goals by various parameters. */
    goals?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Goals that are created by User with the given ID. */
    userId?: (Scalars['ID'] | null),
    /** Select Goals that are created in the MakerGroup(Space) with given ID. */
    makerGroupId?: (Scalars['ID'] | null),
    /** Select Goals that are created in the MakerProject with given ID. */
    makerProjectId?: (Scalars['ID'] | null),
    /** Select Goals that have been completed or not completed depending on given value. */
    completed?: (Scalars['Boolean'] | null),
    /** Define order for the Goals. */
    order?: (GoalsOrder | null)},GoalConnectionRequest] | GoalConnectionRequest
    /** Look up a MakerGroup. */
    makerGroup?: [{
    /** ID for the object. */
    id: Scalars['ID']},MakerGroupRequest]
    /** Look up MakerGroups by various parameters. */
    makerGroups?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select MakerGroups that the User with the given ID is accepted member of. */
    userId?: (Scalars['ID'] | null),
    /** Define order for the MakerGroups. */
    order?: (MakerGroupsOrder | null)},MakerGroupConnectionRequest] | MakerGroupConnectionRequest
    /** Look up a Post. */
    post?: [{
    /** ID for the object. */
    id?: (Scalars['ID'] | null),
    /** URL friendly slug for the object. */
    slug?: (Scalars['String'] | null)},PostRequest] | PostRequest
    /** Look up Posts by various parameters. */
    posts?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Posts that have been featured or not featured depending on given value. */
    featured?: (Scalars['Boolean'] | null),
    /** Select Posts which were posted before the given date and time. */
    postedBefore?: (Scalars['DateTime'] | null),
    /** Select Posts which were posted after the given date and time. */
    postedAfter?: (Scalars['DateTime'] | null),
    /** Select Posts that have the given slug as one of their topics. */
    topic?: (Scalars['String'] | null),
    /** Define order for the Posts. */
    order?: (PostsOrder | null),
    /** Select Posts that have the given twitter url. */
    twitterUrl?: (Scalars['String'] | null),
    /** Select Posts that have the given url. */
    url?: (Scalars['String'] | null)},PostConnectionRequest] | PostConnectionRequest
    /** Look up a Topic. */
    topic?: [{
    /** ID for the object. */
    id?: (Scalars['ID'] | null),
    /** URL friendly slug for the object. */
    slug?: (Scalars['String'] | null)},TopicRequest] | TopicRequest
    /** Look up Topics by various parameters. */
    topics?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Topics that are followed by User with the given ID. */
    followedByUserId?: (Scalars['ID'] | null),
    /** Select Topics whose name or aliases match the given string */
    query?: (Scalars['String'] | null),
    /** Define order for the Topics. */
    order?: (TopicsOrder | null)},TopicConnectionRequest] | TopicConnectionRequest
    /** Look up a User. */
    user?: [{
    /** ID for the user. */
    id?: (Scalars['ID'] | null),
    /** Username for the user. */
    username?: (Scalars['String'] | null)},UserRequest] | UserRequest
    /** Top level scope for currently authenticated user. Includes `goals`, `makerGroups`, `makerProjects` & `user` fields. */
    viewer?: ViewerRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A collection of posts. */
export interface CollectionRequest{
    /** Cover image for the collection. */
    coverImage?: [{width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}] | boolean | number
    /** Identifies the date and time when collection was created. */
    createdAt?: boolean | number
    /** Description of the collection in plain text. */
    description?: boolean | number
    /** Identifies the date and time when collection was featured. */
    featuredAt?: boolean | number
    /** Number of users following the collection. */
    followersCount?: boolean | number
    /** ID of the collection. */
    id?: boolean | number
    /** Whether the viewer is following the collection or not. */
    isFollowing?: boolean | number
    /** Name of the collection. */
    name?: boolean | number
    /** Lookup posts which are part of the collection. */
    posts?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},PostConnectionRequest] | PostConnectionRequest
    /** Tagline of the collection. */
    tagline?: boolean | number
    /** Look up topics that are associated with the object. */
    topics?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},TopicConnectionRequest] | TopicConnectionRequest
    /** Public URL of the goal. */
    url?: boolean | number
    /** User who created the collection. */
    user?: UserRequest
    /** ID of User who created the collection. */
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An object that can have topics associated with it. */
export interface TopicableInterfaceRequest{
    /** ID of the object. */
    id?: boolean | number
    /** Look up topics that are associated with the object. */
    topics?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},TopicConnectionRequest] | TopicConnectionRequest
    on_Collection?: CollectionRequest
    on_Post?: PostRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Topic. */
export interface TopicConnectionRequest{
    /** A list of edges. */
    edges?: TopicEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Information about pagination in a connection. */
export interface PageInfoRequest{
    /** When paginating forwards, the cursor to continue. */
    endCursor?: boolean | number
    /** When paginating forwards, are there more items? */
    hasNextPage?: boolean | number
    /** When paginating backwards, are there more items? */
    hasPreviousPage?: boolean | number
    /** When paginating backwards, the cursor to continue. */
    startCursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface TopicEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: TopicRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A topic. */
export interface TopicRequest{
    /** Identifies the date and time when topic was created. */
    createdAt?: boolean | number
    /** Description of the topic. */
    description?: boolean | number
    /** Number of users who are following the topic. */
    followersCount?: boolean | number
    /** ID of the topic. */
    id?: boolean | number
    /** Image of the topic. */
    image?: [{width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}] | boolean | number
    /** Whether the viewer is following the topic or not. */
    isFollowing?: boolean | number
    /** Name of the topic. */
    name?: boolean | number
    /** Number of posts that are part of the topic. */
    postsCount?: boolean | number
    /** URL friendly slug of the topic. */
    slug?: boolean | number
    /** Public URL of the topic. */
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Post. */
export interface PostConnectionRequest{
    /** A list of edges. */
    edges?: PostEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface PostEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: PostRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A post. */
export interface PostRequest{
    /** Lookup collections which the Post is part of. */
    collections?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},CollectionConnectionRequest] | CollectionConnectionRequest
    /** Lookup comments on the Post. */
    comments?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Define order for the Comments. */
    order?: (CommentsOrder | null)},CommentConnectionRequest] | CommentConnectionRequest
    /** Number of comments made on the Post. */
    commentsCount?: boolean | number
    /** Identifies the date and time when the Post was created. */
    createdAt?: boolean | number
    /** Description of the Post in plain text. */
    description?: boolean | number
    /** Identifies the date and time when the Post was featured. */
    featuredAt?: boolean | number
    /** ID of the Post. */
    id?: boolean | number
    /** Whether the viewer has added the Post to one of their collections. */
    isCollected?: boolean | number
    /** Whether the Viewer has voted for the object or not. */
    isVoted?: boolean | number
    /** Users who are marked as makers of the Post. */
    makers?: UserRequest
    /** Media items for the Post. */
    media?: MediaRequest
    /** Name of the Post. */
    name?: boolean | number
    /** Additional product links */
    productLinks?: ProductLinkRequest
    /** Count of review for the Post */
    reviewsCount?: boolean | number
    /** Aggregate review rating for the Post. */
    reviewsRating?: boolean | number
    /** URL friendly slug of the Post. */
    slug?: boolean | number
    /** Tagline of the Post. */
    tagline?: boolean | number
    /** Thumbnail media object of the Post. */
    thumbnail?: MediaRequest
    /** Look up topics that are associated with the object. */
    topics?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},TopicConnectionRequest] | TopicConnectionRequest
    /** URL of the Post on Product Hunt. */
    url?: boolean | number
    /** User who created the Post. */
    user?: UserRequest
    /** ID of User who created the Post. */
    userId?: boolean | number
    votes?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Votes which were created after the given date and time. */
    createdAfter?: (Scalars['DateTime'] | null),
    /** Select Votes which were created before the given date and time. */
    createdBefore?: (Scalars['DateTime'] | null)},VoteConnectionRequest] | VoteConnectionRequest
    /** Number of votes that the object has currently. */
    votesCount?: boolean | number
    /** URL that redirects to the Post's website. */
    website?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An object which users can vote for. */
export interface VotableInterfaceRequest{
    /** ID of the object */
    id?: boolean | number
    /** Whether the Viewer has voted for the object or not. */
    isVoted?: boolean | number
    votes?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Votes which were created after the given date and time. */
    createdAfter?: (Scalars['DateTime'] | null),
    /** Select Votes which were created before the given date and time. */
    createdBefore?: (Scalars['DateTime'] | null)},VoteConnectionRequest] | VoteConnectionRequest
    /** Number of votes that the object has currently. */
    votesCount?: boolean | number
    on_Post?: PostRequest
    on_Comment?: CommentRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Vote. */
export interface VoteConnectionRequest{
    /** A list of edges. */
    edges?: VoteEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface VoteEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: VoteRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A vote. */
export interface VoteRequest{
    /** Identifies the date and time when Vote was created. */
    createdAt?: boolean | number
    /** ID of the Vote. */
    id?: boolean | number
    /** User who created the Vote. */
    user?: UserRequest
    /** ID of User who created the Vote. */
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A user. */
export interface UserRequest{
    /** Cover image of the user. */
    coverImage?: [{width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}] | boolean | number
    /** Identifies the date and time when user was created. */
    createdAt?: boolean | number
    /** Look up collections that the user is following. */
    followedCollections?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},CollectionConnectionRequest] | CollectionConnectionRequest
    /** Look up other users who are following the user. */
    followers?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},UserConnectionRequest] | UserConnectionRequest
    /** Look up other users who are being followed by the user. */
    following?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},UserConnectionRequest] | UserConnectionRequest
    /** Headline text of the user. */
    headline?: boolean | number
    /** ID of the user. */
    id?: boolean | number
    /** Whether the viewer is following the user or not. */
    isFollowing?: boolean | number
    /** Whether the user is an accepted maker or not. */
    isMaker?: boolean | number
    /** Whether the user is same as the viewer of the API. */
    isViewer?: boolean | number
    /** Look up posts that the user has made. */
    madePosts?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},PostConnectionRequest] | PostConnectionRequest
    /** Name of the user. */
    name?: boolean | number
    /** Profile image of the user. */
    profileImage?: [{size?: (Scalars['Int'] | null)}] | boolean | number
    /** Look up posts that the user has submitted. */
    submittedPosts?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},PostConnectionRequest] | PostConnectionRequest
    /** Twitter username of the user. */
    twitterUsername?: boolean | number
    /** Public URL of the user's profile */
    url?: boolean | number
    /** Username of the user. */
    username?: boolean | number
    /** Look up posts that the user has voted for. */
    votedPosts?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},PostConnectionRequest] | PostConnectionRequest
    /** URL for the user's website */
    websiteUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Collection. */
export interface CollectionConnectionRequest{
    /** A list of edges. */
    edges?: CollectionEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CollectionEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CollectionRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for User. */
export interface UserConnectionRequest{
    /** A list of edges. */
    edges?: UserEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface UserEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: UserRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Comment. */
export interface CommentConnectionRequest{
    /** A list of edges. */
    edges?: CommentEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CommentEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CommentRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A comment posted by a User. */
export interface CommentRequest{
    /** Body of the comment. */
    body?: boolean | number
    /** Identifies the date and time when comment was created. */
    createdAt?: boolean | number
    /** ID of the comment. */
    id?: boolean | number
    /** Whether the Viewer has voted for the object or not. */
    isVoted?: boolean | number
    /** Comment on which this comment was posted(null in case of top level comments). */
    parent?: CommentRequest
    /** ID of Comment on which this comment was posted(null in case of top level comments). */
    parentId?: boolean | number
    /** Lookup comments that were posted on the comment itself. */
    replies?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Define order for the Comments. */
    order?: (CommentsOrder | null)},CommentConnectionRequest] | CommentConnectionRequest
    /** Public URL of the comment. */
    url?: boolean | number
    /** User who posted the comment. */
    user?: UserRequest
    /** ID of User who posted the comment. */
    userId?: boolean | number
    votes?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Votes which were created after the given date and time. */
    createdAfter?: (Scalars['DateTime'] | null),
    /** Select Votes which were created before the given date and time. */
    createdBefore?: (Scalars['DateTime'] | null)},VoteConnectionRequest] | VoteConnectionRequest
    /** Number of votes that the object has currently. */
    votesCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A media object. */
export interface MediaRequest{
    /** Type of media object. */
    type?: boolean | number
    /** Public URL for the media object. Incase of videos this URL represents thumbnail generated from video. */
    url?: [{
    /** Set width of the image to given value. */
    width?: (Scalars['Int'] | null),
    /** Set height of the image to given value. */
    height?: (Scalars['Int'] | null)}] | boolean | number
    /** Video URL of the media object. */
    videoUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product link from a post. */
export interface ProductLinkRequest{
    type?: boolean | number
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A goal created by maker. */
export interface GoalRequest{
    /** Number of cheers on the Goal. */
    cheerCount?: boolean | number
    /** Identifies the date and time when goal was marked as completed. */
    completedAt?: boolean | number
    /** Identifies the date and time when goal was created. */
    createdAt?: boolean | number
    /** Whether the goal is user's current goal or not. */
    current?: boolean | number
    /** Identifies the date and time until the goal is user's current goal. */
    currentUntil?: boolean | number
    /** Identifies the date and time when goal is due. */
    dueAt?: boolean | number
    /** Total time spent in focus mode in seconds, starts at 0 */
    focusedDuration?: boolean | number
    /** Maker group to which the goal belongs to. */
    group?: MakerGroupRequest
    /** ID of Maker group to which the goal belongs to. */
    groupId?: boolean | number
    /** ID of the goal. */
    id?: boolean | number
    /** Whether the Viewer has cheered the goal or not. */
    isCheered?: boolean | number
    /** Maker project to which the goal belongs to. */
    project?: MakerProjectRequest
    /** Title of the goal in plain text */
    title?: boolean | number
    /** Public URL of the goal. */
    url?: boolean | number
    /** User who created the goal. */
    user?: UserRequest
    /** ID of User who created the goal. */
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A maker project. */
export interface MakerProjectRequest{
    /** ID of the MakerProject. */
    id?: boolean | number
    /** Image of the MakerProject. */
    image?: [{width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}] | boolean | number
    /** Whether the MakerProject owner is looking for other makers or not. */
    lookingForOtherMakers?: boolean | number
    /** ID of the MakerProject. */
    name?: boolean | number
    /** Tagline of the MakerProject. */
    tagline?: boolean | number
    /** URL of the MakerProject. */
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A group of makers, also known as Spaces on PH. */
export interface MakerGroupRequest{
    /** Description of the MakerGroup. */
    description?: boolean | number
    /** Number of goals that have been created in the MakerGroup. */
    goalsCount?: boolean | number
    /** ID of the MakerGroup. */
    id?: boolean | number
    /** Whether Viewer is member of the MakerGroup or not. */
    isMember?: boolean | number
    /** Number of users who are part of the MakerGroup. */
    membersCount?: boolean | number
    /** Name of the MakerGroup. */
    name?: boolean | number
    /** Tagline of the MakerGroup. */
    tagline?: boolean | number
    /** URL of the MakerGroup. */
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for Goal. */
export interface GoalConnectionRequest{
    /** A list of edges. */
    edges?: GoalEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface GoalEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for MakerGroup. */
export interface MakerGroupConnectionRequest{
    /** A list of edges. */
    edges?: MakerGroupEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface MakerGroupEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: MakerGroupRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Top level scope for the user in whose context the API is running. */
export interface ViewerRequest{
    /** Look up goals of the viewer. */
    goals?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null),
    /** Select Goals which are set as current or not current depending on given value. */
    current?: (Scalars['Boolean'] | null),
    /** Define order for the Goals. */
    order?: (GoalsOrder | null)},GoalConnectionRequest] | GoalConnectionRequest
    /** Look up maker groups the viewer is accepted member of. */
    makerGroups?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},MakerGroupConnectionRequest] | MakerGroupConnectionRequest
    /** Look up maker projects the viewer is a maintainer(either created or maintained by) of. */
    makerProjects?: [{
    /** Returns the first _n_ elements from the list. */
    first?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come after the specified cursor. */
    after?: (Scalars['String'] | null),
    /** Returns the last _n_ elements from the list. */
    last?: (Scalars['Int'] | null),
    /** Returns the elements in the list that come before the specified cursor. */
    before?: (Scalars['String'] | null)},MakerProjectConnectionRequest] | MakerProjectConnectionRequest
    /** User who is the viewer of the API. */
    user?: UserRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The connection type for MakerProject. */
export interface MakerProjectConnectionRequest{
    /** A list of edges. */
    edges?: MakerProjectEdgeRequest
    /** Information to aid in pagination. */
    pageInfo?: PageInfoRequest
    /** Total number of objects returned from this query */
    totalCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface MakerProjectEdgeRequest{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: MakerProjectRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationRequest{
    /** Cheer a Goal as Viewer. Returns the cheered Goal */
    goalCheer?: [{input: GoalCheerInput},GoalCheerPayloadRequest]
    /** Cheer a Goal as Viewer. Returns the cheered Goal */
    goalCheerUndo?: [{input: GoalCheerUndoInput},GoalCheerUndoPayloadRequest]
    /** Create a Goal for Viewer. Returns the created Goal. */
    goalCreate?: [{input: GoalCreateInput},GoalCreatePayloadRequest]
    /** Marks a Goal as complete. Returns the updated Goal */
    goalMarkAsComplete?: [{input: GoalMarkAsCompleteInput},GoalMarkAsCompletePayloadRequest]
    /** Marks a Goal as incomplete. Returns the updated Goal. */
    goalMarkAsIncomplete?: [{input: GoalMarkAsIncompleteInput},GoalMarkAsIncompletePayloadRequest]
    /** Update a Goal's `due_at`, `title`, `group` fields. Returns the updated Goal. */
    goalUpdate?: [{input: GoalUpdateInput},GoalUpdatePayloadRequest]
    /** Follow a User as Viewer. Returns the followed User. */
    userFollow?: [{input: UserFollowInput},UserFollowPayloadRequest]
    /** Stop following a User as Viewer. Returns the un-followed User. */
    userFollowUndo?: [{input: UserFollowUndoInput},UserFollowUndoPayloadRequest]
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated return type of GoalCheer */
export interface GoalCheerPayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ErrorRequest{
    /** Field for which the error occurred. */
    field?: boolean | number
    /** Error message. */
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalCheer */
export interface GoalCheerInput {
/** ID of the Goal to cheer. */
goalId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of GoalCheerUndo */
export interface GoalCheerUndoPayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalCheerUndo */
export interface GoalCheerUndoInput {
/** ID of the Goal to cheer. */
goalId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of GoalCreate */
export interface GoalCreatePayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalCreate */
export interface GoalCreateInput {
/** ID of the MakerProject */
projectId?: (Scalars['ID'] | null),
/** ID of the MakerGroup(space) to set on the Goal. Viewer should be accepted member of the MakerGroup. */
groupId?: (Scalars['ID'] | null),
/** Set the date and time when the Goal is due in future. Pass null to make Goal never due. */
dueAt?: (Scalars['DateTime'] | null),
/** Set the title of the Goal. Accepts a non empty string. Maximum length is 80 characters. */
title: Scalars['String'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of GoalMarkAsComplete */
export interface GoalMarkAsCompletePayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalMarkAsComplete */
export interface GoalMarkAsCompleteInput {
/** ID of the goal to mark complete. */
goalId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of GoalMarkAsIncomplete */
export interface GoalMarkAsIncompletePayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalMarkAsIncomplete */
export interface GoalMarkAsIncompleteInput {
/** ID of the Goal to mark complete. */
goalId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of GoalUpdate */
export interface GoalUpdatePayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: GoalRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of GoalUpdate */
export interface GoalUpdateInput {
/** ID of the Goal to update. */
goalId: Scalars['ID'],
/** ID of the MakerGroup(space) to set on the Goal. Cannot be null. Viewer should be accepted member of the MakerGroup.  */
groupId?: (Scalars['ID'] | null),
/** Set the date and time when the Goal is due in future. Pass null to make the Goal never due. */
dueAt?: (Scalars['DateTime'] | null),
/** Set the title of the Goal. Accepts a non empty string. Maximum length is 80 characters. */
title?: (Scalars['String'] | null),
/** ID of the MakerProject */
projectId?: (Scalars['ID'] | null),
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of UserFollow */
export interface UserFollowPayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: UserRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of UserFollow */
export interface UserFollowInput {
/** ID of the User to follow. */
userId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


/** Autogenerated return type of UserFollowUndo */
export interface UserFollowUndoPayloadRequest{
    /** A unique identifier for the client performing the mutation. */
    clientMutationId?: boolean | number
    errors?: ErrorRequest
    node?: UserRequest
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Autogenerated input type of UserFollowUndo */
export interface UserFollowUndoInput {
/** ID of the User to stop following. */
userId: Scalars['ID'],
/** A unique identifier for the client performing the mutation. */
clientMutationId?: (Scalars['String'] | null)}


const Query_possibleTypes = ['Query']
export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
  return Query_possibleTypes.includes(obj.__typename)
}



const Collection_possibleTypes = ['Collection']
export const isCollection = (obj?: { __typename?: any } | null): obj is Collection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isCollection"')
  return Collection_possibleTypes.includes(obj.__typename)
}



const TopicableInterface_possibleTypes = ['Collection','Post']
export const isTopicableInterface = (obj?: { __typename?: any } | null): obj is TopicableInterface => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isTopicableInterface"')
  return TopicableInterface_possibleTypes.includes(obj.__typename)
}



const TopicConnection_possibleTypes = ['TopicConnection']
export const isTopicConnection = (obj?: { __typename?: any } | null): obj is TopicConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isTopicConnection"')
  return TopicConnection_possibleTypes.includes(obj.__typename)
}



const PageInfo_possibleTypes = ['PageInfo']
export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
  return PageInfo_possibleTypes.includes(obj.__typename)
}



const TopicEdge_possibleTypes = ['TopicEdge']
export const isTopicEdge = (obj?: { __typename?: any } | null): obj is TopicEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isTopicEdge"')
  return TopicEdge_possibleTypes.includes(obj.__typename)
}



const Topic_possibleTypes = ['Topic']
export const isTopic = (obj?: { __typename?: any } | null): obj is Topic => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isTopic"')
  return Topic_possibleTypes.includes(obj.__typename)
}



const PostConnection_possibleTypes = ['PostConnection']
export const isPostConnection = (obj?: { __typename?: any } | null): obj is PostConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isPostConnection"')
  return PostConnection_possibleTypes.includes(obj.__typename)
}



const PostEdge_possibleTypes = ['PostEdge']
export const isPostEdge = (obj?: { __typename?: any } | null): obj is PostEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isPostEdge"')
  return PostEdge_possibleTypes.includes(obj.__typename)
}



const Post_possibleTypes = ['Post']
export const isPost = (obj?: { __typename?: any } | null): obj is Post => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isPost"')
  return Post_possibleTypes.includes(obj.__typename)
}



const VotableInterface_possibleTypes = ['Post','Comment']
export const isVotableInterface = (obj?: { __typename?: any } | null): obj is VotableInterface => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isVotableInterface"')
  return VotableInterface_possibleTypes.includes(obj.__typename)
}



const VoteConnection_possibleTypes = ['VoteConnection']
export const isVoteConnection = (obj?: { __typename?: any } | null): obj is VoteConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isVoteConnection"')
  return VoteConnection_possibleTypes.includes(obj.__typename)
}



const VoteEdge_possibleTypes = ['VoteEdge']
export const isVoteEdge = (obj?: { __typename?: any } | null): obj is VoteEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isVoteEdge"')
  return VoteEdge_possibleTypes.includes(obj.__typename)
}



const Vote_possibleTypes = ['Vote']
export const isVote = (obj?: { __typename?: any } | null): obj is Vote => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isVote"')
  return Vote_possibleTypes.includes(obj.__typename)
}



const User_possibleTypes = ['User']
export const isUser = (obj?: { __typename?: any } | null): obj is User => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
  return User_possibleTypes.includes(obj.__typename)
}



const CollectionConnection_possibleTypes = ['CollectionConnection']
export const isCollectionConnection = (obj?: { __typename?: any } | null): obj is CollectionConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionConnection"')
  return CollectionConnection_possibleTypes.includes(obj.__typename)
}



const CollectionEdge_possibleTypes = ['CollectionEdge']
export const isCollectionEdge = (obj?: { __typename?: any } | null): obj is CollectionEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionEdge"')
  return CollectionEdge_possibleTypes.includes(obj.__typename)
}



const UserConnection_possibleTypes = ['UserConnection']
export const isUserConnection = (obj?: { __typename?: any } | null): obj is UserConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isUserConnection"')
  return UserConnection_possibleTypes.includes(obj.__typename)
}



const UserEdge_possibleTypes = ['UserEdge']
export const isUserEdge = (obj?: { __typename?: any } | null): obj is UserEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isUserEdge"')
  return UserEdge_possibleTypes.includes(obj.__typename)
}



const CommentConnection_possibleTypes = ['CommentConnection']
export const isCommentConnection = (obj?: { __typename?: any } | null): obj is CommentConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isCommentConnection"')
  return CommentConnection_possibleTypes.includes(obj.__typename)
}



const CommentEdge_possibleTypes = ['CommentEdge']
export const isCommentEdge = (obj?: { __typename?: any } | null): obj is CommentEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isCommentEdge"')
  return CommentEdge_possibleTypes.includes(obj.__typename)
}



const Comment_possibleTypes = ['Comment']
export const isComment = (obj?: { __typename?: any } | null): obj is Comment => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isComment"')
  return Comment_possibleTypes.includes(obj.__typename)
}



const Media_possibleTypes = ['Media']
export const isMedia = (obj?: { __typename?: any } | null): obj is Media => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMedia"')
  return Media_possibleTypes.includes(obj.__typename)
}



const ProductLink_possibleTypes = ['ProductLink']
export const isProductLink = (obj?: { __typename?: any } | null): obj is ProductLink => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isProductLink"')
  return ProductLink_possibleTypes.includes(obj.__typename)
}



const Goal_possibleTypes = ['Goal']
export const isGoal = (obj?: { __typename?: any } | null): obj is Goal => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoal"')
  return Goal_possibleTypes.includes(obj.__typename)
}



const MakerProject_possibleTypes = ['MakerProject']
export const isMakerProject = (obj?: { __typename?: any } | null): obj is MakerProject => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerProject"')
  return MakerProject_possibleTypes.includes(obj.__typename)
}



const MakerGroup_possibleTypes = ['MakerGroup']
export const isMakerGroup = (obj?: { __typename?: any } | null): obj is MakerGroup => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerGroup"')
  return MakerGroup_possibleTypes.includes(obj.__typename)
}



const GoalConnection_possibleTypes = ['GoalConnection']
export const isGoalConnection = (obj?: { __typename?: any } | null): obj is GoalConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalConnection"')
  return GoalConnection_possibleTypes.includes(obj.__typename)
}



const GoalEdge_possibleTypes = ['GoalEdge']
export const isGoalEdge = (obj?: { __typename?: any } | null): obj is GoalEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalEdge"')
  return GoalEdge_possibleTypes.includes(obj.__typename)
}



const MakerGroupConnection_possibleTypes = ['MakerGroupConnection']
export const isMakerGroupConnection = (obj?: { __typename?: any } | null): obj is MakerGroupConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerGroupConnection"')
  return MakerGroupConnection_possibleTypes.includes(obj.__typename)
}



const MakerGroupEdge_possibleTypes = ['MakerGroupEdge']
export const isMakerGroupEdge = (obj?: { __typename?: any } | null): obj is MakerGroupEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerGroupEdge"')
  return MakerGroupEdge_possibleTypes.includes(obj.__typename)
}



const Viewer_possibleTypes = ['Viewer']
export const isViewer = (obj?: { __typename?: any } | null): obj is Viewer => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isViewer"')
  return Viewer_possibleTypes.includes(obj.__typename)
}



const MakerProjectConnection_possibleTypes = ['MakerProjectConnection']
export const isMakerProjectConnection = (obj?: { __typename?: any } | null): obj is MakerProjectConnection => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerProjectConnection"')
  return MakerProjectConnection_possibleTypes.includes(obj.__typename)
}



const MakerProjectEdge_possibleTypes = ['MakerProjectEdge']
export const isMakerProjectEdge = (obj?: { __typename?: any } | null): obj is MakerProjectEdge => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMakerProjectEdge"')
  return MakerProjectEdge_possibleTypes.includes(obj.__typename)
}



const Mutation_possibleTypes = ['Mutation']
export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
  return Mutation_possibleTypes.includes(obj.__typename)
}



const GoalCheerPayload_possibleTypes = ['GoalCheerPayload']
export const isGoalCheerPayload = (obj?: { __typename?: any } | null): obj is GoalCheerPayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalCheerPayload"')
  return GoalCheerPayload_possibleTypes.includes(obj.__typename)
}



const Error_possibleTypes = ['Error']
export const isError = (obj?: { __typename?: any } | null): obj is Error => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isError"')
  return Error_possibleTypes.includes(obj.__typename)
}



const GoalCheerUndoPayload_possibleTypes = ['GoalCheerUndoPayload']
export const isGoalCheerUndoPayload = (obj?: { __typename?: any } | null): obj is GoalCheerUndoPayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalCheerUndoPayload"')
  return GoalCheerUndoPayload_possibleTypes.includes(obj.__typename)
}



const GoalCreatePayload_possibleTypes = ['GoalCreatePayload']
export const isGoalCreatePayload = (obj?: { __typename?: any } | null): obj is GoalCreatePayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalCreatePayload"')
  return GoalCreatePayload_possibleTypes.includes(obj.__typename)
}



const GoalMarkAsCompletePayload_possibleTypes = ['GoalMarkAsCompletePayload']
export const isGoalMarkAsCompletePayload = (obj?: { __typename?: any } | null): obj is GoalMarkAsCompletePayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalMarkAsCompletePayload"')
  return GoalMarkAsCompletePayload_possibleTypes.includes(obj.__typename)
}



const GoalMarkAsIncompletePayload_possibleTypes = ['GoalMarkAsIncompletePayload']
export const isGoalMarkAsIncompletePayload = (obj?: { __typename?: any } | null): obj is GoalMarkAsIncompletePayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalMarkAsIncompletePayload"')
  return GoalMarkAsIncompletePayload_possibleTypes.includes(obj.__typename)
}



const GoalUpdatePayload_possibleTypes = ['GoalUpdatePayload']
export const isGoalUpdatePayload = (obj?: { __typename?: any } | null): obj is GoalUpdatePayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isGoalUpdatePayload"')
  return GoalUpdatePayload_possibleTypes.includes(obj.__typename)
}



const UserFollowPayload_possibleTypes = ['UserFollowPayload']
export const isUserFollowPayload = (obj?: { __typename?: any } | null): obj is UserFollowPayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isUserFollowPayload"')
  return UserFollowPayload_possibleTypes.includes(obj.__typename)
}



const UserFollowUndoPayload_possibleTypes = ['UserFollowUndoPayload']
export const isUserFollowUndoPayload = (obj?: { __typename?: any } | null): obj is UserFollowUndoPayload => {
  if (!obj?.__typename) throw new Error('__typename is missing in "isUserFollowUndoPayload"')
  return UserFollowUndoPayload_possibleTypes.includes(obj.__typename)
}



/** The query root for Product Hunt API V2 schema */
export interface QueryPromiseChain{
    
/** Look up a Collection(only published). */
collection: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => CollectionPromiseChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: (FieldsSelection<Collection, R> | undefined)) => Promise<(FieldsSelection<Collection, R> | undefined)>})&(CollectionPromiseChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: (FieldsSelection<Collection, R> | undefined)) => Promise<(FieldsSelection<Collection, R> | undefined)>}),
    
/** Look up Collections by various parameters. */
collections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Collections that have the Post with the given ID. */
postId?: (Scalars['ID'] | null),
/** Select Collections that are created by User with the given ID. */
userId?: (Scalars['ID'] | null),
/** Select Collections that have been featured or not featured depending on given value. */
featured?: (Scalars['Boolean'] | null),
/** Define order for the Collections. */
order?: (CollectionsOrder | null)}) => CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>}),
    
/** Look up a Comment. */
comment: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => CommentPromiseChain & {get: <R extends CommentRequest>(request: R, defaultValue?: (FieldsSelection<Comment, R> | undefined)) => Promise<(FieldsSelection<Comment, R> | undefined)>}),
    
/** Look up a Goal. */
goal: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>}),
    
/** Look up Goals by various parameters. */
goals: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Goals that are created by User with the given ID. */
userId?: (Scalars['ID'] | null),
/** Select Goals that are created in the MakerGroup(Space) with given ID. */
makerGroupId?: (Scalars['ID'] | null),
/** Select Goals that are created in the MakerProject with given ID. */
makerProjectId?: (Scalars['ID'] | null),
/** Select Goals that have been completed or not completed depending on given value. */
completed?: (Scalars['Boolean'] | null),
/** Define order for the Goals. */
order?: (GoalsOrder | null)}) => GoalConnectionPromiseChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Promise<FieldsSelection<GoalConnection, R>>})&(GoalConnectionPromiseChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Promise<FieldsSelection<GoalConnection, R>>}),
    
/** Look up a MakerGroup. */
makerGroup: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => MakerGroupPromiseChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: (FieldsSelection<MakerGroup, R> | undefined)) => Promise<(FieldsSelection<MakerGroup, R> | undefined)>}),
    
/** Look up MakerGroups by various parameters. */
makerGroups: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select MakerGroups that the User with the given ID is accepted member of. */
userId?: (Scalars['ID'] | null),
/** Define order for the MakerGroups. */
order?: (MakerGroupsOrder | null)}) => MakerGroupConnectionPromiseChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Promise<FieldsSelection<MakerGroupConnection, R>>})&(MakerGroupConnectionPromiseChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Promise<FieldsSelection<MakerGroupConnection, R>>}),
    
/** Look up a Post. */
post: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => PostPromiseChain & {get: <R extends PostRequest>(request: R, defaultValue?: (FieldsSelection<Post, R> | undefined)) => Promise<(FieldsSelection<Post, R> | undefined)>})&(PostPromiseChain & {get: <R extends PostRequest>(request: R, defaultValue?: (FieldsSelection<Post, R> | undefined)) => Promise<(FieldsSelection<Post, R> | undefined)>}),
    
/** Look up Posts by various parameters. */
posts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Posts that have been featured or not featured depending on given value. */
featured?: (Scalars['Boolean'] | null),
/** Select Posts which were posted before the given date and time. */
postedBefore?: (Scalars['DateTime'] | null),
/** Select Posts which were posted after the given date and time. */
postedAfter?: (Scalars['DateTime'] | null),
/** Select Posts that have the given slug as one of their topics. */
topic?: (Scalars['String'] | null),
/** Define order for the Posts. */
order?: (PostsOrder | null),
/** Select Posts that have the given twitter url. */
twitterUrl?: (Scalars['String'] | null),
/** Select Posts that have the given url. */
url?: (Scalars['String'] | null)}) => PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>})&(PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>}),
    
/** Look up a Topic. */
topic: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => TopicPromiseChain & {get: <R extends TopicRequest>(request: R, defaultValue?: (FieldsSelection<Topic, R> | undefined)) => Promise<(FieldsSelection<Topic, R> | undefined)>})&(TopicPromiseChain & {get: <R extends TopicRequest>(request: R, defaultValue?: (FieldsSelection<Topic, R> | undefined)) => Promise<(FieldsSelection<Topic, R> | undefined)>}),
    
/** Look up Topics by various parameters. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Topics that are followed by User with the given ID. */
followedByUserId?: (Scalars['ID'] | null),
/** Select Topics whose name or aliases match the given string */
query?: (Scalars['String'] | null),
/** Define order for the Topics. */
order?: (TopicsOrder | null)}) => TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>})&(TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>}),
    
/** Look up a User. */
user: ((args?: {
/** ID for the user. */
id?: (Scalars['ID'] | null),
/** Username for the user. */
username?: (Scalars['String'] | null)}) => UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Promise<(FieldsSelection<User, R> | undefined)>})&(UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Promise<(FieldsSelection<User, R> | undefined)>}),
    
/** Top level scope for currently authenticated user. Includes `goals`, `makerGroups`, `makerProjects` & `user` fields. */
viewer: (ViewerPromiseChain & {get: <R extends ViewerRequest>(request: R, defaultValue?: (FieldsSelection<Viewer, R> | undefined)) => Promise<(FieldsSelection<Viewer, R> | undefined)>})
}


/** The query root for Product Hunt API V2 schema */
export interface QueryObservableChain{
    
/** Look up a Collection(only published). */
collection: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => CollectionObservableChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: (FieldsSelection<Collection, R> | undefined)) => Observable<(FieldsSelection<Collection, R> | undefined)>})&(CollectionObservableChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: (FieldsSelection<Collection, R> | undefined)) => Observable<(FieldsSelection<Collection, R> | undefined)>}),
    
/** Look up Collections by various parameters. */
collections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Collections that have the Post with the given ID. */
postId?: (Scalars['ID'] | null),
/** Select Collections that are created by User with the given ID. */
userId?: (Scalars['ID'] | null),
/** Select Collections that have been featured or not featured depending on given value. */
featured?: (Scalars['Boolean'] | null),
/** Define order for the Collections. */
order?: (CollectionsOrder | null)}) => CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>}),
    
/** Look up a Comment. */
comment: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => CommentObservableChain & {get: <R extends CommentRequest>(request: R, defaultValue?: (FieldsSelection<Comment, R> | undefined)) => Observable<(FieldsSelection<Comment, R> | undefined)>}),
    
/** Look up a Goal. */
goal: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>}),
    
/** Look up Goals by various parameters. */
goals: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Goals that are created by User with the given ID. */
userId?: (Scalars['ID'] | null),
/** Select Goals that are created in the MakerGroup(Space) with given ID. */
makerGroupId?: (Scalars['ID'] | null),
/** Select Goals that are created in the MakerProject with given ID. */
makerProjectId?: (Scalars['ID'] | null),
/** Select Goals that have been completed or not completed depending on given value. */
completed?: (Scalars['Boolean'] | null),
/** Define order for the Goals. */
order?: (GoalsOrder | null)}) => GoalConnectionObservableChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Observable<FieldsSelection<GoalConnection, R>>})&(GoalConnectionObservableChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Observable<FieldsSelection<GoalConnection, R>>}),
    
/** Look up a MakerGroup. */
makerGroup: ((args: {
/** ID for the object. */
id: Scalars['ID']}) => MakerGroupObservableChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: (FieldsSelection<MakerGroup, R> | undefined)) => Observable<(FieldsSelection<MakerGroup, R> | undefined)>}),
    
/** Look up MakerGroups by various parameters. */
makerGroups: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select MakerGroups that the User with the given ID is accepted member of. */
userId?: (Scalars['ID'] | null),
/** Define order for the MakerGroups. */
order?: (MakerGroupsOrder | null)}) => MakerGroupConnectionObservableChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Observable<FieldsSelection<MakerGroupConnection, R>>})&(MakerGroupConnectionObservableChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Observable<FieldsSelection<MakerGroupConnection, R>>}),
    
/** Look up a Post. */
post: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => PostObservableChain & {get: <R extends PostRequest>(request: R, defaultValue?: (FieldsSelection<Post, R> | undefined)) => Observable<(FieldsSelection<Post, R> | undefined)>})&(PostObservableChain & {get: <R extends PostRequest>(request: R, defaultValue?: (FieldsSelection<Post, R> | undefined)) => Observable<(FieldsSelection<Post, R> | undefined)>}),
    
/** Look up Posts by various parameters. */
posts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Posts that have been featured or not featured depending on given value. */
featured?: (Scalars['Boolean'] | null),
/** Select Posts which were posted before the given date and time. */
postedBefore?: (Scalars['DateTime'] | null),
/** Select Posts which were posted after the given date and time. */
postedAfter?: (Scalars['DateTime'] | null),
/** Select Posts that have the given slug as one of their topics. */
topic?: (Scalars['String'] | null),
/** Define order for the Posts. */
order?: (PostsOrder | null),
/** Select Posts that have the given twitter url. */
twitterUrl?: (Scalars['String'] | null),
/** Select Posts that have the given url. */
url?: (Scalars['String'] | null)}) => PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>})&(PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>}),
    
/** Look up a Topic. */
topic: ((args?: {
/** ID for the object. */
id?: (Scalars['ID'] | null),
/** URL friendly slug for the object. */
slug?: (Scalars['String'] | null)}) => TopicObservableChain & {get: <R extends TopicRequest>(request: R, defaultValue?: (FieldsSelection<Topic, R> | undefined)) => Observable<(FieldsSelection<Topic, R> | undefined)>})&(TopicObservableChain & {get: <R extends TopicRequest>(request: R, defaultValue?: (FieldsSelection<Topic, R> | undefined)) => Observable<(FieldsSelection<Topic, R> | undefined)>}),
    
/** Look up Topics by various parameters. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Topics that are followed by User with the given ID. */
followedByUserId?: (Scalars['ID'] | null),
/** Select Topics whose name or aliases match the given string */
query?: (Scalars['String'] | null),
/** Define order for the Topics. */
order?: (TopicsOrder | null)}) => TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>})&(TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>}),
    
/** Look up a User. */
user: ((args?: {
/** ID for the user. */
id?: (Scalars['ID'] | null),
/** Username for the user. */
username?: (Scalars['String'] | null)}) => UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Observable<(FieldsSelection<User, R> | undefined)>})&(UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Observable<(FieldsSelection<User, R> | undefined)>}),
    
/** Top level scope for currently authenticated user. Includes `goals`, `makerGroups`, `makerProjects` & `user` fields. */
viewer: (ViewerObservableChain & {get: <R extends ViewerRequest>(request: R, defaultValue?: (FieldsSelection<Viewer, R> | undefined)) => Observable<(FieldsSelection<Viewer, R> | undefined)>})
}


/** A collection of posts. */
export interface CollectionPromiseChain{
    
/** Cover image for the collection. */
coverImage: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when collection was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** Description of the collection in plain text. */
description: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when collection was featured. */
featuredAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Promise<(Scalars['DateTime'] | undefined)>}),
    
/** Number of users following the collection. */
followersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** ID of the collection. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the viewer is following the collection or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Name of the collection. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Lookup posts which are part of the collection. */
posts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>})&(PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>}),
    
/** Tagline of the collection. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>})&(TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>}),
    
/** Public URL of the goal. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** User who created the collection. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>}),
    
/** ID of User who created the collection. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>})
}


/** A collection of posts. */
export interface CollectionObservableChain{
    
/** Cover image for the collection. */
coverImage: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when collection was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** Description of the collection in plain text. */
description: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when collection was featured. */
featuredAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Observable<(Scalars['DateTime'] | undefined)>}),
    
/** Number of users following the collection. */
followersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** ID of the collection. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the viewer is following the collection or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Name of the collection. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Lookup posts which are part of the collection. */
posts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>})&(PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>}),
    
/** Tagline of the collection. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>})&(TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>}),
    
/** Public URL of the goal. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** User who created the collection. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>}),
    
/** ID of User who created the collection. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>})
}


/** An object that can have topics associated with it. */
export interface TopicableInterfacePromiseChain{
    
/** ID of the object. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>})&(TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>})
}


/** An object that can have topics associated with it. */
export interface TopicableInterfaceObservableChain{
    
/** ID of the object. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>})&(TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>})
}


/** The connection type for Topic. */
export interface TopicConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends TopicEdgeRequest>(request: R, defaultValue?: FieldsSelection<TopicEdge, R>[]) => Promise<FieldsSelection<TopicEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Topic. */
export interface TopicConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends TopicEdgeRequest>(request: R, defaultValue?: FieldsSelection<TopicEdge, R>[]) => Observable<FieldsSelection<TopicEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** Information about pagination in a connection. */
export interface PageInfoPromiseChain{
    
/** When paginating forwards, the cursor to continue. */
endCursor: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** When paginating forwards, are there more items? */
hasNextPage: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** When paginating backwards, are there more items? */
hasPreviousPage: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** When paginating backwards, the cursor to continue. */
startCursor: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})
}


/** Information about pagination in a connection. */
export interface PageInfoObservableChain{
    
/** When paginating forwards, the cursor to continue. */
endCursor: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** When paginating forwards, are there more items? */
hasNextPage: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** When paginating backwards, are there more items? */
hasPreviousPage: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** When paginating backwards, the cursor to continue. */
startCursor: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})
}


/** An edge in a connection. */
export interface TopicEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (TopicPromiseChain & {get: <R extends TopicRequest>(request: R, defaultValue?: FieldsSelection<Topic, R>) => Promise<FieldsSelection<Topic, R>>})
}


/** An edge in a connection. */
export interface TopicEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (TopicObservableChain & {get: <R extends TopicRequest>(request: R, defaultValue?: FieldsSelection<Topic, R>) => Observable<FieldsSelection<Topic, R>>})
}


/** A topic. */
export interface TopicPromiseChain{
    
/** Identifies the date and time when topic was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** Description of the topic. */
description: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Number of users who are following the topic. */
followersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** ID of the topic. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Image of the topic. */
image: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Whether the viewer is following the topic or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Name of the topic. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Number of posts that are part of the topic. */
postsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** URL friendly slug of the topic. */
slug: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Public URL of the topic. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}


/** A topic. */
export interface TopicObservableChain{
    
/** Identifies the date and time when topic was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** Description of the topic. */
description: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Number of users who are following the topic. */
followersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** ID of the topic. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Image of the topic. */
image: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Whether the viewer is following the topic or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Name of the topic. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Number of posts that are part of the topic. */
postsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** URL friendly slug of the topic. */
slug: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Public URL of the topic. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** The connection type for Post. */
export interface PostConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends PostEdgeRequest>(request: R, defaultValue?: FieldsSelection<PostEdge, R>[]) => Promise<FieldsSelection<PostEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Post. */
export interface PostConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends PostEdgeRequest>(request: R, defaultValue?: FieldsSelection<PostEdge, R>[]) => Observable<FieldsSelection<PostEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface PostEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (PostPromiseChain & {get: <R extends PostRequest>(request: R, defaultValue?: FieldsSelection<Post, R>) => Promise<FieldsSelection<Post, R>>})
}


/** An edge in a connection. */
export interface PostEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (PostObservableChain & {get: <R extends PostRequest>(request: R, defaultValue?: FieldsSelection<Post, R>) => Observable<FieldsSelection<Post, R>>})
}


/** A post. */
export interface PostPromiseChain{
    
/** Lookup collections which the Post is part of. */
collections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>}),
    
/** Lookup comments on the Post. */
comments: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Define order for the Comments. */
order?: (CommentsOrder | null)}) => CommentConnectionPromiseChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Promise<FieldsSelection<CommentConnection, R>>})&(CommentConnectionPromiseChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Promise<FieldsSelection<CommentConnection, R>>}),
    
/** Number of comments made on the Post. */
commentsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** Identifies the date and time when the Post was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** Description of the Post in plain text. */
description: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when the Post was featured. */
featuredAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Promise<(Scalars['DateTime'] | undefined)>}),
    
/** ID of the Post. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the viewer has added the Post to one of their collections. */
isCollected: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Users who are marked as makers of the Post. */
makers: ({get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>[]) => Promise<FieldsSelection<User, R>[]>}),
    
/** Media items for the Post. */
media: ({get: <R extends MediaRequest>(request: R, defaultValue?: FieldsSelection<Media, R>[]) => Promise<FieldsSelection<Media, R>[]>}),
    
/** Name of the Post. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Additional product links */
productLinks: ({get: <R extends ProductLinkRequest>(request: R, defaultValue?: FieldsSelection<ProductLink, R>[]) => Promise<FieldsSelection<ProductLink, R>[]>}),
    
/** Count of review for the Post */
reviewsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** Aggregate review rating for the Post. */
reviewsRating: ({get: (request?: boolean|number, defaultValue?: Scalars['Float']) => Promise<Scalars['Float']>}),
    
/** URL friendly slug of the Post. */
slug: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Tagline of the Post. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Thumbnail media object of the Post. */
thumbnail: (MediaPromiseChain & {get: <R extends MediaRequest>(request: R, defaultValue?: (FieldsSelection<Media, R> | undefined)) => Promise<(FieldsSelection<Media, R> | undefined)>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>})&(TopicConnectionPromiseChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Promise<FieldsSelection<TopicConnection, R>>}),
    
/** URL of the Post on Product Hunt. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** User who created the Post. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>}),
    
/** ID of User who created the Post. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>})&(VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** URL that redirects to the Post's website. */
website: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}


/** A post. */
export interface PostObservableChain{
    
/** Lookup collections which the Post is part of. */
collections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>}),
    
/** Lookup comments on the Post. */
comments: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Define order for the Comments. */
order?: (CommentsOrder | null)}) => CommentConnectionObservableChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Observable<FieldsSelection<CommentConnection, R>>})&(CommentConnectionObservableChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Observable<FieldsSelection<CommentConnection, R>>}),
    
/** Number of comments made on the Post. */
commentsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** Identifies the date and time when the Post was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** Description of the Post in plain text. */
description: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when the Post was featured. */
featuredAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Observable<(Scalars['DateTime'] | undefined)>}),
    
/** ID of the Post. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the viewer has added the Post to one of their collections. */
isCollected: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Users who are marked as makers of the Post. */
makers: ({get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>[]) => Observable<FieldsSelection<User, R>[]>}),
    
/** Media items for the Post. */
media: ({get: <R extends MediaRequest>(request: R, defaultValue?: FieldsSelection<Media, R>[]) => Observable<FieldsSelection<Media, R>[]>}),
    
/** Name of the Post. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Additional product links */
productLinks: ({get: <R extends ProductLinkRequest>(request: R, defaultValue?: FieldsSelection<ProductLink, R>[]) => Observable<FieldsSelection<ProductLink, R>[]>}),
    
/** Count of review for the Post */
reviewsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** Aggregate review rating for the Post. */
reviewsRating: ({get: (request?: boolean|number, defaultValue?: Scalars['Float']) => Observable<Scalars['Float']>}),
    
/** URL friendly slug of the Post. */
slug: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Tagline of the Post. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Thumbnail media object of the Post. */
thumbnail: (MediaObservableChain & {get: <R extends MediaRequest>(request: R, defaultValue?: (FieldsSelection<Media, R> | undefined)) => Observable<(FieldsSelection<Media, R> | undefined)>}),
    
/** Look up topics that are associated with the object. */
topics: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>})&(TopicConnectionObservableChain & {get: <R extends TopicConnectionRequest>(request: R, defaultValue?: FieldsSelection<TopicConnection, R>) => Observable<FieldsSelection<TopicConnection, R>>}),
    
/** URL of the Post on Product Hunt. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** User who created the Post. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>}),
    
/** ID of User who created the Post. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>})&(VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** URL that redirects to the Post's website. */
website: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** An object which users can vote for. */
export interface VotableInterfacePromiseChain{
    
/** ID of the object */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>})&(VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** An object which users can vote for. */
export interface VotableInterfaceObservableChain{
    
/** ID of the object */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>})&(VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** The connection type for Vote. */
export interface VoteConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends VoteEdgeRequest>(request: R, defaultValue?: FieldsSelection<VoteEdge, R>[]) => Promise<FieldsSelection<VoteEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Vote. */
export interface VoteConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends VoteEdgeRequest>(request: R, defaultValue?: FieldsSelection<VoteEdge, R>[]) => Observable<FieldsSelection<VoteEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface VoteEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (VotePromiseChain & {get: <R extends VoteRequest>(request: R, defaultValue?: FieldsSelection<Vote, R>) => Promise<FieldsSelection<Vote, R>>})
}


/** An edge in a connection. */
export interface VoteEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (VoteObservableChain & {get: <R extends VoteRequest>(request: R, defaultValue?: FieldsSelection<Vote, R>) => Observable<FieldsSelection<Vote, R>>})
}


/** A vote. */
export interface VotePromiseChain{
    
/** Identifies the date and time when Vote was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** ID of the Vote. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** User who created the Vote. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>}),
    
/** ID of User who created the Vote. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>})
}


/** A vote. */
export interface VoteObservableChain{
    
/** Identifies the date and time when Vote was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** ID of the Vote. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** User who created the Vote. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>}),
    
/** ID of User who created the Vote. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>})
}


/** A user. */
export interface UserPromiseChain{
    
/** Cover image of the user. */
coverImage: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when user was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** Look up collections that the user is following. */
followedCollections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionPromiseChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Promise<FieldsSelection<CollectionConnection, R>>}),
    
/** Look up other users who are following the user. */
followers: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => UserConnectionPromiseChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Promise<FieldsSelection<UserConnection, R>>})&(UserConnectionPromiseChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Promise<FieldsSelection<UserConnection, R>>}),
    
/** Look up other users who are being followed by the user. */
following: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => UserConnectionPromiseChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Promise<FieldsSelection<UserConnection, R>>})&(UserConnectionPromiseChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Promise<FieldsSelection<UserConnection, R>>}),
    
/** Headline text of the user. */
headline: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** ID of the user. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the viewer is following the user or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Whether the user is an accepted maker or not. */
isMaker: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Whether the user is same as the viewer of the API. */
isViewer: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Look up posts that the user has made. */
madePosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>})&(PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>}),
    
/** Name of the user. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Profile image of the user. */
profileImage: ((args?: {size?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Look up posts that the user has submitted. */
submittedPosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>})&(PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>}),
    
/** Twitter username of the user. */
twitterUsername: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Public URL of the user's profile */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Username of the user. */
username: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Look up posts that the user has voted for. */
votedPosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>})&(PostConnectionPromiseChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Promise<FieldsSelection<PostConnection, R>>}),
    
/** URL for the user's website */
websiteUrl: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})
}


/** A user. */
export interface UserObservableChain{
    
/** Cover image of the user. */
coverImage: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Identifies the date and time when user was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** Look up collections that the user is following. */
followedCollections: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>})&(CollectionConnectionObservableChain & {get: <R extends CollectionConnectionRequest>(request: R, defaultValue?: FieldsSelection<CollectionConnection, R>) => Observable<FieldsSelection<CollectionConnection, R>>}),
    
/** Look up other users who are following the user. */
followers: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => UserConnectionObservableChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Observable<FieldsSelection<UserConnection, R>>})&(UserConnectionObservableChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Observable<FieldsSelection<UserConnection, R>>}),
    
/** Look up other users who are being followed by the user. */
following: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => UserConnectionObservableChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Observable<FieldsSelection<UserConnection, R>>})&(UserConnectionObservableChain & {get: <R extends UserConnectionRequest>(request: R, defaultValue?: FieldsSelection<UserConnection, R>) => Observable<FieldsSelection<UserConnection, R>>}),
    
/** Headline text of the user. */
headline: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** ID of the user. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the viewer is following the user or not. */
isFollowing: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Whether the user is an accepted maker or not. */
isMaker: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Whether the user is same as the viewer of the API. */
isViewer: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Look up posts that the user has made. */
madePosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>})&(PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>}),
    
/** Name of the user. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Profile image of the user. */
profileImage: ((args?: {size?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Look up posts that the user has submitted. */
submittedPosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>})&(PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>}),
    
/** Twitter username of the user. */
twitterUsername: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Public URL of the user's profile */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Username of the user. */
username: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Look up posts that the user has voted for. */
votedPosts: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>})&(PostConnectionObservableChain & {get: <R extends PostConnectionRequest>(request: R, defaultValue?: FieldsSelection<PostConnection, R>) => Observable<FieldsSelection<PostConnection, R>>}),
    
/** URL for the user's website */
websiteUrl: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})
}


/** The connection type for Collection. */
export interface CollectionConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends CollectionEdgeRequest>(request: R, defaultValue?: FieldsSelection<CollectionEdge, R>[]) => Promise<FieldsSelection<CollectionEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Collection. */
export interface CollectionConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends CollectionEdgeRequest>(request: R, defaultValue?: FieldsSelection<CollectionEdge, R>[]) => Observable<FieldsSelection<CollectionEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface CollectionEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (CollectionPromiseChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: FieldsSelection<Collection, R>) => Promise<FieldsSelection<Collection, R>>})
}


/** An edge in a connection. */
export interface CollectionEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (CollectionObservableChain & {get: <R extends CollectionRequest>(request: R, defaultValue?: FieldsSelection<Collection, R>) => Observable<FieldsSelection<Collection, R>>})
}


/** The connection type for User. */
export interface UserConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends UserEdgeRequest>(request: R, defaultValue?: FieldsSelection<UserEdge, R>[]) => Promise<FieldsSelection<UserEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for User. */
export interface UserConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends UserEdgeRequest>(request: R, defaultValue?: FieldsSelection<UserEdge, R>[]) => Observable<FieldsSelection<UserEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface UserEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>})
}


/** An edge in a connection. */
export interface UserEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>})
}


/** The connection type for Comment. */
export interface CommentConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends CommentEdgeRequest>(request: R, defaultValue?: FieldsSelection<CommentEdge, R>[]) => Promise<FieldsSelection<CommentEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Comment. */
export interface CommentConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends CommentEdgeRequest>(request: R, defaultValue?: FieldsSelection<CommentEdge, R>[]) => Observable<FieldsSelection<CommentEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface CommentEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (CommentPromiseChain & {get: <R extends CommentRequest>(request: R, defaultValue?: FieldsSelection<Comment, R>) => Promise<FieldsSelection<Comment, R>>})
}


/** An edge in a connection. */
export interface CommentEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (CommentObservableChain & {get: <R extends CommentRequest>(request: R, defaultValue?: FieldsSelection<Comment, R>) => Observable<FieldsSelection<Comment, R>>})
}


/** A comment posted by a User. */
export interface CommentPromiseChain{
    
/** Body of the comment. */
body: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Identifies the date and time when comment was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** ID of the comment. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Comment on which this comment was posted(null in case of top level comments). */
parent: (CommentPromiseChain & {get: <R extends CommentRequest>(request: R, defaultValue?: (FieldsSelection<Comment, R> | undefined)) => Promise<(FieldsSelection<Comment, R> | undefined)>}),
    
/** ID of Comment on which this comment was posted(null in case of top level comments). */
parentId: ({get: (request?: boolean|number, defaultValue?: (Scalars['ID'] | undefined)) => Promise<(Scalars['ID'] | undefined)>}),
    
/** Lookup comments that were posted on the comment itself. */
replies: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Define order for the Comments. */
order?: (CommentsOrder | null)}) => CommentConnectionPromiseChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Promise<FieldsSelection<CommentConnection, R>>})&(CommentConnectionPromiseChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Promise<FieldsSelection<CommentConnection, R>>}),
    
/** Public URL of the comment. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** User who posted the comment. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>}),
    
/** ID of User who posted the comment. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>})&(VoteConnectionPromiseChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Promise<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** A comment posted by a User. */
export interface CommentObservableChain{
    
/** Body of the comment. */
body: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Identifies the date and time when comment was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** ID of the comment. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the Viewer has voted for the object or not. */
isVoted: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Comment on which this comment was posted(null in case of top level comments). */
parent: (CommentObservableChain & {get: <R extends CommentRequest>(request: R, defaultValue?: (FieldsSelection<Comment, R> | undefined)) => Observable<(FieldsSelection<Comment, R> | undefined)>}),
    
/** ID of Comment on which this comment was posted(null in case of top level comments). */
parentId: ({get: (request?: boolean|number, defaultValue?: (Scalars['ID'] | undefined)) => Observable<(Scalars['ID'] | undefined)>}),
    
/** Lookup comments that were posted on the comment itself. */
replies: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Define order for the Comments. */
order?: (CommentsOrder | null)}) => CommentConnectionObservableChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Observable<FieldsSelection<CommentConnection, R>>})&(CommentConnectionObservableChain & {get: <R extends CommentConnectionRequest>(request: R, defaultValue?: FieldsSelection<CommentConnection, R>) => Observable<FieldsSelection<CommentConnection, R>>}),
    
/** Public URL of the comment. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** User who posted the comment. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>}),
    
/** ID of User who posted the comment. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    votes: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Votes which were created after the given date and time. */
createdAfter?: (Scalars['DateTime'] | null),
/** Select Votes which were created before the given date and time. */
createdBefore?: (Scalars['DateTime'] | null)}) => VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>})&(VoteConnectionObservableChain & {get: <R extends VoteConnectionRequest>(request: R, defaultValue?: FieldsSelection<VoteConnection, R>) => Observable<FieldsSelection<VoteConnection, R>>}),
    
/** Number of votes that the object has currently. */
votesCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** A media object. */
export interface MediaPromiseChain{
    
/** Type of media object. */
type: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Public URL for the media object. Incase of videos this URL represents thumbnail generated from video. */
url: ((args?: {
/** Set width of the image to given value. */
width?: (Scalars['Int'] | null),
/** Set height of the image to given value. */
height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})&({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Video URL of the media object. */
videoUrl: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})
}


/** A media object. */
export interface MediaObservableChain{
    
/** Type of media object. */
type: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Public URL for the media object. Incase of videos this URL represents thumbnail generated from video. */
url: ((args?: {
/** Set width of the image to given value. */
width?: (Scalars['Int'] | null),
/** Set height of the image to given value. */
height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})&({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Video URL of the media object. */
videoUrl: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})
}


/** Product link from a post. */
export interface ProductLinkPromiseChain{
    type: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}


/** Product link from a post. */
export interface ProductLinkObservableChain{
    type: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** A goal created by maker. */
export interface GoalPromiseChain{
    
/** Number of cheers on the Goal. */
cheerCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** Identifies the date and time when goal was marked as completed. */
completedAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Promise<(Scalars['DateTime'] | undefined)>}),
    
/** Identifies the date and time when goal was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Promise<Scalars['DateTime']>}),
    
/** Whether the goal is user's current goal or not. */
current: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Identifies the date and time until the goal is user's current goal. */
currentUntil: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Promise<(Scalars['DateTime'] | undefined)>}),
    
/** Identifies the date and time when goal is due. */
dueAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Promise<(Scalars['DateTime'] | undefined)>}),
    
/** Total time spent in focus mode in seconds, starts at 0 */
focusedDuration: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** Maker group to which the goal belongs to. */
group: (MakerGroupPromiseChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: FieldsSelection<MakerGroup, R>) => Promise<FieldsSelection<MakerGroup, R>>}),
    
/** ID of Maker group to which the goal belongs to. */
groupId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** ID of the goal. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether the Viewer has cheered the goal or not. */
isCheered: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Maker project to which the goal belongs to. */
project: (MakerProjectPromiseChain & {get: <R extends MakerProjectRequest>(request: R, defaultValue?: (FieldsSelection<MakerProject, R> | undefined)) => Promise<(FieldsSelection<MakerProject, R> | undefined)>}),
    
/** Title of the goal in plain text */
title: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Public URL of the goal. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** User who created the goal. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>}),
    
/** ID of User who created the goal. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>})
}


/** A goal created by maker. */
export interface GoalObservableChain{
    
/** Number of cheers on the Goal. */
cheerCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** Identifies the date and time when goal was marked as completed. */
completedAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Observable<(Scalars['DateTime'] | undefined)>}),
    
/** Identifies the date and time when goal was created. */
createdAt: ({get: (request?: boolean|number, defaultValue?: Scalars['DateTime']) => Observable<Scalars['DateTime']>}),
    
/** Whether the goal is user's current goal or not. */
current: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Identifies the date and time until the goal is user's current goal. */
currentUntil: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Observable<(Scalars['DateTime'] | undefined)>}),
    
/** Identifies the date and time when goal is due. */
dueAt: ({get: (request?: boolean|number, defaultValue?: (Scalars['DateTime'] | undefined)) => Observable<(Scalars['DateTime'] | undefined)>}),
    
/** Total time spent in focus mode in seconds, starts at 0 */
focusedDuration: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** Maker group to which the goal belongs to. */
group: (MakerGroupObservableChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: FieldsSelection<MakerGroup, R>) => Observable<FieldsSelection<MakerGroup, R>>}),
    
/** ID of Maker group to which the goal belongs to. */
groupId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** ID of the goal. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether the Viewer has cheered the goal or not. */
isCheered: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Maker project to which the goal belongs to. */
project: (MakerProjectObservableChain & {get: <R extends MakerProjectRequest>(request: R, defaultValue?: (FieldsSelection<MakerProject, R> | undefined)) => Observable<(FieldsSelection<MakerProject, R> | undefined)>}),
    
/** Title of the goal in plain text */
title: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Public URL of the goal. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** User who created the goal. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>}),
    
/** ID of User who created the goal. */
userId: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>})
}


/** A maker project. */
export interface MakerProjectPromiseChain{
    
/** ID of the MakerProject. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Image of the MakerProject. */
image: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    
/** Whether the MakerProject owner is looking for other makers or not. */
lookingForOtherMakers: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** ID of the MakerProject. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Tagline of the MakerProject. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** URL of the MakerProject. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}


/** A maker project. */
export interface MakerProjectObservableChain{
    
/** ID of the MakerProject. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Image of the MakerProject. */
image: ((args?: {width?: (Scalars['Int'] | null),height?: (Scalars['Int'] | null)}) => {get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>})&({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    
/** Whether the MakerProject owner is looking for other makers or not. */
lookingForOtherMakers: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** ID of the MakerProject. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Tagline of the MakerProject. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** URL of the MakerProject. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** A group of makers, also known as Spaces on PH. */
export interface MakerGroupPromiseChain{
    
/** Description of the MakerGroup. */
description: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Number of goals that have been created in the MakerGroup. */
goalsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** ID of the MakerGroup. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Promise<Scalars['ID']>}),
    
/** Whether Viewer is member of the MakerGroup or not. */
isMember: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Promise<Scalars['Boolean']>}),
    
/** Number of users who are part of the MakerGroup. */
membersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>}),
    
/** Name of the MakerGroup. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Tagline of the MakerGroup. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** URL of the MakerGroup. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}


/** A group of makers, also known as Spaces on PH. */
export interface MakerGroupObservableChain{
    
/** Description of the MakerGroup. */
description: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Number of goals that have been created in the MakerGroup. */
goalsCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** ID of the MakerGroup. */
id: ({get: (request?: boolean|number, defaultValue?: Scalars['ID']) => Observable<Scalars['ID']>}),
    
/** Whether Viewer is member of the MakerGroup or not. */
isMember: ({get: (request?: boolean|number, defaultValue?: Scalars['Boolean']) => Observable<Scalars['Boolean']>}),
    
/** Number of users who are part of the MakerGroup. */
membersCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>}),
    
/** Name of the MakerGroup. */
name: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Tagline of the MakerGroup. */
tagline: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** URL of the MakerGroup. */
url: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** The connection type for Goal. */
export interface GoalConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends GoalEdgeRequest>(request: R, defaultValue?: FieldsSelection<GoalEdge, R>[]) => Promise<FieldsSelection<GoalEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for Goal. */
export interface GoalConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends GoalEdgeRequest>(request: R, defaultValue?: FieldsSelection<GoalEdge, R>[]) => Observable<FieldsSelection<GoalEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface GoalEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: FieldsSelection<Goal, R>) => Promise<FieldsSelection<Goal, R>>})
}


/** An edge in a connection. */
export interface GoalEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: FieldsSelection<Goal, R>) => Observable<FieldsSelection<Goal, R>>})
}


/** The connection type for MakerGroup. */
export interface MakerGroupConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends MakerGroupEdgeRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupEdge, R>[]) => Promise<FieldsSelection<MakerGroupEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for MakerGroup. */
export interface MakerGroupConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends MakerGroupEdgeRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupEdge, R>[]) => Observable<FieldsSelection<MakerGroupEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface MakerGroupEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (MakerGroupPromiseChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: FieldsSelection<MakerGroup, R>) => Promise<FieldsSelection<MakerGroup, R>>})
}


/** An edge in a connection. */
export interface MakerGroupEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (MakerGroupObservableChain & {get: <R extends MakerGroupRequest>(request: R, defaultValue?: FieldsSelection<MakerGroup, R>) => Observable<FieldsSelection<MakerGroup, R>>})
}


/** Top level scope for the user in whose context the API is running. */
export interface ViewerPromiseChain{
    
/** Look up goals of the viewer. */
goals: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Goals which are set as current or not current depending on given value. */
current?: (Scalars['Boolean'] | null),
/** Define order for the Goals. */
order?: (GoalsOrder | null)}) => GoalConnectionPromiseChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Promise<FieldsSelection<GoalConnection, R>>})&(GoalConnectionPromiseChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Promise<FieldsSelection<GoalConnection, R>>}),
    
/** Look up maker groups the viewer is accepted member of. */
makerGroups: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => MakerGroupConnectionPromiseChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Promise<FieldsSelection<MakerGroupConnection, R>>})&(MakerGroupConnectionPromiseChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Promise<FieldsSelection<MakerGroupConnection, R>>}),
    
/** Look up maker projects the viewer is a maintainer(either created or maintained by) of. */
makerProjects: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => MakerProjectConnectionPromiseChain & {get: <R extends MakerProjectConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectConnection, R>) => Promise<FieldsSelection<MakerProjectConnection, R>>})&(MakerProjectConnectionPromiseChain & {get: <R extends MakerProjectConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectConnection, R>) => Promise<FieldsSelection<MakerProjectConnection, R>>}),
    
/** User who is the viewer of the API. */
user: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Promise<FieldsSelection<User, R>>})
}


/** Top level scope for the user in whose context the API is running. */
export interface ViewerObservableChain{
    
/** Look up goals of the viewer. */
goals: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null),
/** Select Goals which are set as current or not current depending on given value. */
current?: (Scalars['Boolean'] | null),
/** Define order for the Goals. */
order?: (GoalsOrder | null)}) => GoalConnectionObservableChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Observable<FieldsSelection<GoalConnection, R>>})&(GoalConnectionObservableChain & {get: <R extends GoalConnectionRequest>(request: R, defaultValue?: FieldsSelection<GoalConnection, R>) => Observable<FieldsSelection<GoalConnection, R>>}),
    
/** Look up maker groups the viewer is accepted member of. */
makerGroups: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => MakerGroupConnectionObservableChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Observable<FieldsSelection<MakerGroupConnection, R>>})&(MakerGroupConnectionObservableChain & {get: <R extends MakerGroupConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerGroupConnection, R>) => Observable<FieldsSelection<MakerGroupConnection, R>>}),
    
/** Look up maker projects the viewer is a maintainer(either created or maintained by) of. */
makerProjects: ((args?: {
/** Returns the first _n_ elements from the list. */
first?: (Scalars['Int'] | null),
/** Returns the elements in the list that come after the specified cursor. */
after?: (Scalars['String'] | null),
/** Returns the last _n_ elements from the list. */
last?: (Scalars['Int'] | null),
/** Returns the elements in the list that come before the specified cursor. */
before?: (Scalars['String'] | null)}) => MakerProjectConnectionObservableChain & {get: <R extends MakerProjectConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectConnection, R>) => Observable<FieldsSelection<MakerProjectConnection, R>>})&(MakerProjectConnectionObservableChain & {get: <R extends MakerProjectConnectionRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectConnection, R>) => Observable<FieldsSelection<MakerProjectConnection, R>>}),
    
/** User who is the viewer of the API. */
user: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: FieldsSelection<User, R>) => Observable<FieldsSelection<User, R>>})
}


/** The connection type for MakerProject. */
export interface MakerProjectConnectionPromiseChain{
    
/** A list of edges. */
edges: ({get: <R extends MakerProjectEdgeRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectEdge, R>[]) => Promise<FieldsSelection<MakerProjectEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoPromiseChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Promise<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Promise<Scalars['Int']>})
}


/** The connection type for MakerProject. */
export interface MakerProjectConnectionObservableChain{
    
/** A list of edges. */
edges: ({get: <R extends MakerProjectEdgeRequest>(request: R, defaultValue?: FieldsSelection<MakerProjectEdge, R>[]) => Observable<FieldsSelection<MakerProjectEdge, R>[]>}),
    
/** Information to aid in pagination. */
pageInfo: (PageInfoObservableChain & {get: <R extends PageInfoRequest>(request: R, defaultValue?: FieldsSelection<PageInfo, R>) => Observable<FieldsSelection<PageInfo, R>>}),
    
/** Total number of objects returned from this query */
totalCount: ({get: (request?: boolean|number, defaultValue?: Scalars['Int']) => Observable<Scalars['Int']>})
}


/** An edge in a connection. */
export interface MakerProjectEdgePromiseChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (MakerProjectPromiseChain & {get: <R extends MakerProjectRequest>(request: R, defaultValue?: FieldsSelection<MakerProject, R>) => Promise<FieldsSelection<MakerProject, R>>})
}


/** An edge in a connection. */
export interface MakerProjectEdgeObservableChain{
    
/** A cursor for use in pagination. */
cursor: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** The item at the end of the edge. */
node: (MakerProjectObservableChain & {get: <R extends MakerProjectRequest>(request: R, defaultValue?: FieldsSelection<MakerProject, R>) => Observable<FieldsSelection<MakerProject, R>>})
}

export interface MutationPromiseChain{
    
/** Cheer a Goal as Viewer. Returns the cheered Goal */
goalCheer: ((args: {input: GoalCheerInput}) => GoalCheerPayloadPromiseChain & {get: <R extends GoalCheerPayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCheerPayload, R>) => Promise<FieldsSelection<GoalCheerPayload, R>>}),
    
/** Cheer a Goal as Viewer. Returns the cheered Goal */
goalCheerUndo: ((args: {input: GoalCheerUndoInput}) => GoalCheerUndoPayloadPromiseChain & {get: <R extends GoalCheerUndoPayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCheerUndoPayload, R>) => Promise<FieldsSelection<GoalCheerUndoPayload, R>>}),
    
/** Create a Goal for Viewer. Returns the created Goal. */
goalCreate: ((args: {input: GoalCreateInput}) => GoalCreatePayloadPromiseChain & {get: <R extends GoalCreatePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCreatePayload, R>) => Promise<FieldsSelection<GoalCreatePayload, R>>}),
    
/** Marks a Goal as complete. Returns the updated Goal */
goalMarkAsComplete: ((args: {input: GoalMarkAsCompleteInput}) => GoalMarkAsCompletePayloadPromiseChain & {get: <R extends GoalMarkAsCompletePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalMarkAsCompletePayload, R>) => Promise<FieldsSelection<GoalMarkAsCompletePayload, R>>}),
    
/** Marks a Goal as incomplete. Returns the updated Goal. */
goalMarkAsIncomplete: ((args: {input: GoalMarkAsIncompleteInput}) => GoalMarkAsIncompletePayloadPromiseChain & {get: <R extends GoalMarkAsIncompletePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalMarkAsIncompletePayload, R>) => Promise<FieldsSelection<GoalMarkAsIncompletePayload, R>>}),
    
/** Update a Goal's `due_at`, `title`, `group` fields. Returns the updated Goal. */
goalUpdate: ((args: {input: GoalUpdateInput}) => GoalUpdatePayloadPromiseChain & {get: <R extends GoalUpdatePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalUpdatePayload, R>) => Promise<FieldsSelection<GoalUpdatePayload, R>>}),
    
/** Follow a User as Viewer. Returns the followed User. */
userFollow: ((args: {input: UserFollowInput}) => UserFollowPayloadPromiseChain & {get: <R extends UserFollowPayloadRequest>(request: R, defaultValue?: FieldsSelection<UserFollowPayload, R>) => Promise<FieldsSelection<UserFollowPayload, R>>}),
    
/** Stop following a User as Viewer. Returns the un-followed User. */
userFollowUndo: ((args: {input: UserFollowUndoInput}) => UserFollowUndoPayloadPromiseChain & {get: <R extends UserFollowUndoPayloadRequest>(request: R, defaultValue?: FieldsSelection<UserFollowUndoPayload, R>) => Promise<FieldsSelection<UserFollowUndoPayload, R>>})
}

export interface MutationObservableChain{
    
/** Cheer a Goal as Viewer. Returns the cheered Goal */
goalCheer: ((args: {input: GoalCheerInput}) => GoalCheerPayloadObservableChain & {get: <R extends GoalCheerPayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCheerPayload, R>) => Observable<FieldsSelection<GoalCheerPayload, R>>}),
    
/** Cheer a Goal as Viewer. Returns the cheered Goal */
goalCheerUndo: ((args: {input: GoalCheerUndoInput}) => GoalCheerUndoPayloadObservableChain & {get: <R extends GoalCheerUndoPayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCheerUndoPayload, R>) => Observable<FieldsSelection<GoalCheerUndoPayload, R>>}),
    
/** Create a Goal for Viewer. Returns the created Goal. */
goalCreate: ((args: {input: GoalCreateInput}) => GoalCreatePayloadObservableChain & {get: <R extends GoalCreatePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalCreatePayload, R>) => Observable<FieldsSelection<GoalCreatePayload, R>>}),
    
/** Marks a Goal as complete. Returns the updated Goal */
goalMarkAsComplete: ((args: {input: GoalMarkAsCompleteInput}) => GoalMarkAsCompletePayloadObservableChain & {get: <R extends GoalMarkAsCompletePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalMarkAsCompletePayload, R>) => Observable<FieldsSelection<GoalMarkAsCompletePayload, R>>}),
    
/** Marks a Goal as incomplete. Returns the updated Goal. */
goalMarkAsIncomplete: ((args: {input: GoalMarkAsIncompleteInput}) => GoalMarkAsIncompletePayloadObservableChain & {get: <R extends GoalMarkAsIncompletePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalMarkAsIncompletePayload, R>) => Observable<FieldsSelection<GoalMarkAsIncompletePayload, R>>}),
    
/** Update a Goal's `due_at`, `title`, `group` fields. Returns the updated Goal. */
goalUpdate: ((args: {input: GoalUpdateInput}) => GoalUpdatePayloadObservableChain & {get: <R extends GoalUpdatePayloadRequest>(request: R, defaultValue?: FieldsSelection<GoalUpdatePayload, R>) => Observable<FieldsSelection<GoalUpdatePayload, R>>}),
    
/** Follow a User as Viewer. Returns the followed User. */
userFollow: ((args: {input: UserFollowInput}) => UserFollowPayloadObservableChain & {get: <R extends UserFollowPayloadRequest>(request: R, defaultValue?: FieldsSelection<UserFollowPayload, R>) => Observable<FieldsSelection<UserFollowPayload, R>>}),
    
/** Stop following a User as Viewer. Returns the un-followed User. */
userFollowUndo: ((args: {input: UserFollowUndoInput}) => UserFollowUndoPayloadObservableChain & {get: <R extends UserFollowUndoPayloadRequest>(request: R, defaultValue?: FieldsSelection<UserFollowUndoPayload, R>) => Observable<FieldsSelection<UserFollowUndoPayload, R>>})
}


/** Autogenerated return type of GoalCheer */
export interface GoalCheerPayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalCheer */
export interface GoalCheerPayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}

export interface ErrorPromiseChain{
    
/** Field for which the error occurred. */
field: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>}),
    
/** Error message. */
message: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Promise<Scalars['String']>})
}

export interface ErrorObservableChain{
    
/** Field for which the error occurred. */
field: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>}),
    
/** Error message. */
message: ({get: (request?: boolean|number, defaultValue?: Scalars['String']) => Observable<Scalars['String']>})
}


/** Autogenerated return type of GoalCheerUndo */
export interface GoalCheerUndoPayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalCheerUndo */
export interface GoalCheerUndoPayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalCreate */
export interface GoalCreatePayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalCreate */
export interface GoalCreatePayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalMarkAsComplete */
export interface GoalMarkAsCompletePayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalMarkAsComplete */
export interface GoalMarkAsCompletePayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalMarkAsIncomplete */
export interface GoalMarkAsIncompletePayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalMarkAsIncomplete */
export interface GoalMarkAsIncompletePayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalUpdate */
export interface GoalUpdatePayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (GoalPromiseChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Promise<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of GoalUpdate */
export interface GoalUpdatePayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (GoalObservableChain & {get: <R extends GoalRequest>(request: R, defaultValue?: (FieldsSelection<Goal, R> | undefined)) => Observable<(FieldsSelection<Goal, R> | undefined)>})
}


/** Autogenerated return type of UserFollow */
export interface UserFollowPayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Promise<(FieldsSelection<User, R> | undefined)>})
}


/** Autogenerated return type of UserFollow */
export interface UserFollowPayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Observable<(FieldsSelection<User, R> | undefined)>})
}


/** Autogenerated return type of UserFollowUndo */
export interface UserFollowUndoPayloadPromiseChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Promise<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Promise<FieldsSelection<Error, R>[]>}),
    node: (UserPromiseChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Promise<(FieldsSelection<User, R> | undefined)>})
}


/** Autogenerated return type of UserFollowUndo */
export interface UserFollowUndoPayloadObservableChain{
    
/** A unique identifier for the client performing the mutation. */
clientMutationId: ({get: (request?: boolean|number, defaultValue?: (Scalars['String'] | undefined)) => Observable<(Scalars['String'] | undefined)>}),
    errors: ({get: <R extends ErrorRequest>(request: R, defaultValue?: FieldsSelection<Error, R>[]) => Observable<FieldsSelection<Error, R>[]>}),
    node: (UserObservableChain & {get: <R extends UserRequest>(request: R, defaultValue?: (FieldsSelection<User, R> | undefined)) => Observable<(FieldsSelection<User, R> | undefined)>})
}