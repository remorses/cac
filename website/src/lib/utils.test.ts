import { db } from 'db/kysely'
import { test, expect } from 'vitest'

test('kysely works as i intended', async () => {
    let orgId = '84e4c5b4-7ee6-4327-bb92-f0ad08d2cac6'
    const sql = db
        .selectFrom('Org')
        .where('orgId', '=', orgId)
        .innerJoin('auth.users', 'Org.orgId', 'auth.users.id')
        .selectAll()
    const orgAndUser = await sql.executeTakeFirst()

    expect(orgAndUser).toMatchInlineSnapshot(`
      {
        "aud": "authenticated",
        "banned_until": null,
        "confirmation_sent_at": null,
        "confirmation_token": "",
        "confirmed_at": 2024-07-25T12:25:15.665Z,
        "createdAt": 2024-08-28T10:34:52.813Z,
        "created_at": 2024-07-25T12:25:15.656Z,
        "deleted_at": null,
        "email": "beats.by.morse@gmail.com",
        "email_change": "",
        "email_change_confirm_status": 0,
        "email_change_sent_at": null,
        "email_change_token_current": "",
        "email_change_token_new": "",
        "email_confirmed_at": 2024-07-25T12:25:15.665Z,
        "encrypted_password": "$2a$10$8r.VsdnFBUnXnpCahhjbWOI6j/KbEHnYi85HnDZR8PLc11Ldyb.2m",
        "githubLogin": "remorses",
        "id": "11d9c82e-0e9a-42fb-8b70-d8e6e73a0b4e",
        "instance_id": "00000000-0000-0000-0000-000000000000",
        "invited_at": null,
        "is_anonymous": false,
        "is_sso_user": false,
        "is_super_admin": null,
        "last_sign_in_at": 2024-08-26T16:21:54.369Z,
        "name": "benjamin@framer.com",
        "orgId": "84e4c5b4-7ee6-4327-bb92-f0ad08d2cac6",
        "phone": null,
        "phone_change": "",
        "phone_change_sent_at": null,
        "phone_change_token": "",
        "phone_confirmed_at": null,
        "raw_app_meta_data": {
          "provider": "google",
          "providers": [
            "google",
            "github",
          ],
        },
        "raw_user_meta_data": {
          "avatar_url": "https://avatars.githubusercontent.com/u/31321188?v=4",
          "email": "beats.by.morse@gmail.com",
          "email_verified": true,
          "full_name": "Tommy D. Rossi",
          "iss": "https://api.github.com",
          "name": "Tommy D. Rossi",
          "phone_verified": false,
          "picture": "https://lh3.googleusercontent.com/a/ACg8ocIWN6ORKRmykXrxTvtjAmqYlsqPoIPbkv02FcmZMgWqf1uVAw=s96-c",
          "preferred_username": "remorses",
          "provider_id": "31321188",
          "sub": "31321188",
          "user_name": "remorses",
        },
        "reauthentication_sent_at": null,
        "reauthentication_token": "",
        "recovery_sent_at": null,
        "recovery_token": "",
        "role": "authenticated",
        "ssoProviderId": null,
        "stripeCustomerId": null,
        "updatedAt": 2024-08-28T10:34:52.813Z,
        "updated_at": 2024-08-28T14:08:52.282Z,
      }
    `)
    expect('\n' + sql.compile().sql).toMatchInlineSnapshot(
        `
      "
      select * from "Org" inner join "auth"."users" on "Org"."orgId" = $1 where "orgId" = $2"
    `,
    )
})
