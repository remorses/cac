export default {
    "scalars": [
        0,
        1,
        5,
        8,
        11,
        24,
        28,
        31,
        37,
        40,
        41,
        42
    ],
    "types": {
        "Boolean": {},
        "String": {},
        "Query": {
            "collection": [
                3,
                {
                    "id": [
                        5
                    ],
                    "slug": [
                        1
                    ]
                }
            ],
            "collections": [
                20,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "postId": [
                        5
                    ],
                    "userId": [
                        5
                    ],
                    "featured": [
                        0
                    ],
                    "order": [
                        31
                    ]
                }
            ],
            "comment": [
                27,
                {
                    "id": [
                        5,
                        "ID!"
                    ]
                }
            ],
            "goal": [
                32,
                {
                    "id": [
                        5,
                        "ID!"
                    ]
                }
            ],
            "goals": [
                35,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "userId": [
                        5
                    ],
                    "makerGroupId": [
                        5
                    ],
                    "makerProjectId": [
                        5
                    ],
                    "completed": [
                        0
                    ],
                    "order": [
                        37
                    ]
                }
            ],
            "makerGroup": [
                34,
                {
                    "id": [
                        5,
                        "ID!"
                    ]
                }
            ],
            "makerGroups": [
                38,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "userId": [
                        5
                    ],
                    "order": [
                        40
                    ]
                }
            ],
            "post": [
                14,
                {
                    "id": [
                        5
                    ],
                    "slug": [
                        1
                    ]
                }
            ],
            "posts": [
                12,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "featured": [
                        0
                    ],
                    "postedBefore": [
                        11
                    ],
                    "postedAfter": [
                        11
                    ],
                    "topic": [
                        1
                    ],
                    "order": [
                        41
                    ],
                    "twitterUrl": [
                        1
                    ],
                    "url": [
                        1
                    ]
                }
            ],
            "topic": [
                10,
                {
                    "id": [
                        5
                    ],
                    "slug": [
                        1
                    ]
                }
            ],
            "topics": [
                6,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "followedByUserId": [
                        5
                    ],
                    "query": [
                        1
                    ],
                    "order": [
                        42
                    ]
                }
            ],
            "user": [
                19,
                {
                    "id": [
                        5
                    ],
                    "username": [
                        1
                    ]
                }
            ],
            "viewer": [
                43
            ],
            "__typename": [
                1
            ]
        },
        "Collection": {
            "coverImage": [
                1,
                {
                    "width": [
                        8
                    ],
                    "height": [
                        8
                    ]
                }
            ],
            "createdAt": [
                11
            ],
            "description": [
                1
            ],
            "featuredAt": [
                11
            ],
            "followersCount": [
                8
            ],
            "id": [
                5
            ],
            "isFollowing": [
                0
            ],
            "name": [
                1
            ],
            "posts": [
                12,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "tagline": [
                1
            ],
            "topics": [
                6,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "url": [
                1
            ],
            "user": [
                19
            ],
            "userId": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "TopicableInterface": {
            "id": [
                5
            ],
            "topics": [
                6,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "on_Collection": [
                3
            ],
            "on_Post": [
                14
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "TopicConnection": {
            "edges": [
                9
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                0
            ],
            "hasPreviousPage": [
                0
            ],
            "startCursor": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "TopicEdge": {
            "cursor": [
                1
            ],
            "node": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Topic": {
            "createdAt": [
                11
            ],
            "description": [
                1
            ],
            "followersCount": [
                8
            ],
            "id": [
                5
            ],
            "image": [
                1,
                {
                    "width": [
                        8
                    ],
                    "height": [
                        8
                    ]
                }
            ],
            "isFollowing": [
                0
            ],
            "name": [
                1
            ],
            "postsCount": [
                8
            ],
            "slug": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DateTime": {},
        "PostConnection": {
            "edges": [
                13
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PostEdge": {
            "cursor": [
                1
            ],
            "node": [
                14
            ],
            "__typename": [
                1
            ]
        },
        "Post": {
            "collections": [
                20,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "comments": [
                25,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "order": [
                        28
                    ]
                }
            ],
            "commentsCount": [
                8
            ],
            "createdAt": [
                11
            ],
            "description": [
                1
            ],
            "featuredAt": [
                11
            ],
            "id": [
                5
            ],
            "isCollected": [
                0
            ],
            "isVoted": [
                0
            ],
            "makers": [
                19
            ],
            "media": [
                29
            ],
            "name": [
                1
            ],
            "productLinks": [
                30
            ],
            "reviewsCount": [
                8
            ],
            "reviewsRating": [
                24
            ],
            "slug": [
                1
            ],
            "tagline": [
                1
            ],
            "thumbnail": [
                29
            ],
            "topics": [
                6,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "url": [
                1
            ],
            "user": [
                19
            ],
            "userId": [
                5
            ],
            "votes": [
                16,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "createdAfter": [
                        11
                    ],
                    "createdBefore": [
                        11
                    ]
                }
            ],
            "votesCount": [
                8
            ],
            "website": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "VotableInterface": {
            "id": [
                5
            ],
            "isVoted": [
                0
            ],
            "votes": [
                16,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "createdAfter": [
                        11
                    ],
                    "createdBefore": [
                        11
                    ]
                }
            ],
            "votesCount": [
                8
            ],
            "on_Post": [
                14
            ],
            "on_Comment": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "VoteConnection": {
            "edges": [
                17
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "VoteEdge": {
            "cursor": [
                1
            ],
            "node": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "Vote": {
            "createdAt": [
                11
            ],
            "id": [
                5
            ],
            "user": [
                19
            ],
            "userId": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "coverImage": [
                1,
                {
                    "width": [
                        8
                    ],
                    "height": [
                        8
                    ]
                }
            ],
            "createdAt": [
                11
            ],
            "followedCollections": [
                20,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "followers": [
                22,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "following": [
                22,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "headline": [
                1
            ],
            "id": [
                5
            ],
            "isFollowing": [
                0
            ],
            "isMaker": [
                0
            ],
            "isViewer": [
                0
            ],
            "madePosts": [
                12,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "name": [
                1
            ],
            "profileImage": [
                1,
                {
                    "size": [
                        8
                    ]
                }
            ],
            "submittedPosts": [
                12,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "twitterUsername": [
                1
            ],
            "url": [
                1
            ],
            "username": [
                1
            ],
            "votedPosts": [
                12,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "websiteUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CollectionConnection": {
            "edges": [
                21
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CollectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UserConnection": {
            "edges": [
                23
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UserEdge": {
            "cursor": [
                1
            ],
            "node": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "CommentConnection": {
            "edges": [
                26
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CommentEdge": {
            "cursor": [
                1
            ],
            "node": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "Comment": {
            "body": [
                1
            ],
            "createdAt": [
                11
            ],
            "id": [
                5
            ],
            "isVoted": [
                0
            ],
            "parent": [
                27
            ],
            "parentId": [
                5
            ],
            "replies": [
                25,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "order": [
                        28
                    ]
                }
            ],
            "url": [
                1
            ],
            "user": [
                19
            ],
            "userId": [
                5
            ],
            "votes": [
                16,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "createdAfter": [
                        11
                    ],
                    "createdBefore": [
                        11
                    ]
                }
            ],
            "votesCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CommentsOrder": {},
        "Media": {
            "type": [
                1
            ],
            "url": [
                1,
                {
                    "width": [
                        8
                    ],
                    "height": [
                        8
                    ]
                }
            ],
            "videoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ProductLink": {
            "type": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CollectionsOrder": {},
        "Goal": {
            "cheerCount": [
                8
            ],
            "completedAt": [
                11
            ],
            "createdAt": [
                11
            ],
            "current": [
                0
            ],
            "currentUntil": [
                11
            ],
            "dueAt": [
                11
            ],
            "focusedDuration": [
                8
            ],
            "group": [
                34
            ],
            "groupId": [
                5
            ],
            "id": [
                5
            ],
            "isCheered": [
                0
            ],
            "project": [
                33
            ],
            "title": [
                1
            ],
            "url": [
                1
            ],
            "user": [
                19
            ],
            "userId": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "MakerProject": {
            "id": [
                5
            ],
            "image": [
                1,
                {
                    "width": [
                        8
                    ],
                    "height": [
                        8
                    ]
                }
            ],
            "lookingForOtherMakers": [
                0
            ],
            "name": [
                1
            ],
            "tagline": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MakerGroup": {
            "description": [
                1
            ],
            "goalsCount": [
                8
            ],
            "id": [
                5
            ],
            "isMember": [
                0
            ],
            "membersCount": [
                8
            ],
            "name": [
                1
            ],
            "tagline": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalConnection": {
            "edges": [
                36
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "GoalEdge": {
            "cursor": [
                1
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalsOrder": {},
        "MakerGroupConnection": {
            "edges": [
                39
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MakerGroupEdge": {
            "cursor": [
                1
            ],
            "node": [
                34
            ],
            "__typename": [
                1
            ]
        },
        "MakerGroupsOrder": {},
        "PostsOrder": {},
        "TopicsOrder": {},
        "Viewer": {
            "goals": [
                35,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ],
                    "current": [
                        0
                    ],
                    "order": [
                        37
                    ]
                }
            ],
            "makerGroups": [
                38,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "makerProjects": [
                44,
                {
                    "first": [
                        8
                    ],
                    "after": [
                        1
                    ],
                    "last": [
                        8
                    ],
                    "before": [
                        1
                    ]
                }
            ],
            "user": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "MakerProjectConnection": {
            "edges": [
                45
            ],
            "pageInfo": [
                7
            ],
            "totalCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MakerProjectEdge": {
            "cursor": [
                1
            ],
            "node": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "Mutation": {
            "goalCheer": [
                47,
                {
                    "input": [
                        49,
                        "GoalCheerInput!"
                    ]
                }
            ],
            "goalCheerUndo": [
                50,
                {
                    "input": [
                        51,
                        "GoalCheerUndoInput!"
                    ]
                }
            ],
            "goalCreate": [
                52,
                {
                    "input": [
                        53,
                        "GoalCreateInput!"
                    ]
                }
            ],
            "goalMarkAsComplete": [
                54,
                {
                    "input": [
                        55,
                        "GoalMarkAsCompleteInput!"
                    ]
                }
            ],
            "goalMarkAsIncomplete": [
                56,
                {
                    "input": [
                        57,
                        "GoalMarkAsIncompleteInput!"
                    ]
                }
            ],
            "goalUpdate": [
                58,
                {
                    "input": [
                        59,
                        "GoalUpdateInput!"
                    ]
                }
            ],
            "userFollow": [
                60,
                {
                    "input": [
                        61,
                        "UserFollowInput!"
                    ]
                }
            ],
            "userFollowUndo": [
                62,
                {
                    "input": [
                        63,
                        "UserFollowUndoInput!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "GoalCheerPayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "Error": {
            "field": [
                1
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalCheerInput": {
            "goalId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalCheerUndoPayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalCheerUndoInput": {
            "goalId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalCreatePayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalCreateInput": {
            "projectId": [
                5
            ],
            "groupId": [
                5
            ],
            "dueAt": [
                11
            ],
            "title": [
                1
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalMarkAsCompletePayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalMarkAsCompleteInput": {
            "goalId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalMarkAsIncompletePayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalMarkAsIncompleteInput": {
            "goalId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GoalUpdatePayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "GoalUpdateInput": {
            "goalId": [
                5
            ],
            "groupId": [
                5
            ],
            "dueAt": [
                11
            ],
            "title": [
                1
            ],
            "projectId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserFollowPayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "UserFollowInput": {
            "userId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserFollowUndoPayload": {
            "clientMutationId": [
                1
            ],
            "errors": [
                48
            ],
            "node": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "UserFollowUndoInput": {
            "userId": [
                5
            ],
            "clientMutationId": [
                1
            ],
            "__typename": [
                1
            ]
        }
    }
}