### Deployment to Heroku

1. Give this repo a star and fork it to your GitHub account
   [here](https://github.com/vixshan/mochi/fork).
2. if you do not have an Heroku account,create one
   [here](https://signup.heroku.com/).
3. Click
   [here to deploy](https://dashboard.heroku.com/new?template=https%3A%2F%2Fgithub.com%2Fvixshan%2Fmochi)
   the app to Heroku
4. A form will open up, fill the required fields in the form and click on <b>Deploy app</b> button.
> Please note by default the dashboard is enabled, hence the the dashboard values are required, you can disable it in the [config.js](https://github.com/vixshan/mochi/blob/49ef81f775242793514905a8b05dd57eea7f99e1/config.js#L42)

Setting up custom domain for the dashboard
5. Now go to <b>Settings -> Domains</b> and add your custom domain.

<details>
  <summary>Adding a custom domain to your Heroku app</summary>
  <img src="public/images/heroku-dom.jpeg">
</details>
<br>

6. Now go to <b>Deploy -> Deployment method</b> and connect your app to the
   forked repo to enable auto deploys.

> Note: You can also deploy the app to Heroku using the Heroku CLI.