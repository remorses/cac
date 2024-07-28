Github auth workflow:

-   user install plugin and clicks login
-   redirect to `/api/markdown-plugin/auth/framer-login?key=xxx` with key parameter, do a login with supabase (github Oauth is different than the Github app for the permissions, this way i can have my own oauth callback)
-   plugins polls for the database `FramerLoginRequest` with the key, when it finds it, login is completed and a session is returned
-   logins with supabase to keep session and such, after supabase login
-   redirect to `/api/markdown-plugin/github/install`. if user has not installed yet the Github app, redirect to github installation page, then
-   redirect to `/api/markdown-plugin/github/callback`, here save the github installation token in the database
-   redirect to `/api/after-framer-login?key=xxx`, here `FramerLoginRequest` is saved in the database, user is told to go back to Framer and complete the login
